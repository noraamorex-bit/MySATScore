/**
 * Attempt lifecycle: starting a test, running its modules, routing between
 * them, and scoring the result.
 *
 * Two invariants drive the design:
 *
 *  1. **The clock belongs to the server.** A module's deadline is stored when
 *     it starts. Refreshing, closing the tab, losing the network, or changing
 *     the device clock cannot buy extra time, and a module whose deadline has
 *     passed is submitted automatically the next time the attempt is touched.
 *
 *  2. **The form is frozen.** The assembled test is stored on the attempt as
 *     JSON, so rebuilding the question bank or editing a question in the admin
 *     console can never alter an attempt that is already under way.
 */
import "server-only";
import type { Attempt, AttemptModule } from "@prisma/client";
import { db } from "./db";
import { getBank, getQuestions } from "./bank";
import { getCuratedForm } from "./catalogue";
import { assembleTest } from "./sat/assemble";
import { isCorrect } from "./sat/grade";
import { decideRoute, scoreSections, type ScoredResponse, type TotalScore } from "./sat/scoring";
import { ROUTING_POLICY } from "./sat/scoring-config";
import { activeScoringConfig } from "./scoring-store";
import { BREAK_MINUTES, SUBJECT_ORDER } from "./sat/blueprint";
import type {
  AssembledTest, ModuleNumber, Question, RoutePath, Subject, TestKind,
} from "./sat/types";

/** Tolerance for clock skew between the browser and the server, in ms. */
const GRACE_MS = 3000;

export interface ModulePlanStep {
  subject: Subject;
  module: ModuleNumber;
}

/** The fixed order of modules for a test of the given kind. */
export function modulePlan(kind: TestKind): ModulePlanStep[] {
  const subjects: Subject[] =
    kind === "rw-only" ? ["rw"] : kind === "math-only" ? ["math"] : SUBJECT_ORDER;
  return subjects.flatMap((subject) => [
    { subject, module: 1 as ModuleNumber },
    { subject, module: 2 as ModuleNumber },
  ]);
}

/** Index in the plan after which the optional break is offered. */
export function breakAfterIndex(kind: TestKind): number | null {
  return kind === "full" ? 1 : null;
}

/* ------------------------------------------------------------------- start */

export interface StartOptions {
  userId: string;
  /** Curated catalogue id, or null to generate a fresh form. */
  curatedId?: string | null;
  kind?: TestKind;
}

export async function startAttempt(options: StartOptions): Promise<Attempt> {
  const { userId } = options;

  // Don't strand a user with two live attempts; the older one is abandoned.
  await db.attempt.updateMany({
    where: { userId, status: "in-progress" },
    data: { status: "abandoned" },
  });

  let form: AssembledTest;
  if (options.curatedId) {
    const curated = await getCuratedForm(options.curatedId);
    if (!curated) throw new Error(`No curated test with id "${options.curatedId}"`);
    form = curated;
  } else {
    const kind = options.kind ?? "full";
    const bank = await getBank();
    const seen = await seenQuestionIds(userId);
    const { test } = assembleTest({
      bank: bank.active,
      kind,
      seed: `${userId}:${Date.now()}`,
      seenIds: seen,
      id: `gen-${Math.random().toString(36).slice(2, 10)}`,
    });
    form = test;
  }

  const attempt = await db.attempt.create({
    data: {
      userId,
      testId: form.id,
      title: form.title,
      kind: form.kind,
      curated: form.curated,
      form: JSON.stringify(form),
      status: "in-progress",
      cursor: 0,
      routingVersion: ROUTING_POLICY.version,
    },
  });

  await ensureModule(attempt, 0);
  return attempt;
}

/** Every question id this user has already been served. */
export async function seenQuestionIds(userId: string): Promise<Set<string>> {
  const rows = await db.questionExposure.findMany({
    where: { userId },
    select: { questionId: true },
  });
  return new Set(rows.map((r) => r.questionId));
}

/* ------------------------------------------------------- module management */

function parseForm(attempt: Attempt): AssembledTest {
  return JSON.parse(attempt.form) as AssembledTest;
}

function parseRoutes(attempt: Attempt): Partial<Record<Subject, RoutePath>> {
  try {
    return JSON.parse(attempt.routes) as Partial<Record<Subject, RoutePath>>;
  } catch {
    return {};
  }
}

/**
 * Creates the module row for a plan position if it does not exist yet. Module 2
 * rows can only be created once the preceding module has been graded, because
 * the routing decision determines which question list they carry.
 */
