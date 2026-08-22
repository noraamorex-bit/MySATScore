/**
 * Answer grading.
 *
 * Multiple-choice grading is an id comparison. Student-produced responses need
 * more care: the Digital SAT accepts any form of the value that fits the entry
 * field, so `1/2`, `.5`, and `0.5` are all the same answer, and a repeating
 * decimal may be truncated or rounded at the last digit.
 */
import type { Question } from "./types";

/** Normalises a typed response for comparison. */
export function normalizeResponse(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .replace(/^\+/, "")
    .replace(/^(-?)\./, "$10.")
    .replace(/^(-?)0+(\d)/, "$1$2");
}

/** Parses a response as a number, understanding `a/b` fractions. */
export function parseNumericResponse(raw: string): number | null {
  const cleaned = normalizeResponse(raw);
  if (cleaned === "") return null;
  const fraction = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(cleaned);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    return Number(fraction[1]) / denominator;
  }
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/**
 * True when a student response matches the key.
 *
 * A literal match against any accepted form wins outright. Failing that, the
 * response is compared numerically, allowing the tolerance a truncated or
 * rounded entry needs: the real test accepts a value that fills the entry field,
 * so `0.333` and `0.334` both match one third.
 */
export function matchesStudentResponse(question: Question, given: string): boolean {
  const accepted = question.acceptedAnswers ?? [question.correct];
  const normalizedGiven = normalizeResponse(given);
  if (normalizedGiven === "") return false;
  if (accepted.some((form) => normalizeResponse(form) === normalizedGiven)) return true;

  const givenValue = parseNumericResponse(given);
  if (givenValue === null) return false;
  const target = parseNumericResponse(question.correct);
  if (target === null) return false;

  if (Math.abs(givenValue - target) < 1e-9) return true;
  // Accept truncation or rounding at the precision the test taker supplied.
  const decimals = (normalizedGiven.split(".")[1] ?? "").length;
  if (decimals >= 2 && decimals <= 6) {
    const factor = 10 ** decimals;
    const truncated = Math.trunc(target * factor) / factor;
    const rounded = Math.round(target * factor) / factor;
    if (Math.abs(givenValue - truncated) < 1e-9) return true;
    if (Math.abs(givenValue - rounded) < 1e-9) return true;
  }
  return false;
}

export function isCorrect(question: Question, given: string | null | undefined): boolean {
  if (given === null || given === undefined || given === "") return false;
  if (question.answerFormat === "multiple-choice") return given === question.correct;
  return matchesStudentResponse(question, given);
}

/** Human-readable key, for the review screen. */
export function correctAnswerLabel(question: Question): string {
  if (question.answerFormat === "multiple-choice") {
    const choice = question.choices?.find((c) => c.id === question.correct);
    return choice ? `${choice.id}. ${choice.text}` : question.correct;
  }
  const forms = question.acceptedAnswers ?? [question.correct];
  const extra = forms.filter((f) => f !== question.correct).slice(0, 3);
  return extra.length ? `${question.correct} (also accepted: ${extra.join(", ")})` : question.correct;
}
