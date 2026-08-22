import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRunnerState } from "@/lib/attempts";
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
    return <BreakScreen attemptId={state.attempt.id} breakEndsAtMs={state.attempt.breakEndsAtMs} />;
  }

  if (state.module.status === "pending") {
    return <ModuleIntro state={state} />;
  }

  return <TestRunner state={state} />;
}
