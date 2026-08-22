import type { Stimulus as StimulusModel } from "@/lib/sat/types";
import { RichLine, RichText } from "./RichText";
import { ChartView } from "./ChartView";
import { FigureView } from "./FigureView";

/** Renders whatever context a question carries: passage, table, graph, figure. */
export function Stimulus({ stimulus }: { stimulus: StimulusModel }) {
  switch (stimulus.type) {
    case "passage":
      return (
        <div className="prose-passage">
          {stimulus.title ? (
            <p className="mb-3 font-sans text-[13px] font-semibold uppercase tracking-wide text-muted">
              {stimulus.title}
            </p>
          ) : null}
          {stimulus.paragraphs.map((paragraph, i) =>
            /^Text \d$/.test(paragraph.trim()) ? (
              <p
                key={i}
                className={`font-sans text-[13px] font-bold uppercase tracking-wide text-accent ${i > 0 ? "mt-6" : ""}`}
              >
                {paragraph}
              </p>
            ) : (
              <p key={i} className={i > 0 ? "mt-4" : undefined}>
                <RichLine text={paragraph} />
              </p>
            ),
          )}
          {stimulus.bullets?.length ? (
            <ul className="mt-4 space-y-2 pl-5">
              {stimulus.bullets.map((bullet, i) => (
                <li key={i} className="list-disc">
                  <RichLine text={bullet} />
                </li>
              ))}
            </ul>
          ) : null}
          {stimulus.credit ? (
            <p className="mt-4 font-sans text-[13px] text-muted">{stimulus.credit}</p>
          ) : null}
        </div>
      );

    case "table":
      return (
        <div>
          {stimulus.intro ? <RichText text={stimulus.intro} className="mb-3 text-[15px]" /> : null}
          {stimulus.title ? (
            <p className="mb-2 text-[13px] font-semibold text-ink">{stimulus.title}</p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse text-[14px]">
              <thead>
                <tr>
                  {stimulus.columns.map((column, i) => (
                    <th
                      key={i}
                      scope="col"
                      className={`border border-line bg-paper px-3 py-2 font-semibold ${
                        stimulus.numericColumns?.includes(i) ? "text-right" : "text-left"
                      }`}
                    >
                      <RichLine text={column} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stimulus.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`border border-line px-3 py-2 ${
                          stimulus.numericColumns?.includes(c) ? "text-right tabular-nums" : "text-left"
                        }`}
                      >
                        <RichLine text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stimulus.caption ? (
            <p className="mt-1.5 text-[13px] text-muted">{stimulus.caption}</p>
          ) : null}
        </div>
      );

    case "chart":
      return (
        <div>
          {stimulus.intro ? <RichText text={stimulus.intro} className="mb-1 text-[15px]" /> : null}
          <ChartView chart={stimulus} />
        </div>
      );

    case "figure":
      return <FigureView figure={stimulus} />;

    case "image":
      return (
        <figure className="my-3">
          {/* Imported content may reference an external image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stimulus.src}
            alt={stimulus.alt}
            width={stimulus.width}
            height={stimulus.height}
            className="h-auto max-w-full rounded-lg border border-line"
          />
          {stimulus.caption ? (
            <figcaption className="mt-1.5 text-[13px] text-muted">{stimulus.caption}</figcaption>
          ) : null}
        </figure>
      );

    default:
      return null;
  }
}
