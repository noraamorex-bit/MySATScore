/**
 * Scoring configuration storage.
 *
 * The compiled-in tables in `sat/scoring-config.ts` are the default. An
 * administrator can publish a replacement, which is stored as JSON and becomes
 * active immediately — so scales can be corrected without a code change, and
 * every completed attempt records the version it was scored under.
 */
import "server-only";
import { db } from "./db";
import { SCORING_CONFIG, type ScoringConfig } from "./sat/scoring-config";

export async function activeScoringConfig(): Promise<ScoringConfig> {
  const row = await db.scoringConfig.findFirst({ where: { active: true } });
  if (!row) return SCORING_CONFIG;
  try {
    return JSON.parse(row.payload) as ScoringConfig;
  } catch {
    return SCORING_CONFIG;
  }
}

export async function publishScoringConfig(config: ScoringConfig): Promise<void> {
  await db.$transaction([
    db.scoringConfig.updateMany({ where: { active: true }, data: { active: false } }),
    db.scoringConfig.upsert({
      where: { version: config.version },
      create: {
        version: config.version,
        label: config.label,
        payload: JSON.stringify(config),
        active: true,
      },
      update: { label: config.label, payload: JSON.stringify(config), active: true },
    }),
  ]);
}

export async function listScoringConfigs() {
  return db.scoringConfig.findMany({ orderBy: { createdAt: "desc" } });
}
