# Swapnil Kharche — Portfolio

A premium, database-backed personal portfolio for Swapnil Kharche (Software
Development Manager / Engineering Leader). Built to be fully editable from an
admin dashboard — no content hardcoded past Slice 1.

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

## Environment variables

Copy `.env.example` to `.env.local` and fill in values as later slices need
them. No secrets are required for Slice 0. Never commit `.env.local`.

## Deploy (Vercel)

1. Create a GitHub repository and push this project.
2. In Vercel, **Add New… → Project**, import the repo.
3. Framework preset auto-detects **Next.js**. No env vars needed for Slice 0.
4. Deploy → confirm the live URL renders the placeholder homepage.
