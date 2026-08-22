"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RunnerState } from "@/lib/attempts";
import { SUBJECT_LABEL } from "@/lib/sat/blueprint";
import { formatDuration } from "@/lib/format";

/**
 * Directions screen shown before each module. The clock does not start until
 * the test taker presses the button, matching the real administration.
 */
export function ModuleIntro({ state }: { state: RunnerState }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const { module, attempt, questions } = state;
  const subject = SUBJECT_LABEL[module.subject];
  const isMath = module.subject === "math";

  async function begin() {
    setStarting(true);
    try {
      await fetch(`/api/attempt/${attempt.id}/module`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", ordinal: module.ordinal }),
      });
      router.refresh();
    } catch {
      setStarting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl animate-fade-in">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
          Module {module.position} of {module.total}
        </p>
        <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight text-ink sm:text-[36px]">
          {subject}, Module {module.module}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          {module.module === 1
            ? `This module contains a mix of question difficulties. How you do here determines which second module you receive.`
            : `This module has been selected based on your performance in Module 1.`}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <div className="card px-4 py-3">
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-faint">Questions</dt>
            <dd className="mt-1 text-[22px] font-semibold tabular-nums text-ink">{questions.length}</dd>
          </div>
          <div className="card px-4 py-3">
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-faint">Time</dt>
            <dd className="mt-1 text-[22px] font-semibold tabular-nums text-ink">
              {formatDuration(module.durationSeconds)}
            </dd>
          </div>
        </dl>

        <ul className="mt-6 space-y-2.5 text-[14.5px] leading-relaxed text-muted">
          <li>• The timer starts when you press Begin and cannot be paused.</li>
          <li>• You can move freely between questions and mark any of them for review.</li>
          <li>• There is no penalty for a wrong answer, so never leave a question blank.</li>
          {isMath ? (
            <li>• A calculator and the formula reference are available from the toolbar.</li>
          ) : (
            <li>• Each question refers only to the passage shown beside it.</li>
          )}
          <li>• Once you submit this module, you cannot return to it.</li>
        </ul>

        <button type="button" onClick={begin} disabled={starting} className="btn-primary mt-8 w-full sm:w-auto">
          {starting ? "Starting…" : `Begin Module ${module.module}`}
        </button>
      </div>
    </div>
  );
}
