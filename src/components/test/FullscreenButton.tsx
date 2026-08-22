"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

/**
 * Enters full-screen where the browser supports it. iPhone Safari does not
 * expose the Fullscreen API, so the button hides itself there rather than
 * offering a control that does nothing.
 */
export function FullscreenButton() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setSupported(typeof document.documentElement.requestFullscreen === "function");
    function onChange() {
      setActive(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!supported) return null;

  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Denied by the browser (for example, not from a user gesture chain).
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={active ? "Exit full screen" : "Full screen"}
      className={clsx(
        "hidden h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted transition hover:bg-paper hover:text-ink sm:flex",
        active && "border-accent bg-accent-soft text-accent",
      )}
    >
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        {active ? (
          <path d="M8 3v5H3M12 17v-5h5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M3 7.5V3h4.5M16.5 12.5V17H12" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span className="sr-only">{active ? "Exit full screen" : "Enter full screen"}</span>
    </button>
  );
}
