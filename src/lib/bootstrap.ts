/**
 * First-run database setup.
 *
 * A brand-new deployment points at an empty database. Rather than require the
 * deployer to run a migration by hand — which needs a terminal, and is not
 * something you can do from a phone — the app creates its own tables the first
 * time it needs them.
 *
 * This is deliberately narrow, because automatically running DDL against a
 * production database is otherwise a bad idea:
 *
 *   • It only ever runs when the `User` table does not exist. An existing
 *     database is never touched, so this cannot alter or drop anything.
 *   • It takes a PostgreSQL advisory lock first, so two serverless instances
 *     starting at once cannot both try to create the same tables.
 *   • It re-checks after acquiring the lock, so the loser of that race does
 *     nothing.
 *   • It runs once per process and caches the result, so the check is not
 *     repeated on every request.
 *   • Setting `AUTO_MIGRATE=off` disables it entirely, for anyone who would
 *     rather manage their schema themselves.
 *
 * It creates tables only. It never modifies or removes an existing one, so
 * later schema changes still need a real migration.
 */
import "server-only";
import { db } from "./db";
import { SCHEMA_STATEMENTS } from "./schema-sql";

/** Arbitrary but fixed, so every instance of this app contends on one lock. */
const ADVISORY_LOCK_KEY = 4_073_219_884;

export type BootstrapResult = "already-present" | "created" | "disabled" | "failed";

let inFlight: Promise<BootstrapResult> | null = null;

async function tablesExist(): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<{ present: string | null }[]>(
    `SELECT to_regclass('public."User"')::text AS present`,
  );
  return Boolean(rows[0]?.present);
}

async function createSchema(): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.$executeRawUnsafe(statement);
  }
}

async function run(): Promise<BootstrapResult> {
  if (process.env.AUTO_MIGRATE === "off") return "disabled";

  // Local SQLite development creates its tables with `npm run setup`, and the
  // checks below are PostgreSQL-specific, so stand down rather than log a
  // confusing error on every cold start.
  if ((process.env.DATABASE_URL ?? "").startsWith("file:")) return "disabled";

  try {
    if (await tablesExist()) return "already-present";

    await db.$executeRawUnsafe(`SELECT pg_advisory_lock($1)`, ADVISORY_LOCK_KEY);
    try {
      // Another instance may have created everything while we waited.
      if (await tablesExist()) return "already-present";
      console.log("[bootstrap] Empty database detected; creating tables.");
      await createSchema();
      console.log(`[bootstrap] Created ${SCHEMA_STATEMENTS.length} schema objects.`);
      return "created";
    } finally {
      await db.$executeRawUnsafe(`SELECT pg_advisory_unlock($1)`, ADVISORY_LOCK_KEY);
    }
  } catch (error) {
    // A failure here must not take the site down with an unhandled rejection.
    // The request that follows will surface a clearer error, and the next cold
    // start retries.
    console.error("[bootstrap] Could not prepare the database:", error);
    inFlight = null;
    return "failed";
  }
}

/**
 * Ensures the schema exists. Safe to call from anywhere and as often as you
 * like; the work happens at most once per process.
 */
export function ensureSchema(): Promise<BootstrapResult> {
  inFlight ??= run();
  return inFlight;
}
