# Architecture & System Design

This document explains **how the portfolio is built and _why_ each component was
chosen**. For setup/usage see [`README.md`](./README.md); for the product brief
and slice plan see [`CLAUDE.md`](./CLAUDE.md).

---

## 1. Goals that drove the design

1. **Database-backed, owner-editable** — every visible word is editable from
   `/admin`, no code changes. This rules out a static site generator with
   Markdown files and pushes toward a real DB + CMS-style admin.
2. **Zero / near-zero running cost** — a personal site shouldn't cost money at
   idle. Favours generous free tiers (Vercel, Supabase) and _local_ ML for the
   AI demo instead of paid APIs.
3. **Recruiter-grade credibility** — the code itself is a portfolio artifact, so
   it uses production patterns (typed data layer, auth, RLS, rate limits,
   observability) rather than shortcuts.
4. **One codebase, three surfaces** — public site, protected admin, and JSON
   APIs — served by a single deployable app.

---

## 2. High-level architecture

```
                        ┌──────────────────────────────────────────┐
                        │                 Vercel                    │
                        │        Next.js 14 (App Router)            │
   Visitor ───────────▶ │  ┌────────────┐  ┌────────────────────┐  │
                        │  │ (public)   │  │ (admin)/admin      │  │
                        │  │  RSC pages │  │  gated editors     │  │
                        │  └─────┬──────┘  └─────────┬──────────┘  │
                        │        │ services/*  server actions      │
   Recruiter ─────────▶ │  ┌─────┴───────────────────┴─────────┐   │
                        │  │  /api/*  (rag ingest/ask, contact) │   │
                        │  └─────┬───────────────────┬─────────┘   │
                        └────────┼───────────────────┼─────────────┘
                                 │ anon + service    │ server-only
                                 ▼                   ▼
                        ┌──────────────────┐   ┌───────────────┐
                        │    Supabase      │   │  Groq  (LLM)  │
                        │ Postgres+pgvector│   │  answers only │
                        │ Auth · Storage   │   └───────────────┘
                        └──────────────────┘
                                 ▲
                    local ML (in the Node runtime, no external call):
                    unpdf · tesseract.js · Transformers.js (embed + rerank)
```

