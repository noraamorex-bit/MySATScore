# Getting MySATScore online

This guide assumes you have never deployed anything before. It uses **only a web
browser** — nothing to install, no command line, no coding.

**Time:** about 20–30 minutes.
**Cost:** free. Every service used here has a free tier that is plenty for this.

---

## What you are about to do, in plain English

The app is a **program**, not a set of files. It has to run somewhere that can
execute code and remember things. So there are three pieces:

| Piece | What it does | Who provides it |
| --- | --- | --- |
| **The code** | Already written, already on GitHub | GitHub (done) |
| **A database** | Remembers users, tests, answers, scores | **Supabase** |
| **A server** | Runs the code and serves the website | **Vercel** |

You will create the database, tell the code to use that kind of database, and
then point Vercel at your GitHub repository. Vercel does the rest automatically.

> **Why not GitHub Pages?** GitHub Pages can only serve fixed files — pictures,
> text, plain web pages. It cannot run a program or store anything. This app
> does both. GitHub Pages is used at the very end, optionally, for a simple
> welcome page that links to the real app.

---

## Before you start

Create these three free accounts if you do not have them. Signing in to all of
them with the **same GitHub account** makes everything simpler.

1. **GitHub** — you already have this (`noraamorex-bit`).
2. **Supabase** — <https://supabase.com> → *Start your project* → sign in with GitHub.
3. **Vercel** — <https://vercel.com/signup> → *Continue with GitHub*.

Nothing asks for a credit card.

---

# Step 1 — Create the database

### 1.1 Make a Supabase project

1. Go to <https://supabase.com/dashboard> and click **New project**.
2. Fill in:
   - **Name:** `mysatscore`
   - **Database Password:** click **Generate a password**, then **copy it and
     save it somewhere safe.** You need it in a minute and Supabase will not
     show it again.
   - **Region:** pick the one closest to you.
3. Click **Create new project** and wait 1–2 minutes while it sets up.

### 1.2 Create the tables

The database starts completely empty. This step creates the nine tables the app
needs.

1. In your GitHub repository, open this file:
   **`prisma/init.sql`**
   (or go straight to
   <https://github.com/noraamorex-bit/MySATScore/blob/main/prisma/init.sql>)
2. Click the **Copy raw file** button (the small copy icon at the top right of
   the file).
3. Back in Supabase, click **SQL Editor** in the left sidebar, then
   **New query**.
4. Paste everything into the big text box.
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter).

You should see **Success. No rows returned.** That is what success looks like
here — it created tables rather than fetching anything.

To check: click **Table Editor** in the sidebar. You should see nine tables:
`User`, `Attempt`, `AttemptModule`, `Answer`, `QuestionExposure`,
`QuestionStat`, `QuestionOverride`, `CuratedForm`, `ScoringConfig`.

### 1.3 Copy the connection string

This is the address and password the app uses to reach your database.

1. In Supabase, click **Connect** at the top of the page (on some versions it is
   *Project Settings → Database → Connection string*).
2. You will see several options. Choose **Transaction pooler**.

   > **This choice matters.** Vercel runs your app in many short-lived copies,
   > each opening its own database connection. The "Direct connection" option
   > would run out of connections quickly and the site would start failing. The
   > transaction pooler is built for exactly this. It uses port **6543**.

3. Copy the string. It looks like this:

   ```
   postgresql://postgres.abcdefghijkl:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```

4. Replace `[YOUR-PASSWORD]` — including the square brackets — with the database
   password you saved in step 1.1.

5. Add this to the very end, exactly as written:

   ```
   ?pgbouncer=true&connection_limit=1
   ```

   So the finished string ends with `.../postgres?pgbouncer=true&connection_limit=1`.

   > **Why:** it tells the app it is talking through a pooler, so it adjusts how
   > it sends queries. Without it you will get intermittent errors.

**Save this whole string in a note.** You need it in Step 3. Treat it like a
password — anyone with it can read your database.

---

# Step 2 — Change one word in the code

The code currently says "use a simple local database file", which is right for
working on your own computer but will not work on a real server. You are
changing it to say "use PostgreSQL", which is what Supabase provides.

