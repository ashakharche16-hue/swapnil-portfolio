# Swapnil Kharche — Portfolio

A premium, database-backed personal portfolio for Swapnil Kharche (Software
Development Manager / Engineering Leader). Built to be fully editable from an admin dashboard.

See [`CLAUDE.md`](./CLAUDE.md) for the full product brief, design direction, and
the slice-by-slice build plan.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** + **Framer Motion** (added in Slice 1)
- **Supabase** (Postgres, Auth, Storage) — added in Slice 2
- **Vercel** hosting

## Project structure

```
/app                 # App Router routes
  /(public)          # public site route group
  /(admin)/admin     # protected admin route group (built in Slice 3)
  /api               # route handlers
/components          # reusable UI components
/hooks               # custom React hooks
/services            # data access layer (all Supabase reads/writes)
/contexts            # theme, auth context
/types               # shared TypeScript types
/utils               # pure helpers
/lib                 # supabase client, config
/db                  # SQL schema + seed scripts
/reference           # static reference build of the public site
/public              # static assets
```

## Getting started (local)

Requires Node 18.18+.

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the placeholder homepage.

### Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server             |
| `npm run build`        | Production build                 |
| `npm start`            | Run the production build         |
| `npm run lint`         | ESLint                           |
| `npm run typecheck`    | TypeScript type-check (`tsc`)    |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |
| `npm run db:seed`      | Seed Supabase from `db/seed.ts`  |

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. **Never commit
`.env.local`** — it's gitignored. The app runs without these (it falls back to
the local seed), but the database, auth, and admin need them.

| Variable                        | Public? | Used for                                  |
| ------------------------------- | ------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes     | Supabase project URL                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes     | Public read + auth (respects RLS)         |
| `SUPABASE_SERVICE_ROLE_KEY`     | **no**  | Server-only writes (seed + admin actions) |
| `NEXT_PUBLIC_SITE_URL`          | yes     | Canonical URL (SEO, Slice 8)              |

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time; the
service-role key is used **only server-side** and is never shipped to the
browser.

## Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run [`db/schema.sql`](./db/schema.sql) (idempotent).
3. **Project Settings → API** → copy the Project URL, `anon` key, and
   `service_role` key into `.env.local`.
4. Seed content: `npm run db:seed` (uses the service-role key).
5. **Authentication → Users → Add user** (email + password, auto-confirm) to
   create the admin login, and **disable public sign-ups** (single-owner model).
6. Restart `npm run dev`, then sign in at `/login` and edit from `/admin`.

## Deploy (Vercel)

The database is hosted by Supabase, so local and production talk to the **same
database over the network** — nothing DB-related is committed. Vercel keeps its
own copy of the environment variables (your `.env.local` is not pushed).

1. Push this repo to GitHub.
2. In Vercel, **Add New… → Project**, import the repo (Next.js is auto-detected).
3. **Settings → Environment Variables** — add the four variables from the table
   above (same values as `.env.local`), scoped to **Production** (and
   **Preview** if you want preview deploys to work). Keep
   `SUPABASE_SERVICE_ROLE_KEY` unchecked as a `NEXT_PUBLIC` var — it must stay
   secret.
4. **Deploy.** (Env vars only apply to builds created after they're added — if
   you add them later, trigger a redeploy.)
5. In Supabase → **Authentication → URL Configuration**, set **Site URL** to
   your Vercel URL and add it to **Redirect URLs**.

You don't seed on Vercel — seeding is a one-time local step against the shared
Supabase database (step 4 above). Optionally sync Vercel's env down locally with
`vercel env pull .env.local`.
