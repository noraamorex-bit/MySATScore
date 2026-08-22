/**
 * Scoring engine. Converts raw responses into scaled section scores and a
 * 400–1600 total, using the tables in `scoring-config.ts`.
 */
import {
  ROUTING_POLICY,
  SCORING_CONFIG,
  type RoutingPolicy,
  type ScaleAnchors,
  type ScoringConfig,
} from "./scoring-config";
import type { Difficulty, Question, RoutePath, Subject } from "./types";

export interface ScoredResponse {
  questionId: string;
  /** Null when the question was left blank. */
  given: string | null;
  correct: boolean;
  difficulty: Difficulty;
  domain: string;
  subdomain: string;
  skills: string[];
  subject: Subject;
  module: 1 | 2;
  timeSpentMs: number;
  flagged: boolean;
}

export interface SectionScore {
  subject: Subject;
  raw: number;
  attempted: number;
  total: number;
  route: RoutePath | null;
  scaled: number;
  /** True when the routed form caps the attainable score below 800. */
  cappedByRoute: boolean;
  ceiling: number;
}

export interface TotalScore {
  sections: SectionScore[];
  /** 400–1600 when both sections were taken, otherwise the single section. */
  total: number | null;
  scoringVersion: string;
}

/** Linear interpolation across `[raw, scaled]` anchors, clamped at both ends. */
export function interpolateScale(anchors: ScaleAnchors, raw: number): number {
  if (anchors.length === 0) return 200;
  if (raw <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (raw >= last[0]) return last[1];
  for (let i = 1; i < anchors.length; i += 1) {
    const [x0, y0] = anchors[i - 1];
    const [x1, y1] = anchors[i];
    if (raw <= x1) {
      const t = x1 === x0 ? 0 : (raw - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function scaleSection(
  subject: Subject,
  raw: number,
  route: RoutePath | null,
  config: ScoringConfig = SCORING_CONFIG,
): { scaled: number; ceiling: number } {
  const scale = config.scales[subject];
  // A single-module practice run has no route; score it on the upper table so
  // partial practice is not artificially penalised.
  const anchors = route === "lower" ? scale.lower : scale.upper;
  const clampedRaw = Math.max(0, Math.min(scale.maxRaw, raw));
  const rawScaled = interpolateScale(anchors, clampedRaw);
  const scaled = Math.max(
    config.minSectionScore,
    Math.min(config.maxSectionScore, roundTo(rawScaled, config.roundToNearest)),
  );
  const ceiling = Math.max(
    config.minSectionScore,
    Math.min(
      config.maxSectionScore,
      roundTo(interpolateScale(anchors, scale.maxRaw), config.roundToNearest),
    ),
  );
  return { scaled, ceiling };
}

export function scoreSections(
  responses: ScoredResponse[],
  routes: Partial<Record<Subject, RoutePath>>,
  config: ScoringConfig = SCORING_CONFIG,
): TotalScore {
  const subjects = Array.from(new Set(responses.map((r) => r.subject)));
  // Keep test-day order (Reading and Writing, then Math).
  subjects.sort((a, b) => (a === "rw" ? -1 : b === "rw" ? 1 : 0));

  const sections: SectionScore[] = subjects.map((subject) => {
    const inSubject = responses.filter((r) => r.subject === subject);
    const raw = inSubject.filter((r) => r.correct).length;
    const route = routes[subject] ?? null;
    const { scaled, ceiling } = scaleSection(subject, raw, route, config);
    return {
      subject,
      raw,
      attempted: inSubject.filter((r) => r.given !== null).length,
      total: inSubject.length,
      route,
      scaled,
      ceiling,
      cappedByRoute: ceiling < config.maxSectionScore,
    };
  });

  const complete = sections.length === 2;
  return {
    sections,
    total: complete ? sections.reduce((sum, s) => sum + s.scaled, 0) : null,
    scoringVersion: config.version,
  };
}

/* -------------------------------------------------------------- adaptivity */

export interface RoutingDecision {
  route: RoutePath;
  score: number;
  maxScore: number;
  ratio: number;
  threshold: number;
  strategy: RoutingPolicy["strategy"];
  policyVersion: string;
}

/**
 * Decides which second module a test taker receives. Pure and deterministic:
 * identical module-1 answers always yield an identical decision, and the
 * inputs to that decision are returned so results can explain themselves.
 */
export function decideRoute(
  subject: Subject,
  moduleOneQuestions: Question[],
  correctByQuestionId: Record<string, boolean>,
  policy: RoutingPolicy = ROUTING_POLICY,
): RoutingDecision {
  const weightOf = (d: Difficulty) =>
    policy.strategy === "raw" ? 1 : policy.weights[d];

  let score = 0;
  let maxScore = 0;
  for (const q of moduleOneQuestions) {
    const w = weightOf(q.difficulty);
    maxScore += w;
    if (correctByQuestionId[q.id]) score += w;
  }

  const ratio = maxScore === 0 ? 0 : score / maxScore;
  const threshold = policy.upperThreshold[subject];
  return {
    route: ratio >= threshold ? "upper" : "lower",
    score: Number(score.toFixed(3)),
    maxScore: Number(maxScore.toFixed(3)),
    ratio: Number(ratio.toFixed(4)),
    threshold,
    strategy: policy.strategy,
    policyVersion: policy.version,
  };
}