You can do this entirely on the GitHub website.

1. Go to
   <https://github.com/noraamorex-bit/MySATScore/blob/main/prisma/schema.prisma>
2. Click the **pencil icon** (Edit this file) near the top right.
3. Find **line 14**. It looks like this:

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

4. Change `"sqlite"` to `"postgresql"` so it reads:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

   > ⚠️ **Do not touch line 10**, which says `provider = "prisma-client-js"`.
   > That is a different setting and changing it will break the build. You are
   > only changing the one inside the block that starts with `datasource db {`.

5. Scroll down, click **Commit changes...**, then **Commit changes** in the
   dialog. Leave the defaults as they are.

That is the only code change you need to make.

---

# Step 3 — Put the app online

### 3.1 Import the project

1. Go to <https://vercel.com/new>.
2. Find **MySATScore** in the list of your GitHub repositories and click
   **Import**. If you do not see it, click **Adjust GitHub App Permissions** and
   grant Vercel access to the repository.
3. Vercel detects that this is a Next.js app. **Leave every build setting
   alone** — the defaults are correct.

### 3.2 Add three settings

Before deploying, open the **Environment Variables** section and add these three.
For each one: type the name, paste the value, click **Add**.

| Name | Value |
| --- | --- |
| `DATABASE_URL` | the full connection string from Step 1.3 |
| `AUTH_SECRET` | a long random string — see below |
| `ADMIN_EMAIL` | the email address you will use to manage questions |

**About `AUTH_SECRET`:** this is a private key the app uses to sign login
cookies, so nobody can forge being logged in as someone else. It must be at
least 16 characters; 40 or more is better. It is never shown to anyone.

To make one, either:
- use your password manager's "generate password" feature and ask for 40+
  characters, or
- use the password generator built into Chrome, Safari, or Firefox, or
- genuinely mash your keyboard for 40+ characters of letters and digits.

Do not use a real word, and do not reuse a password you use elsewhere.

**About `ADMIN_EMAIL`:** whoever registers on your site with this exact email
address automatically becomes the administrator. Use your own email, and get it
right — you cannot easily change who is admin afterwards.

> The app deliberately refuses to start if `AUTH_SECRET` is missing or too
> short. If your first deployment fails, this is the most likely reason.

### 3.3 Deploy

Click **Deploy**. It takes roughly two minutes.

When it finishes you get a link like `https://mysatscore-xyz123.vercel.app`.
Click it. **Your site is live.**

### 3.4 Check it worked

Open your new site and confirm:

- The home page loads and describes the test.
- **Practice** lists 22 ready-made tests.
- Click **Begin test** → you get a directions screen → **Begin Module 1** starts
  a countdown.
- Answer a couple of questions and use **Back** and **Next**.

You do not need to finish the test to know it works.

---

# Step 4 — Make yourself the administrator

There is no separate setup for this and nothing to run.

1. On your live site, click **Create account**.
2. Register using **exactly** the email you put in `ADMIN_EMAIL`.
3. Choose a strong password of your own.

Once registered, an **Admin** link appears in the top navigation. From there you
can add, edit, retire, and replace questions, import and export them, build new
fixed tests, see which questions are being answered correctly, and update the
scoring tables.

If the Admin link does not appear, the email did not match. Check for typos or
extra spaces in the Vercel setting, correct it, and see "Changing a setting
later" below.

---

# Step 5 — The welcome page on GitHub Pages *(optional)*

This is genuinely optional. It gives `noraamorex-bit.github.io/MySATScore` a
simple page describing the app with a button through to your Vercel site,
instead of a "404 not found".

1. Go to
   <https://github.com/noraamorex-bit/MySATScore/blob/main/docs/index.html>
2. Click the **pencil icon** to edit.
3. Press Ctrl+F (Cmd+F on a Mac) and search for `YOUR-PROJECT`. There are
   **two** places that say:

   ```
   https://YOUR-PROJECT.vercel.app
   ```

4. Replace both with your real Vercel address from Step 3.3.
5. **Commit changes.**

