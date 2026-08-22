# Deploying MySATScore

## Read this first: what can host what

MySATScore is a **server application**, not a static site. It needs:

- a Node server (React Server Components, server actions)
- API route handlers (`/api/attempt/...`)
- middleware (issues the signed session cookie on every request)
- a persistent database (attempts, answers, per-user question exposure)

That rules out **GitHub Pages**, which serves static files and nothing else.
There is no configuration that makes it work: exporting the app statically
(`output: "export"`) would strip the API routes, the middleware, and every
server component — which is essentially the whole application.

So the two hosts do different jobs:

| Host | What it serves |
| --- | --- |
| **Vercel** | The application. This is the real deployment. |
| **GitHub Pages** | *(optional)* A static landing page in `docs/` that links to the Vercel app. |

If you only want one, deploy to Vercel and skip Part 2.

---

# Part 1 — Vercel (the application)

You need a Postgres database. SQLite will not work: Vercel's filesystem is
ephemeral and read-only at runtime, so a `.db` file would be wiped on every
deploy and would not be shared between serverless instances.

## 1. Create a Postgres database

Any hosted Postgres works. Two easy options:

**Supabase** — create a project, then Project Settings → Database → Connection
string → **Transaction pooler** (port `6543`).

**Neon** — create a project and copy the **pooled** connection string.

You want the *pooled* connection string, not the direct one. Serverless
functions open a connection per invocation and will exhaust a direct Postgres
connection limit quickly. Append Prisma's pooling hints if they are not already
present:

```
postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1
```

## 2. Switch the Prisma datasource to Postgres and commit

The repo ships with SQLite so `npm run setup` works with zero configuration.
Switch it before deploying:

```bash
npm run db:use-postgres
git add prisma/schema.prisma
git commit -m "Use PostgreSQL for deployment"
git push
```

Every model already uses portable types, so nothing else changes. (`npm run
db:use-sqlite` switches back for local work.)

## 3. Create the schema and seed it, once, from your machine

Do this **before** the first Vercel deploy, pointing at the production database:

```bash
DATABASE_URL="postgresql://...pooled-url..." npx prisma db push
DATABASE_URL="postgresql://...pooled-url..." \
ADMIN_EMAIL="you@example.com" \
ADMIN_PASSWORD="a-long-password-you-choose" \
  npm run seed
```

`db push` creates the tables. `seed` creates the administrator account and
records the built-in scoring configuration as the active version. The question
bank is committed to the repo as JSON, so there is nothing else to load — the
app has all 1,360 questions the moment it starts.

Running this locally rather than in the Vercel build keeps schema changes
deliberate: a build should never be able to alter your production schema by
accident.

## 4. Generate an AUTH_SECRET

Session cookies are signed with it, and the app **refuses to start in
production** if it is missing or shorter than 16 characters — by design.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## 5. Import the project into Vercel

1. [vercel.com/new](https://vercel.com/new) → import `noraamorex-bit/MySATScore`.
2. Framework preset: **Next.js** (detected automatically).
3. Leave Build Command, Output Directory, and Install Command on their defaults.
   The `build` script already runs `prisma generate` before `next build`, which
   is what keeps a cached Vercel build from shipping a stale Prisma client.
4. Add **Environment Variables** — set each for Production, Preview, and
   Development:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | your pooled Postgres connection string |
   | `AUTH_SECRET` | the value from step 4 |
   | `ADMIN_EMAIL` | the email you seeded |
   | `ADMIN_PASSWORD` | only read by the seed script; safe to omit here |

5. **Deploy.**

## 6. Check it

Open the deployment and confirm:

- `/` loads and you get a session cookie (`mss_session`) as a guest
- `/practice` lists 22 curated forms
- start a test → the module directions screen appears → **Begin** starts the timer
- answer a few, submit the module → module 2 is routed
- `/about` shows the bank size and the active scoring configuration
- sign in with your seeded admin email at `/login`, then `/admin` loads

If `/` returns a 500, it is almost always `DATABASE_URL` — check the Vercel
function logs, and confirm you used the pooled connection string.

## Notes

- **Preview deployments share the production database** unless you give the
  Preview environment its own `DATABASE_URL`. For a real project, create a
  second database and set it on Preview only.
- **Change the seeded admin password** if you used the default from
  `.env.example`.
- **Updating the question bank:** edit or add templates under
  `content/generators/`, run `npm run bank:build && npm run bank:verify`, commit
  the regenerated `content/bank/questions.json` and `content/curated/tests.json`,
  and push. Vercel redeploys; no database migration is involved, because the
  bank is a committed data file rather than table rows.
- **Admin edits** (from `/admin`) are stored in the database as an overlay, so
  they survive redeploys and never touch the committed bank file.

---

# Part 2 — GitHub Pages (optional landing page)

`docs/index.html` is a self-contained landing page: no build step, no
dependencies, and it matches the app's design language. It exists so that
`noraamorex-bit.github.io/MySATScore` is something rather than a 404.

## 1. Point it at your Vercel deployment

Open `docs/index.html` and replace both occurrences of
`https://YOUR-PROJECT.vercel.app` with your real URL. They are marked with an
`<!-- APP_URL -->` comment:

```bash
sed -i 's|https://YOUR-PROJECT.vercel.app|https://your-real-app.vercel.app|g' docs/index.html
git add docs/index.html && git commit -m "Point the landing page at the deployment"
```

## 2. Enable Pages

In the repository: **Settings → Pages → Build and deployment → Source:
GitHub Actions.**

## 3. Publish

`.github/workflows/pages.yml` publishes `docs/` whenever it changes on `main`,
and can also be run by hand from the **Actions** tab (**Deploy landing page** →
**Run workflow**). The site appears at:

```
https://noraamorex-bit.github.io/MySATScore/
```

## If you would rather not use Actions

Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder
`/docs`. Then delete `.github/workflows/pages.yml`. The `docs/.nojekyll` file is
already there, which stops Jekyll from touching the output.

---

# Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:

```
typecheck → lint → prisma db push (throwaway SQLite) → npm test → next build
```

`npm test` is bank verification, the full attempt-lifecycle suite (85 checks,
including timer expiry and refresh edge cases), and the admin suite (22 checks).
It uses a temporary SQLite file, so CI needs no database service and no secrets.

Connect the repository to Vercel and you can require this workflow to pass
before a production deploy: **Settings → Git → Ignored Build Step**, or protect
`main` with a required status check.

---

# Other hosts

Anything that runs a Node server works, since the app has no Vercel-specific
code:

- **Railway / Render / Fly.io** — build with `npm run build`, start with
  `npm start`, set the same environment variables. These give you a persistent
  filesystem, so SQLite is viable for a single instance, though Postgres is
  still the better choice.
- **Docker** — `npm ci && npm run build`, then `npm start` on port 3000.
- **Netlify** — works via the Next.js runtime, with the same Postgres
  requirement.

`output: "export"` is the one thing that will never work. The app is a server
application, and that is the point.
