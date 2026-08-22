/**
 * Authoring helpers shared by every generator: choice assembly, id minting,
 * fraction arithmetic, and the small amount of LaTeX formatting the bank uses.
 *
 * Inline math is written between `$` delimiters and rendered with KaTeX.
 */
import { Rng } from "./rng";
import type { Choice, Question } from "../../src/lib/sat/types";

export const LETTERS = ["A", "B", "C", "D"] as const;

/* ------------------------------------------------------------------- number */

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export interface Frac {
  n: number;
  d: number;
}

export function frac(n: number, d: number): Frac {
  if (d === 0) throw new Error("frac: zero denominator");
  const g = gcd(n, d);
  const sign = d < 0 ? -1 : 1;
  return { n: (sign * n) / g, d: (sign * d) / g };
}

export function fracEquals(a: Frac, b: Frac): boolean {
  return a.n * b.d === b.n * a.d;
}

/** LaTeX for a fraction, collapsing to an integer when the denominator is 1. */
export function texFrac({ n, d }: Frac): string {
  if (d === 1) return `${n}`;
  if (n < 0) return `-\\dfrac{${-n}}{${d}}`;
  return `\\dfrac{${n}}{${d}}`;
}

/** Plain-text form of a fraction, used for grid-in answers. */
export function plainFrac({ n, d }: Frac): string {
  return d === 1 ? `${n}` : `${n}/${d}`;
}

