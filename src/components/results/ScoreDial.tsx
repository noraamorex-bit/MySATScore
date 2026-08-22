import type { Subject } from "@/lib/sat/types";

/**
 * The headline score, drawn as an arc gauge across the reported range.
 *
 * The arc spans 400–1600 for a total score and 200–800 for a single section, so
 * the needle position means the same thing on every results page.
 */
export function ScoreDial({
  total,
  sections,
}: {
  total: number | null;
  sections: { subject: Subject; label: string; scaled: number }[];
}) {
  const single = total === null && sections.length === 1 ? sections[0] : null;
  const value = total ?? single?.scaled ?? 0;
  const min = total !== null ? 400 : 200;
  const max = total !== null ? 1600 : 800;
  const fraction = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const R = 88;
  const CIRC = Math.PI * R; // half circle
  const dash = CIRC * fraction;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 124" className="w-[240px]" role="img" aria-label={`Score ${value}`}>
        <path
          d={`M 22 110 A ${R} ${R} 0 0 1 198 110`}
          fill="none"
          stroke="rgb(var(--line))"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 22 110 A ${R} ${R} 0 0 1 198 110`}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRC}`}
        />
        <text
          x="110" y="98" textAnchor="middle"
          className="fill-[rgb(var(--ink))] text-[44px] font-semibold tabular-nums"
        >
          {value}
        </text>
        <text x="22" y="122" textAnchor="middle" className="fill-[rgb(var(--faint))] text-[11px]">
          {min}
        </text>
        <text x="198" y="122" textAnchor="middle" className="fill-[rgb(var(--faint))] text-[11px]">
          {max}
        </text>
      </svg>
      <p className="mt-1 text-[13px] font-semibold uppercase tracking-wide text-faint">
        {total !== null ? "Total score" : `${single?.label} score`}
      </p>
      {total !== null ? (
        <div className="mt-3 flex gap-6">
          {sections.map((section) => (
            <div key={section.subject} className="text-center">
              <p className="text-[19px] font-semibold tabular-nums text-ink">{section.scaled}</p>
              <p className="text-[11.5px] font-medium uppercase tracking-wide text-faint">
                {section.subject === "rw" ? "Reading & Writing" : "Math"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
