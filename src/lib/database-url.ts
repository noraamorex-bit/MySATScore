/**
 * Normalises the database connection string.
 *
 * Connection strings are copied out of a hosting dashboard and then edited by
 * hand, which is where deployments usually go wrong — especially from a phone.
 * Two things reliably get missed, and both are fixable or at least explainable
 * here rather than surfacing as a baffling runtime error.
 */

export class DatabaseUrlError extends Error {}

/** Hosts whose poolers run PgBouncer in transaction mode. */
const POOLED_HOST_MARKERS = ["pooler.supabase.com", "pgbouncer"];
const POOLED_PORTS = ["6543"];

/**
 * Returns the connection string Prisma should use.
 *
 * - Rejects a string still containing the dashboard's `[YOUR-PASSWORD]`
 *   placeholder, with a message that says what to do about it.
 * - Adds `pgbouncer=true&connection_limit=1` when the string points at a
 *   transaction pooler and does not already say so. Without it, Prisma uses
 *   prepared statements the pooler cannot support, and queries fail
 *   intermittently in a way that is very hard to diagnose.
 */
export function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;

  if (/\[YOUR-PASSWORD\]|\[PASSWORD\]|YOUR-PASSWORD/i.test(raw)) {
    throw new DatabaseUrlError(
      "DATABASE_URL still contains the placeholder [YOUR-PASSWORD]. Replace it " +
        "with your actual database password (including removing the square brackets).",
    );
  }

  // Only Postgres connection strings need any of this.
  if (!/^postgres(ql)?:\/\//i.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // Leave anything unparseable alone; Prisma will report it more precisely.
    return raw;
  }

  const isPooled =
    POOLED_PORTS.includes(url.port) ||
    POOLED_HOST_MARKERS.some((marker) => url.hostname.includes(marker));

  if (isPooled && !url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    return url.toString();
  }

  return raw;
}