/** Trims float noise: 2.5000000004 -> "2.5", 3 -> "3". */
export function num(value: number, decimals = 4): string {
  if (!Number.isFinite(value)) return "undefined";
  const rounded = Number(value.toFixed(decimals));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/** "+ 3" / "- 3", for building expressions. */
export function signed(value: number, spaced = true): string {
  const sign = value < 0 ? "-" : "+";
  return spaced ? `${sign} ${Math.abs(value)}` : `${sign}${Math.abs(value)}`;
}

/** A single term: coefficient, variable, optional power. Handles ±1 and 0. */
export function term(coef: number, variable = "x", power = 1): string {
  if (coef === 0) return "";
  const v = power === 0 ? "" : power === 1 ? variable : `${variable}^{${power}}`;
  if (v === "") return `${coef}`;
  if (coef === 1) return v;
  if (coef === -1) return `-${v}`;
  return `${coef}${v}`;
}

/** `ax + b` with tidy signs; omits zero parts. */
export function linear(a: number, b: number, variable = "x"): string {
  if (a === 0) return `${b}`;
  const head = term(a, variable);
  if (b === 0) return head;
  return `${head} ${signed(b)}`;
}

/** Joins pre-built terms with tidy `+`/`-` separators. */
export function joinTerms(parts: { coef: number; body: string }[]): string {
  const out: string[] = [];
  for (const { coef, body } of parts) {
    if (coef === 0) continue;
    if (out.length === 0) out.push(body);
    else out.push(`${coef < 0 ? "-" : "+"} ${body.replace(/^-/, "")}`);
  }
  return out.length ? out.join(" ") : "0";
}

/** `ax^2 + bx + c` with tidy signs; omits zero terms. */
export function quadratic(a: number, b: number, c: number, variable = "x"): string {
  return joinTerms([
    { coef: a, body: term(a, variable, 2) },
    { coef: b, body: term(b, variable, 1) },
    { coef: c, body: `${c}` },
  ]);
}

/** `(x - r)` style factor with tidy signs. */
export function factorOf(root: number, variable = "x"): string {
  if (root === 0) return variable;
  return `(${variable} ${signed(-root)})`;
}

export function money(value: number): string {
  return `\\$${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ------------------------------------------------------------------ choices */

export interface BuiltChoices {
  choices: Choice[];
  correct: string;
}

const NUMERIC_CORE = /-?\d[\d,]*(\.\d+)?/;

/** Reads the numeric value out of an option, ignoring `$`, `%`, and delimiters. */
export function numericValue(text: string): number | null {
  const cleaned = text
    .replace(/\\d?frac\{[^}]*\}\{[^}]*\}/g, "~")
    .replace(/[$%,\s]/g, "")
    .replace(/\\/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** Rebuilds an option's surrounding formatting around a new number. */
function reformat(template: string, value: number): string | null {
  if (!NUMERIC_CORE.test(template)) return null;
  return template.replace(NUMERIC_CORE, num(value));
}

/**
 * Assembles four answer choices from a correct option and a list of candidate
 * distractors.
 *
 * Candidates are deduplicated in order, so a template can offer more than three
 * and let collisions fall out naturally. If fewer than three survive — which
 * happens when sampled parameters make two error paths coincide — numeric
 * near-misses are synthesised so the item is still a well-formed four-choice
 * question rather than a build failure.
 *
 * When every option parses as a number the choices are sorted ascending, which
 * is how the real test presents numeric answers; otherwise they are shuffled.
 */
export function buildChoices(
  rng: Rng,
  correctText: string,
  candidates: string[],
  opts: { sortNumeric?: boolean } = {},
): BuiltChoices {
  // Keys are compared exactly, not trimmed: punctuation-only options such as
  // "; " and ";" are genuinely different answers in a boundaries item.
  const seen = new Set<string>([correctText]);
  const distractors: string[] = [];
  for (const candidate of candidates) {
    const key = candidate;
    if (!key || key === "$$" || seen.has(key)) continue;
    if (/NaN|Infinity|undefined/.test(key)) continue;
    seen.add(key);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }

  if (distractors.length < 3) {
    const value = numericValue(correctText);
    if (value === null) {
      throw new Error(
        `buildChoices: only ${distractors.length} usable distractors for a non-numeric answer "${correctText}"`,
      );
    }
    const step = Number.isInteger(value) ? 1 : 0.5;
    for (let delta = step; distractors.length < 3 && delta <= step * 40; delta += step) {
      for (const sign of rng.bool() ? [1, -1] : [-1, 1]) {
        const replaced = reformat(correctText, Number((value + sign * delta).toFixed(4)));
        if (!replaced) continue;
        const key = replaced;
        if (seen.has(key)) continue;
        seen.add(key);
        distractors.push(replaced);
        if (distractors.length === 3) break;
      }
    }
  }

  const all = [correctText, ...distractors];
  if (all.length !== 4) {
    throw new Error(`buildChoices: expected 4 options, produced ${all.length}`);
  }

  const values = all.map(numericValue);
  const allNumeric = opts.sortNumeric !== false && values.every((v) => v !== null);

  const ordered = allNumeric
    ? all
        .map((t, i) => ({ t, v: values[i] as number }))
        .sort((a, b) => a.v - b.v)
        .map((o) => o.t)
    : rng.shuffle(all);

  const choices = ordered.map((text, i) => ({ id: LETTERS[i], text }));
  const correct = choices[ordered.indexOf(correctText)].id;
  return { choices, correct };
}

/* ----------------------------------------------------------------- assembly */

export type QuestionDraft = Omit<Question, "id" | "v"> & { id?: string };

/** Zero-pads a variant index so ids sort naturally. */
export function pad(n: number, width = 3): string {
  return String(n).padStart(width, "0");
}

export function mintId(templateId: string, index: number): string {
  return `${templateId}-${pad(index)}`;
}

export function finalize(draft: QuestionDraft, id: string): Question {
  return { ...draft, id, v: 1 };
}

/** Grid-in answers accept every equivalent literal the real test would take. */
export function acceptedNumericForms(value: number | Frac): string[] {
  const forms = new Set<string>();
  if (typeof value === "number") {
    forms.add(num(value));
    if (Number.isInteger(value)) forms.add(`${value}`);
    else {
      // The Digital SAT accepts a truncated or rounded value filling the grid.
      forms.add(value.toFixed(2));
      forms.add(value.toFixed(3));
      forms.add(num(Number(value.toFixed(4))));
      const asFrac = decimalToFraction(value);
      if (asFrac) forms.add(plainFrac(asFrac));
      if (Math.abs(value) < 1) forms.add(num(value).replace(/^(-?)0\./, "$1."));
    }
  } else {
    forms.add(plainFrac(value));
    const dec = value.n / value.d;
    forms.add(num(dec));
    if (!Number.isInteger(dec)) {
      forms.add(dec.toFixed(2));
      forms.add(dec.toFixed(3));
      if (Math.abs(dec) < 1) forms.add(num(dec).replace(/^(-?)0\./, "$1."));
    }
  }
  return Array.from(forms).filter((f) => f.length > 0 && f !== "undefined");
}

/** Exact small-denominator conversion; returns null when none is close. */
function decimalToFraction(value: number, maxDen = 100): Frac | null {
  for (let d = 2; d <= maxDen; d += 1) {
    const n = value * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) return frac(Math.round(n), d);
  }
  return null;
}

/** Sentence-cases a fragment for use at the start of an explanation. */
export function sentence(text: string): string {
  const t = text.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
