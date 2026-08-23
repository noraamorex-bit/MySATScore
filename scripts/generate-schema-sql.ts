/**
 * Generates `src/lib/schema-sql.ts` from `prisma/init.sql`.
 *
 * The app creates its own tables on first run, which means the DDL has to be
 * reachable from the server bundle. A generated TypeScript module is the
 * reliable way to do that — reading a .sql file at runtime depends on file
 * tracing that varies by host.
 *
 *   npx tsx scripts/generate-schema-sql.ts
 *
 * CI regenerates this and fails if the committed copy has drifted.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "prisma/init.sql"), "utf8");

// Strip comments, then split into individual statements. Prisma sends queries
// over the extended protocol, which permits only one statement per call, so the
// file cannot be executed as a single blob.
const body = source
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = body
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

if (statements.length === 0) throw new Error("prisma/init.sql produced no statements");
for (const statement of statements) {
  if (statement.includes("$$")) {
    throw new Error("init.sql now contains dollar-quoting; the naive split is no longer safe");
  }
}

const out = `/**
 * The database schema, as individual SQL statements.
 *
 * GENERATED FILE — do not edit. Regenerate with:
 *   npx tsx scripts/generate-schema-sql.ts
 *
 * Source: prisma/init.sql, itself generated from prisma/schema.prisma. Kept in
 * the bundle so a fresh deployment can create its own tables on first run
 * without anyone having to run a migration by hand.
 */

export const SCHEMA_STATEMENTS: readonly string[] = [
${statements.map((s) => `  \`${s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\`,`).join("\n")}
];
`;

writeFileSync(resolve(process.cwd(), "src/lib/schema-sql.ts"), out);
console.log(`Wrote src/lib/schema-sql.ts (${statements.length} statements).`);
