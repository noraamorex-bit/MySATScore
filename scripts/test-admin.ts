/**
 * Exercises the administrator surface: question validation and CRUD, retirement
 * and replacement, CSV round-tripping, curated form assembly, scoring
 * configuration publishing, and usage reporting.
 *
 * Writes only to rows prefixed `test-`, and removes them at the end.
 *
 *   npm run test:admin
 */
import Module from "node:module";

// `server-only` throws outside Next's server bundle; this harness calls those
// modules directly, so the guard is stubbed for the run.
const load = (Module as unknown as { _load: (...a: unknown[]) => unknown })._load;
(Module as unknown as { _load: unknown })._load = function (this: unknown, r: string, ...rest: unknown[]) {
  return r === "server-only" ? {} : load.call(this, r, ...rest);
};
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
let fail = 0, n = 0;
const ck = (l: string, c: boolean, d = ""): void => {
  n++;
  if (c) {
    console.log(`  ok   ${l}`);
  } else {
    fail++;
    console.error(`  FAIL ${l} ${d}`);
  }
};

(async () => {
  const admin = await import("../src/lib/admin");
  const bankMod = await import("../src/lib/bank");

  console.log("\nQuestion CRUD");
  const q = {
    id: "test-custom-0001", subject: "math", moduleEligibility: "any", domain: "algebra",
    subdomain: "Linear equations in one variable", skills: ["Testing"], difficulty: "easy",
    prompt: "$2x = 10$\n\nWhat is the value of $x$?", answerFormat: "multiple-choice",
    choices: [{ id: "A", text: "2" }, { id: "B", text: "5" }, { id: "C", text: "10" }, { id: "D", text: "20" }],
    correct: "B", explanation: "Divide both sides by two to get $x = 5$, which checks out.",
    calculator: "not-needed", source: { kind: "original", attribution: "Test" }, v: 1,
  };
  ck("valid question saves", (await admin.saveQuestion(q)).ok);
  ck("it appears in the merged bank", Boolean((await bankMod.getBank()).byId.get(q.id)));
  const bad = await admin.saveQuestion({ ...q, id: "test-bad", correct: "Z" });
  ck("a key not among the choices is rejected", !bad.ok, JSON.stringify(bad.errors));
  const badDup = await admin.saveQuestion({ ...q, id: "test-dup", choices: [{id:"A",text:"2"},{id:"B",text:"2"},{id:"C",text:"3"},{id:"D",text:"4"}] });
  ck("duplicate choices are rejected", !badDup.ok);
  const badSpr = await admin.saveQuestion({ ...q, id: "test-spr", answerFormat: "student-response", choices: undefined, correct: "5", acceptedAnswers: [] });
  ck("a grid-in without accepted answers is rejected", !badSpr.ok);

  await admin.setRetired(q.id, true, "test");
  const afterRetire = await bankMod.getBank();
  ck("retiring removes it from the active pool", !afterRetire.active.some((x: { id: string }) => x.id === q.id));
  ck("retired questions stay readable", Boolean(afterRetire.byId.get(q.id)));
  await admin.setRetired(q.id, false);

  console.log("\nReplacement");
  const rep = await admin.replaceQuestion(q.id, { ...q, id: "test-custom-0001-r2" }, "typo in the stem");
  ck("replacement saves", rep.ok);
  const afterReplace = await bankMod.getBank();
  ck("the original is retired", afterReplace.retiredIds.has(q.id));
  ck("the replacement is active", afterReplace.active.some((x: { id: string }) => x.id === "test-custom-0001-r2"));

  console.log("\nCSV round trip");
  const csv = await admin.exportCsv();
  const parsed = admin.parseCsv(csv);
  ck("export parses back", parsed.errors.length === 0 && parsed.rows.length > 1000, `${parsed.rows.length} rows, ${parsed.errors.length} errors`);
  const sample = parsed.rows.find((r: Record<string, string>) => r.id === "m-alg-lineq1-000")!;
  const rebuilt = admin.csvRowToQuestion({ ...sample, id: "test-csv-0001" });
  ck("a re-imported row validates", (await admin.saveQuestion(rebuilt)).ok);
  const csvImport = await admin.importQuestions([rebuilt, { id: "nope" }], "test");
  ck("import reports per-row failures", csvImport.imported === 1 && csvImport.skipped === 1);

  console.log("\nCurated forms");
  const built = await admin.buildCuratedForm({ id: "test-form-01", title: "Test Form", kind: "full" });
  ck("a curated form builds", built.ok, built.errors.join("; "));
  const dup = await admin.buildCuratedForm({ id: "test-form-01", title: "Test Form", kind: "full" });
  ck("duplicate ids are rejected", !dup.ok);
  const cat = await (await import("../src/lib/catalogue")).listCatalogue();
  ck("it appears in the catalogue", cat.some((c: { id: string }) => c.id === "test-form-01"));
  const form = JSON.parse((await db.curatedForm.findUnique({ where: { id: "test-form-01" } }))!.form);
  type FormModule = { questionIds: string[] };
  const allIds = [
    ...(form.modules as FormModule[]).flatMap((m) => m.questionIds),
    ...(Object.values(form.routedModules) as FormModule[]).flatMap((m) => m.questionIds),
  ];
  ck("no duplicate ids in the built form", new Set(allIds).size === allIds.length);
  await admin.deleteCuratedForm("test-form-01");

  console.log("\nScoring configuration");
  const store = await import("../src/lib/scoring-store");
  const { SCORING_CONFIG } = await import("../src/lib/sat/scoring-config");
  const custom = { ...SCORING_CONFIG, version: "test-scale-v9", label: "Test scale" };
  await store.publishScoringConfig(custom);
  const active = await store.activeScoringConfig();
  ck("the published configuration becomes active", active.version === "test-scale-v9");
  await store.publishScoringConfig(SCORING_CONFIG);
  ck("publishing again switches back", (await store.activeScoringConfig()).version === SCORING_CONFIG.version);
  const cfgs = await store.listScoringConfigs();
  ck("only one configuration is active", cfgs.filter((c: { active: boolean }) => c.active).length === 1);

  console.log("\nUsage");
  const usage = await admin.questionUsage(50);
  ck("usage rows load", Array.isArray(usage));
  ck("unused count is sane", (await admin.unusedQuestionCount()) >= 0);

  // Clean up test rows.
  await db.questionOverride.deleteMany({ where: { questionId: { startsWith: "test-" } } });
  await db.scoringConfig.deleteMany({ where: { version: "test-scale-v9" } });

  console.log(`\n${n - fail}/${n} admin checks passed.`);
  if (fail) process.exitCode = 1;
  await db.$disconnect();
})();
