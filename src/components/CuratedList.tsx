"use client";

import { useFormStatus } from "react-dom";
import { startTestAction } from "@/app/actions";
import type { CatalogueEntry } from "@/lib/catalogue";
import { MODULE_SPEC } from "@/lib/sat/blueprint";
import { formatDuration } from "@/lib/format";

const KIND_LABEL: Record<string, string> = {
  full: "Full length",
  "rw-only": "Reading and Writing",
  "math-only": "Math",
};

function minutesFor(kind: string): number {
  if (kind === "rw-only") return MODULE_SPEC.rw.minutes * 2;
  if (kind === "math-only") return MODULE_SPEC.math.minutes * 2;
  return (MODULE_SPEC.rw.minutes + MODULE_SPEC.math.minutes) * 2;
}

export function CuratedList({ entries }: { entries: CatalogueEntry[] }) {
  if (entries.length === 0) {
    return <div className="card px-5 py-6 text-[14px] text-muted">No forms published yet.</div>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.id} className="card flex flex-col gap-3 p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
              {KIND_LABEL[entry.kind] ?? entry.kind}
            </p>
            <p className="mt-1 text-[16px] font-semibold text-ink">{entry.title}</p>
            <p className="mt-0.5 text-[13px] text-muted">
              {entry.questionCount} questions · {formatDuration(minutesFor(entry.kind) * 60)}
            </p>
          </div>
          <form action={startTestAction} className="mt-auto">
            <input type="hidden" name="curatedId" value={entry.id} />
            <StartButton />
          </form>
        </li>
      ))}
    </ul>
  );
}

function StartButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-ghost btn-sm w-full" disabled={pending}>
      {pending ? "Starting…" : "Start"}
    </button>
  );
}
