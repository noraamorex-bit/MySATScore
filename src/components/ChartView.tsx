import type { ChartStimulus } from "@/lib/sat/types";

/**
 * Renders a data display as inline SVG.
 *
 * Drawing the chart ourselves rather than pulling in a charting library keeps
 * the runner's payload small, makes the output theme-aware through
 * `currentColor` and CSS variables, and guarantees the same rendering on every
 * device — which matters when the same graph has to be legible on a phone and
 * on a classroom projector.
 */
export function ChartView({ chart }: { chart: ChartStimulus }) {
  const W = 520;
  const H = 320;
  const pad = { top: 24, right: 20, bottom: 52, left: 62 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const isCategorical = chart.chart === "bar" || chart.chart === "histogram";
  const points = chart.series.flatMap((s) => s.points);

  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);
  const trend = chart.trendline;

  const xMin = isCategorical ? -0.5 : Math.min(0, ...xValues);
  const xMax = isCategorical ? (chart.categories?.length ?? 1) - 0.5 : Math.max(...xValues) * 1.08;
  const yMinRaw = Math.min(0, ...yValues);
  const yMaxRaw = Math.max(
    ...yValues,
    trend ? trend.slope * xMax + trend.intercept : Number.NEGATIVE_INFINITY,
  );
  const yMin = yMinRaw;
  const yMax = yMaxRaw === yMinRaw ? yMinRaw + 1 : yMaxRaw * 1.08;

  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const sy = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;

  const yTicks = chart.yTicks ?? niceTicks(yMin, yMax, 5);
  const xTicks = isCategorical
    ? (chart.categories ?? []).map((_, i) => i)
    : (chart.xTicks ?? niceTicks(xMin, xMax, 6));

  return (
    <figure className="my-3">
      {chart.title ? (
        <figcaption className="mb-2 text-[13px] font-semibold text-ink">{chart.title}</figcaption>
      ) : null}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[320px] max-w-[560px] text-muted"
          role="img"
          aria-label={`${chart.title ?? "Graph"}: ${chart.xLabel} versus ${chart.yLabel}`}
        >
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line
                x1={pad.left} x2={W - pad.right} y1={sy(t)} y2={sy(t)}
                stroke="currentColor" strokeOpacity={0.16}
              />
              <text
                x={pad.left - 8} y={sy(t) + 4} textAnchor="end"
                className="fill-current text-[11px]"
              >
                {formatTick(t)}
              </text>
            </g>
          ))}

          {xTicks.map((t) => (
            <g key={`x${t}`}>
              {!isCategorical && (
                <line
                  x1={sx(t)} x2={sx(t)} y1={pad.top} y2={pad.top + plotH}
                  stroke="currentColor" strokeOpacity={0.08}
                />
              )}
              <text
                x={sx(t)} y={pad.top + plotH + 18} textAnchor="middle"
                className="fill-current text-[11px]"
              >
                {isCategorical ? (chart.categories?.[t] ?? t) : formatTick(t)}
              </text>
            </g>
          ))}

          <line
            x1={pad.left} x2={W - pad.right} y1={sy(Math.max(yMin, 0))} y2={sy(Math.max(yMin, 0))}
            stroke="currentColor" strokeOpacity={0.55}
          />
          <line
            x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH}
            stroke="currentColor" strokeOpacity={0.55}
          />

          {isCategorical
            ? chart.series.flatMap((series, si) =>
                series.points.map((p) => {
                  const bandWidth = (plotW / (chart.categories?.length ?? 1)) * 0.56;
                  return (
                    <rect
                      key={`${si}-${p.x}`}
                      x={sx(p.x) - bandWidth / 2}
                      y={sy(p.y)}
                      width={bandWidth}
                      height={Math.max(1, sy(Math.max(yMin, 0)) - sy(p.y))}
                      className="fill-accent"
                      fillOpacity={0.82}
                      rx={2}
                    />
                  );
                }),
              )
            : chart.series.map((series, si) => (
                <g key={si}>
                  {chart.chart === "line" ? (
                    <polyline
                      fill="none"
                      className="stroke-accent"
                      strokeWidth={2}
                      points={series.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}
                    />
                  ) : null}
                  {series.points.map((p, i) => (
                    <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.6} className="fill-accent" />
                  ))}
                </g>
              ))}

          {trend ? (
            <line
              x1={sx(xMin)} y1={sy(trend.slope * xMin + trend.intercept)}
              x2={sx(xMax)} y2={sy(trend.slope * xMax + trend.intercept)}
              className="stroke-ink" strokeWidth={1.6} strokeDasharray="6 4" strokeOpacity={0.75}
            />
          ) : null}

          <text
            x={pad.left + plotW / 2} y={H - 10} textAnchor="middle"
            className="fill-current text-[12px] font-medium"
          >
            {chart.xLabel}
          </text>
          <text
            x={16} y={pad.top + plotH / 2} textAnchor="middle"
            transform={`rotate(-90 16 ${pad.top + plotH / 2})`}
            className="fill-current text-[12px] font-medium"
          >
            {chart.yLabel}
          </text>
        </svg>
      </div>
      {chart.caption ? <p className="mt-1.5 text-[13px] text-muted">{chart.caption}</p> : null}
    </figure>
  );
}

function formatTick(value: number): string {
  if (Math.abs(value) >= 1000) return value.toLocaleString("en-US");
  return String(Number(value.toFixed(2)));
}

/** Round tick values to a readable step. */
function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || 1;
  const rawStep = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? magnitude * 10;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max + 1e-9 && ticks.length < 12; t += step) {
    ticks.push(Number(t.toFixed(6)));
  }
  return ticks;
}
