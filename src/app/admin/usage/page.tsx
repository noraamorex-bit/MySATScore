import Link from "next/link";
import clsx from "clsx";
import { Card, SectionHeading, Stat } from "@/components/ui";
import { RichLine } from "@/components/RichText";
import { questionUsage, unusedQuestionCount } from "@/lib/admin";
import { getBank } from "@/lib/bank";
import { formatDate, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Expected percent-correct band for each authored difficulty. */
const BANDS: Record<string, [number, number]> = {
  easy: [0.7, 1],
  medium: [0.45, 0.8],
  hard: [0, 0.55],
};

export default async function UsagePage() {
  const [rows, unused, bank] = await Promise.all([
    questionUsage(300),
    unusedQuestionCount(),
    getBank(),
  ]);

  const served = rows.reduce((sum, row) => sum + row.timesServed, 0);
  const suspect = rows.filter((row) => {
    if (row.timesServed < 10 || row.percentCorrect === null) return false;
    const band = BANDS[row.question.difficulty] ?? [0, 1];
    return row.percentCorrect < band[0] || row.percentCorrect > band[1];
  });

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions served" value={served.toLocaleString()} />
        <Stat label="Distinct questions used" value={rows.length.toLocaleString()} />
        <Stat label="Never served" value={unused.toLocaleString()} tone="accent" />
        <Stat
          label="Possibly mistagged"
          value={suspect.length}
          tone={suspect.length > 0 ? "caution" : "default"}
          sub="Observed accuracy outside its difficulty band"
        />
      </div>

      {suspect.length > 0 ? (
        <>
          <SectionHeading
            title="Review these first"
            hint="Ten or more attempts, with performance that does not match the authored difficulty."
          />
          <UsageTable rows={suspect} />
        </>
      ) : null}

      <SectionHeading
        title="Most-served questions"
        hint={`${bank.stats.active.toLocaleString()} questions are active in the bank.`}
      />
      {rows.length === 0 ? (
        <Card className="text-[14px] text-muted">
          No questions have been served yet. Usage appears here once tests are taken.
        </Card>
      ) : (
        <UsageTable rows={rows.slice(0, 80)} />
      )}
    </div>
  );
}

function UsageTable({ rows }: { rows: Awaited<ReturnType<typeof questionUsage>> }) {
  return (
    <Card className="mb-8 overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-paper text-left text-[11.5px] uppercase tracking-wide text-faint">
              <th scope="col" className="px-4 py-2.5 font-semibold">Question</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Difficulty</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Served</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Correct</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Last served</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const band = BANDS[row.question.difficulty] ?? [0, 1];
              const outOfBand =
                row.percentCorrect !== null &&
                row.timesServed >= 10 &&
                (row.percentCorrect < band[0] || row.percentCorrect > band[1]);
              return (
                <tr key={row.question.id} className="border-b border-line last:border-0">
                  <td className="max-w-[380px] px-4 py-2.5">
                    <Link
                      href={`/admin/questions/${row.question.id}`}
                      className="line-clamp-1 text-ink hover:text-accent"
                    >
                      <RichLine text={row.question.prompt.split("\n")[0]} />
                    </Link>
                    <p className="font-mono text-[11.5px] text-faint">
                      {row.question.id}
                      {row.retired ? " · retired" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 capitalize text-muted">{row.question.difficulty}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">{row.timesServed}</td>
                  <td
                    className={clsx(
                      "px-4 py-2.5 text-right tabular-nums",
                      outOfBand ? "font-semibold text-caution" : "text-muted",
                    )}
                  >
                    {row.percentCorrect === null ? "—" : formatPercent(row.percentCorrect)}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {row.lastServedAt ? formatDate(row.lastServedAt) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
