/**
 * Regression test for first-run schema creation.
 *
 * A deployment's very first requests can arrive together, each on its own cold
 * serverless instance, all pointed at an empty database. An earlier version of
 * `ensureSchema` guarded that with an advisory lock and an existence check;
 * racing real processes against a real database showed two could still clear
 * the check, and the loser died on `relation "User" already exists`. This test
 * reproduces that race so the fix cannot quietly regress.
 *
 * Requires a PostgreSQL DATABASE_URL. Creates and drops its own database, so it
 * never touches the one it was pointed at.
 *
 *   npm run test:bootstrap
 */
import { execFile } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const run = promisify(execFile);

const PROCESSES = 8;
const SCRATCH_DB = "mysatscore_bootstrap_race";

let checks = 0;
let failures = 0;
function check(label: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (ok) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const parentUrl = process.env.DATABASE_URL ?? "";
if (!parentUrl.startsWith("postgres")) {
  console.log("Skipping: this test needs a PostgreSQL DATABASE_URL.");
  process.exit(0);
}

/** The same server, a different database. */
function siblingUrl(url: string, database: string): string {
  const parsed = new URL(url);
  parsed.pathname = `/${database}`;
  return parsed.toString();
}

/** A tiny program that calls ensureSchema once and prints the outcome. */
const CHILD = `
import Module from "node:module";
const load = Module._load;
Module._load = function (request, ...rest) {
  return request === "server-only" ? {} : load.call(this, request, ...rest);
};
(async () => {
  const { ensureSchema } = await import(${JSON.stringify(join(process.cwd(), "src/lib/bootstrap.ts"))});
  const result = await ensureSchema();
  console.log("RESULT:" + result);
  process.exit(0);
})();
`;

async function main(): Promise<void> {
  const admin = new PrismaClient({ datasourceUrl: parentUrl });
  const scratchUrl = siblingUrl(parentUrl, SCRATCH_DB);

  const workDir = mkdtempSync(join(tmpdir(), "mss-bootstrap-"));
  const childPath = join(workDir, "child.mts");
  writeFileSync(childPath, CHILD);

  const spawnAll = () =>
    Promise.all(
      Array.from({ length: PROCESSES }, () =>
        run("npx", ["tsx", childPath], {
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: scratchUrl },
          timeout: 120_000,
        })
          .then(({ stdout }) => /RESULT:(\w[\w-]*)/.exec(stdout)?.[1] ?? "no-output")
          .catch((error: { stdout?: string; stderr?: string }) => {
            const matched = /RESULT:(\w[\w-]*)/.exec(error.stdout ?? "");
            return matched ? matched[1] : `crashed: ${(error.stderr ?? "").slice(0, 200)}`;
          }),
      ),
    );

  try {
    await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${SCRATCH_DB}"`);
    await admin.$executeRawUnsafe(`CREATE DATABASE "${SCRATCH_DB}"`);

    const probe = new PrismaClient({ datasourceUrl: scratchUrl });
    const countTables = async () => {
      const rows = await probe.$queryRawUnsafe<{ n: number }[]>(
        `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'`,
      );
      return Number(rows[0].n);
    };

    check("the scratch database starts empty", (await countTables()) === 0);

    console.log(`\n${PROCESSES} processes against an empty database`);
    const first = await spawnAll();
    console.log(`  outcomes: ${first.join(", ")}`);

    check("no process failed", !first.some((r) => r === "failed" || r.startsWith("crashed")));
    check("exactly one process created the schema",
      first.filter((r) => r === "created").length === 1,
      `${first.filter((r) => r === "created").length} reported "created"`);
    check("the rest found it already present",
      first.filter((r) => r === "already-present").length === PROCESSES - 1);

    check("all nine tables exist", (await countTables()) === 9, String(await countTables()));

    const indexes = await probe.$queryRawUnsafe<{ n: number }[]>(
      `SELECT count(*)::int AS n FROM pg_indexes WHERE schemaname='public'`,
    );
    check("indexes were created", Number(indexes[0].n) >= 15, String(indexes[0].n));

    const keys = await probe.$queryRawUnsafe<{ n: number }[]>(
      `SELECT count(*)::int AS n FROM information_schema.table_constraints
       WHERE table_schema='public' AND constraint_type='FOREIGN KEY'`,
    );
    check("foreign keys were created", Number(keys[0].n) === 6, String(keys[0].n));

    const locks = await probe.$queryRawUnsafe<{ n: number }[]>(
      `SELECT count(*)::int AS n FROM pg_locks WHERE locktype='advisory'`,
    );
    check("no advisory lock was left held", Number(locks[0].n) === 0, String(locks[0].n));

    console.log(`\n${PROCESSES} processes against the now-populated database`);
    const second = await spawnAll();
    console.log(`  outcomes: ${second.join(", ")}`);
    check("every process reports it was already present",
      second.every((r) => r === "already-present"), second.join(","));
    check("the table count is unchanged", (await countTables()) === 9);

    // An existing database must never be modified by the bootstrap.
    await probe.$executeRawUnsafe(
      `INSERT INTO "User" (id, role, "isGuest", "createdAt", "updatedAt")
       VALUES ('canary', 'student', true, now(), now())`,
    );
    await spawnAll();
    const canary = await probe.$queryRawUnsafe<{ n: number }[]>(
      `SELECT count(*)::int AS n FROM "User" WHERE id='canary'`,
    );
    check("existing data survives untouched", Number(canary[0].n) === 1);

    await probe.$disconnect();
  } finally {
    rmSync(workDir, { recursive: true, force: true });
    await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${SCRATCH_DB}"`).catch(() => {});
    await admin.$disconnect();
  }

  console.log(`\n${checks - failures}/${checks} checks passed.`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
