/**
 * Results and performance analytics.
 *
 * Everything a results page shows is derived here from the attempt's stored
 * answers and its frozen form, so the numbers on the screen and the numbers in
 * the history dashboard can never disagree.
 */
import "server-only";
import type { Attempt } from "@prisma/client";
import { db } from "./db";
import { getBank } from "./bank";
import { buildScoredResponses } from "./attempts";
import { activeScoringConfig } from "./scoring-store";
import { scoreSections, type ScoredResponse, type TotalScore } from "./sat/scoring";
import { DOMAIN_LABELS, type Difficulty, type Question, type RoutePath, type Subject } from "./sat/types";
import { SUBJECT_LABEL } from "./sat/blueprint";

export interface Breakdown {
  key: string;
  label: string;
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
  accuracy: number;
  /** Median-ish signal: average seconds spent per question in this bucket. */
  averageSeconds: number;
}

export interface ReviewItem {
  index: number;
  subject: Subject;
  module: 1 | 2;
  question: Question;
  given: string | null;
  correct: boolean;
  skipped: boolean;
  flagged: boolean;
  timeSpentMs: number;
}

export interface AttemptResults {
  attempt: {
    id: string;
    title: string;
    kind: string;
    curated: boolean;
    completedAt: Date | null;
    startedAt: Date | null;
    scoringVersion: string | null;
    routingVersion: string | null;
  };
  score: TotalScore;
  routes: Partial<Record<Subject, RoutePath>>;
  summary: {
    answered: number;
    unanswered: number;
    correct: number;
    incorrect: number;
    total: number;
    accuracy: number;
    flagged: number;
    totalTimeMs: number;
    averageSecondsPerQuestion: number;
  };
  byDomain: Breakdown[];
  byDifficulty: Breakdown[];
  bySubject: Breakdown[];
  bySkill: Breakdown[];
  weakestSkills: Breakdown[];
  recommendations: { title: string; detail: string }[];
  review: ReviewItem[];
}

function emptyBreakdown(key: string, label: string): Breakdown {
  return { key, label, correct: 0, incorrect: 0, skipped: 0, total: 0, accuracy: 0, averageSeconds: 0 };
}