async function ensureModule(attempt: Attempt, ordinal: number): Promise<AttemptModule> {
  const existing = await db.attemptModule.findUnique({
    where: { attemptId_ordinal: { attemptId: attempt.id, ordinal } },
  });
  if (existing) return existing;

  const form = parseForm(attempt);
  const plan = modulePlan(attempt.kind as TestKind);
  const step = plan[ordinal];
  if (!step) throw new Error(`No module at position ${ordinal} for a ${attempt.kind} test`);

  let questionIds: string[];
  let route: RoutePath | null = null;
  let durationSeconds: number;

  if (step.module === 1) {
    const module = form.modules.find((m) => m.subject === step.subject);
    if (!module) throw new Error(`Form is missing module 1 for ${step.subject}`);
    questionIds = module.questionIds;
    durationSeconds = module.durationSeconds;
  } else {
    const routes = parseRoutes(attempt);
    route = routes[step.subject] ?? "lower";
    const module = form.routedModules[`${step.subject}:${route}`];
    if (!module) throw new Error(`Form is missing the ${route} module for ${step.subject}`);
    questionIds = module.questionIds;
    durationSeconds = module.durationSeconds;
  }

  return db.attemptModule.create({
    data: {
      attemptId: attempt.id,
      ordinal,
      subject: step.subject,
      module: step.module,
      route,
      durationSeconds,
      questionIds: JSON.stringify(questionIds),
      status: "pending",
    },
  });
}

/** Starts the clock on a module. Idempotent: restarting never extends time. */
export async function startModule(attemptId: string, ordinal: number): Promise<AttemptModule> {
  const attempt = await loadAttempt(attemptId);
  const module = await ensureModule(attempt, ordinal);
  if (module.status !== "pending") return module;
  const now = new Date();
  return db.attemptModule.update({
    where: { id: module.id },
    data: {
      status: "active",
      startedAt: now,
      endsAt: new Date(now.getTime() + module.durationSeconds * 1000),
    },
  });
}

async function loadAttempt(attemptId: string): Promise<Attempt> {
  const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new Error("Attempt not found");
  return attempt;
}

/**
 * Brings an attempt up to date with the wall clock: any active module whose
 * deadline has passed is submitted, and the attempt advances. Called on every
 * read and write path so a user who closes the tab mid-module finds the test in
 * the state it should be in.
 */
export async function reconcile(attemptId: string): Promise<void> {
  let attempt = await loadAttempt(attemptId);
  if (attempt.status !== "in-progress") return;

  for (let guard = 0; guard < 8; guard += 1) {
    const module = await db.attemptModule.findUnique({
      where: { attemptId_ordinal: { attemptId, ordinal: attempt.cursor } },
    });
    if (!module || module.status !== "active" || !module.endsAt) break;
    if (module.endsAt.getTime() + GRACE_MS > Date.now()) break;
    await submitModule(attemptId, module.ordinal, { timedOut: true });
    attempt = await loadAttempt(attemptId);
    if (attempt.status !== "in-progress") break;
  }
}

/* ------------------------------------------------------------------ answers */

export interface SaveAnswerInput {
  attemptId: string;
  questionId: string;
  given?: string | null;
  flagged?: boolean;
  timeSpentMs?: number;
}

export type SaveAnswerResult =
  | { ok: true }
  | { ok: false; reason: "module-closed" | "unknown-question" | "not-in-module" };

export async function saveAnswer(input: SaveAnswerInput): Promise<SaveAnswerResult> {
  await reconcile(input.attemptId);
  const attempt = await loadAttempt(input.attemptId);
  if (attempt.status !== "in-progress") return { ok: false, reason: "module-closed" };

  const module = await db.attemptModule.findUnique({
    where: { attemptId_ordinal: { attemptId: attempt.id, ordinal: attempt.cursor } },
  });
  if (!module || module.status !== "active") return { ok: false, reason: "module-closed" };
  if (module.endsAt && module.endsAt.getTime() + GRACE_MS < Date.now()) {
    return { ok: false, reason: "module-closed" };
  }

  const questionIds = JSON.parse(module.questionIds) as string[];
  if (!questionIds.includes(input.questionId)) return { ok: false, reason: "not-in-module" };

  const bank = await getBank();
  const question = bank.byId.get(input.questionId);
  if (!question) return { ok: false, reason: "unknown-question" };

  const given = input.given === undefined ? undefined : input.given || null;
  const correct = given === undefined ? undefined : isCorrect(question, given);

  await db.answer.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId: input.questionId } },
    create: {
      attemptId: attempt.id,
      moduleId: module.id,
      questionId: input.questionId,
      given: given ?? null,
      isCorrect: correct ?? false,
      flagged: input.flagged ?? false,
      timeSpentMs: input.timeSpentMs ?? 0,
    },
    update: {
      ...(given !== undefined ? { given, isCorrect: correct ?? false } : {}),
      ...(input.flagged !== undefined ? { flagged: input.flagged } : {}),
      ...(input.timeSpentMs !== undefined
        ? { timeSpentMs: { increment: Math.max(0, Math.min(input.timeSpentMs, 30 * 60 * 1000)) } }
        : {}),
    },
  });

  return { ok: true };
}

