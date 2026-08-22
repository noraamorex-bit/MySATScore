/**
 * End-to-end exercise of the whole test lifecycle, run directly against the
 * server modules: start → module 1 → adaptive routing → module 2 → break →
 * Math → scoring → results → review → history → a second, non-repeating test.
 *
 * Also covers the edge cases that matter in practice: an expired timer, a
 * partially answered module, a refresh mid-module, and starting a new test
 * while one is still open.
 *
 *   npm run test:flow
 */
import Module from "node:module";

// `server-only` throws outside Next's server bundle. This harness deliberately
// exercises those server modules directly, so the guard is stubbed for the
// duration of the run.
const load = (Module as unknown as { _load: (...args: unknown[]) => unknown })._load;
(Module as unknown as { _load: unknown })._load = function patched(
  this: unknown,
  request: string,
  ...rest: unknown[]
) {
  if (request === "server-only") return {};
  return load.call(this, request, ...rest);
};

import { PrismaClient } from "@prisma/client";
import { assembleTest } from "../src/lib/sat/assemble";
import { decideRoute, scoreSections, scaleSection } from "../src/lib/sat/scoring";
import { isCorrect, matchesStudentResponse, normalizeResponse } from "../src/lib/sat/grade";
import { MODULE_SPEC } from "../src/lib/sat/blueprint";
import type { Question } from "../src/lib/sat/types";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const db = new PrismaClient();

let failures = 0;
let checks = 0;

function check(label: string, condition: boolean, detail?: string): void {
  checks += 1;
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
}

const bank = (
  JSON.parse(readFileSync(resolve(process.cwd(), "content/bank/questions.json"), "utf8")) as {
    questions: Question[];
  }
).questions;

