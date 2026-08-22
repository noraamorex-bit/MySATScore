/**
 * The Digital SAT test blueprint: structure, timing, and content distribution.
 *
 * Everything the assembler needs to build a form that mirrors the real exam
 * lives here so it can be tuned in one place.
 */
import type { Difficulty, MathDomain, RwDomain, Subject } from "./types";

export const MODULE_SPEC = {
  rw: { questions: 27, minutes: 32 },
  math: { questions: 22, minutes: 35 },
} as const satisfies Record<Subject, { questions: number; minutes: number }>;

export const BREAK_MINUTES = 10;

export const SUBJECT_LABEL: Record<Subject, string> = {
  rw: "Reading and Writing",
  math: "Math",
};

export const SUBJECT_SHORT: Record<Subject, string> = { rw: "R&W", math: "Math" };

/** Section order on test day: Reading and Writing, then Math. */
export const SUBJECT_ORDER: Subject[] = ["rw", "math"];

export const TOTAL_QUESTIONS =
  (MODULE_SPEC.rw.questions + MODULE_SPEC.math.questions) * 2; // 98

export const TOTAL_TESTING_MINUTES =
  (MODULE_SPEC.rw.minutes + MODULE_SPEC.math.minutes) * 2; // 134 = 2h14m

/**
 * Questions per domain in a 27-question Reading and Writing module.
 *
 * The published blueprint gives section-level percentages (Information and
 * Ideas 26%, Craft and Structure 28%, Expression of Ideas 20%, Standard
 * English Conventions 26%). Halving the 54-question section and rounding to
 * whole items gives the per-module counts below.
 */
export const RW_DOMAIN_COUNTS: Record<RwDomain, number> = {
  "craft-and-structure": 8,
  "information-and-ideas": 7,
  "standard-english-conventions": 7,
  "expression-of-ideas": 5,
};

/**
 * Questions per domain in a 22-question Math module (Algebra 35%,
 * Advanced Math 35%, Problem-Solving and Data Analysis 15%, Geometry and
 * Trigonometry 15% of the 44-question section).
 */
export const MATH_DOMAIN_COUNTS: Record<MathDomain, number> = {
  algebra: 8,
  "advanced-math": 8,
  "problem-solving-and-data-analysis": 3,
  "geometry-and-trigonometry": 3,
};

/**
 * Roughly a quarter of Math questions are student-produced responses
 * (grid-ins) rather than multiple choice.
 */
export const MATH_STUDENT_RESPONSE_PER_MODULE = 5;

/**
 * Reading and Writing modules are ordered by domain — the real test presents
 * Craft and Structure, then Information and Ideas, then Expression of Ideas,
 * then Standard English Conventions, loosely easiest-to-hardest within each.
 */
export const RW_DOMAIN_SEQUENCE: RwDomain[] = [
  "craft-and-structure",
  "information-and-ideas",
  "expression-of-ideas",
  "standard-english-conventions",
];

/** Math modules run roughly easiest to hardest, mixing domains throughout. */
export const MATH_DOMAIN_SEQUENCE: MathDomain[] = [
  "algebra",
  "advanced-math",
  "problem-solving-and-data-analysis",
  "geometry-and-trigonometry",
];

/**
 * Difficulty mix by module form.
 *
 * Module 1 is the routing module and carries a representative spread. Module 2
 * is either the lower or upper form; the upper form is where the hard items
 * live and is what makes the top of the scale reachable.
 */
export type ModuleForm = "module1" | "lower" | "upper";

export const DIFFICULTY_MIX: Record<ModuleForm, Record<Difficulty, number>> = {
  module1: { easy: 0.33, medium: 0.45, hard: 0.22 },
  lower: { easy: 0.48, medium: 0.41, hard: 0.11 },
  upper: { easy: 0.15, medium: 0.42, hard: 0.43 },
};

/** Human-facing description of the two module-2 forms (never shown mid-test). */
export const ROUTE_LABEL = { lower: "Standard form", upper: "Advanced form" } as const;

export function moduleDurationSeconds(subject: Subject): number {
  return MODULE_SPEC[subject].minutes * 60;
}

export function moduleQuestionCount(subject: Subject): number {
  return MODULE_SPEC[subject].questions;
}

/**
 * Turns a proportional difficulty mix into exact integer counts that sum to
 * `total`. Largest-remainder rounding keeps the shape of the mix intact.
 */
export function difficultyCounts(
  form: ModuleForm,
  total: number,
): Record<Difficulty, number> {
  const mix = DIFFICULTY_MIX[form];
  const order: Difficulty[] = ["easy", "medium", "hard"];
  const exact = order.map((d) => mix[d] * total);
  const floors = exact.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const byRemainder = order
    .map((d, i) => ({ i, frac: exact[i] - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of byRemainder) {
    if (remainder <= 0) break;
    floors[i] += 1;
    remainder -= 1;
  }
  return { easy: floors[0], medium: floors[1], hard: floors[2] };
}

/**
 * Same largest-remainder approach for domain counts, used when a bank shortage
 * forces the assembler to re-balance.
 */
export function domainCounts(subject: Subject): Record<string, number> {
  return subject === "rw" ? { ...RW_DOMAIN_COUNTS } : { ...MATH_DOMAIN_COUNTS };
}
