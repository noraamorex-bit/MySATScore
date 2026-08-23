/**
 * Prisma client singleton.
 *
 * Next.js keeps modules alive across hot reloads in development, so the client
 * is cached on `globalThis` to avoid exhausting the connection pool.
 */
import { PrismaClient } from "@prisma/client";
import { normalizeDatabaseUrl } from "./database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Repairs the two things most often missed when a connection string is copied
// out of a hosting dashboard by hand. See `database-url.ts`.
const datasourceUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
