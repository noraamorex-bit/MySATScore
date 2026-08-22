# MySATScore

A Digital SAT practice platform: full-length adaptive mock tests with realistic
timing, scaled scoring, question-level analytics, and a content-management
console.

The test experience mirrors the real administration — two adaptive Reading and
Writing modules, an optional break, two adaptive Math modules, a server-held
clock, a review screen before each submission — while the branding, the
question bank, and the scoring model are entirely this project's own.

---

## Quick start

```bash
npm install
cp .env.example .env      # optional; sensible defaults are already committed
npm run setup             # generate the client, create the database, seed it
npm run dev               # http://localhost:3000
```

`npm run setup` uses SQLite and needs no external services. The bundled question
bank (1,360 questions) and curated test catalogue (22 forms) are committed, so
the app is fully usable the moment it starts — no import step, no placeholder
content.

The seeded administrator is `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`
(`admin@mysatscore.local` / `admin12345` by default). **Change these before
deploying anywhere.**

### Using PostgreSQL or Supabase

```bash
npm run db:use-postgres                 # rewrites the Prisma datasource
# set DATABASE_URL in .env, e.g.
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
npm run setup
```

Every model uses types that are portable across both engines, and structured
values are stored as JSON strings rather than native JSON columns, so nothing
else has to change. `npm run db:use-sqlite` switches back.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js development, production build, production server |
| `npm run setup` | Prisma generate + schema push + seed |
| `npm run seed` | Create/repair the administrator account and scoring config |
| `npm run bank:build` | Regenerate `content/bank/questions.json` and the curated catalogue |
| `npm run bank:verify` | Validate the bank: schema, keys, math rendering, form integrity |
| `npm run test` | `bank:verify` + `test:flow` + `test:admin` |
| `npm run test:flow` | End-to-end attempt lifecycle, routing, scoring, edge cases |
| `npm run test:admin` | Admin CRUD, retirement, replacement, CSV round trip, form building |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:studio` | Prisma Studio |

---

## How the test works

**Structure.** Reading and Writing runs first: two modules of 27 questions at
32 minutes each. Math follows: two modules of 22 questions at 35 minutes each.
98 questions, 2 hours 14 minutes of testing, plus an optional 10-minute break
between the sections. A module cannot be revisited once submitted, and a later
module cannot be opened early — the server renders whatever module the attempt's
cursor points at, and nothing else.

**Adaptivity.** Module 1 carries a representative spread of difficulties. Each
correct answer earns points weighted by difficulty (easy 1, medium 1.35, hard
1.75), and clearing 60% of the available weighted points routes the test taker
to the harder second module. The policy is pure, deterministic, and configurable
in `src/lib/sat/scoring-config.ts`; identical module-1 answers always produce an
identical decision, and the inputs to that decision are recorded so a result can
explain itself. Difficulty is never revealed during a test.

**The clock is the server's.** A module's deadline is stored when it starts.
Refreshing, closing the tab, losing the network, sleeping the device, or
changing the system clock cannot buy extra time; answers submitted after the
deadline are rejected, and a module whose deadline has passed is submitted
automatically the next time the attempt is touched. The browser recomputes its
countdown from that absolute timestamp rather than counting ticks.

**The form is frozen.** The assembled test is stored on the attempt as JSON, so
rebuilding the question bank or editing a question in the admin console can
never alter an attempt already under way.

---

## Scoring

Section scores run 200–800 in ten-point steps; the total is their sum, 400–1600.

College Board does not publish the equating tables used on the real exam, and
the true conversion depends on which second module a test taker received. The
tables in `src/lib/sat/scoring-config.ts` are a **documented model**, not
official data. They reproduce the properties that matter for practice:

- the advanced second module is the only path to the top of the scale;
- the standard second module compresses toward a ceiling in the low-to-mid 600s;
- the curve is steepest in the middle of the raw range and flattens at both ends.

They are deliberately isolated from the scoring engine so they can be replaced
wholesale. An administrator can publish a new versioned configuration from
`/admin/scoring` without a deploy, and every completed attempt records the
version it was scored under, so old results stay explainable.

---

## The question bank

**Every question is original.** No College Board material is reproduced. The
schema carries a `source` field (`original`, `official-public`, `imported`) and
requires attribution for anything not written for this project, so officially
released material can be imported and credited properly if you have it.

**Contents.** 1,360 questions across every domain and difficulty:

| | |
| --- | --- |
| Math | 923 — Algebra 262, Advanced Math 248, Problem-Solving and Data Analysis 215, Geometry and Trigonometry 198 |
| Reading and Writing | 437 — Standard English Conventions 136, Information and Ideas 114, Craft and Structure 113, Expression of Ideas 74 |
| Difficulty | 392 easier · 571 medium · 397 harder |
| Formats | Multiple choice and student-produced response (grid-in), with passages, tables, graphs, and geometric figures |

Each question stores an id, subject, module eligibility, domain, subdomain,
skill tags, difficulty, stimulus, prompt, choices, key, accepted answer forms,
explanation, distractor notes, calculator policy, source, and template lineage.
Usage — times served, times correct, last served, and per-user exposure — is
tracked in the database.

**It is generated, not hand-maintained as data.** `content/generators/` holds
authored templates; `npm run bank:build` seeds a deterministic PRNG with
`<templateId>:<index>` and emits the bank, so a rebuild produces byte-identical
output, ids stay stable, and content review is a diff. Math templates compute
their own answers from the sampled parameters and self-check them, so a
generated item cannot quietly disagree with its own key. `npm run bank:verify`
then re-validates every item against the schema, grades each key through the
real grading path, renders every math span through KaTeX, and checks that no two
items render identically.

```
content/
  generators/          authored templates and the build pipeline
    math/              algebra, advanced, psda, geometry
    rw/                conventions, expression, vocab, passage sets
    build.ts           deterministic bank build
    verify.ts          integrity checks
  bank/questions.json  the generated bank (committed)
  curated/tests.json   the curated catalogue (committed)
