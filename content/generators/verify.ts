/**
 * Checks the built bank and curated catalogue for the properties the app relies
 * on. Run after `npm run bank:build`, and in CI before a deploy.
 *
 *   npm run bank:verify
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import katex from "katex";
import { questionSchema } from "../../src/lib/sat/schema";
import { parseRich } from "../../src/lib/rich-text";
import { isCorrect } from "../../src/lib/sat/grade";
import { MODULE_SPEC } from "../../src/lib/sat/blueprint";
import type { AssembledTest, Question, Subject } from "../../src/lib/sat/types";

const bank = JSON.parse(
  readFileSync(resolve(process.cwd(), "content/bank/questions.json"), "utf8"),
) as { questions: Question[] };
const catalogue = JSON.parse(
  readFileSync(resolve(process.cwd(), "content/curated/tests.json"), "utf8"),
) as { tests: AssembledTest[] };

const problems: string[] = [];
let checks = 0;

function fail(message: string): void {
  problems.push(message);
}

/* --------------------------------------------------------------- questions */

const ids = new Set<string>();
const fingerprints = new Map<string, string>();

for (const question of bank.questions) {
  checks += 1;

  const parsed = questionSchema.safeParse(question);
  if (!parsed.success) {
    fail(`${question.id}: ${parsed.error.issues.map((i) => i.message).join("; ")}`);
    continue;
  }

  if (ids.has(question.id)) fail(`duplicate id: ${question.id}`);
  ids.add(question.id);

  // The key must actually grade as correct through the real grading path.
  if (!isCorrect(question, question.correct)) {
    fail(`${question.id}: its own key does not grade as correct`);
  }

  // Every math span must render.
  const texts = [
    question.prompt,
    question.explanation,
    ...(question.choices?.map((c) => c.text) ?? []),
    ...Object.values(question.distractorNotes ?? {}),
    ...(question.stimulus?.type === "passage" ? question.stimulus.paragraphs : []),
    ...(question.stimulus?.type === "passage" ? (question.stimulus.bullets ?? []) : []),
  ];
  for (const text of texts) {
    for (const run of parseRich(text)) {
      if (run.kind !== "math") continue;
      try {
        katex.renderToString(run.value, { displayMode: run.display, throwOnError: true, strict: false });
      } catch (error) {
        fail(`${question.id}: math does not render — ${(error as Error).message.slice(0, 70)}`);
      }
    }
  }

  // Rendering-identical items would let one question appear twice in a test.
  const fingerprint = JSON.stringify([
    question.prompt,
    question.stimulus ?? null,
    question.choices?.map((c) => c.text) ?? question.correct,
  ]);
  const previous = fingerprints.get(fingerprint);
  if (previous) fail(`${question.id}: renders identically to ${previous}`);
  fingerprints.set(fingerprint, question.id);

  // A distractor that matches the key makes the item unanswerable.
  if (question.answerFormat === "multiple-choice") {
    for (const choice of question.choices ?? []) {
      if (choice.id !== question.correct && choice.text.trim() === "") {
        fail(`${question.id}: choice ${choice.id} is empty`);
      }
    }
  } else {
    for (const form of question.acceptedAnswers ?? []) {
      if (!isCorrect(question, form)) {
        fail(`${question.id}: accepted answer "${form}" does not grade as correct`);
      }
    }
  }
}

/* ------------------------------------------------------------- catalogue */

const formIds = new Set<string>();
for (const test of catalogue.tests) {
  checks += 1;
  if (formIds.has(test.id)) fail(`duplicate curated form id: ${test.id}`);
  formIds.add(test.id);

  const modules = [...test.modules, ...Object.values(test.routedModules)];
  const used = new Set<string>();
  for (const formModule of modules) {
    const expected = MODULE_SPEC[formModule.subject as Subject].questions;
    if (formModule.questionIds.length !== expected) {
      fail(
        `${test.id}: ${formModule.subject} module ${formModule.module}` +
          `${formModule.route ? ` (${formModule.route})` : ""} has ` +
          `${formModule.questionIds.length} questions, expected ${expected}`,
      );
    }
    if (formModule.durationSeconds !== MODULE_SPEC[formModule.subject as Subject].minutes * 60) {
      fail(`${test.id}: ${formModule.subject} module has the wrong duration`);
    }
    for (const id of formModule.questionIds) {
      if (!ids.has(id)) fail(`${test.id}: references unknown question ${id}`);
      if (used.has(id)) fail(`${test.id}: question ${id} appears more than once in the form`);
      used.add(id);
    }
  }

  const subjects = new Set(test.modules.map((m) => m.subject));
  for (const subject of subjects) {
    for (const route of ["lower", "upper"]) {
      if (!test.routedModules[`${subject}:${route}`]) {
        fail(`${test.id}: missing the ${route} module for ${subject}`);
      }
    }
  }
}

/* ---------------------------------------------------------------- report */

const bySubject: Record<string, number> = {};
const byDomain: Record<string, number> = {};
const byDifficulty: Record<string, number> = {};
for (const q of bank.questions) {
  bySubject[q.subject] = (bySubject[q.subject] ?? 0) + 1;
  byDomain[q.domain] = (byDomain[q.domain] ?? 0) + 1;
  byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
}

console.log(`Questions : ${bank.questions.length}`);
console.log(`  subject : ${JSON.stringify(bySubject)}`);
console.log(`  level   : ${JSON.stringify(byDifficulty)}`);
for (const [domain, n] of Object.entries(byDomain).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${domain.padEnd(34)} ${n}`);
}
console.log(`Curated forms: ${catalogue.tests.length}`);
console.log(`Checked ${checks} records.`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 40)) console.error(`  ! ${problem}`);
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
  process.exitCode = 1;
} else {
  console.log("\nNo problems found.");
}
