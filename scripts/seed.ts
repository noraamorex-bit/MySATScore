/**
 * Seeds the database so the application is usable immediately after setup.
 *
 * Idempotent: run it as often as you like. It creates the administrator account
 * from the environment, records the built-in scoring configuration as the
 * active version, and reports what the bundled question bank contains.
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const scrypt = promisify(scryptCallback) as (
  password: string, salt: Buffer, keylen: number,
) => Promise<Buffer>;

const db = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function main(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? "admin@mysatscore.local").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "admin") {
      await db.user.update({ where: { id: existing.id }, data: { role: "admin" } });
      console.log(`Promoted ${email} to administrator.`);
    } else {
      console.log(`Administrator ${email} already exists.`);
    }
  } else {
    await db.user.create({
      data: {
        email,
        name: "Administrator",
        passwordHash: await hashPassword(password),
        role: "admin",
      },
    });
    console.log(`Created administrator ${email} (password from ADMIN_PASSWORD).`);
  }

  // Record the compiled-in scale as a stored, versioned configuration so the
  // admin console has something to show and to diff against.
  const { SCORING_CONFIG } = await import("../src/lib/sat/scoring-config");
  await db.scoringConfig.upsert({
    where: { version: SCORING_CONFIG.version },
    create: {
      version: SCORING_CONFIG.version,
      label: SCORING_CONFIG.label,
      payload: JSON.stringify(SCORING_CONFIG),
      active: true,
    },
    update: {},
  });

  const bank = JSON.parse(
    readFileSync(resolve(process.cwd(), "content/bank/questions.json"), "utf8"),
  ) as { questions: { subject: string; domain: string; difficulty: string }[] };
  const curated = JSON.parse(
    readFileSync(resolve(process.cwd(), "content/curated/tests.json"), "utf8"),
  ) as { tests: unknown[] };

  const bySubject: Record<string, number> = {};
  for (const question of bank.questions) {
    bySubject[question.subject] = (bySubject[question.subject] ?? 0) + 1;
  }

  console.log(
    `Question bank: ${bank.questions.length} questions ` +
      `(Reading and Writing ${bySubject.rw ?? 0}, Math ${bySubject.math ?? 0}).`,
  );
  console.log(`Curated catalogue: ${curated.tests.length} ready-made forms.`);
  console.log("\nSetup complete. Run `npm run dev` and open http://localhost:3000");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
