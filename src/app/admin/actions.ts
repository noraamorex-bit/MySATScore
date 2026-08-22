"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  buildCuratedForm, csvRowToQuestion, deleteCuratedForm, importQuestions, parseCsv,
  replaceQuestion, revertQuestion, saveQuestion, setFormPublished, setRetired,
} from "@/lib/admin";
import { publishScoringConfig } from "@/lib/scoring-store";
import { SCORING_CONFIG, type ScoringConfig } from "@/lib/sat/scoring-config";
import type { TestKind } from "@/lib/sat/types";

export interface ActionState {
  error?: string;
  success?: string;
  details?: string[];
}

/** Saves a question from the editor's JSON field. */
export async function saveQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = String(formData.get("payload") ?? "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { error: `That is not valid JSON: ${(error as Error).message}` };
  }

  const replacesId = String(formData.get("replacesId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || undefined;

  const result = replacesId
    ? await replaceQuestion(replacesId, parsed, note ?? "Replaced from the admin console")
    : await saveQuestion(parsed, note);

  if (!result.ok) return { error: "The question did not validate.", details: result.errors };
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${result.questionId}`);
  return { success: `Saved ${result.questionId}.` };
}

export async function retireQuestionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const questionId = String(formData.get("questionId"));
  const retired = formData.get("retired") === "true";
  await setRetired(questionId, retired, String(formData.get("note") ?? "") || undefined);
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${questionId}`);
}

export async function revertQuestionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const questionId = String(formData.get("questionId"));
  await revertQuestion(questionId);
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

/** Imports questions from pasted JSON or CSV. */
export async function importAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const format = String(formData.get("format") ?? "json");
  const text = String(formData.get("payload") ?? "").trim();
  if (!text) return { error: "Paste some JSON or CSV first." };

  let rows: unknown[] = [];
  const parseErrors: string[] = [];

  if (format === "json") {
    try {
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : [parsed];
    } catch (error) {
      return { error: `That is not valid JSON: ${(error as Error).message}` };
    }
  } else {
    const csv = parseCsv(text);
    parseErrors.push(...csv.errors);
    rows = csv.rows.map(csvRowToQuestion);
  }

  const result = await importQuestions(rows, `Imported (${format})`);
  revalidatePath("/admin/questions");
  revalidatePath("/admin");

  const details = [...parseErrors, ...result.errors].slice(0, 12);
  if (result.imported === 0) {
    return { error: "Nothing was imported.", details };
  }
  return {
    success: `Imported ${result.imported} question${result.imported === 1 ? "" : "s"}${
      result.skipped ? `, skipped ${result.skipped}` : ""
    }.`,
    details,
  };
}

export async function buildFormAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const kind = String(formData.get("kind") ?? "full") as TestKind;
  const seed = String(formData.get("seed") ?? "").trim();

  if (!/^[a-z0-9-]{3,60}$/.test(id)) {
    return { error: "Use a lowercase id with hyphens, 3–60 characters." };
  }
  if (!title) return { error: "Give the form a title." };

  const result = await buildCuratedForm({ id, title, kind, seed: seed || undefined });
  if (!result.ok) return { error: result.errors.join(" ") };
  revalidatePath("/admin/tests");
  revalidatePath("/practice");
  return {
    success: `Built "${title}".`,
    details: result.warnings.length
      ? [`${result.warnings.length} blueprint relaxation(s):`, ...result.warnings.slice(0, 6)]
      : undefined,
  };
}

export async function toggleFormAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await setFormPublished(String(formData.get("id")), formData.get("published") === "true");
  revalidatePath("/admin/tests");
  revalidatePath("/practice");
}

export async function deleteFormAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await deleteCuratedForm(String(formData.get("id")));
  revalidatePath("/admin/tests");
  revalidatePath("/practice");
}

/** Publishes a replacement scoring configuration. */
export async function publishScoringAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = String(formData.get("payload") ?? "");
  let parsed: ScoringConfig;
  try {
    parsed = JSON.parse(raw) as ScoringConfig;
  } catch (error) {
    return { error: `That is not valid JSON: ${(error as Error).message}` };
  }

  const problems: string[] = [];
  if (!parsed.version || typeof parsed.version !== "string") problems.push("`version` is required.");
  if (!parsed.label) problems.push("`label` is required.");
  if (!parsed.scales?.rw || !parsed.scales?.math) problems.push("Both `scales.rw` and `scales.math` are required.");
  for (const subject of ["rw", "math"] as const) {
    const scale = parsed.scales?.[subject];
    if (!scale) continue;
    for (const route of ["lower", "upper"] as const) {
      const anchors = scale[route];
      if (!Array.isArray(anchors) || anchors.length < 2) {
        problems.push(`\`scales.${subject}.${route}\` needs at least two [raw, scaled] anchors.`);
        continue;
      }
      let previous = -Infinity;
      for (const [raw, scaled] of anchors) {
        if (typeof raw !== "number" || typeof scaled !== "number") {
          problems.push(`\`scales.${subject}.${route}\` anchors must be pairs of numbers.`);
          break;
        }
        if (raw <= previous) {
          problems.push(`\`scales.${subject}.${route}\` anchors must be sorted by raw score.`);
          break;
        }
        previous = raw;
      }
    }
  }
  if (problems.length) return { error: "The configuration is not usable.", details: problems };

  await publishScoringConfig({
    ...SCORING_CONFIG,
    ...parsed,
    roundToNearest: parsed.roundToNearest ?? SCORING_CONFIG.roundToNearest,
    minSectionScore: parsed.minSectionScore ?? SCORING_CONFIG.minSectionScore,
    maxSectionScore: parsed.maxSectionScore ?? SCORING_CONFIG.maxSectionScore,
  });
  revalidatePath("/admin/scoring");
  revalidatePath("/about");
  return { success: `Published ${parsed.version}. New attempts are scored with it immediately.` };
}
