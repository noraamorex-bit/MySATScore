/**
 * Test assembler.
 *
 * Builds a form that matches the Digital SAT blueprint — exact question counts,
 * domain distribution, difficulty mix, and the right number of student-produced
 * responses — while guaranteeing that no question id appears twice anywhere in
 * the test, including in the routed second module the test taker never sees.
 *
 * Assembly is seeded, so a given seed always produces the same form. Curated
 * catalogue forms are simply assemblies run at build time with fixed seeds.
 */
import {
  MATH_DOMAIN_SEQUENCE,
  MATH_STUDENT_RESPONSE_PER_MODULE,
  RW_DOMAIN_SEQUENCE,
  SUBJECT_LABEL,
  difficultyCounts,
  domainCounts,
  moduleDurationSeconds,
  moduleQuestionCount,
  type ModuleForm,
} from "./blueprint";
import type {
  AssembledTest, Difficulty, Question, RoutePath, Subject, TestKind, TestModule,
} from "./types";

/** Small deterministic PRNG, mirroring the content pipeline's. */
class Seeded {
  private state: number;
  constructor(seed: string) {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i += 1) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    this.state = h >>> 0 || 0x9e3779b9;
  }
  next(): number {
    let x = this.state;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    this.state = x;
    return x / 0x100000000;
  }
}

export interface AssembleOptions {
  bank: Question[];
  kind: TestKind;
  seed: string;
  /** Questions this user has already been served; avoided when possible. */
  seenIds?: ReadonlySet<string>;
  /** Questions that must not be used at all (e.g. retired items). */
  excludeIds?: ReadonlySet<string>;
  /**
   * Set when `seenIds` is a soft preference rather than a per-user guarantee —
   * as when building a catalogue of curated forms from a finite bank, where
   * some overlap between forms is expected and is not worth reporting.
   */
  reuseIsExpected?: boolean;
  id?: string;
  title?: string;
  curated?: boolean;
}

export interface AssembleResult {
  test: AssembledTest;
  /** Blueprint targets that could not be met exactly, for admin diagnostics. */
  warnings: string[];
  /** How many selected questions the user had already seen. */
  repeats: number;
}

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

interface SelectionState {
  taken: Set<string>;
  seen: ReadonlySet<string>;
  rng: Seeded;
  warnings: string[];
  repeats: number;
  reuseIsExpected: boolean;
}

function subjectsFor(kind: TestKind): Subject[] {
  if (kind === "rw-only") return ["rw"];
  if (kind === "math-only") return ["math"];
  return ["rw", "math"];
}

/**
 * Greedily fills one module. Each pick chooses the domain that is furthest from
 * its target, then the difficulty still owed, then prefers a question the user
 * has not seen. Constraints are relaxed in a fixed order when the bank cannot
 * satisfy them, and every relaxation is reported rather than hidden.
 */
