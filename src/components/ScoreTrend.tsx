import type { HistoryEntry } from "@/lib/analytics";
import { formatDate } from "@/lib/format";

/**
 * Score progression over time, drawn as inline SVG.
 *
 * The vertical axis is fixed to the reported 400–1600 range rather than scaled
 * to the data, so a five-point gain does not look like a breakthrough.
 */
export function ScoreTrend({ history }: { history: HistoryEntry[] }) {
  const points = history.filter((h) => h.total !== null) as (HistoryEntry & { total: number })[];

  if (points.length === 0) {
    return (
      <p className="py-8 text-center text-[14px] text-muted">
        Complete a full-length test to start tracking your score.
      </p>
    );
  }

  const W = 720;
  const H = 240;
  const pad = { top: 18, right: 18, bottom: 34, left: 46 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const MIN = 400;
  const MAX = 1600;

  const sx = (i: number) =>
    pad.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const sy = (score: number) => pad.top + plotH - ((score - MIN) / (MAX - MIN)) * plotH;

  const ticks = [400, 700, 1000, 1300, 1600];
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(p.total)}`).join(" ");
  const area = `${path} L ${sx(points.length - 1)} ${pad.top + plotH} L ${sx(0)} ${pad.top + plotH} Z`;
  const latest = points[points.length - 1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-[15px] font-semibold text-ink">Score progression</p>
        <p className="text-[13px] text-muted">
          {points.length} scored {points.length === 1 ? "test" : "tests"} · latest{" "}
          <span className="font-semibold text-ink tabular-nums">{latest.total}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[240px] w-full min-w-[420px] text-muted"
          role="img"
          aria-label="Total SAT score over time"
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.22" />
              <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left} x2={W - pad.right} y1={sy(t)} y2={sy(t)}
                stroke="currentColor" strokeOpacity={0.15}
              />
              <text x={pad.left - 8} y={sy(t) + 4} textAnchor="end" className="fill-current text-[11px] tabular-nums">
                {t}
              </text>
            </g>
          ))}

          {points.length > 1 ? <path d={area} fill="url(#trend-fill)" /> : null}
          <path d={path} fill="none" className="stroke-accent" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => (
            <g key={p.id}>
              <circle cx={sx(i)} cy={sy(p.total)} r={4.5} className="fill-accent" />
              <circle cx={sx(i)} cy={sy(p.total)} r={8} fill="transparent">
                <title>{`${p.title} — ${p.total} on ${formatDate(p.completedAt)}`}</title>
              </circle>
              {i === points.length - 1 || points.length <= 6 ? (
                <text
                  x={sx(i)} y={sy(p.total) - 12} textAnchor="middle"
                  className="fill-current text-[11px] font-semibold tabular-nums"
                >
                  {p.total}
                </text>
              ) : null}
            </g>
          ))}

          {points.map((p, i) =>
            points.length <= 8 || i === 0 || i === points.length - 1 ? (
              <text
                key={`l${p.id}`} x={sx(i)} y={H - 12} textAnchor="middle"
                className="fill-current text-[10.5px]"
              >
                {formatDate(p.completedAt)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
}
