/**
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
  `CREATE SCHEMA IF NOT EXISTS "public"`,
  `CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
)`,
  `CREATE TABLE "public"."Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "curated" BOOLEAN NOT NULL DEFAULT false,
    "form" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "cursor" INTEGER NOT NULL DEFAULT 0,
    "onBreak" BOOLEAN NOT NULL DEFAULT false,
    "breakEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "routes" TEXT NOT NULL DEFAULT '{}',
    "scoreSnapshot" TEXT,
    "scoringVersion" TEXT,
    "routingVersion" TEXT,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
)`,
  `CREATE TABLE "public"."AttemptModule" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "module" INTEGER NOT NULL,
    "route" TEXT,
    "durationSeconds" INTEGER NOT NULL,
    "questionIds" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "timedOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AttemptModule_pkey" PRIMARY KEY ("id")
)`,
  `CREATE TABLE "public"."Answer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "given" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentMs" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
)`,
  `CREATE TABLE "public"."QuestionExposure" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "attemptId" TEXT,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasCorrect" BOOLEAN,

    CONSTRAINT "QuestionExposure_pkey" PRIMARY KEY ("id")
)`,
  `CREATE TABLE "public"."QuestionStat" (
    "questionId" TEXT NOT NULL,
    "timesServed" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastServedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionStat_pkey" PRIMARY KEY ("questionId")
)`,
  `CREATE TABLE "public"."QuestionOverride" (
    "questionId" TEXT NOT NULL,
    "payload" TEXT,
    "retired" BOOLEAN NOT NULL DEFAULT false,
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionOverride_pkey" PRIMARY KEY ("questionId")
)`,
  `CREATE TABLE "public"."CuratedForm" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratedForm_pkey" PRIMARY KEY ("id")
)`,
  `CREATE TABLE "public"."ScoringConfig" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringConfig_pkey" PRIMARY KEY ("id")
)`,
  `CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email")`,
  `CREATE INDEX "User_role_idx" ON "public"."User"("role")`,
  `CREATE INDEX "Attempt_userId_status_idx" ON "public"."Attempt"("userId", "status")`,
  `CREATE INDEX "Attempt_userId_completedAt_idx" ON "public"."Attempt"("userId", "completedAt")`,
  `CREATE INDEX "AttemptModule_attemptId_idx" ON "public"."AttemptModule"("attemptId")`,
  `CREATE UNIQUE INDEX "AttemptModule_attemptId_ordinal_key" ON "public"."AttemptModule"("attemptId", "ordinal")`,
  `CREATE INDEX "Answer_moduleId_idx" ON "public"."Answer"("moduleId")`,
  `CREATE UNIQUE INDEX "Answer_attemptId_questionId_key" ON "public"."Answer"("attemptId", "questionId")`,
  `CREATE INDEX "QuestionExposure_userId_idx" ON "public"."QuestionExposure"("userId")`,
  `CREATE INDEX "QuestionExposure_questionId_idx" ON "public"."QuestionExposure"("questionId")`,
  `CREATE UNIQUE INDEX "QuestionExposure_userId_questionId_key" ON "public"."QuestionExposure"("userId", "questionId")`,
  `CREATE INDEX "QuestionOverride_retired_idx" ON "public"."QuestionOverride"("retired")`,
  `CREATE INDEX "QuestionOverride_custom_idx" ON "public"."QuestionOverride"("custom")`,
  `CREATE UNIQUE INDEX "ScoringConfig_version_key" ON "public"."ScoringConfig"("version")`,
  `CREATE INDEX "ScoringConfig_active_idx" ON "public"."ScoringConfig"("active")`,
  `ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "public"."AttemptModule" ADD CONSTRAINT "AttemptModule_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."AttemptModule"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "public"."QuestionExposure" ADD CONSTRAINT "QuestionExposure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "public"."QuestionExposure" ADD CONSTRAINT "QuestionExposure_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."Attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
];
