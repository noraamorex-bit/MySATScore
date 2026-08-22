/**
 * Administrator operations over the question bank, curated forms, and scoring
 * configuration.
 *
 * Every write lands in the database overlay rather than in the generated bank
 * file, so the bank stays reproducible from source and an administrator's
 * change is always reversible.
 */
import "server-only";
import { db } from "./db";
import { getBank, invalidateBankCache, isStaticQuestion } from "./bank";
import { questionSchema } from "./sat/schema";
import { assembleTest } from "./sat/assemble";
import type { AssembledTest, Question, TestKind } from "./sat/types";

export interface SaveResult {
  ok: boolean;
  errors: string[];
  questionId?: string;
}

/** Validates and stores a question, creating or replacing the overlay row. */
export async function saveQuestion(input: unknown, note?: string): Promise<SaveResult> {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      ),
    };
  }
  const question = parsed.data as unknown as Question;

  await db.questionOverride.upsert({
    where: { questionId: question.id },
    create: {
      questionId: question.id,
      payload: JSON.stringify(question),
      custom: !isStaticQuestion(question.id),
      note,
    },
    update: { payload: JSON.stringify(question), note },
  });
  invalidateBankCache();
  return { ok: true, errors: [], questionId: question.id };
}

/**
 * Retires a question. Retired questions stay readable — so past attempts still
 * render — but the assembler will not serve them again.
 */
export async function setRetired(questionId: string, retired: boolean, note?: string): Promise<void> {
  await db.questionOverride.upsert({
    where: { questionId },
    create: { questionId, retired, custom: !isStaticQuestion(questionId), note },
    update: { retired, note },
  });
  invalidateBankCache();
}

/**
 * Removes an administrator's changes to a question. For a bank question this
 * restores the generated version; for a custom question it deletes it.
 */
export async function revertQuestion(questionId: string): Promise<void> {
  await db.questionOverride.deleteMany({ where: { questionId } });
  invalidateBankCache();
}

/**
 * Replaces a flawed question: retires the original and stores a replacement
 * under a new id, keeping the audit trail intact.
 */
export async function replaceQuestion(
  originalId: string,
  replacement: unknown,
  reason: string,
): Promise<SaveResult> {
  const saved = await saveQuestion(replacement, `Replacement for ${originalId}: ${reason}`);
  if (!saved.ok) return saved;
  await setRetired(originalId, true, `Replaced by ${saved.questionId}: ${reason}`);
  return saved;
}

/* --------------------------------------------------------------- importing */

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/** Imports an array of questions, validating each one independently. */
export async function importQuestions(payload: unknown[], note: string): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  for (const [index, raw] of payload.entries()) {
    const saved = await saveQuestion(raw, note);
    if (saved.ok) result.imported += 1;
    else {
      result.skipped += 1;
      result.errors.push(`Row ${index + 1}: ${saved.errors.join("; ")}`);
    }
  }
  return result;
}

/**
 * Parses a CSV question export.
 *
 * The format is deliberately flat so it can be produced in a spreadsheet:
 * one row per question, with the four choices in their own columns and skills
 * separated by `|`.
 */
export const CSV_COLUMNS = [
  "id", "subject", "domain", "subdomain", "skills", "difficulty", "prompt",
  "choiceA", "choiceB", "choiceC", "choiceD", "correct", "explanation",
  "calculator", "answerFormat", "acceptedAnswers", "passage",
] as const;

export function parseCsv(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const errors: string[] = [];
  const lines = splitCsvRows(text).filter((row) => row.some((cell) => cell.trim() !== ""));
  if (lines.length < 2) return { rows: [], errors: ["The file has no data rows."] };

  const header = lines[0].map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = lines[i];
    if (cells.length !== header.length) {
      errors.push(`Row ${i + 1}: expected ${header.length} columns, found ${cells.length}`);
      continue;
    }
    rows.push(Object.fromEntries(header.map((key, index) => [key, cells[index]])));
  }
  return { rows, errors };
}

/** Minimal RFC 4180 reader: quoted fields, escaped quotes, embedded newlines. */
function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') { quoted = true; continue; }
    if (char === ",") { row.push(field); field = ""; continue; }
    if (char === "\r") continue;
    if (char === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    field += char;
  }
  row.push(field);
  rows.push(row);
  return rows;
}

