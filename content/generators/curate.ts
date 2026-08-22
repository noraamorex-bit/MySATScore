/**
 * Builds the curated catalogue: a fixed set of full-length forms with stable
 * ids and stable question lists.
 *
 * Curated forms exist so a user can take "Practice Test 4" and get the same
 * exam every time, and so two users comparing scores took the same test. They
 * are assembled at build time with fixed seeds and written to
 * `content/curated/tests.json`; nothing about them is decided at runtime.
 */
import { assembleTest } from "../../src/lib/sat/assemble";
import type { AssembledTest, Question, TestKind } from "../../src/lib/sat/types";

export interface CuratedCatalogue {
  version: number;
  tests: AssembledTest[];
}

interface FormSpec {
  id: string;
  title: string;
  kind: TestKind;
  seed: string;
}

/**
 * The catalogue mixes full-length forms with single-section forms. Full forms
 * come first so they carry the freshest questions.
 */
function formSpecs(): FormSpec[] {
  const specs: FormSpec[] = [];
  for (let i = 1; i <= 10; i += 1) {
    specs.push({
      id: `curated-full-${String(i).padStart(2, "0")}`,
      title: `Practice Test ${i}`,
      kind: "full",
      seed: `curated:full:${i}`,
    });
  }
  for (let i = 1; i <= 6; i += 1) {
    specs.push({
      id: `curated-rw-${String(i).padStart(2, "0")}`,
      title: `Reading and Writing Set ${i}`,
      kind: "rw-only",
      seed: `curated:rw:${i}`,
    });
    specs.push({
      id: `curated-math-${String(i).padStart(2, "0")}`,
      title: `Math Set ${i}`,
      kind: "math-only",
      seed: `curated:math:${i}`,
    });
  }
  return specs;
}

/** Questions a form of this kind consumes, per subject. */
function demand(kind: TestKind): { rw: number; math: number } {
  const rw = kind === "math-only" ? 0 : 27 * 3;
  const math = kind === "rw-only" ? 0 : 22 * 3;
  return { rw, math };
}

export function buildCuratedCatalogue(bank: Question[]): CuratedCatalogue {
  const tests: AssembledTest[] = [];
  const totals = {
    rw: bank.filter((q) => q.subject === "rw").length,
    math: bank.filter((q) => q.subject === "math").length,
  };

  // Questions already committed to an earlier curated form. Forms are built to
  // avoid one another, but the bank is finite: once too little is left unspent
  // to fill the next form, the ledger resets and a new non-overlapping group
  // begins. That spreads any overlap across the catalogue rather than piling it
  // all onto the last few forms.
  let spent = new Set<string>();
  let unspent = { ...totals };

  for (const spec of formSpecs()) {
    const need = demand(spec.kind);
    if (unspent.rw < need.rw || unspent.math < need.math) {
      spent = new Set<string>();
      unspent = { ...totals };
    }

    const { test, warnings } = assembleTest({
      bank,
      kind: spec.kind,
      seed: spec.seed,
      id: spec.id,
      title: spec.title,
      curated: true,
      // Prefer unspent questions but allow reuse rather than shipping a short form.
      seenIds: spent,
      reuseIsExpected: true,
    });
    for (const module of [...test.modules, ...Object.values(test.routedModules)]) {
      for (const id of module.questionIds) {
        if (!spent.has(id)) {
          spent.add(id);
          const subject = module.subject;
          unspent[subject] = Math.max(0, unspent[subject] - 1);
        }
      }
    }
    // createdAt would otherwise change on every rebuild and churn the diff.
    test.createdAt = "static";
    if (warnings.length) {
      const unique = Array.from(new Set(warnings));
      console.error(`  ~ ${spec.id}: ${unique.slice(0, 3).join(" | ")}${unique.length > 3 ? ` (+${unique.length - 3} more)` : ""}`);
    }
    tests.push(test);
  }

  return { version: 1, tests };
}