/* ---------------------------------------------------------- module submit */

export interface SubmitResult {
  attemptComplete: boolean;
  nextOrdinal: number | null;
  breakStarted: boolean;
  route: RoutePath | null;
}

export async function submitModule(
  attemptId: string,
  ordinal: number,
  options: { timedOut?: boolean } = {},
): Promise<SubmitResult> {
  const attempt = await loadAttempt(attemptId);
  const module = await db.attemptModule.findUnique({
    where: { attemptId_ordinal: { attemptId, ordinal } },
  });
  if (!module) throw new Error(`No module at position ${ordinal}`);

  if (module.status === "submitted" || module.status === "expired") {
    return {
      attemptComplete: attempt.status === "completed",
      nextOrdinal: attempt.cursor === ordinal ? null : attempt.cursor,
      breakStarted: attempt.onBreak,
      route: module.route as RoutePath | null,
    };
  }

  await db.attemptModule.update({
    where: { id: module.id },
    data: {
      status: options.timedOut ? "expired" : "submitted",
      submittedAt: new Date(),
      timedOut: Boolean(options.timedOut),
    },
  });

  await recordExposures(attempt.userId, attemptId, module);

  const plan = modulePlan(attempt.kind as TestKind);
  const subject = module.subject as Subject;
  let route: RoutePath | null = module.route as RoutePath | null;

  // Module 1 determines which second module the test taker receives.
  if (module.module === 1) {
    const questionIds = JSON.parse(module.questionIds) as string[];
    const questions = await getQuestions(questionIds);
    const answers = await db.answer.findMany({
      where: { attemptId, moduleId: module.id },
      select: { questionId: true, isCorrect: true },
    });
    const correctById: Record<string, boolean> = {};
    for (const a of answers) correctById[a.questionId] = a.isCorrect;
    const decision = decideRoute(subject, questions, correctById);
    route = decision.route;
    const routes = parseRoutes(attempt);
    routes[subject] = decision.route;
    await db.attempt.update({
      where: { id: attemptId },
      data: { routes: JSON.stringify(routes), routingVersion: decision.policyVersion },
    });
  }

  const nextOrdinal = ordinal + 1;
  if (nextOrdinal >= plan.length) {
    await completeAttempt(attemptId);
    return { attemptComplete: true, nextOrdinal: null, breakStarted: false, route };
  }

  const startBreak = breakAfterIndex(attempt.kind as TestKind) === ordinal;
  await db.attempt.update({
    where: { id: attemptId },
    data: {
      cursor: nextOrdinal,
      onBreak: startBreak,
      breakEndsAt: startBreak ? new Date(Date.now() + BREAK_MINUTES * 60 * 1000) : null,
    },
  });
  const refreshed = await loadAttempt(attemptId);
  await ensureModule(refreshed, nextOrdinal);

  return { attemptComplete: false, nextOrdinal, breakStarted: startBreak, route };
}

/** Ends the optional break early. */
export async function endBreak(attemptId: string): Promise<void> {
  await db.attempt.update({
    where: { id: attemptId },
    data: { onBreak: false, breakEndsAt: null },
  });
}

/* --------------------------------------------------------------- exposure */

/**
 * Records which questions this user has now seen, and updates bank-wide serve
 * counts. Exposure is what makes "never show the same question twice" work
 * across separately generated tests.
 */
async function recordExposures(
  userId: string,
  attemptId: string,
  module: AttemptModule,
): Promise<void> {
  const questionIds = JSON.parse(module.questionIds) as string[];
  const answers = await db.answer.findMany({
    where: { attemptId, moduleId: module.id },
    select: { questionId: true, isCorrect: true, given: true },
  });
  const answerBy = new Map(answers.map((a) => [a.questionId, a]));
  const now = new Date();

  for (const questionId of questionIds) {
    const answer = answerBy.get(questionId);
    const wasCorrect = answer?.given ? answer.isCorrect : null;
    await db.questionExposure.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: { userId, questionId, attemptId, seenAt: now, wasCorrect },
      update: { seenAt: now, attemptId, wasCorrect },
    });
    await db.questionStat.upsert({
      where: { questionId },
      create: {
        questionId,
        timesServed: 1,
        timesCorrect: wasCorrect ? 1 : 0,
        lastServedAt: now,
      },
      update: {
        timesServed: { increment: 1 },
        ...(wasCorrect ? { timesCorrect: { increment: 1 } } : {}),
        lastServedAt: now,
      },
    });
  }
}