/** Turns a CSV row into a question object for validation. */
export function csvRowToQuestion(row: Record<string, string>): unknown {
  const answerFormat = (row.answerFormat || "multiple-choice").trim();
  const skills = (row.skills ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const accepted = (row.acceptedAnswers ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: row.id?.trim(),
    subject: row.subject?.trim(),
    moduleEligibility: "any",
    domain: row.domain?.trim(),
    subdomain: row.subdomain?.trim() || "Imported",
    skills: skills.length ? skills : ["Imported"],
    difficulty: row.difficulty?.trim(),
    stimulus: row.passage?.trim()
      ? { type: "passage", paragraphs: row.passage.split("\n\n").map((p) => p.trim()).filter(Boolean) }
      : undefined,
    prompt: row.prompt,
    answerFormat,
    choices:
      answerFormat === "multiple-choice"
        ? [
            { id: "A", text: row.choiceA },
            { id: "B", text: row.choiceB },
            { id: "C", text: row.choiceC },
            { id: "D", text: row.choiceD },
          ]
        : undefined,
    correct: row.correct?.trim(),
    acceptedAnswers: answerFormat === "student-response"
      ? (accepted.length ? accepted : [row.correct?.trim()])
      : undefined,
    explanation: row.explanation,
    calculator: row.subject?.trim() === "math" ? (row.calculator?.trim() || "recommended") : undefined,
    source: { kind: "imported", attribution: "Imported by an administrator" },
    v: 1,
  };
}

/** CSV export of the current bank, for round-tripping through a spreadsheet. */
export async function exportCsv(): Promise<string> {
  const bank = await getBank();
  const escape = (value: string) => `"${(value ?? "").replace(/"/g, '""')}"`;
  const lines = [CSV_COLUMNS.join(",")];
  for (const q of bank.questions) {
    const choices = Object.fromEntries((q.choices ?? []).map((c) => [c.id, c.text]));
    lines.push(
      [
        q.id, q.subject, q.domain, q.subdomain, q.skills.join("|"), q.difficulty, q.prompt,
        choices.A ?? "", choices.B ?? "", choices.C ?? "", choices.D ?? "",
        q.correct, q.explanation, q.calculator ?? "", q.answerFormat,
        (q.acceptedAnswers ?? []).join("|"),
        q.stimulus?.type === "passage" ? q.stimulus.paragraphs.join("\n\n") : "",
      ]
        .map((value) => escape(String(value ?? "")))
        .join(","),
    );
  }
  return lines.join("\n");
}

/* ---------------------------------------------------------- curated forms */

export async function buildCuratedForm(options: {
  id: string;
  title: string;
  kind: TestKind;
  seed?: string;
}): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const bank = await getBank();
  const existing = await db.curatedForm.findUnique({ where: { id: options.id } });
  if (existing) return { ok: false, errors: [`A form with id "${options.id}" already exists.`], warnings: [] };

  // Avoid overlapping with forms that already exist, where the bank allows.
  const published = await db.curatedForm.findMany();
  const spent = new Set<string>();
  for (const row of published) {
    const form = JSON.parse(row.form) as AssembledTest;
    for (const module of [...form.modules, ...Object.values(form.routedModules)]) {
      for (const questionId of module.questionIds) spent.add(questionId);
    }
  }

  const { test, warnings } = assembleTest({
    bank: bank.active,
    kind: options.kind,
    seed: options.seed || `admin:${options.id}`,
    id: options.id,
    title: options.title,
    curated: true,
    seenIds: spent,
  });

  await db.curatedForm.create({
    data: {
      id: options.id,
      title: options.title,
      kind: options.kind,
      form: JSON.stringify(test),
      published: true,
    },
  });
  return { ok: true, errors: [], warnings: Array.from(new Set(warnings)) };
}

export async function setFormPublished(id: string, published: boolean): Promise<void> {
  await db.curatedForm.update({ where: { id }, data: { published } });
}

export async function deleteCuratedForm(id: string): Promise<void> {
  await db.curatedForm.delete({ where: { id } });
}

/* ------------------------------------------------------------------ usage */

export interface UsageRow {
  question: Question;
  timesServed: number;
  timesCorrect: number;
  percentCorrect: number | null;
  lastServedAt: Date | null;
  retired: boolean;
}

/**
 * Question usage with empirical difficulty. A wide gap between the authored
 * difficulty and the observed percent correct is the signal that an item needs
 * review — that is what this view is for.
 */
export async function questionUsage(limit = 200): Promise<UsageRow[]> {
  const bank = await getBank();
  const stats = await db.questionStat.findMany({
    orderBy: { timesServed: "desc" },
    take: limit,
  });
  return stats
    .map((stat) => {
      const question = bank.byId.get(stat.questionId);
      if (!question) return null;
      return {
        question,
        timesServed: stat.timesServed,
        timesCorrect: stat.timesCorrect,
        percentCorrect: stat.timesServed > 0 ? stat.timesCorrect / stat.timesServed : null,
        lastServedAt: stat.lastServedAt,
        retired: bank.retiredIds.has(stat.questionId),
      };
    })
    .filter((row): row is UsageRow => row !== null);
}

/** Bank questions never yet served to anyone. */
export async function unusedQuestionCount(): Promise<number> {
  const bank = await getBank();
  const served = await db.questionStat.count();
  return Math.max(0, bank.stats.active - served);
}
