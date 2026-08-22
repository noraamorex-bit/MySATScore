/**
 * Splits authored content into plain-text, inline-math, and display-math runs.
 *
 * Content in the bank uses `$...$` for inline math and `$$...$$` for display
 * math, with `\$` for a literal dollar sign in prose. Escaped dollars are
 * swapped for a sentinel before scanning, so a price in a word problem can
 * never be mistaken for the start of an equation - and the scan avoids regex
 * lookbehind, which older mobile Safari does not support.
 */
export type RichRun =
  | { kind: "text"; value: string }
  | { kind: "math"; value: string; display: boolean };

const SENTINEL = "\u0000";

export function parseRich(input: string): RichRun[] {
  const escaped = input.replace(/\\\$/g, SENTINEL);
  const runs: RichRun[] = [];
  const pattern = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(escaped)) !== null) {
    if (match.index > last) {
      runs.push({ kind: "text", value: restoreText(escaped.slice(last, match.index)) });
    }
    const display = match[1] !== undefined;
    const body = display ? match[1] : match[2];
    runs.push({ kind: "math", value: restoreMath(body), display });
    last = pattern.lastIndex;
  }
  if (last < escaped.length) {
    runs.push({ kind: "text", value: restoreText(escaped.slice(last)) });
  }
  return runs;
}

/** In prose, an escaped dollar becomes a plain dollar sign. */
function restoreText(value: string): string {
  return value.split(SENTINEL).join("$");
}

/** Inside math, the escape is what KaTeX expects. */
function restoreMath(value: string): string {
  return value.split(SENTINEL).join("\\$");
}

/** Splits a text run on `*emphasis*` markers. */
export function splitEmphasis(value: string): { text: string; emphasis: boolean }[] {
  const out: { text: string; emphasis: boolean }[] = [];
  const pattern = /\*([^*\n]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value)) !== null) {
    if (match.index > last) out.push({ text: value.slice(last, match.index), emphasis: false });
    out.push({ text: match[1], emphasis: true });
    last = pattern.lastIndex;
  }
  if (last < value.length) out.push({ text: value.slice(last), emphasis: false });
  return out;
}

/** Plain-text rendering, for search indexes and CSV export. */
export function toPlainText(input: string): string {
  return parseRich(input)
    .map((run) => run.value)
    .join(" ")
    .split("*").join("")
    .replace(/\s+/g, " ")
    .trim();
}
