import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveAnswer } from "@/lib/attempts";

const bodySchema = z.object({
  questionId: z.string().min(1),
  given: z.string().nullable().optional(),
  flagged: z.boolean().optional(),
  /** Additional time spent since the last report, in milliseconds. */
  timeSpentMs: z.number().int().min(0).max(30 * 60 * 1000).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const owns = await db.attempt.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owns) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await saveAnswer({ attemptId: id, ...parsed.data });
  if (!result.ok) {
    // A closed module is expected when the clock runs out mid-keystroke; the
    // client reacts by moving on rather than showing an error.
    return NextResponse.json({ saved: false, reason: result.reason }, { status: 200 });
  }
  return NextResponse.json({ saved: true });
}