Then turn Pages on: in your repository go to **Settings → Pages**. Under *Build
and deployment*, set **Source** to **Deploy from a branch**, choose branch
**`main`**, and click **Save**. Wait a minute or two, then visit
<https://noraamorex-bit.github.io/MySATScore/>.

The page is set up to work whichever folder option you pick, so you do not need
to think about that setting.

---

# Keeping it running

### Changing a setting later

Vercel → your project → **Settings → Environment Variables**. Edit the value,
save, then go to the **Deployments** tab, open the most recent deployment, and
choose **Redeploy**. Environment variables are only read when the app starts, so
a redeploy is required for a change to take effect.

### Changing the code

Any change you commit to the `main` branch on GitHub deploys automatically
within a couple of minutes. There is nothing to click.

### Your data

Everything users do lives in your Supabase database, not in Vercel. Redeploying
never affects it. Supabase pauses free projects after a period of inactivity —
you resume them from the dashboard with one click and nothing is lost.

### Costs

The free tiers cover a personal or small-classroom project comfortably. Neither
service will charge you without you explicitly upgrading.

---

# If something goes wrong

| What you see | What it usually means |
| --- | --- |
| Deployment fails, log mentions `AUTH_SECRET` | The secret is missing or shorter than 16 characters. Fix it in Environment Variables and redeploy. |
| Site loads but every page shows an error | `DATABASE_URL` is wrong. Check you replaced `[YOUR-PASSWORD]`, used the **Transaction pooler** string (port 6543), and added `?pgbouncer=true&connection_limit=1`. |
| Errors that come and go at random | You probably used the *Direct connection* string instead of the pooler. |
| `relation "User" does not exist` | Step 1.2 did not run. Go back to the Supabase SQL Editor and run `prisma/init.sql`. |
| Build fails mentioning Prisma or `sqlite` | Step 2 was missed, or the wrong `provider` line was edited. Check line 14, and that line 10 still says `prisma-client-js`. |
| No **Admin** link after registering | The registered email does not exactly match `ADMIN_EMAIL`. |

**Where to read the actual error:** Vercel → your project → **Deployments** →
click the failed one → **Build Logs** for build failures, or the **Logs** tab
for errors that happen while people use the site. The real reason is almost
always in the last few red lines.

---

# Appendix A — Doing it from a terminal instead

If you are comfortable with a command line, this replaces Steps 1.2, 2 and 4.
You need [Node.js 20+](https://nodejs.org) and Git.

```bash
git clone https://github.com/noraamorex-bit/MySATScore.git
cd MySATScore
npm install

# Point the schema at PostgreSQL (this is Step 2)
npm run db:use-postgres
git commit -am "Use PostgreSQL for deployment" && git push

# Create the tables and the admin account (Steps 1.2 and 4)
export DATABASE_URL="postgresql://...your pooled string..."
npx prisma db push
ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="something-long" npm run seed

# Generate an AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

To run it on your own machine with no database at all:

```bash
npm run db:use-sqlite   # if you switched it
npm run setup           # creates a local file-based database and seeds it
npm run dev             # http://localhost:3000
```

Useful commands:

| Command | What it does |
| --- | --- |
| `npm test` | Bank checks, full test-lifecycle checks, admin checks |
| `npm run bank:build` | Rebuild the question bank from its source templates |
| `npm run bank:verify` | Validate every question and every curated test |
| `npm run db:studio` | Browse the database in a local web UI |

After changing `prisma/schema.prisma`, regenerate `prisma/init.sql` with:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

---

# Appendix B — Automated checks

`.github/workflows/ci.yml` runs on every push to `main`: type checking, linting,
the question-bank verification, the full test-lifecycle suite (85 checks,
including timer expiry and page-refresh behaviour), the admin suite (22 checks),
and a production build. It uses a temporary throwaway database, so it needs no
secrets and no setup. You can watch it in the repository's **Actions** tab.

# Appendix C — Other hosts

Anything that can run a Node.js server works — Railway, Render, Fly.io, or your
own machine with Docker. Build with `npm run build`, start with `npm start`, and
set the same three environment variables.

The one thing that will never work is a static-file host such as GitHub Pages,
Netlify Drop, or an S3 bucket on its own. This is a program, not a folder of
pages.