```

**Adding questions** means adding a template or a seed to `content/generators/`
and running `npm run bank:build`, or importing JSON/CSV through the admin
console. Nothing in the application code needs to change; the bank is a data
dependency, not a source dependency.

---

## No question repeats

Two separate guarantees:

1. **Within a test.** No question id can appear twice anywhere in a form —
   including in the routed second module the test taker was *not* sent to,
   which is reserved up front so a collision is impossible. `bank:verify`
   enforces this for every curated form.

2. **Across a user's tests.** Every question served is recorded as an exposure
   for that user. When a new form is generated, the assembler walks its entire
   constraint-relaxation ladder over *unseen* questions before it will consider
   a seen one — so never repeating a question outranks matching the blueprint
   exactly. A repeat happens only when the bank holds nothing unseen that could
   fill the slot, and that case is reported rather than hidden.

**Capacity, honestly.** A full-length form consumes 81 Reading and Writing and
66 Math questions (both routed second modules included). At 437 Reading and
Writing questions, the current bank supports about five fully non-overlapping
full-length forms per user before it starts reusing items, and many more
Math-only sets. The curated catalogue ships 22 forms built in non-overlapping
groups: consecutive forms share nothing, and the catalogue rotates once the
unspent pool runs low. Reading and Writing is the binding constraint, and
`content/generators/rw/` is where to add depth.

---

## Architecture

```
src/
  lib/
    sat/               the domain, dependency-free and portable
      types.ts         question, stimulus, and test models
      blueprint.ts     structure, timing, content distribution
      scoring-config.ts   scale tables and routing policy (data, not logic)
      scoring.ts       scaling and the routing decision
      assemble.ts      blueprint-matching test assembler
      grade.ts         answer grading, including grid-in equivalence
      schema.ts        zod validation for everything entering the bank
    bank.ts            static bank + database overlay, merged and cached
    catalogue.ts       curated forms, static + admin-authored
    attempts.ts        attempt lifecycle: modules, clock, routing, scoring
    analytics.ts       results, breakdowns, recommendations, history
    admin.ts           question CRUD, import/export, form building, usage
    auth.ts            scrypt passwords, signed session cookies
  app/                 routes (App Router, server components by default)
  components/          UI, including the test runner and renderers
prisma/schema.prisma   User, Attempt, AttemptModule, Answer, QuestionExposure,
                       QuestionStat, QuestionOverride, CuratedForm, ScoringConfig
