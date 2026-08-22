import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeading } from "@/components/ui";
import { getBank } from "@/lib/bank";
import { SCORING_CONFIG, ROUTING_POLICY } from "@/lib/sat/scoring-config";
import { activeScoringConfig } from "@/lib/scoring-store";
import {
  DIFFICULTY_MIX, MATH_DOMAIN_COUNTS, MODULE_SPEC, RW_DOMAIN_COUNTS, TOTAL_QUESTIONS,
  TOTAL_TESTING_MINUTES, BREAK_MINUTES,
} from "@/lib/sat/blueprint";
import { DOMAIN_LABELS } from "@/lib/sat/types";
import { formatDuration } from "@/lib/format";

export const metadata: Metadata = { title: "How scoring works" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [bank, scoring] = await Promise.all([getBank(), activeScoringConfig()]);

  return (
    <AppShell>
      <h1 className="text-[30px] font-semibold tracking-tight text-ink">
        How this platform works
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
        Everything below is configuration, not magic. If a number here looks wrong, it can be
        changed in one place without touching the rest of the application.
      </p>

      <SectionHeading title="Test structure" />
      <Card>
        <ul className="space-y-2 text-[14.5px] leading-relaxed text-ink">
          <li>
            Reading and Writing: two modules of {MODULE_SPEC.rw.questions} questions,{" "}
            {MODULE_SPEC.rw.minutes} minutes each.
          </li>
          <li>
            Math: two modules of {MODULE_SPEC.math.questions} questions, {MODULE_SPEC.math.minutes}{" "}
            minutes each.
          </li>
          <li>
            {TOTAL_QUESTIONS} questions and {formatDuration(TOTAL_TESTING_MINUTES * 60)} of testing
            in total, plus an optional {BREAK_MINUTES}-minute break between sections.
          </li>
          <li>Reading and Writing is always taken first, and a module cannot be revisited.</li>
        </ul>
      </Card>

      <SectionHeading
        title="Adaptive routing"
        hint="Deterministic: the same module 1 answers always produce the same module 2."
      />
      <Card>
        <p className="text-[14.5px] leading-relaxed text-ink">
          Module 1 carries a representative spread of difficulties. Each correct answer earns points
          weighted by difficulty — easy {ROUTING_POLICY.weights.easy}, medium{" "}
          {ROUTING_POLICY.weights.medium}, hard {ROUTING_POLICY.weights.hard} — so answering only
          the easy questions correctly does not route you upward. Scoring at least{" "}
          {Math.round(ROUTING_POLICY.upperThreshold.rw * 100)}% of the available weighted points
          routes you to the harder second module.
        </p>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          Difficulty is never shown during a test. It appears only in your results, where it is
          useful.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[12px] uppercase tracking-wide text-faint">
                <th scope="col" className="py-2 font-semibold">Module form</th>
                <th scope="col" className="py-2 text-right font-semibold">Easier</th>
                <th scope="col" className="py-2 text-right font-semibold">Medium</th>
                <th scope="col" className="py-2 text-right font-semibold">Harder</th>
              </tr>
            </thead>
            <tbody>
              {(["module1", "lower", "upper"] as const).map((form) => (
                <tr key={form} className="border-b border-line last:border-0">
                  <td className="py-2 capitalize text-ink">
                    {form === "module1" ? "Module 1" : form === "lower" ? "Module 2 — standard" : "Module 2 — advanced"}
                  </td>
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <td key={level} className="py-2 text-right tabular-nums text-muted">
                      {Math.round(DIFFICULTY_MIX[form][level] * 100)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionHeading title="Scaled scoring" hint={`Active configuration: ${scoring.label}`} />
      <Card>
        <p className="text-[14.5px] leading-relaxed text-ink">
          Section scores run from {scoring.minSectionScore} to {scoring.maxSectionScore} in steps of{" "}
          {scoring.roundToNearest}, and the total is their sum. Which second module you received
          changes the conversion: the advanced form is the only path to the top of the scale, and
          the standard form compresses toward a ceiling.
        </p>
        <div className="mt-4 rounded-lg border border-caution/40 bg-caution/8 p-4">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-caution">
            About these tables
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
            College Board does not publish the equating tables used on the real exam, and the true
            conversion varies from form to form. The scales used here are a documented model that
            reproduces the behaviour that matters for practice — not official data. They live in a
            single configuration file, versioned as{" "}
            <code className="rounded bg-paper px-1.5 py-0.5 text-[13px]">{scoring.version}</code>,
            and can be replaced from the admin console as better information becomes available.
            Every completed test records the version it was scored under.
          </p>
        </div>
        {scoring.version !== SCORING_CONFIG.version ? (
          <p className="mt-3 text-[13px] text-muted">
            An administrator has published a scale that replaces the built-in default (
            {SCORING_CONFIG.version}).
          </p>
        ) : null}
      </Card>

      <SectionHeading title="Content distribution" hint="Questions per module, matched to the published blueprint." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-faint">
            Reading and Writing
          </p>
          <BlueprintList counts={RW_DOMAIN_COUNTS} total={MODULE_SPEC.rw.questions} />
        </Card>
        <Card>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-faint">Math</p>
          <BlueprintList counts={MATH_DOMAIN_COUNTS} total={MODULE_SPEC.math.questions} />
        </Card>
      </div>

      <SectionHeading title="Question bank" />
      <Card>
        <p className="text-[14.5px] leading-relaxed text-ink">
          {bank.stats.active.toLocaleString()} active questions, written for this platform. No
          College Board material is reproduced. Every question carries a stable id, a domain, a
          skill list, a difficulty, and a full explanation, and the bank is generated from source so
          it can be rebuilt and reviewed as a diff.
        </p>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          The assembler tracks which questions you have already seen and prefers ones you have not,
          so questions do not repeat across your tests until the bank is exhausted. Within a single
          test, no question id can appear twice — including in the second module you were not routed
          to.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-[13.5px] sm:grid-cols-4">
          <div>
            <dt className="text-faint">Reading and Writing</dt>
            <dd className="text-[17px] font-semibold tabular-nums text-ink">{bank.stats.bySubject.rw}</dd>
          </div>
          <div>
            <dt className="text-faint">Math</dt>
            <dd className="text-[17px] font-semibold tabular-nums text-ink">{bank.stats.bySubject.math}</dd>
          </div>
          <div>
            <dt className="text-faint">Easier / medium / harder</dt>
            <dd className="text-[17px] font-semibold tabular-nums text-ink">
              {bank.stats.byDifficulty.easy}/{bank.stats.byDifficulty.medium}/{bank.stats.byDifficulty.hard}
            </dd>
          </div>
          <div>
            <dt className="text-faint">Retired</dt>
            <dd className="text-[17px] font-semibold tabular-nums text-ink">{bank.stats.retired}</dd>
          </div>
        </dl>
      </Card>
    </AppShell>
  );
}

function BlueprintList({ counts, total }: { counts: Record<string, number>; total: number }) {
  return (
    <ul className="space-y-2 text-[14px]">
      {Object.entries(counts).map(([domain, count]) => (
        <li key={domain} className="flex items-baseline justify-between gap-3">
          <span className="text-ink">{DOMAIN_LABELS[domain as never] ?? domain}</span>
          <span className="shrink-0 tabular-nums text-muted">
            {count} · {Math.round((count / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}
