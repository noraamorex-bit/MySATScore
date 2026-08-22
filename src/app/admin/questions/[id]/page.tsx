import { notFound } from "next/navigation";
import Link from "next/link";
import { QuestionEditor } from "@/components/admin/QuestionEditor";
import { Card, Pill } from "@/components/ui";
import { getBank, isStaticQuestion } from "@/lib/bank";
import { db } from "@/lib/db";
import { retireQuestionAction, revertQuestionAction } from "@/app/admin/actions";
import { formatDateTime, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ replace?: string }>;
}) {
  const { id } = await params;
  const { replace } = await searchParams;
  const bank = await getBank();
  const question = bank.byId.get(id);
  if (!question) notFound();

  const [override, stat, exposures] = await Promise.all([
    db.questionOverride.findUnique({ where: { questionId: id } }),
    db.questionStat.findUnique({ where: { questionId: id } }),
    db.questionExposure.count({ where: { questionId: id } }),
  ]);

  const retired = bank.retiredIds.has(id);
  const replacing = replace === "1";
  const initial = replacing
    ? { ...question, id: `${question.id}-r2`, source: { ...question.source, attribution: `Replacement for ${question.id}` } }
    : question;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link href="/admin/questions" className="text-[13px] font-medium text-accent hover:underline">
          ← All questions
        </Link>
        {retired ? <Pill tone="negative">Retired</Pill> : null}
        {override?.custom ? <Pill tone="accent">Custom</Pill> : null}
        {override && !override.custom ? <Pill tone="caution">Edited</Pill> : null}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card className="py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Times served</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-ink">{stat?.timesServed ?? 0}</p>
        </Card>
        <Card className="py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Percent correct</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-ink">
            {stat && stat.timesServed > 0 ? formatPercent(stat.timesCorrect / stat.timesServed) : "—"}
          </p>
        </Card>
        <Card className="py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Users who saw it</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-ink">{exposures}</p>
        </Card>
        <Card className="py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Last served</p>
          <p className="mt-1 text-[13.5px] text-ink">
            {stat?.lastServedAt ? formatDateTime(stat.lastServedAt) : "Never"}
          </p>
        </Card>
      </div>

      {stat && stat.timesServed >= 10 ? (
        <DifficultyCheck
          authored={question.difficulty}
          observed={stat.timesCorrect / stat.timesServed}
        />
      ) : null}

      <QuestionEditor
        initial={initial}
        replacesId={replacing ? question.id : undefined}
        heading={replacing ? `Replacement for ${question.id}` : `Edit ${question.id}`}
      />

      <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
        <form action={retireQuestionAction}>
          <input type="hidden" name="questionId" value={id} />
          <input type="hidden" name="retired" value={retired ? "false" : "true"} />
          <button type="submit" className={retired ? "btn-ghost" : "btn-danger"}>
            {retired ? "Restore to the bank" : "Retire this question"}
          </button>
        </form>
        {!replacing ? (
          <Link href={`/admin/questions/${id}?replace=1`} className="btn-ghost">
            Replace with a new question
          </Link>
        ) : null}
        {override ? (
          <form action={revertQuestionAction}>
            <input type="hidden" name="questionId" value={id} />
            <button type="submit" className="btn-quiet">
              {override.custom ? "Delete this custom question" : "Revert to the generated version"}
            </button>
          </form>
        ) : null}
        {isStaticQuestion(id) ? (
          <p className="w-full text-[12.5px] text-faint">
            This question comes from the generated bank. Edits are stored as an overlay; reverting
            restores the generated version.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Flags a mismatch between the authored difficulty and observed performance. */
function DifficultyCheck({ authored, observed }: { authored: string; observed: number }) {
  const expected = { easy: [0.7, 1], medium: [0.45, 0.8], hard: [0, 0.55] } as Record<string, number[]>;
  const band = expected[authored] ?? [0, 1];
  if (observed >= band[0] && observed <= band[1]) return null;
  return (
    <div className="mb-6 rounded-lg border border-caution/40 bg-caution/8 px-4 py-3">
      <p className="text-[13px] font-semibold text-caution">Difficulty may be mistagged</p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-ink">
        This question is tagged <strong>{authored}</strong>, but {formatPercent(observed)} of test
        takers answer it correctly. Consider re-tagging it, or reviewing the item for an ambiguous
        key.
      </p>
    </div>
  );
}