function tally(
  responses: ScoredResponse[],
  keyOf: (r: ScoredResponse) => string[],
  labelOf: (key: string) => string,
): Breakdown[] {
  const map = new Map<string, Breakdown & { timeMs: number }>();
  for (const r of responses) {
    for (const key of keyOf(r)) {
      const row = map.get(key) ?? { ...emptyBreakdown(key, labelOf(key)), timeMs: 0 };
      row.total += 1;
      row.timeMs += r.timeSpentMs;
      if (r.given === null) row.skipped += 1;
      else if (r.correct) row.correct += 1;
      else row.incorrect += 1;
      map.set(key, row);
    }
  }
  return Array.from(map.values())
    .map((row) => ({
      key: row.key,
      label: row.label,
      correct: row.correct,
      incorrect: row.incorrect,
      skipped: row.skipped,
      total: row.total,
      accuracy: row.total ? row.correct / row.total : 0,
      averageSeconds: row.total ? Math.round(row.timeMs / row.total / 1000) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easier questions",
  medium: "Medium questions",
  hard: "Harder questions",
};

export async function getAttemptResults(
  attemptId: string,
  userId: string,
): Promise<AttemptResults | null> {
  const attempt = await db.attempt.findFirst({ where: { id: attemptId, userId } });
  if (!attempt) return null;

  const responses = await buildScoredResponses(attempt);
  const routes = safeParse<Partial<Record<Subject, RoutePath>>>(attempt.routes, {});
  const score = attempt.scoreSnapshot
    ? safeParse<TotalScore>(attempt.scoreSnapshot, await recompute(attempt, responses, routes))
    : await recompute(attempt, responses, routes);

  const bank = await getBank();
  const answers = await db.answer.findMany({ where: { attemptId } });
  const answerBy = new Map(answers.map((a) => [a.questionId, a]));

  const review: ReviewItem[] = responses.map((r, index) => {
    const question = bank.byId.get(r.questionId);
    const answer = answerBy.get(r.questionId);
    return {
      index,
      subject: r.subject,
      module: r.module,
      question: question as Question,
      given: r.given,
      correct: r.correct,
      skipped: r.given === null,
      flagged: answer?.flagged ?? false,
      timeSpentMs: r.timeSpentMs,
    };
  }).filter((item) => Boolean(item.question));

  const answered = responses.filter((r) => r.given !== null).length;
  const correct = responses.filter((r) => r.correct).length;
  const totalTimeMs = responses.reduce((sum, r) => sum + r.timeSpentMs, 0);

  const byDomain = tally(responses, (r) => [r.domain], (k) => DOMAIN_LABELS[k as never] ?? k);
  const byDifficulty = tally(
    responses,
    (r) => [r.difficulty],
    (k) => DIFFICULTY_LABEL[k as Difficulty] ?? k,
  ).sort((a, b) => ["easy", "medium", "hard"].indexOf(a.key) - ["easy", "medium", "hard"].indexOf(b.key));
  const bySubject = tally(responses, (r) => [r.subject], (k) => SUBJECT_LABEL[k as Subject] ?? k);
  const bySkill = tally(responses, (r) => (r.skills.length ? r.skills : [r.subdomain]), (k) => k);

  // A skill needs at least three questions before a low score means anything.
  const weakestSkills = bySkill
    .filter((s) => s.total >= 3 && s.accuracy < 0.75)
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, 6);

  return {
    attempt: {
      id: attempt.id,
      title: attempt.title,
      kind: attempt.kind,
      curated: attempt.curated,
      completedAt: attempt.completedAt,
      startedAt: attempt.startedAt ?? attempt.createdAt,
      scoringVersion: attempt.scoringVersion,
      routingVersion: attempt.routingVersion,
    },
    score,
    routes,
    summary: {
      answered,
      unanswered: responses.length - answered,
      correct,
      incorrect: answered - correct,
      total: responses.length,
      accuracy: responses.length ? correct / responses.length : 0,
      flagged: review.filter((r) => r.flagged).length,
      totalTimeMs,
      averageSecondsPerQuestion: responses.length
        ? Math.round(totalTimeMs / responses.length / 1000)
        : 0,
    },
    byDomain,
    byDifficulty,
    bySubject,
    bySkill,
    weakestSkills,
    recommendations: buildRecommendations(byDomain, byDifficulty, weakestSkills, responses),
    review,
  };
}

async function recompute(
  attempt: Attempt,
  responses: ScoredResponse[],
  routes: Partial<Record<Subject, RoutePath>>,
): Promise<TotalScore> {
  const config = await activeScoringConfig();
  void attempt;
  return scoreSections(responses, routes, config);
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Turns the breakdowns into concrete next steps. The advice is deliberately
 * specific — a domain name and a number — rather than generic encouragement.
 */
function buildRecommendations(
  byDomain: Breakdown[],
  byDifficulty: Breakdown[],
  weakest: Breakdown[],
  responses: ScoredResponse[],
): { title: string; detail: string }[] {
  const out: { title: string; detail: string }[] = [];

  const weakDomains = byDomain
    .filter((d) => d.total >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2);
  for (const domain of weakDomains) {
    if (domain.accuracy >= 0.8) continue;
    out.push({
      title: `Practice ${domain.label}`,
      detail: `You answered ${domain.correct} of ${domain.total} correctly (${Math.round(domain.accuracy * 100)}%). This was among your weakest domains on this test.`,
    });
  }

  const easy = byDifficulty.find((d) => d.key === "easy");
  if (easy && easy.total >= 4 && easy.accuracy < 0.85) {
    out.push({
      title: "Slow down on the easier questions",
      detail: `You missed ${easy.incorrect} of ${easy.total} questions rated easier. Points lost early cost the same as points lost late, and these are the fastest to recover.`,
    });
  }

  const skipped = responses.filter((r) => r.given === null).length;
  if (skipped > 0) {
    out.push({
      title: `Answer all ${skipped} remaining question${skipped === 1 ? "" : "s"}`,
      detail:
        "There is no penalty for a wrong answer on the SAT, so a guess is always worth more than a blank.",
    });
  }

  const rushed = responses.filter((r) => r.given !== null && !r.correct && r.timeSpentMs < 15000);
  if (rushed.length >= 3) {
    out.push({
      title: "Watch for rushed answers",
      detail: `${rushed.length} of your incorrect answers were submitted in under 15 seconds. Re-reading the question stem is usually cheaper than the point.`,
    });
  }

  for (const skill of weakest.slice(0, 2)) {
    out.push({
      title: `Review: ${skill.label}`,
      detail: `${skill.correct} of ${skill.total} correct. Work through the explanations for these questions in the review tab before your next test.`,
    });
  }

  if (out.length === 0) {
    out.push({
      title: "Keep the streak going",
      detail:
        "No domain fell below 80% on this test. Take another full-length form to confirm the result under timed conditions.",
    });
  }
  return out.slice(0, 5);
}

/* ------------------------------------------------------------- history */

export interface HistoryEntry {
  id: string;
  title: string;
  kind: string;
  completedAt: Date;
  total: number | null;
  rw: number | null;
  math: number | null;
  correct: number;
  totalQuestions: number;
  accuracy: number;
  routes: Partial<Record<Subject, RoutePath>>;
}

export async function getHistory(userId: string, limit = 50): Promise<HistoryEntry[]> {
  const attempts = await db.attempt.findMany({
    where: { userId, status: "completed" },
    orderBy: { completedAt: "asc" },
    take: limit,
  });

  const entries: HistoryEntry[] = [];
  for (const attempt of attempts) {
    const score = attempt.scoreSnapshot ? safeParse<TotalScore | null>(attempt.scoreSnapshot, null) : null;
    const counts = await db.answer.aggregate({
      where: { attemptId: attempt.id },
      _count: { _all: true },
    });
    const correct = await db.answer.count({ where: { attemptId: attempt.id, isCorrect: true } });
    const totalQuestions = await countFormQuestions(attempt);
    entries.push({
      id: attempt.id,
      title: attempt.title,
      kind: attempt.kind,
      completedAt: attempt.completedAt ?? attempt.createdAt,
      total: score?.total ?? null,
      rw: score?.sections.find((s) => s.subject === "rw")?.scaled ?? null,
      math: score?.sections.find((s) => s.subject === "math")?.scaled ?? null,
      correct,
      totalQuestions,
      accuracy: totalQuestions ? correct / totalQuestions : 0,
    routes: safeParse<Partial<Record<Subject, RoutePath>>>(attempt.routes, {}),
    });
    void counts;
  }
  return entries;
}

async function countFormQuestions(attempt: Attempt): Promise<number> {
  const modules = await db.attemptModule.findMany({
    where: { attemptId: attempt.id, status: { in: ["submitted", "expired"] } },
    select: { questionIds: true },
  });
  return modules.reduce((sum, m) => sum + safeParse<string[]>(m.questionIds, []).length, 0);
}

/** Aggregate performance across every completed attempt, for the dashboard. */
export async function getUserOverview(userId: string) {
  const history = await getHistory(userId);
  const completed = history.filter((h) => h.total !== null);
  const best = completed.reduce<number | null>(
    (max, h) => (h.total !== null && (max === null || h.total > max) ? h.total : max),
    null,
  );
  const latest = completed.length ? completed[completed.length - 1] : null;
  const first = completed.length ? completed[0] : null;
  const exposures = await db.questionExposure.count({ where: { userId } });
  const bank = await getBank();

  return {
    testsCompleted: history.length,
    best,
    latest: latest?.total ?? null,
    delta: latest && first && latest.total !== null && first.total !== null && completed.length > 1
      ? latest.total - first.total
      : null,
    questionsSeen: exposures,
    bankSize: bank.stats.active,
    history,
  };
}
