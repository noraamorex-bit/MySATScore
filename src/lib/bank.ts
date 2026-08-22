/**
 * Server-side access to the question bank.
 *
 * The bank itself is a static JSON file produced by `npm run bank:build` and
 * kept entirely separate from application logic. Administrator changes are
 * stored as a database overlay — edits, retirements, and custom questions — and
 * merged on read, so the generated file is never mutated and can always be
 * rebuilt from source.
 *
 * The merged result is cached per process and invalidated whenever the overlay
 * changes.
 */
import "server-only";
import bankFile from "@content/bank/questions.json";
import { db } from "./db";
import { questionSchema } from "./sat/schema";
import type { Difficulty, Domain, Question, Subject } from "./sat/types";

const STATIC_QUESTIONS = bankFile.questions as unknown as Question[];
const STATIC_IDS = new Set(STATIC_QUESTIONS.map((q) => q.id));

export interface BankSnapshot {
  questions: Question[];
  byId: Map<string, Question>;
  /** Questions available to the assembler (retired ones excluded). */
  active: Question[];
  retiredIds: Set<string>;
  stats: {
    total: number;
    active: number;
    custom: number;
    retired: number;
    bySubject: Record<Subject, number>;
    byDomain: Record<string, number>;
    byDifficulty: Record<Difficulty, number>;
  };
}

let cache: { key: string; snapshot: BankSnapshot } | null = null;

/** Cheap cache key: overlay row count plus the latest overlay timestamp. */
async function overlayKey(): Promise<string> {
  const [count, latest] = await Promise.all([
    db.questionOverride.count(),
    db.questionOverride.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
  ]);
  return `${count}:${latest?.updatedAt.getTime() ?? 0}`;
}

export function invalidateBankCache(): void {
  cache = null;
}

export async function getBank(): Promise<BankSnapshot> {
  const key = await overlayKey();
  if (cache && cache.key === key) return cache.snapshot;

  const overrides = await db.questionOverride.findMany();
  const byId = new Map<string, Question>();
  for (const q of STATIC_QUESTIONS) byId.set(q.id, q);

  const retiredIds = new Set<string>();
  let customCount = 0;
  for (const row of overrides) {
    if (row.retired) retiredIds.add(row.questionId);
    if (row.custom) customCount += 1;
    if (!row.payload) continue;
    try {
      const parsed = questionSchema.safeParse(JSON.parse(row.payload));
      if (parsed.success) byId.set(row.questionId, parsed.data as unknown as Question);
    } catch {
      // A malformed override must never take down the bank; the static version
      // (or, for custom questions, nothing) is used instead.
    }
  }

  const questions = Array.from(byId.values());
  const active = questions.filter((q) => !retiredIds.has(q.id));

  const bySubject = { rw: 0, math: 0 } as Record<Subject, number>;
  const byDomain: Record<string, number> = {};
  const byDifficulty = { easy: 0, medium: 0, hard: 0 } as Record<Difficulty, number>;
  for (const q of active) {
    bySubject[q.subject] += 1;
    byDomain[q.domain] = (byDomain[q.domain] ?? 0) + 1;
    byDifficulty[q.difficulty] += 1;
  }

  const snapshot: BankSnapshot = {
    questions,
    byId,
    active,
    retiredIds,
    stats: {
      total: questions.length,
      active: active.length,
      custom: customCount,
      retired: retiredIds.size,
      bySubject,
      byDomain,
      byDifficulty,
    },
  };
  cache = { key, snapshot };
  return snapshot;
}

export async function getQuestions(ids: string[]): Promise<Question[]> {
  const bank = await getBank();
  const out: Question[] = [];
  for (const id of ids) {
    const q = bank.byId.get(id);
    if (q) out.push(q);
  }
  return out;
}

export async function getQuestion(id: string): Promise<Question | undefined> {
  const bank = await getBank();
  return bank.byId.get(id);
}

export interface BankFilter {
  subject?: Subject;
  domain?: Domain;
  difficulty?: Difficulty;
  search?: string;
  includeRetired?: boolean;
}

/** Filtered listing for the admin console. */
export async function searchBank(filter: BankFilter): Promise<Question[]> {
  const bank = await getBank();
  const needle = filter.search?.trim().toLowerCase();
  return bank.questions.filter((q) => {
    if (!filter.includeRetired && bank.retiredIds.has(q.id)) return false;
    if (filter.subject && q.subject !== filter.subject) return false;
    if (filter.domain && q.domain !== filter.domain) return false;
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
    if (needle) {
      const haystack = [
        q.id, q.prompt, q.subdomain, q.skills.join(" "), q.explanation,
        ...(q.choices?.map((c) => c.text) ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

/** Whether a question came from the generated file rather than the overlay. */
export function isStaticQuestion(id: string): boolean {
  return STATIC_IDS.has(id);
}