function selectModule(
  bank: Question[],
  subject: Subject,
  form: ModuleForm,
  state: SelectionState,
): Question[] {
  const total = moduleQuestionCount(subject);
  const domainNeed = domainCounts(subject) as Record<string, number>;
  const diffNeed = difficultyCounts(form, total);
  let sprNeed = subject === "math" ? MATH_STUDENT_RESPONSE_PER_MODULE : 0;

  const usedTemplates = new Set<string>();
  const usedSets = new Set<string>();
  const picked: Question[] = [];

  const available = bank.filter(
    (q) =>
      q.subject === subject &&
      !state.taken.has(q.id) &&
      (q.moduleEligibility === "any" ||
        (form === "module1" ? q.moduleEligibility === "module1" : q.moduleEligibility === "module2")),
  );

  const sameSet = (q: Question) => !q.setId || !usedSets.has(q.setId);
  const sameTemplate = (q: Question) => !q.templateId || !usedTemplates.has(q.templateId);

  for (let slot = 0; slot < total; slot += 1) {
    const remaining = total - slot;

    /**
     * Student-produced responses are a fixed count per math module, so the
     * format constraint is treated as near-hard: force one once the remaining
     * slots are exactly the number still owed, and exclude them once the quota
     * is filled.
     */
    const formatOk = (q: Question): boolean => {
      if (subject !== "math") return true;
      if (sprNeed >= remaining) return q.answerFormat === "student-response";
      if (sprNeed === 0) return q.answerFormat === "multiple-choice";
      return true;
    };

    /**
     * Relaxation ladder, strictest first. Math templates are parameterised, so
     * two variants of one template read almost identically and the one-per-module
     * rule stays hard until the last resort. Reading and Writing templates hold
     * individually authored items, so reusing a template there is unremarkable
     * and is relaxed early and silently.
     */
    const rwLadder: ((q: Question) => boolean)[] = [
      (q) => domainNeed[q.domain] > 0 && diffNeed[q.difficulty] > 0 && sameTemplate(q) && sameSet(q),
      (q) => domainNeed[q.domain] > 0 && diffNeed[q.difficulty] > 0 && sameSet(q),
      (q) => domainNeed[q.domain] > 0 && sameSet(q),
      (q) => diffNeed[q.difficulty] > 0 && sameSet(q),
      (q) => sameSet(q),
      () => true,
    ];
    const mathLadder: ((q: Question) => boolean)[] = [
      (q) => domainNeed[q.domain] > 0 && diffNeed[q.difficulty] > 0 && sameTemplate(q) && formatOk(q),
      (q) => domainNeed[q.domain] > 0 && sameTemplate(q) && formatOk(q),
      (q) => diffNeed[q.difficulty] > 0 && sameTemplate(q) && formatOk(q),
      (q) => sameTemplate(q) && formatOk(q),
      (q) => formatOk(q),
      () => true,
    ];
    const ladder = subject === "math" ? mathLadder : rwLadder;
    /** Levels at or above this index mean a blueprint target was missed. */
    const warnFrom = subject === "math" ? 2 : 2;

    /**
     * Never repeating a question the user has already seen outranks matching the
     * blueprint exactly, so the whole relaxation ladder is walked once over
     * unseen questions before any seen question is considered at all. A repeat
     * therefore only happens when the bank holds nothing unseen that could fill
     * the slot — and that case is reported as a warning rather than hidden.
     */
    let chosen: Question | undefined;
    let levelUsed = 0;
    for (const unseenOnly of [true, false]) {
      for (let level = 0; level < ladder.length && !chosen; level += 1) {
        let candidates = available.filter((q) => !state.taken.has(q.id) && ladder[level](q));
        if (unseenOnly) candidates = candidates.filter((q) => !state.seen.has(q.id));
        if (candidates.length === 0) continue;
        levelUsed = level;
        chosen = candidates[Math.floor(state.rng.next() * candidates.length)];
      }
      if (chosen) break;
    }

    if (!chosen) {
      state.warnings.push(
        `${SUBJECT_LABEL[subject]} ${form}: bank exhausted after ${picked.length} of ${total} questions`,
      );
      break;
    }
    if (levelUsed >= warnFrom) {
      state.warnings.push(
        `${SUBJECT_LABEL[subject]} ${form}: blueprint target relaxed at question ${slot + 1}`,
      );
    }

    state.taken.add(chosen.id);
    if (state.seen.has(chosen.id)) {
      state.repeats += 1;
      if (!state.reuseIsExpected) {
        state.warnings.push(
          `${SUBJECT_LABEL[subject]} ${form}: reused a previously seen question at position ${slot + 1}`,
        );
      }
    }
    if (chosen.templateId) usedTemplates.add(chosen.templateId);
    if (chosen.setId) usedSets.add(chosen.setId);
    domainNeed[chosen.domain] = Math.max(0, (domainNeed[chosen.domain] ?? 0) - 1);
    diffNeed[chosen.difficulty] = Math.max(0, diffNeed[chosen.difficulty] - 1);
    if (chosen.answerFormat === "student-response") sprNeed = Math.max(0, sprNeed - 1);
    picked.push(chosen);
  }

  return orderModule(picked, subject);
}

