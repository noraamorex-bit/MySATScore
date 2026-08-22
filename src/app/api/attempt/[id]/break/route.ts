import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { endBreak } from "@/lib/attempts";

/** Ends the optional break early and returns the user to testing. */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const owns = await db.attempt.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owns) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  await endBreak(id);
  return NextResponse.json({ ok: true });
}
