"use client";

import { useEffect, useState } from "react";

/** Light/dark switch. The initial value is applied before paint in the layout. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mss-theme", next);
    } catch {
      // Private browsing can block storage; the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full p-2 text-muted transition hover:bg-paper hover:text-ink"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
          <path d="M10 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7-4a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM5 10a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm10.07-5.07a1 1 0 0 1 0 1.41l-.7.71a1 1 0 1 1-1.42-1.42l.71-.7a1 1 0 0 1 1.41 0ZM7.05 13.66a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.42l.7-.7a1 1 0 0 1 1.42 0Zm8.02 2.12a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 1 1 1.42-1.41l.7.7a1 1 0 0 1 0 1.42ZM6.34 6.34a1 1 0 0 1-1.41 0l-.71-.7A1 1 0 0 1 5.64 4.22l.7.71a1 1 0 0 1 0 1.41ZM10 15a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
          <path d="M16.3 12.6A6.6 6.6 0 0 1 7.4 3.7a.8.8 0 0 0-1-1 8.2 8.2 0 1 0 10.9 10.9.8.8 0 0 0-1-1Z" />
        </svg>
      )}
    </button>
  );
}