**Reading path:** components → `services/*` → Supabase (anon key, RLS-enforced).
**Writing path:** admin editors → server actions → Supabase (service-role key).
Components never touch Supabase direc tly — see [§5](#5-data-layer).

---

## 3. Frontend framework & language

### Next.js 14, App Router — _why_

- **One framework covers all three surfaces** (public pages, admin, API route
  handlers) so there's a single deploy, shared types, and shared auth.
- **React Server Components + `force-dynamic`** let public pages read straight
  from the DB on each request, so an admin edit shows up on the next load with
  no rebuild — essential for the "editable without code" goal.
- **Server Actions** give the admin a type-safe write path (`saveProfile`,
  `saveSection`, `saveNav`, inbox actions) without hand-rolling API endpoints.
- **Route Handlers** (`/api/rag/*`, `/api/contact`) run on the Node runtime,
  which the local ML libraries require.
- **Route groups** `(public)` / `(admin)` cleanly separate concerns and layouts.

_Alternatives considered:_ a static SSG (Astro/Next export) — rejected because
content is DB-driven and must change without a rebuild. A separate SPA + API —
rejected as more moving parts for no benefit here.

### TypeScript (strict) — _why_

Shared `types/content.ts` is the contract between the seed, the DB rows, the
services layer, the public components, and the admin editors. Strict mode makes
a content-shape change surface as compile errors across all of them.

### Tailwind CSS + CSS variables — _why_

- Tailwind for fast, consistent utility styling with no dead CSS.
- A **design-token layer in `globals.css` driven by CSS variables** (`--bg`,
  `--accent`, fonts, …) mapped into Tailwind. This makes the theme
  **data-drivable** (dark/light, and DB-editable colors later) without
  recompiling, and keeps the "mono for data/metrics" signature centralized.

### Framer Motion — _why_

Subtle scroll-reveal only, respecting `prefers-reduced-motion`. Restraint is
deliberate: excessive animation reads as "template," the opposite of the
"builds scalable systems" impression.

---

## 4. Backend: Supabase

One managed service covers three needs on a free tier, minimizing ops.

| Capability     | Used for                                      | Why this vs. alternatives                                                                 |
| -------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Postgres**   | All content, submissions, analytics, RAG data | Relational + JSONB gives both structure and flexibility; SQL is well understood.          |
| **`pgvector`** | RAG embeddings + similarity search            | Keeps vectors _in the same DB_ — no separate vector store (Pinecone/Weaviate) to run/pay. |
| **Auth**       | Admin login (email+password)                  | Built-in, integrates with RLS; no separate auth provider.                                 |
| **Storage**    | Résumé PDF, images                            | Same project, public bucket, simple URLs.                                                 |
| **RLS**        | Public read / server-only write               | Security enforced at the database, not just the app.                                      |

### Two clients, on purpose (`lib/supabase*.ts`)

- **Anon client** (`getSupabaseClient`) — public reads, **subject to RLS**.
- **Service-role client** (`getSupabaseAdmin`) — server-only writes and
  privileged reads; **bypasses RLS**. Never imported into client components.
- **SSR client** (`lib/supabase-server.ts`) — cookie-based session for auth
  checks in the admin.

Env is read **at call time, not module load**, so the same code works in Next
_and_ in standalone scripts (`db:seed`).

---

## 5. Data layer & content model

### The `services/` rule — _why_

Components never call Supabase directly; they go through `services/*`
(`content.ts`, `sections.ts`, `admin.ts`, `inbox.ts`). This isolates all data
access, makes it testable/swappable, and is where the **seed fallback** lives so
the site always renders even with no DB configured.

### `profile` (singleton) + `sections` (typed rows) — _why_

Instead of ~30 brittle tables (one per section), there is:

- **`profile`** — one row holding identity, hero, footer, nav (JSONB).
- **`sections`** — one row per block (about, experience, work, …) with
  `sort_order`, `visible`, `heading` (JSONB), and a section-specific `content`
  (JSONB).

This gives a **consistent shape** for reorder/show-hide and lets the admin reuse
_one_ editor pattern for every section, while JSONB absorbs each section's
differing fields. `services/content.ts` assembles these into a typed
`PublicSite` with per-field seed fallback.

---

## 6. Admin & security

- **`middleware.ts`** gates `/admin/*` (redirect to `/login`) and bounces
  authenticated admins away from `/login`.
- **Defense in depth:** the admin layout re-checks the session, and **every**
  server action verifies it again before writing.
- **`getAdminUser()` + `ADMIN_EMAILS` allowlist** (`utils/admin.ts`) — even an
  authenticated user is only treated as admin if their email is allowlisted
  (empty list ⇒ any authenticated user, safe only with Supabase sign-ups off).
  _Why:_ makes the "who is admin" rule explicit and fail-safe.
- **No sign-up UI** — accounts are created by the owner in Supabase only.
- **Secrets boundary** — service-role, Groq, Resend keys are server-only; only
  `NEXT_PUBLIC_*` reach the browser.

---

## 7. The RAG demo (the interesting part)

Goal: a **production-grade, $0** Retrieval-Augmented-Generation demo. Only the
final answer uses a hosted LLM; everything else runs locally in the Node
runtime.

### Pipeline

```
Upload ─▶ extract text ─▶ chunk ─▶ embed (local) ─▶ store vectors
 (PDF/img) unpdf/tesseract  chunk.ts  Transformers.js   pgvector

Ask ─▶ [cache?] ─▶ condense ─▶ embed ─▶ vector search ─▶ rerank ─▶ Groq ─▶ stream
        cache.ts    (if history)         match_chunks    cross-enc   answer + cite
```

### Component choices — _why each_

| Component                             | Role                                  | Why chosen                                                                                         |
| ------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **`unpdf`**                           | Text extraction from text PDFs        | Serverless-friendly, no native binaries; fast for the common case.                                 |
| **`tesseract.js`**                    | OCR for image uploads / scanned pages | Runs locally in-process; avoids a paid OCR API.                                                    |
| **Transformers.js** (`bge-small-en`)  | 384-dim embeddings, **locally**       | No per-token embedding cost; small model, good quality; runs in the Node runtime.                  |
| **`pgvector` + HNSW index**           | Similarity search                     | Vectors live beside the content in Postgres; HNSW keeps ANN search fast.                           |
| **Cross-encoder rerank** (`ms-marco`) | Re-score top-N candidates             | Bi-encoder recall is cheap but noisy; a reranker sharply improves precision of the final snippets. |
| **Groq** (`llama-3.3-70b`)            | Final grounded answer (streamed)      | Only the generation step needs a big LLM; Groq's free tier + speed fit a live demo.                |
| **Groq** (`llama-3.1-8b`)             | Utility: condense-question, suggest   | Small/cheap model for cheap sub-tasks; keeps big-model calls rare.                                 |

### Why "retrieve wide, then rerank"

`match_chunks` returns a wide net (`RETRIEVE=20`) via fast vector search, then
the cross-encoder reranks down to a few (`RAG_KEEP_CHUNKS`) high-precision
snippets. This two-stage design is the standard accuracy/latency trade-off:
cheap recall first, expensive precision only on the shortlist.

### Conversational memory

Turns are stored in `rag_messages`; a follow-up is **condensed into a standalone
question** (only when history exists — no wasted call on the first turn) so
retrieval works across turns.

### Streaming + citations

The answer streams via a `ReadableStream` (better UX, avoids request timeouts),
and source snippets ride along in a base64 `X-Rag-Sources` header so the UI can
render citations without a second request.

### Prompt-injection defense

The system prompt instructs the model to treat document text strictly as
reference data and never follow instructions embedded in it — important because
the "document" is attacker-controlled user input.

### Cost & abuse controls (`lib/rag/usage.ts`, `lib/rag/cache.ts`)

Because Groq's free tier is finite, the demo is engineered to stay within it:

- **Context trimming** — fewer/shorter chunks and limited history bound _input_
  tokens; `max_tokens` bounds output.
- **Per-IP rate limit** — stops one visitor draining the quota.
- **Global daily token budget** — once today's logged tokens exceed the budget,
  answering pauses (upload/search still work). Usage is logged to
  `analytics_events` (`type='rag_ask'`) — which doubles as observability.
- **Answer cache** (`rag_answer_cache`) — first-turn questions are cached per
  document; identical repeats return instantly with **zero tokens** and bypass
  the budget. Only first-turn (context-free) questions are cached, to avoid
  serving a wrong answer to a context-dependent follow-up.

_Why these mirror the contact-form guards:_ same philosophy — never lose the
core action, only throttle the expensive side effect.

---

## 8. Contact form & email

- Public form → `POST /api/contact` → **stored in `contact_submissions`**, then
  **emailed via Resend** (best-effort).
- **Why store first, email second:** the record must never be lost even if email
  fails or a cap is hit; the admin inbox reads from the DB regardless.
- **Why no exposed email/phone:** avoids scraping/spam; the form is the channel.
- **Guards:** honeypot (kills bots), per-IP rate limit, and daily/monthly send
  caps (skip the email, keep the record) so Resend's free tier can't be blown.
- **Resend chosen** for a clean API and a free tier that sends to your own inbox
  with no domain setup to start.

---

## 9. Notable UX/implementation choices

- **Collapsible sections via native `<details>`** — accessible and keyboard-
  friendly with zero client JS, and the content stays in the DOM for SEO. A tiny
  client helper (`SectionNav`) opens the target section when navigated to.
- **Favicon via `next/og`** (`app/icon.tsx`) — a generated PNG works in every
  browser (including those that skip SVG favicons) and is consistent across
  pages.
- **`dev:clean` script** — frees port 3000 before starting, avoiding the "stale
  dev server serves old env/DB" foot-gun (Next reads env only at startup).

---

## 10. Deployment & runtime boundary

- **Vercel** hosts Next.js; **Supabase** hosts the DB/Auth/Storage. Local and
  production talk to the **same Supabase over the network**, so nothing DB-
  related is committed and `.env.local` is never pushed.
- **Node runtime** is pinned for the RAG and contact routes (`runtime = "nodejs"`,
  `maxDuration = 60`) because the ML libs and longer generations need it. The
  heavy local models make the RAG routes most reliable on a Node host or locally
  (documented trade-off).

---

## 11. Data model summary

| Table                 | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `profile`             | Singleton: identity, hero, footer, nav (JSONB)            |
| `sections`            | One row per content block; ordered, show/hide, JSONB body |
| `contact_submissions` | Contact inbox (+ `ip` for rate limits)                    |
| `analytics_events`    | Lightweight events incl. RAG token usage & feedback       |
| `rag_documents`       | Uploaded docs (+ cached suggested questions)              |
| `rag_chunks`          | Text chunks + `vector(384)` embedding (HNSW index)        |
| `rag_messages`        | Conversation memory per document + session                |
| `rag_answer_cache`    | First-turn Q→A cache (zero-token repeats)                 |
| `blog_posts`          | Blog (future slice)                                       |

`match_chunks(query_embedding, document_id, count)` is a SQL function doing
cosine similarity within one document.

---

## 12. Trade-offs, in one place

- **RSC `force-dynamic`** trades some caching for instant content freshness —
  right while the site is small; ISR/caching is a later optimization.
- **Local ML** trades cold-start weight/latency for **$0 and privacy** — the
  right call for a demo, with the caveat that serverless cold starts are heavy.
- **Flexible JSONB content** trades strict column typing for **one reusable
  editor and easy reordering** — mitigated by shared TypeScript types.
- **"Any authenticated user = admin" default** trades simplicity for a small
  risk, closed by disabling sign-ups and/or setting `ADMIN_EMAILS`.