```

`src/lib/sat/` has no imports outside itself, which is what lets the content
pipeline, the server, and the browser all share one definition of what a
question and a test are.

**Rendering.** Passages, tables, graphs, and geometric figures are described
declaratively in the bank and rendered as semantic HTML and inline SVG — no
charting library, no images to serve, crisp on any display, and correct in both
themes. Math is written as `$…$` / `$$…$$` and rendered with KaTeX.

**Authentication.** Middleware issues every visitor a signed, HTTP-only session
cookie, and the matching row is created lazily the first time it is needed.
Guests are ordinary user rows flagged `isGuest`, so attempts, history, exposure
tracking, and analytics behave identically before and after sign-up — and
registering claims the same session id, carrying every test already taken with
it. Passwords are scrypt-hashed with a per-user salt; session tokens are
HMAC-SHA-256 signed via Web Crypto so middleware and the server share one
implementation.

---

## The test runner

- Split passage/question layout on wide screens, stacked on phones
- Server-held countdown with a hide toggle and five-minute and one-minute cues
- Mark for review, answer eliminator, question navigator, review screen
- Confirmation before every submission, with unanswered and marked counts
- On-screen scientific calculator (expression parser, never `eval`) and the
  formula reference sheet, on Math only
- Full-screen mode where the browser supports it
- Keyboard shortcuts: `A`–`D` to answer, `←`/`→` to navigate, `M` to mark
- Answers, flags, and time-on-question persist as you go, so a refresh or a
  closed tab loses nothing

**Mobile.** Layouts are fluid rather than breakpoint-hopping, controls are
comfortably sized, `100dvh` and `env(safe-area-inset-*)` keep the runner clear
of iOS browser chrome and the home indicator, inputs are 16px so Safari does not
zoom on focus, and wide content scrolls inside its own container so the page body
never does.

---

## Results and review

After a test: total and section scores, which routed form you received and
whether it capped your ceiling, raw counts, accuracy, performance by domain and
by difficulty, time on task, answered/unanswered/marked counts, weakest skills,
and specific recommended practice areas. The history dashboard charts score
progression across every completed test on a fixed 400–1600 axis, so a five-point
gain looks like a five-point gain.

Review shows every question with your answer, the key, the full explanation, the
domain and skill tags, and trap analysis where the item has it — filterable by
incorrect, correct, skipped, or marked. **Retry missed questions** replays
everything you got wrong, untimed, with the explanation on demand and without
touching the original score.

---

## Admin console (`/admin`, administrators only)

- **Questions** — search and filter the merged bank; edit any question against
  the same schema the pipeline validates, with a live preview rendered by the
  test runner's own components
- **Retire / replace / revert** — retired questions stay readable so past
  attempts still render, but are never served again; replacing one retires the
  original and links the successor; reverting restores the generated version
- **Import / export** — JSON or CSV, validated per row so a bad row is reported
  and skipped rather than fatal; CSV export round-trips through a spreadsheet
- **Curated tests** — build fixed forms that avoid questions already used, then
  publish or unpublish them
- **Usage** — times served and observed percent correct per question, with items
  whose real-world accuracy falls outside their authored difficulty band flagged
  for review
- **Scoring** — publish a new versioned scale, with validation and sample
  conversions

Administrator edits are stored as a database overlay. The generated bank file is
never mutated, so it stays reproducible from source and every change is
reversible.

---

## Testing

`npm run test` runs three suites, 100+ assertions in total:

- **`bank:verify`** — every question validates; every key grades correct through
  the real grading path; every accepted grid-in form grades correct; every math
  span renders; no two questions render identically; every curated form has
  exact counts, exact durations, both routed modules, and no duplicate ids.
- **`test:flow`** — a full attempt end to end: start, module 1, adaptive
  routing, module 2, break, Math, scoring, results, review, exposure tracking,
  history, then a second test that avoids everything already seen. Covers the
  edge cases too: a refresh that must not extend the clock, answers rejected
  after the deadline, auto-submission of an expired module, a partially answered
  module, an empty attempt, and starting a test while another is open.
- **`test:admin`** — question CRUD and validation failures, retirement,
  replacement, CSV round-tripping, per-row import failures, curated form
  assembly and duplicate-id rejection, scoring configuration publishing.

The whole flow has also been exercised over HTTP against a production build:
every page, every API route, guest session issuance, module transitions, the
break, scoring, results, review, and the admin console.

---

## Notes and limitations

- The scoring tables are a documented model, not official equating data. See
  `/about` in the app, `src/lib/sat/scoring-config.ts`, and `/admin/scoring`.
- Reading and Writing is the bank's binding constraint. Adding depth there is
  the highest-value expansion, and `content/generators/rw/` is set up for it:
  new seeds are appended to a list and picked up automatically.
- The Digital SAT's real calculator is Desmos. This is a scientific calculator
  with a hand-written expression parser — capable, but not a graphing tool.
- SAT is a trademark of the College Board, which is not affiliated with and does
  not endorse this project.
