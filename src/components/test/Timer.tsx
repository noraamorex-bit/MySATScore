"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { formatClock } from "@/lib/format";

/**
 * Countdown for the active module.
 *
 * The deadline is an absolute server timestamp, so the display stays correct
 * across a sleeping device, a backgrounded tab, or a page refresh — the
 * component recomputes from the wall clock rather than counting ticks. It can
 * be hidden, as on the real test, and it warns at five minutes.
 */
export function Timer({
  endsAtMs,
  onExpire,
  compact = false,
}: {
  endsAtMs: number;
  onExpire: () => void;
  compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endsAtMs - Date.now()));
  const [hidden, setHidden] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    function tick() {
      const left = Math.max(0, endsAtMs - Date.now());
      setRemaining(left);
      if (left <= 0 && !fired.current) {
        fired.current = true;
        onExpire();
      }
    }
    tick();
    const id = window.setInterval(tick, 500);
    // A tab that was backgrounded may have missed hundreds of ticks.
    const onVisible = () => tick();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [endsAtMs, onExpire]);

  const seconds = Math.ceil(remaining / 1000);
  const warning = seconds <= 300;
  const critical = seconds <= 60;

  return (
    <div className="flex flex-col items-center leading-none">
      <div
        className={clsx(
          "font-mono tabular-nums transition-colors",
          compact ? "text-[16px]" : "text-[22px]",
          critical ? "text-negative" : warning ? "text-caution" : "text-ink",
          critical && "animate-pulseline",
        )}
        role="timer"
        aria-live="off"
      >
        {hidden ? "— : —" : formatClock(seconds)}
      </div>
      <button
        type="button"
        onClick={() => setHidden((v) => !v)}
        className="mt-1 text-[11px] font-medium text-faint transition hover:text-muted"
      >
        {hidden ? "Show" : "Hide"}
      </button>
      <span className="sr-only" aria-live="polite">
        {warning && !critical ? "Five minutes remaining." : null}
        {critical ? "One minute remaining." : null}
      </span>
    </div>
  );
}
