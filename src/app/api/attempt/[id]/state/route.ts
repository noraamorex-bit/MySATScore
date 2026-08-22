import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getRunnerState } from "@/lib/attempts";

/**
 * Authoritative snapshot of the running attempt. The client polls this after a
 * suspend/resume so a device that slept through the end of a module finds out
 * immediately rather than continuing to accept answers.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const state = await getRunnerState(id, user.id);
  if (!state) return NextResponse.json({ finished: true });
  return NextResponse.json({
    finished: false,
    cursor: state.attempt.cursor,
    onBreak: state.attempt.onBreak,
    breakEndsAtMs: state.attempt.breakEndsAtMs,
    moduleStatus: state.module.status,
    endsAtMs: state.module.endsAtMs,
  });
}
