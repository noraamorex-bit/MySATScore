import clsx from "clsx";
import type { Breakdown } from "@/lib/analytics";
import { Bar } from "@/components/ui";
import { formatPercent } from "@/lib/format";

/** Correct / incorrect / skipped counts and accuracy for a set of buckets. */
export function BreakdownTable({ rows }: { rows: Breakdown[] }) {
  if (rows.length === 0) {
    return (
      <div className="card px-5 py-6 text-[14px] text-muted">No data for this breakdown.</div>
    );
  }
  return (
    <ul className="card divide-y divide-line">
      {rows.map((row) => (
        <li key={row.key} className="px-4 py-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[14.5px] font-medium text-ink">{row.label}</p>
            <p className="text-[13px] tabular-nums text-muted">
              <span
                className={clsx(
                  "font-semibold",
                  row.accuracy >= 0.8 ? "text-positive" : row.accuracy < 0.5 ? "text-negative" : "text-ink",
                )}
              >
                {formatPercent(row.accuracy)}
              </span>{" "}
              · {row.correct} correct · {row.incorrect} incorrect
              {row.skipped > 0 ? ` · ${row.skipped} skipped` : ""}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Bar
              value={row.accuracy}
              tone={row.accuracy >= 0.8 ? "positive" : row.accuracy < 0.5 ? "negative" : "accent"}
            />
            <span className="shrink-0 text-[12px] tabular-nums text-faint">{row.averageSeconds}s avg</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
