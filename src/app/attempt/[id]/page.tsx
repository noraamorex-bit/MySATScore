import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRunnerState } from "@/lib/attempts";
import { getSectionScoreSoFar } from "@/lib/analytics";
import { TestRunner } from "@/components/test/TestRunner";
import { ModuleIntro } from "@/components/test/ModuleIntro";
import { BreakScreen } from "@/components/test/BreakScreen";

export const metadata: Metadata = { title: "Testing" };
export const dynamic = "force-dynamic";

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const state = await getRunnerState(id, user.id);

  if (!state) {
    // Either the attempt finished while the tab was away, or it belongs to
    // someone else. A completed attempt goes to its results.
    const attempt = await db.attempt.findFirst({
      where: { id, userId: user.id },
      select: { status: true },
    });
    if (attempt?.status === "completed") redirect(`/results/${id}`);
    redirect("/");
  }

  if (state.attempt.onBreak) {
    // Reading and Writing is finished by the time the break starts, so its
    // section score can be offered here for anyone who wants it.
    const rwScore = await getSectionScoreSoFar(state.attempt.id, user.id, "rw");
    return (
      <BreakScreen
        attemptId={state.attempt.id}
        breakEndsAtMs={state.attempt.breakEndsAtMs}
        sectionScore={
          rwScore
            ? {
                label: "Reading and Writing",
                scaled: rwScore.scaled,
                raw: rwScore.raw,
                total: rwScore.total,
                cappedByRoute: rwScore.cappedByRoute,
                ceiling: rwScore.ceiling,
              }
            : null
        }
      />
    );
  }

  if (state.module.status === "pending") {
    return <ModuleIntro state={state} />;
  }

  return <TestRunner state={state} />;
}
