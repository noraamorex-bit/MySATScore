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
 *   • Every statement is idempotent: an object that already exists is skipped
 *     rather than raising. Several instances starting at once therefore
 *     converge on the same result instead of one of them dying.
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

export type BootstrapResult = "already-present" | "created" | "disabled" | "failed";

let inFlight: Promise<BootstrapResult> | null = null;

/** Anything that can run a query: the client itself, or a transaction handle. */
type Queryable = Pick<typeof db, "$queryRawUnsafe" | "$executeRawUnsafe">;

async function tablesExist(client: Queryable): Promise<boolean> {
  const rows = await client.$queryRawUnsafe<{ present: string | null }[]>(
    `SELECT to_regclass('public."User"')::text AS present`,
  );
  return Boolean(rows[0]?.present);
}

/**
 * PostgreSQL error codes meaning "this object is already there".
 *
 * 42P06 duplicate_schema · 42P07 duplicate_table (also indexes)
 * 42710 duplicate_object (constraints)
 */
const ALREADY_EXISTS = new Set(["42P06", "42P07", "42710"]);

function isAlreadyExists(error: unknown): boolean {
  const meta = (error as { meta?: { code?: string } })?.meta;
  if (meta?.code && ALREADY_EXISTS.has(meta.code)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /already exists/i.test(message);
}

/**
 * Applies the schema, tolerating objects that are already present.
 *
 * An earlier version guarded this with an advisory lock and a preceding
 * existence check. Racing eight processes against an empty database showed that
 * was not enough — two of them cleared the check and the loser died on
 * `relation "User" already exists`. Idempotence at the statement level fixes
 * that class of problem outright, and needs no lock to be correct.
 */
async function createSchema(client: Queryable): Promise<number> {
  let applied = 0;
  for (const statement of SCHEMA_STATEMENTS) {
    try {
      await client.$executeRawUnsafe(statement);
      applied += 1;
    } catch (error) {
      if (!isAlreadyExists(error)) throw error;
    }
  }
  return applied;
}

async function run(): Promise<BootstrapResult> {
  if (process.env.AUTO_MIGRATE === "off") return "disabled";

  // Local SQLite development creates its tables with `npm run setup`, and the
  // checks below are PostgreSQL-specific, so stand down rather than log a
  // confusing error on every cold start.
  if ((process.env.DATABASE_URL ?? "").startsWith("file:")) return "disabled";

  try {
    // On all but the very first request this is a single query and nothing
    // else happens.
    if (await tablesExist(db)) return "already-present";

    console.log("[bootstrap] Empty database detected; creating tables.");

    // Deliberately not wrapped in a transaction. A statement that fails inside
    // a Postgres transaction aborts the whole thing, so the tolerance in
    // `createSchema` would be useless there. Running each statement on its own
    // autocommits it, which also releases its locks immediately — no deadlock
    // between instances racing in the same order — and suits a transaction
    // pooler, where independent statements are exactly what it expects.
    const applied = await createSchema(db);

    console.log(
      `[bootstrap] Applied ${applied} of ${SCHEMA_STATEMENTS.length} schema objects` +
        `${applied < SCHEMA_STATEMENTS.length ? " (the rest already existed)" : ""}.`,
    );
    return applied > 0 ? "created" : "already-present";
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