async function main(): Promise<void> {
  const attempts = await import("../src/lib/attempts");
  const analytics = await import("../src/lib/analytics");

  const email = `flow-test-${Date.now()}@mysatscore.local`;
  const user = await db.user.create({ data: { email, name: "Flow Test" } });
  console.log(`Test user: ${user.id}`);

  /* ------------------------------------------------------------- assembly */

  section("Assembly");
  const generated = assembleTest({ bank, kind: "full", seed: "flow:1" });
  const ids = [
    ...generated.test.modules.flatMap((m) => m.questionIds),
    ...Object.values(generated.test.routedModules).flatMap((m) => m.questionIds),
  ];
  check("no duplicate question ids anywhere in a generated form", new Set(ids).size === ids.length);
  check(
    "module 1 counts match the blueprint",
    generated.test.modules.every(
      (m) => m.questionIds.length === MODULE_SPEC[m.subject].questions,
    ),
  );
  check(
    "both routed forms exist for both subjects",
    ["rw:lower", "rw:upper", "math:lower", "math:upper"].every(
      (key) => generated.test.routedModules[key]?.questionIds.length ===
        MODULE_SPEC[key.startsWith("rw") ? "rw" : "math"].questions,
    ),
  );

  /* ----------------------------------------------------------- attempt #1 */

  section("Attempt 1 — full length, answering everything correctly in module 1");
  const attempt = await attempts.startAttempt({ userId: user.id, kind: "full" });
  check("attempt starts in progress at cursor 0", attempt.status === "in-progress" && attempt.cursor === 0);

  let state = await attempts.getRunnerState(attempt.id, user.id);
  check("runner state loads module 1 of Reading and Writing",
    state?.module.subject === "rw" && state.module.module === 1);
  check("module 1 has no deadline before it is started", state?.module.endsAtMs === null);

  await attempts.startModule(attempt.id, 0);
  state = await attempts.getRunnerState(attempt.id, user.id);
  check("starting the module sets a server-side deadline", (state?.module.endsAtMs ?? 0) > Date.now());

  const startedEndsAt = state!.module.endsAtMs;
  // A refresh must not extend the clock.
  await attempts.startModule(attempt.id, 0);
  const afterRefresh = await attempts.getRunnerState(attempt.id, user.id);
  check("restarting a live module does not extend the deadline",
    afterRefresh?.module.endsAtMs === startedEndsAt);

  for (const item of state!.questions) {
    const result = await attempts.saveAnswer({
      attemptId: attempt.id,
      questionId: item.question.id,
      given: keyFor(item.question),
      timeSpentMs: 20_000,
    });
    check(`answer accepted for ${item.question.id}`, result.ok === true);
    if (result.ok !== true) break;
  }
  const answeredM1 = await db.answer.count({ where: { attemptId: attempt.id, isCorrect: true } });
  check("every module 1 answer graded correct", answeredM1 === MODULE_SPEC.rw.questions,
    `${answeredM1} of ${MODULE_SPEC.rw.questions}`);

  const submit1 = await attempts.submitModule(attempt.id, 0);
  check("a perfect module 1 routes to the advanced second module", submit1.route === "upper",
    String(submit1.route));
  check("the attempt advances to module 2", submit1.nextOrdinal === 1);

  section("Attempt 1 — module 2 partially answered, then submitted");
  await attempts.startModule(attempt.id, 1);
  state = await attempts.getRunnerState(attempt.id, user.id);
  check("module 2 is the routed advanced form", state?.module.route === "upper");
  const half = Math.floor(state!.questions.length / 2);
  for (const item of state!.questions.slice(0, half)) {
    await attempts.saveAnswer({
      attemptId: attempt.id,
      questionId: item.question.id,
      given: keyFor(item.question),
      flagged: true,
      timeSpentMs: 15_000,
    });
  }
  const submit2 = await attempts.submitModule(attempt.id, 1);
  check("finishing Reading and Writing starts the optional break", submit2.breakStarted === true);
  check("the attempt is not complete after two modules", submit2.attemptComplete === false);

  section("Attempt 1 — break, then Math with an expired timer");
  const onBreak = await db.attempt.findUnique({ where: { id: attempt.id } });
  check("break is recorded with an end time", onBreak?.onBreak === true && Boolean(onBreak?.breakEndsAt));
  await attempts.endBreak(attempt.id);

  await attempts.startModule(attempt.id, 2);
  state = await attempts.getRunnerState(attempt.id, user.id);
  check("Math module 1 follows the break", state?.module.subject === "math" && state.module.module === 1);

  // Answer a few, then force the deadline into the past and reconcile.
  for (const item of state!.questions.slice(0, 6)) {
    await attempts.saveAnswer({
      attemptId: attempt.id, questionId: item.question.id, given: keyFor(item.question),
      timeSpentMs: 30_000,
    });
  }
  await db.attemptModule.update({
    where: { attemptId_ordinal: { attemptId: attempt.id, ordinal: 2 } },
    data: { endsAt: new Date(Date.now() - 60_000) },
  });
  const lateSave = await attempts.saveAnswer({
    attemptId: attempt.id,
    questionId: state!.questions[10].question.id,
    given: "A",
  });
  check("answers are rejected once the module clock has run out", lateSave.ok === false);

  const expiredModule = await db.attemptModule.findUnique({
    where: { attemptId_ordinal: { attemptId: attempt.id, ordinal: 2 } },
  });
  check("the expired module is auto-submitted and marked timed out",
    expiredModule?.status === "expired" && expiredModule.timedOut === true);

  const afterExpiry = await db.attempt.findUnique({ where: { id: attempt.id } });
  check("the attempt advances past the expired module", afterExpiry?.cursor === 3);

  section("Attempt 1 — final module and scoring");
  await attempts.startModule(attempt.id, 3);
  state = await attempts.getRunnerState(attempt.id, user.id);
  check("Math module 2 was routed from the expired module's answers",
    state?.module.route === "lower" || state?.module.route === "upper");
  for (const item of state!.questions) {
    await attempts.saveAnswer({
      attemptId: attempt.id, questionId: item.question.id, given: keyFor(item.question),
      timeSpentMs: 40_000,
    });
  }
  const submit4 = await attempts.submitModule(attempt.id, 3);
  check("submitting the last module completes the attempt", submit4.attemptComplete === true);

  const results = await analytics.getAttemptResults(attempt.id, user.id);
  check("results are available", Boolean(results));
  check("both section scores are present", results!.score.sections.length === 2);
  check("total is the sum of the two sections",
    results!.score.total ===
      results!.score.sections.reduce((sum, s) => sum + s.scaled, 0));
  check("total is within the reported range",
    results!.score.total! >= 400 && results!.score.total! <= 1600, String(results!.score.total));
  check("every section score is within 200–800",
    results!.score.sections.every((s) => s.scaled >= 200 && s.scaled <= 800));
  check("review covers every served question",
    results!.review.length === results!.summary.total && results!.summary.total > 0);
  check("unanswered questions are counted, not silently dropped",
    results!.summary.unanswered > 0, `${results!.summary.unanswered}`);
  check("domain breakdown is populated", results!.byDomain.length >= 4);
  check("difficulty breakdown covers all three levels", results!.byDifficulty.length === 3);
  check("recommendations are generated", results!.recommendations.length > 0);

  section("Exposure tracking and history");
  const exposures = await db.questionExposure.count({ where: { userId: user.id } });
  check("every served question is recorded as seen", exposures === results!.summary.total,
    `${exposures} vs ${results!.summary.total}`);
  const unseenBefore = await attempts.seenQuestionIds(user.id);
  check("the seen set matches the exposure rows", unseenBefore.size === exposures);

  const history = await analytics.getHistory(user.id);
  check("history contains the completed attempt", history.length === 1 && history[0].total !== null);

  /* ----------------------------------------------------------- attempt #2 */

  section("Attempt 2 — a second test avoids questions already seen");
  const second = await attempts.startAttempt({ userId: user.id, kind: "full" });
  const secondForm = JSON.parse(second.form) as ReturnType<typeof assembleTest>["test"];
  const firstServed = new Set(unseenBefore);
  const secondModule1Ids = secondForm.modules.flatMap((m) => m.questionIds);
  const overlap = secondModule1Ids.filter((id) => firstServed.has(id));
  check("no module 1 question repeats from the first test", overlap.length === 0,
    `${overlap.length} repeats`);
  const secondIds = [
    ...secondModule1Ids,
    ...Object.values(secondForm.routedModules).flatMap((m) => m.questionIds),
  ];
  check("the second form has no internal duplicates", new Set(secondIds).size === secondIds.length);

  const previous = await db.attempt.findUnique({ where: { id: attempt.id } });
  check("the completed attempt is untouched by starting a new one", previous?.status === "completed");

  section("Abandoning an in-progress attempt");
  const third = await attempts.startAttempt({ userId: user.id, kind: "math-only" });
  const secondNow = await db.attempt.findUnique({ where: { id: second.id } });
  check("starting a test abandons the one still open", secondNow?.status === "abandoned");
  check("a math-only test has two modules planned",
    attempts.modulePlan("math-only").length === 2);
  check("a math-only test offers no break", attempts.breakAfterIndex("math-only") === null);
  await db.attempt.update({ where: { id: third.id }, data: { status: "abandoned" } });

  /* --------------------------------------------------------------- units */

  section("Scoring and routing units");
  const rwUpper = scaleSection("rw", 54, "upper");
  const rwLower = scaleSection("rw", 54, "lower");
  check("a perfect Reading and Writing section on the advanced form reaches 800",
    rwUpper.scaled === 800, String(rwUpper.scaled));
  check("the standard form caps below 800", rwLower.scaled < 800, String(rwLower.scaled));
  check("a raw zero floors at 200", scaleSection("math", 0, "upper").scaled === 200);
  check("section scores are reported in tens",
    [3, 11, 19, 27, 35, 43].every((raw) => scaleSection("math", raw, "upper").scaled % 10 === 0));
  check("scaled score is monotonic in raw score", (() => {
    let previousScore = -1;
    for (let raw = 0; raw <= 44; raw += 1) {
      const value = scaleSection("math", raw, "upper").scaled;
      if (value < previousScore) return false;
      previousScore = value;
    }
    return true;
  })());

  const mathQuestions = bank.filter((q) => q.subject === "math").slice(0, 22);
  const allRight = Object.fromEntries(mathQuestions.map((q) => [q.id, true]));
  const allWrong = Object.fromEntries(mathQuestions.map((q) => [q.id, false]));
  check("all correct routes upward", decideRoute("math", mathQuestions, allRight).route === "upper");
  check("all incorrect routes downward", decideRoute("math", mathQuestions, allWrong).route === "lower");
  check("routing is deterministic",
    decideRoute("math", mathQuestions, allRight).ratio ===
      decideRoute("math", mathQuestions, allRight).ratio);

  const emptyScore = scoreSections([], {});
  check("scoring an empty attempt does not crash", emptyScore.sections.length === 0 && emptyScore.total === null);

  section("Grading units");
  const spr = bank.find((q) => q.answerFormat === "student-response" && q.correct.includes("/"));
  if (spr) {
    check("a fraction answer matches its decimal form",
      matchesStudentResponse(spr, String(evalFraction(spr.correct))));
  }
  check("leading-dot decimals normalise", normalizeResponse(".5") === "0.5");
  check("whitespace and commas are ignored", normalizeResponse(" 1,250 ") === "1250");
  const mcq = bank.find((q) => q.answerFormat === "multiple-choice")!;
  check("a blank answer is never correct", isCorrect(mcq, null) === false);
  check("an empty string is never correct", isCorrect(mcq, "") === false);
  check("the key is correct", isCorrect(mcq, mcq.correct) === true);

  /* --------------------------------------------------------------- cleanup */

  await db.attempt.deleteMany({ where: { userId: user.id } });
  await db.questionExposure.deleteMany({ where: { userId: user.id } });
  await db.user.delete({ where: { id: user.id } });

  console.log(`\n${checks - failures}/${checks} checks passed.`);
  if (failures > 0) process.exitCode = 1;
}

function keyFor(question: Question): string {
  return question.answerFormat === "multiple-choice" ? question.correct : question.correct;
}

function evalFraction(value: string): number {
  const [n, d] = value.split("/");
  return Number(n) / Number(d);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
