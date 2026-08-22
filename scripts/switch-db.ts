/**
 * Switches the Prisma datasource between SQLite (zero-config default) and
 * PostgreSQL/Supabase.
 *
 *   npm run db:use-postgres
 *   npm run db:use-sqlite
 *
 * Only the provider line changes; every model in the schema uses portable types.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2];
if (target !== "sqlite" && target !== "postgresql") {
  console.error("usage: tsx scripts/switch-db.ts <sqlite|postgresql>");
  process.exit(1);
}

const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
const schema = readFileSync(schemaPath, "utf8");
const updated = schema.replace(
  /(datasource db \{\s*\n\s*provider\s*=\s*)"[^"]+"/,
  `$1"${target}"`,
);

if (updated === schema && !schema.includes(`provider = "${target}"`)) {
  console.error("Could not find the datasource provider line in prisma/schema.prisma");
  process.exit(1);
}

writeFileSync(schemaPath, updated);
console.log(`Prisma datasource provider set to "${target}".`);
console.log(
  target === "postgresql"
    ? 'Next: set DATABASE_URL to your PostgreSQL/Supabase connection string, then run `npm run setup`.'
    : 'Next: set DATABASE_URL="file:./dev.db" in .env, then run `npm run setup`.',
);
