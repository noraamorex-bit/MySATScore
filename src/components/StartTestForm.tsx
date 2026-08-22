"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { startTestAction } from "@/app/actions";
import { MODULE_SPEC, TOTAL_TESTING_MINUTES } from "@/lib/sat/blueprint";
import { formatDuration } from "@/lib/format";

const OPTIONS = [
  {
    kind: "full",
    title: "Full-length SAT",
    detail: "Reading and Writing, then Math, with an optional 10-minute break.",
    meta: `98 questions · ${formatDuration(TOTAL_TESTING_MINUTES * 60)}`,
  },
  {
    kind: "rw-only",
    title: "Reading and Writing only",
    detail: "Both adaptive modules, scored on the 200–800 section scale.",
    meta: `54 questions · ${formatDuration(MODULE_SPEC.rw.minutes * 2 * 60)}`,
  },
  {
    kind: "math-only",
    title: "Math only",
    detail: "Both adaptive modules, with calculator and reference sheet.",
    meta: `44 questions · ${formatDuration(MODULE_SPEC.math.minutes * 2 * 60)}`,
  },
] as const;

export function StartTestForm() {
  const [kind, setKind] = useState<string>("full");

  return (
    <form action={startTestAction}>
      <input type="hidden" name="kind" value={kind} />
      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const selected = kind === option.kind;
          return (
            <button
              key={option.kind}
              type="button"
              onClick={() => setKind(option.kind)}
              aria-pressed={selected}
              className={clsx(
                "card flex flex-col items-start gap-1 p-5 text-left transition",
                selected
                  ? "border-accent ring-2 ring-accent/25"
                  : "hover:border-faint/60 hover:shadow-lift",
              )}
            >
              <span className="text-[15px] font-semibold text-ink">{option.title}</span>
              <span className="text-[13.5px] leading-relaxed text-muted">{option.detail}</span>
              <span className="mt-auto pt-2 text-[12px] font-semibold uppercase tracking-wide text-faint">
                {option.meta}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SubmitButton />
        <p className="text-[13px] text-muted">
          Questions are drawn from those you have not seen before.
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Assembling your test…" : "Begin test"}
    </button>
  );
}