/* --------------------------------------------------------------- scoring */

export async function completeAttempt(attemptId: string): Promise<TotalScore> {
  const attempt = await loadAttempt(attemptId);
  const responses = await buildScoredResponses(attempt);
  const routes = parseRoutes(attempt);
  const config = await activeScoringConfig();
  const score = scoreSections(responses, routes, config);

  await db.attempt.update({
    where: { id: attemptId },
    data: {
      status: "completed",
      completedAt: new Date(),
      onBreak: false,
      breakEndsAt: null,
      scoreSnapshot: JSON.stringify(score),
      scoringVersion: score.scoringVersion,
    },
  });
  return score;
}

/** Joins the attempt's answers to the frozen form and the bank. */
export async function buildScoredResponses(attempt: Attempt): Promise<ScoredResponse[]> {
  const modules = await db.attemptModule.findMany({
    where: { attemptId: attempt.id },
    orderBy: { ordinal: "asc" },
  });
  const answers = await db.answer.findMany({ where: { attemptId: attempt.id } });
  const answerBy = new Map(answers.map((a) => [a.questionId, a]));
  const bank = await getBank();

  const responses: ScoredResponse[] = [];
  for (const module of modules) {
    // A module that was never reached contributes nothing.
    if (module.status === "pending") continue;
    const questionIds = JSON.parse(module.questionIds) as string[];
    for (const questionId of questionIds) {
      const question = bank.byId.get(questionId);
      if (!question) continue;
      const answer = answerBy.get(questionId);
      responses.push({
        questionId,
        given: answer?.given ?? null,
        correct: answer?.given ? answer.isCorrect : false,
        difficulty: question.difficulty,
        domain: question.domain,
        subdomain: question.subdomain,
        skills: question.skills,
        subject: question.subject,
        module: module.module as 1 | 2,
        timeSpentMs: answer?.timeSpentMs ?? 0,
        flagged: answer?.flagged ?? false,
      });
    }
  }
  return responses;
}

/* ------------------------------------------------------------ read models */

export interface RunnerQuestionState {
  index: number;
  question: Question;
  given: string | null;
  flagged: boolean;
}

export interface RunnerState {
  attempt: {
    id: string;
    title: string;
    kind: TestKind;
    status: string;
    cursor: number;
    onBreak: boolean;
    breakEndsAtMs: number | null;
  };
  module: {
    id: string;
    ordinal: number;
    subject: Subject;
    module: ModuleNumber;
    route: RoutePath | null;
    status: string;
    durationSeconds: number;
    endsAtMs: number | null;
    /** Position in the plan, e.g. "Module 2 of 4". */
    position: number;
    total: number;
  };
  questions: RunnerQuestionState[];
}

export async function getRunnerState(attemptId: string, userId: string): Promise<RunnerState | null> {
  await reconcile(attemptId);
  const attempt = await db.attempt.findFirst({ where: { id: attemptId, userId } });
  if (!attempt) return null;
  if (attempt.status !== "in-progress") return null;

  const module = await ensureModule(attempt, attempt.cursor);
  const questionIds = JSON.parse(module.questionIds) as string[];
  const questions = await getQuestions(questionIds);
  const answers = await db.answer.findMany({ where: { attemptId, moduleId: module.id } });
  const answerBy = new Map(answers.map((a) => [a.questionId, a]));
  const plan = modulePlan(attempt.kind as TestKind);

  return {
    attempt: {
      id: attempt.id,
      title: attempt.title,
      kind: attempt.kind as TestKind,
      status: attempt.status,
      cursor: attempt.cursor,
      onBreak: attempt.onBreak,
      breakEndsAtMs: attempt.breakEndsAt?.getTime() ?? null,
    },
    module: {
      id: module.id,
      ordinal: module.ordinal,
      subject: module.subject as Subject,
      module: module.module as ModuleNumber,
      route: module.route as RoutePath | null,
      status: module.status,
      durationSeconds: module.durationSeconds,
      endsAtMs: module.endsAt?.getTime() ?? null,
      position: module.ordinal + 1,
      total: plan.length,
    },
    questions: questions.map((question, index) => {
      const answer = answerBy.get(question.id);
      return {
        index,
        question,
        given: answer?.given ?? null,
        flagged: answer?.flagged ?? false,
      };
    }),
  };
}
