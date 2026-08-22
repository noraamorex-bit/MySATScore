import { Card, Pill, SectionHeading } from "@/components/ui";
import { ScoringEditor } from "@/components/admin/ScoringEditor";
import { activeScoringConfig, listScoringConfigs } from "@/lib/scoring-store";
import { SCORING_CONFIG } from "@/lib/sat/scoring-config";
import { scaleSection } from "@/lib/sat/scoring";
import { formatDate } from "@/lib/format";
import type { Subject } from "@/lib/sat/types";

export const dynamic = "force-dynamic";

export default async function ScoringPage() {
  const [active, history] = await Promise.all([activeScoringConfig(), listScoringConfigs()]);

  return (
    <div>
      <SectionHeading
        title="Scoring configuration"
        hint="Replacing the scale takes effect for attempts completed from now on. Past attempts keep the version they were scored under."
        action={<Pill tone="accent">{active.version}</Pill>}
      />

      <Card className="mb-6 border-caution/40 bg-caution/8">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-caution">
          Why this is editable
        </p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
          College Board does not publish the equating tables used to convert raw scores to the
          200–800 scale, and the conversion genuinely depends on which second module a test taker
          received. The shipped tables are a documented model, kept in one file so they can be
          replaced wholesale when better verified information is available — without touching the
          scoring engine or anything else.
        </p>
      </Card>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {(["rw", "math"] as Subject[]).map((subject) => (
          <Card key={subject}>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-faint">
              {subject === "rw" ? "Reading and Writing" : "Math"} — sample conversions
            </p>
            <table className="mt-3 w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="text-left text-[11.5px] uppercase tracking-wide text-faint">
                  <th scope="col" className="py-1.5 font-semibold">Raw</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Standard form</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Advanced form</th>
                </tr>
              </thead>
              <tbody>
                {sampleRaws(active.scales[subject].maxRaw).map((raw) => (
                  <tr key={raw} className="border-t border-line">
                    <td className="py-1.5 tabular-nums text-ink">{raw}</td>
                    <td className="py-1.5 text-right tabular-nums text-muted">
                      {scaleSection(subject, raw, "lower", active).scaled}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-ink">
                      {scaleSection(subject, raw, "upper", active).scaled}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>

      <ScoringEditor current={JSON.stringify(active, null, 2)} />

      <SectionHeading title="Version history" />
      <Card className="p-0">
        <ul className="divide-y divide-line">
          {history.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-ink">{row.label}</p>
                <p className="font-mono text-[12px] text-muted">
                  {row.version} · {formatDate(row.createdAt)}
                </p>
              </div>
              {row.active ? <Pill tone="positive">Active</Pill> : <Pill>Superseded</Pill>}
            </li>
          ))}
          {history.length === 0 ? (
            <li className="px-4 py-5 text-[14px] text-muted">
              No stored configuration; the built-in default ({SCORING_CONFIG.version}) is in use.
            </li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}

function sampleRaws(maxRaw: number): number[] {
  const steps = 8;
  const out: number[] = [];
  for (let i = 0; i <= steps; i += 1) out.push(Math.round((maxRaw * i) / steps));
  return Array.from(new Set(out));
}
