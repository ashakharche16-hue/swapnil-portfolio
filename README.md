# Swapnil Kharche — Portfolio

A premium, **database-backed** personal portfolio for Swapnil Kharche (Software
Development Manager / Engineering Leader). Every piece of visible content is
editable from a protected `/admin` dashboard — no code changes needed. It also
ships a **live, zero-cost RAG demo** (`/rag`) where visitors upload a PDF and ask
questions answered from its contents.

See [`CLAUDE.md`](./CLAUDE.md) for the full product brief and slice-by-slice plan.

## Contents

- [Features](#features)
- [Stack](#stack)
- [Project structure](#project-structure)
- [Quick start (local)](#quick-start-local)
- [Environment variables](#environment-variables)
- [Supabase setup (one time)](#supabase-setup-one-time)
- [Using the admin dashboard](#using-the-admin-dashboard)
- [The RAG demo (`/rag`)](#the-rag-demo-rag)
- [Security](#security)
- [Deploying to Vercel](#deploying-to-vercel)
- [npm scripts](#npm-scripts)
- [Troubleshooting](#troubleshooting)

## Features

- Full public portfolio (hero, metrics, about, experience, work, AI projects,
  skills, recognition, contact) with dark/light theme.
- **Everything editable from `/admin`** — hero, nav, and every section; reorder
  and show/hide sections; résumé PDF upload to storage.
- **Live RAG demo** at `/rag`: PDF/image upload → local OCR + embeddings →
  pgvector retrieval + reranking → streamed, cited answers with follow-up memory.
- Content is served from Supabase, with an automatic fallback to a local seed so
  the site always renders (even with no keys configured).

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** + **Framer Motion**
- **Supabase** — Postgres (+ `pgvector`), Auth, Storage
- **RAG demo**: `unpdf` (PDF text), `tesseract.js` (image OCR),
  `@huggingface/transformers` (local embeddings + reranker), **Groq** (answers)
- **Vercel** hosting

## Project structure

```
/app
  /(public)          # public site + /rag demo
  /(admin)/admin     # protected admin dashboard
  /api/rag           # ingest / ask / feedback route handlers
  /login             # sign-in page
/components          # UI + admin editors + rag demo
/services            # data access layer (all Supabase reads/writes)
/lib                 # supabase clients (anon / server / service-role) + rag/*
/db                  # schema.sql + seed.ts
/scripts             # seed-db.ts
/types               # shared TypeScript types
/utils               # pure helpers (nav, admin allowlist, article)
/reference           # original static reference build
/public              # static assets (favicon, résumé PDF)
```

**Rule:** components never call Supabase directly — they go through `/services`.

## Quick start (local)

Requires **Node 18.18+**.

```bash
npm install
npm run dev
# open http://localhost:3000
```

With no `.env.local`, the site renders from the local seed (`db/seed.ts`). To
enable the database, admin, and RAG demo, set up Supabase (below).

## Environment variables

Copy `.env.example` → `.env.local` and fill in values. **Never commit
`.env.local`** (it's gitignored).

| Variable                        | Public? | Used for                                                                            |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes     | Supabase project URL                                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes     | Public reads + auth (respects RLS)                                                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | **no**  | Server-only writes (seed, admin actions, storage)                                   |
| `NEXT_PUBLIC_SITE_URL`          | yes     | Canonical URL (SEO)                                                                 |
| `ADMIN_EMAILS`                  | **no**  | Comma-separated admin allowlist (see [Security](#security))                         |
| `GROQ_API_KEY`                  | **no**  | RAG demo answer generation ([console.groq.com/keys](https://console.groq.com/keys)) |

> `NEXT_PUBLIC_*` are inlined into the client bundle at build time; the
> service-role key and `GROQ_API_KEY` are **server-only** and never shipped to
> the browser. **Next reads env only at startup** — restart the dev server
> (`npm run dev:clean`) after changing `.env.local`.

## Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run [`db/schema.sql`](./db/schema.sql). It's
   idempotent (safe to re-run) and creates all tables, RLS policies, the
   `pgvector` bits for the RAG demo, and a public `media` storage bucket.
3. **Project Settings → API** → copy the Project URL, `anon` key, and
   `service_role` key into `.env.local`.
4. Seed the content: `npm run db:seed`.
5. **Authentication → Users → Add user** (email + password, "Auto Confirm")
   to create your admin login, and **disable public sign-ups**
   (Authentication → Sign-in/Providers).
6. `npm run dev:clean`, then sign in at `/login` and manage content at `/admin`.

Editing a row in Supabase (or via `/admin`) changes the live site on the next
page load.

## Using the admin dashboard

Sign in at **`/login`** → you land on **`/admin`**. Sidebar sections:

- **Profile & hero** — name, greeting, rotating roles, role/sub lines, eyebrow
  tags, hero chips, hero buttons (CTAs), and contact identity. Includes a
  **résumé PDF upload** (stored in Supabase Storage; sets the résumé URL).
- **Navigation** — add / remove / reorder the top-bar links (label + href). Use
  `#section` for on-page anchors (e.g. `#work`) or a path like `/rag`.
- **Sections** — reorder and show/hide body sections, and edit each one
  (Metrics, About, Experience, Selected Work, AI, Capabilities, Recognition,
  Contact) with full add/remove/reorder of nested items.

All saves write to Supabase and appear on the site after a refresh.

Inline text markers supported in many fields: `**bold**`, `__accent__`,
`` `mono` ``.

## The RAG demo (`/rag`)

An interactive Retrieval-Augmented Generation app. **Parsing, embeddings, and
reranking run locally at $0**; only answer generation uses Groq's free tier.

**Setup**

1. Get a free key at [console.groq.com/keys](https://console.groq.com/keys) and
   set `GROQ_API_KEY` in `.env.local` (and Vercel for production).
2. Ensure `db/schema.sql` has been run (creates `rag_documents`, `rag_chunks`,
   the `match_chunks` function, and enables `pgvector`).
3. `npm run dev:clean`.

**Use**: open `/rag` → upload a text-based PDF (or an image to OCR) → ask a
question or tap a suggested one → get a streamed, cited answer; ask follow-ups
(it remembers the thread). Uploaded documents auto-delete after 24 hours.

> The first upload/question downloads the local models (~30 MB embedder, ~90 MB
> reranker) once — expect a delay on the very first run, then it's fast.
> On Vercel serverless these are heavy (cold starts / function duration); the
> demo is most reliable running on a Node host or locally.

## Security

- **`/admin` is gated** by middleware **and** re-checked in the admin layout;
  every write goes through a server action that verifies the session and writes
  with the service-role key (never exposed to the browser).
- **The app has no sign-up form** — accounts are created only by you in the
  Supabase dashboard. Keep **public sign-ups disabled** in Supabase.
- **Admin allowlist (`ADMIN_EMAILS`)** — set it to a comma-separated list of
  emails (e.g. `you@example.com`) so only those users are treated as admin, even
  if someone else authenticates. If left empty, **any** authenticated user is
  admin (safe only with sign-ups disabled). Setting it is recommended.
- **Never commit secrets.** If a key is ever exposed, rotate it (Supabase keys
  in Project Settings → API; Groq keys at console.groq.com/keys).

## Deploying to Vercel

The database is hosted by Supabase, so local and production talk to the **same
database over the network** — nothing DB-related is committed, and `.env.local`
is not pushed. Vercel keeps its own copy of the env vars.

1. Push this repo to GitHub.
2. In Vercel: **Add New… → Project**, import the repo (Next.js auto-detected).
3. **Settings → Environment Variables** — add the variables from the
   [table above](#environment-variables) (same values as `.env.local`), scoped
   to **Production** (and **Preview** if you want preview deploys to work). Keep
   `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, and `ADMIN_EMAILS` **secret**
   (do not prefix with `NEXT_PUBLIC`).
4. **Deploy.** Env vars only apply to builds created after they're added — if you
   add them later, trigger a redeploy.
5. In Supabase → **Authentication → URL Configuration**, set **Site URL** to
   your Vercel URL and add it to **Redirect URLs**.

You don't seed on Vercel — seeding is a one-time local step (`npm run db:seed`)
against the shared Supabase database. Optionally sync Vercel's env down locally
with `vercel env pull .env.local`.

## npm scripts

| Command                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the dev server                                  |
| `npm run dev:clean`    | Free port 3000, then start dev (avoids stale servers) |
| `npm run build`        | Production build                                      |
| `npm start`            | Run the production build                              |
| `npm run lint`         | ESLint                                                |
| `npm run typecheck`    | TypeScript type-check (`tsc --noEmit`)                |
| `npm run format`       | Format with Prettier                                  |
| `npm run format:check` | Check formatting without writing                      |
| `npm run db:seed`      | Seed Supabase from `db/seed.ts`                       |

## Troubleshooting

- **"My change doesn't show up."** Nav, hero, and section content are served from
  the **database**, not `db/seed.ts` — edit them in `/admin` (or Supabase). If
  you edited `.env.local` or still see stale content, the dev server is likely
  holding old state: run **`npm run dev:clean`** and hard-refresh the browser
  (⌘⇧R). `db/seed.ts` only affects fresh seeds / the no-DB fallback.
- **Résumé upload fails.** Re-run `db/schema.sql` (it creates the public `media`
  storage bucket).
- **RAG says "not configured" (503).** `GROQ_API_KEY` isn't set — add it and
  `npm run dev:clean`.
- **Can't log into `/admin`.** Confirm the user exists in Supabase Auth and, if
  `ADMIN_EMAILS` is set, that your login email is in the list.
