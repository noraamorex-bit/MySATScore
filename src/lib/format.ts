/** Formatting helpers shared by the dashboard, results, and the test runner. */

/** `mm:ss`, or `h:mm:ss` past an hour. Used for the countdown clock. */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}

/** Prose duration, e.g. "2 hr 14 min". */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function formatDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}
