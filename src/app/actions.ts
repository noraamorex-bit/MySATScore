"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { startAttempt } from "@/lib/attempts";
import type { TestKind } from "@/lib/sat/types";

/**
 * Starts a test and sends the user straight into it. Accepts either a curated
 * catalogue id or a kind to generate.
 */
export async function startTestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const curatedId = (formData.get("curatedId") as string | null) || null;
  const kind = ((formData.get("kind") as string | null) ?? "full") as TestKind;

  const attempt = await startAttempt({
    userId: user.id,
    curatedId,
    kind: curatedId ? undefined : kind,
  });

  revalidatePath("/");
  redirect(`/attempt/${attempt.id}`);
}

/** Abandons an in-progress attempt so the dashboard is not stuck on it. */
export async function abandonAttemptAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const attemptId = formData.get("attemptId") as string;
  await db.attempt.updateMany({
    where: { id: attemptId, userId: user.id, status: "in-progress" },
    data: { status: "abandoned" },
  });
  revalidatePath("/");
  redirect("/");
}

/** Deletes a completed attempt and its answers from the user's history. */
export async function deleteAttemptAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const attemptId = formData.get("attemptId") as string;
  await db.attempt.deleteMany({ where: { id: attemptId, userId: user.id } });
  revalidatePath("/history");
  redirect("/history");
}
