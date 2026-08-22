/**
 * The catalogue of ready-made tests: the curated forms built with the bank,
 * plus any forms an administrator has created.
 */
import "server-only";
import curatedFile from "@content/curated/tests.json";
import { db } from "./db";
import type { AssembledTest, TestKind } from "./sat/types";

const STATIC_FORMS = curatedFile.tests as unknown as AssembledTest[];

export interface CatalogueEntry {
  id: string;
  title: string;
  kind: TestKind;
  questionCount: number;
  /** True for admin-authored forms, which can be edited or unpublished. */
  managed: boolean;
}

export async function listCatalogue(): Promise<CatalogueEntry[]> {
  const managed = await db.curatedForm.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
  });
  const managedEntries = managed.map((row) => {
    const form = JSON.parse(row.form) as AssembledTest;
    return {
      id: row.id,
      title: row.title,
      kind: row.kind as TestKind,
      questionCount: countServed(form),
      managed: true,
    };
  });
  const staticEntries = STATIC_FORMS.map((form) => ({
    id: form.id,
    title: form.title,
    kind: form.kind,
    questionCount: countServed(form),
    managed: false,
  }));
  return [...staticEntries, ...managedEntries];
}

export async function getCuratedForm(id: string): Promise<AssembledTest | null> {
  const managed = await db.curatedForm.findUnique({ where: { id } });
  if (managed) return JSON.parse(managed.form) as AssembledTest;
  return STATIC_FORMS.find((t) => t.id === id) ?? null;
}

/** Questions a test taker actually sees: module 1 plus one routed module. */
function countServed(form: AssembledTest): number {
  const firsts = form.modules.reduce((sum, m) => sum + m.questionIds.length, 0);
  const seconds = form.modules.reduce((sum, m) => {
    const routed = form.routedModules[`${m.subject}:lower`];
    return sum + (routed?.questionIds.length ?? 0);
  }, 0);
  return firsts + seconds;
}