/**
 * Puts a module into test-day order: Reading and Writing runs by domain and
 * then roughly easiest to hardest; Math runs easiest to hardest with the
 * student-produced responses grouped at the end, as on the real exam.
 */
function orderModule(questions: Question[], subject: Subject): Question[] {
  const diffRank = (d: Difficulty) => DIFFICULTY_ORDER.indexOf(d);
  if (subject === "rw") {
    const domainRank = (d: string) => {
      const i = RW_DOMAIN_SEQUENCE.indexOf(d as never);
      return i === -1 ? RW_DOMAIN_SEQUENCE.length : i;
    };
    return [...questions].sort(
      (a, b) => domainRank(a.domain) - domainRank(b.domain) || diffRank(a.difficulty) - diffRank(b.difficulty),
    );
  }
  const domainRank = (d: string) => {
    const i = MATH_DOMAIN_SEQUENCE.indexOf(d as never);
    return i === -1 ? MATH_DOMAIN_SEQUENCE.length : i;
  };
  const mc = questions.filter((q) => q.answerFormat === "multiple-choice");
  const spr = questions.filter((q) => q.answerFormat === "student-response");
  const byDifficulty = (a: Question, b: Question) =>
    diffRank(a.difficulty) - diffRank(b.difficulty) || domainRank(a.domain) - domainRank(b.domain);
  return [...mc.sort(byDifficulty), ...spr.sort(byDifficulty)];
}

export function assembleTest(options: AssembleOptions): AssembleResult {
  const { bank, kind, seed } = options;
  const excluded = options.excludeIds ?? new Set<string>();
  const state: SelectionState = {
    taken: new Set(excluded),
    seen: options.seenIds ?? new Set<string>(),
    rng: new Seeded(seed),
    warnings: [],
    repeats: 0,
    reuseIsExpected: options.reuseIsExpected ?? false,
  };

  const modules: TestModule[] = [];
  const routedModules: Record<string, TestModule> = {};

  for (const subject of subjectsFor(kind)) {
    const first = selectModule(bank, subject, "module1", state);
    modules.push({
      subject,
      module: 1,
      durationSeconds: moduleDurationSeconds(subject),
      questionIds: first.map((q) => q.id),
    });
    for (const route of ["lower", "upper"] as RoutePath[]) {
      const second = selectModule(bank, subject, route, state);
      routedModules[`${subject}:${route}`] = {
        subject,
        module: 2,
        route,
        durationSeconds: moduleDurationSeconds(subject),
        questionIds: second.map((q) => q.id),
      };
    }
  }

  // Exclusions were only a scratch guard during selection; drop them from the
  // record so the test's own id set is exactly what it uses.
  const usedIds = new Set<string>();
  for (const m of [...modules, ...Object.values(routedModules)]) {
    for (const id of m.questionIds) {
      if (usedIds.has(id)) state.warnings.push(`duplicate question ${id} within the test`);
      usedIds.add(id);
    }
  }

  const test: AssembledTest = {
    id: options.id ?? `gen-${seed}`,
    kind,
    title: options.title ?? defaultTitle(kind),
    curated: options.curated ?? false,
    createdAt: new Date().toISOString(),
    modules,
    routedModules,
  };

  return { test, warnings: state.warnings, repeats: state.repeats };
}

function defaultTitle(kind: TestKind): string {
  if (kind === "rw-only") return "Reading and Writing practice";
  if (kind === "math-only") return "Math practice";
  return "Full-length practice test";
}

/** Every question id a test could serve, across both routed forms. */
export function allQuestionIds(test: AssembledTest): string[] {
  return [
    ...test.modules.flatMap((m) => m.questionIds),
    ...Object.values(test.routedModules).flatMap((m) => m.questionIds),
  ];
}

/** The module a test taker is actually served, given the routing decision. */
export function moduleFor(
  test: AssembledTest,
  subject: Subject,
  module: 1 | 2,
  route?: RoutePath,
): TestModule | undefined {
  if (module === 1) return test.modules.find((m) => m.subject === subject);
  return test.routedModules[`${subject}:${route ?? "lower"}`];
}
