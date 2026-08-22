import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { startModule, submitModule } from "@/lib/attempts";

const bodySchema = z.object({
  action: z.enum(["start", "submit"]),
  ordinal: z.number().int().min(0).max(7),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const owns = await db.attempt.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owns) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (parsed.data.action === "start") {
    const module = await startModule(id, parsed.data.ordinal);
    return NextResponse.json({ started: true, endsAtMs: module.endsAt?.getTime() ?? null });
  }

  const result = await submitModule(id, parsed.data.ordinal);
  return NextResponse.json(result);
}
