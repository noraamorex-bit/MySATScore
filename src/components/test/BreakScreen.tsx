"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatClock } from "@/lib/format";
import { BREAK_MINUTES } from "@/lib/sat/blueprint";

/**
 * The optional 10-minute break between Reading and Writing and Math.
 *
 * The countdown is advisory: the break ends when the test taker chooses, or
 * automatically when the time runs out. The Math section's own clock does not
 * begin until the module directions screen is dismissed.
 */
export interface BreakSectionScore {
  label: string;
  scaled: number;
  raw: number;
  total: number;
  cappedByRoute: boolean;
  ceiling: number;
}

export function BreakScreen({
  attemptId,
  breakEndsAtMs,
  sectionScore,
}: {
  attemptId: string;
  breakEndsAtMs: number | null;
  sectionScore?: BreakSectionScore | null;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(() =>
    breakEndsAtMs ? Math.max(0, breakEndsAtMs - Date.now()) : BREAK_MINUTES * 60 * 1000,
  );
  const [ending, setEnding] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const resume = useCallback(async () => {
    setEnding(true);
    try {
      await fetch(`/api/attempt/${attemptId}/break`, { method: "POST" });
      router.refresh();
    } catch {
      setEnding(false);
    }
  }, [attemptId, router]);

  useEffect(() => {
    if (!breakEndsAtMs) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, breakEndsAtMs - Date.now());
      setRemaining(left);
      if (left <= 0) void resume();
    }, 500);
    return () => window.clearInterval(id);
  }, [breakEndsAtMs, resume]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg animate-fade-in text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Break</p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-ink sm:text-[36px]">
          Reading and Writing is complete
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          Take up to {BREAK_MINUTES} minutes before starting the Math section. Your Math timer does
          not begin until you press Begin on the next screen.
        </p>

        <div className="mx-auto mt-8 w-fit rounded-2xl border border-line bg-surface px-10 py-6 shadow-card">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">
            Break time remaining
          </p>
          <p className="mt-1 font-mono text-[44px] font-semibold tabular-nums leading-none text-ink">
            {formatClock(Math.ceil(remaining / 1000))}
          </p>
        </div>

        {sectionScore ? (
          <div className="mx-auto mt-6 w-full max-w-sm">
            {revealed ? (
              <div className="card animate-scale-in px-5 py-4 text-left">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">
                  {sectionScore.label}
                </p>
                <p className="mt-1 text-[32px] font-semibold leading-none tabular-nums text-accent">
                  {sectionScore.scaled}
                </p>
                <p className="mt-2 text-[13px] text-muted">
                  {sectionScore.raw} of {sectionScore.total} correct.
                  {sectionScore.cappedByRoute
                    ? ` The second module you received caps this section near ${sectionScore.ceiling}.`
                    : ""}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="btn-ghost btn-sm w-full"
              >
                Show my Reading and Writing score
              </button>
            )}
            <p className="mt-2 text-[12px] leading-relaxed text-faint">
              The real test does not show a section score before you finish, so this is here only
              if you want it. Your Math performance does not change it.
            </p>
          </div>
        ) : null}

        <button type="button" onClick={resume} disabled={ending} className="btn-primary mt-8">
          {ending ? "Resuming…" : "Resume testing"}
        </button>
        <p className="mt-3 text-[13px] text-faint">
          The break ends automatically when the timer reaches zero.
        </p>
      </div>
    </div>
  );
}
