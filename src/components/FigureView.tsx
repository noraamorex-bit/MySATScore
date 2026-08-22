import katex from "katex";
import type { FigureStimulus } from "@/lib/sat/types";

/** Renders a declarative geometry figure as SVG. */
export function FigureView({ figure }: { figure: FigureStimulus }) {
  return (
    <figure className="my-3">
      {figure.title ? (
        <figcaption className="mb-2 text-[13px] font-semibold text-ink">{figure.title}</figcaption>
      ) : null}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${figure.width} ${figure.height}`}
          className="h-auto w-full max-w-[360px] text-ink"
          role="img"
          aria-label={figure.caption ?? figure.title ?? "Geometric figure"}
        >
          {figure.shapes.map((shape, i) => {
            switch (shape.kind) {
              case "line":
                return (
                  <line
                    key={i} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
                    stroke="currentColor" strokeWidth={1.6}
                    strokeDasharray={shape.dashed ? "5 4" : undefined}
                  />
                );
              case "polygon":
                return (
                  <polygon
                    key={i}
                    points={shape.points.map(([x, y]) => `${x},${y}`).join(" ")}
                    fill={shape.fill ? "currentColor" : "none"}
                    fillOpacity={shape.fill ? 0.12 : 0}
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinejoin="round"
                  />
                );
              case "circle":
                return (
                  <circle
                    key={i} cx={shape.cx} cy={shape.cy} r={shape.r}
                    fill={shape.fill ? "currentColor" : "none"} fillOpacity={shape.fill ? 0.12 : 0}
                    stroke="currentColor" strokeWidth={1.6}
                  />
                );
              case "arc": {
                const start = polar(shape.cx, shape.cy, shape.r, shape.start);
                const end = polar(shape.cx, shape.cy, shape.r, shape.end);
                const large = Math.abs(shape.end - shape.start) > 180 ? 1 : 0;
                return (
                  <path
                    key={i}
                    d={`M ${start.x} ${start.y} A ${shape.r} ${shape.r} 0 ${large} 1 ${end.x} ${end.y}`}
                    fill="none" stroke="currentColor" strokeWidth={1.6}
                  />
                );
              }
              case "rightAngle": {
                const s = shape.size ?? 12;
                const dx = Math.sign(shape.dx) * s;
                const dy = Math.sign(shape.dy) * s;
                return (
                  <polyline
                    key={i}
                    points={`${shape.x + dx},${shape.y} ${shape.x + dx},${shape.y + dy} ${shape.x},${shape.y + dy}`}
                    fill="none" stroke="currentColor" strokeWidth={1.3} strokeOpacity={0.8}
                  />
                );
              }
              case "label":
                return shape.math ? (
                  <foreignObject
                    key={i}
                    x={shape.x - 42}
                    y={shape.y - 15}
                    width={84}
                    height={26}
                  >
                    <div
                      className="flex h-full items-center justify-center text-[13px] leading-none"
                      dangerouslySetInnerHTML={{ __html: renderLabel(shape.text) }}
                    />
                  </foreignObject>
                ) : (
                  <text
                    key={i} x={shape.x} y={shape.y}
                    textAnchor={shape.anchor ?? "middle"}
                    className="fill-current text-[13px] font-medium"
                  >
                    {shape.text}
                  </text>
                );
              default:
                return null;
            }
          })}
        </svg>
      </div>
      {figure.notToScale ? (
        <p className="mt-1 text-[12px] italic text-faint">Note: Figure not drawn to scale.</p>
      ) : null}
      {figure.caption ? <p className="mt-1.5 text-[13px] text-muted">{figure.caption}</p> : null}
    </figure>
  );
}

function renderLabel(text: string): string {
  try {
    return katex.renderToString(text, { throwOnError: false, strict: false, output: "html" });
  } catch {
    return text;
  }
}

function polar(cx: number, cy: number, r: number, degrees: number) {
  const rad = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
