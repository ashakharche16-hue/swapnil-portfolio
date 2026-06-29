# CLAUDE.md

Guidance for any Claude instance (Claude Code or chat) working in this repository.
Read this file fully before writing code.

---

## What we are building

A premium personal portfolio for **Swapnil Kharche** — Software Development Manager / Engineering Leader (12+ years, Deloitte Consulting, Pune IN). The site must impress recruiters and hiring managers for Software Development Manager, Engineering Manager, Staff/Principal Engineer, and Technical Lead roles.

It is a **full-stack, database-backed application**, not a static page. The owner must be able to edit every piece of content from an admin dashboard **without touching source code**.

### Core promise

> Everything visible on the public site is editable from `/admin`. No content is hardcoded in components past Slice 1.

---

## Stack (decided — do not substitute without asking)

| Layer                   | Choice                                                               |
| ----------------------- | -------------------------------------------------------------------- |
| Framework               | Next.js 14 (App Router)                                              |
| Language                | TypeScript (strict)                                                  |
| Styling                 | Tailwind CSS                                                         |
| Animation               | Framer Motion                                                        |
| Database                | Supabase (Postgres)                                                  |
| Auth                    | Supabase Auth (email+password first; Google login is a later toggle) |
| File storage            | Supabase Storage (résumé PDF, profile photo, gallery images)         |
| Hosting                 | Vercel                                                               |
| Résumé parser (Slice 9) | Separate FastAPI service — NOT in the Next.js app                    |

---

## Design direction (the bar to hit)

The aesthetic is **"this person builds scalable systems,"** not a flashy designer portfolio. Restraint is the brief.

- **Palette (dark, default):** ink `#0B0F1A`, elevated `#11172A`, border `#1F2535`, text `#E6E9F2`, muted `#8892B0`, accent (signal blue) `#7CC5FF`, signal green `#4ADE80` (used ONLY for "available" status).
- **Palette (light):** bg `#FAFAF7`, text `#0B0F1A`, accent `#1D4ED8`.
- **Type:** `Fraunces` (serif) for the name + section headings only; `Inter` for body; `JetBrains Mono` for eyebrows, metric numbers, tags, nav, labels. The mono treatment of data/metrics is the signature element — it makes the page feel native to someone whose work is logs, configs, and schemas.
- **Layout:** large typography, lots of whitespace, hairline borders, near-zero decoration. Glassmorphism only on the sticky top bar.
- **Motion:** subtle scroll-reveal only. Respect `prefers-reduced-motion`. No gratuitous animation — extra motion makes it read as AI-generated.
- **Theme colors must be DB-driven** (editable in admin) once Slice 2 lands.

> A reference static build of the public site already exists (`reference/index.html` if provided). Match its structure and feel, then improve on it.

---

## Folder structure (keep it clean & modular)

```
/app                 # Next.js App Router routes
  /(public)          # public site route group
  /(admin)/admin     # protected admin route group
  /api               # route handlers
/components          # reusable UI components
/hooks               # custom React hooks
/services            # data access layer (all Supabase reads/writes live here)
/contexts            # theme, auth context
/types               # shared TypeScript types
/utils               # pure helpers
/lib                 # supabase client, config
/db                  # SQL schema + seed scripts
/public              # static assets
```

**Rule:** components never call Supabase directly. They go through `/services`. This keeps data logic testable and swappable.

---

## Code quality (non-negotiable)

- TypeScript strict mode; no `any` without a written reason.
- Reusable components; no copy-pasted section markup.
- ESLint + Prettier configured and passing.
- Every async UI state has: loading state, error state, empty state.
- Form validation on all inputs.
- Error boundaries around route groups.
- Environment variables for all secrets — never commit keys.
- Accessible: keyboard navigable, visible focus rings, semantic HTML, WCAG-minded.

---

## CRITICAL — security & credentials boundary

Claude must **never** ask for, type, store, or commit real secrets (Supabase keys, passwords, OAuth secrets, tokens). When a step needs them:

1. Tell the owner exactly which env var to set and where to get the value.
2. Reference it via `process.env.X`.
3. Provide a `.env.example` with empty placeholders. Never a real `.env`.

The owner creates the Supabase/Vercel/GitHub projects and pastes keys themselves.

---

## How to work: build in SLICES

Do **not** attempt the whole app in one pass. Each slice must end in something the owner can run and deploy before the next begins. After finishing a slice, stop and let the owner verify.

At the end of every slice, output:

- what changed (files added/modified),
- the exact commands to run it,
- what the owner should see if it worked,
- any env vars or manual dashboard steps required.

---

## The slice plan

### Slice 0 — Scaffold & deploy a blank site

Foundation first, so deployment never becomes the late surprise.

- `create-next-app` with TS + Tailwind + App Router.
- Set up the folder structure above, ESLint, Prettier.
- Placeholder homepage.
- **Owner steps:** create GitHub repo, push, connect to Vercel, confirm a live URL.
- **Done when:** the empty site is deployed at a real URL.

### Slice 1 — Public site, static content

- Port the reference design into React components: Hero, Metrics, About, Experience, Work/Case-studies, AI, Skills, Recognition, Contact, Footer.
- Content lives in `/db/seed.ts` (a typed seed file), NOT inside components.
- Theme context with dark/light toggle (persist to localStorage).
- Framer Motion scroll reveals; responsive; accessible.
- **Done when:** the full portfolio renders and looks like the reference.

### Slice 2 — Database & content model (the heart)

- Create Supabase project + schema in `/db/schema.sql`.
- Core tables: `profile`, `sections` (a typed, ordered, flexible content model so Experience/Projects/Skills/Certs/Awards/Testimonials all share a consistent shape — avoids 30 brittle tables), `blog_posts`, `contact_submissions`, `analytics_events`.
- `/services` data layer reads content from Supabase.
- Seed the DB from Slice 1's seed file.
- Switch the public site to read from the DB.
- **Done when:** editing a row in Supabase changes the live site.

### Slice 3 — Auth & admin shell

- Supabase Auth (email+password).
- Protected `/admin` route group; redirect non-admins.
- Admin layout: sidebar, dashboard shell, loading/error states.
- ONE working editor (Profile) proving the full read→edit→save loop.
- **Done when:** owner logs in, edits headline, sees it live.

### Slice 4 — Full admin dashboard

- Repeat the proven editor pattern for: About, Experience, Projects, Skills, Leadership, AI Projects, Certifications, Awards, Publications, Gallery, Testimonials, Recommendations, Contact, Social, SEO metadata, theme colors, site title.
- Image/photo/PDF uploads → Supabase Storage.
- Reorder + show/hide sections.
- **Done when:** the entire site is editable from the dashboard, zero code.

### Slice 5 — Contact form + enquiry inbox

- Public form with validation → `contact_submissions`.
- Admin inbox: list, read, mark-handled.
- **Done when:** a submitted message appears in admin.

### Slice 6 — Blog CMS

- Markdown editor with live preview + syntax highlighting.
- Tags, search, individual post pages, public index, admin management.
- **Done when:** owner can write and publish a post.

### Slice 7 — Analytics & dashboard metrics

- Lightweight event logging (page views, résumé downloads, blog views) → `analytics_events`.
- Dashboard widgets: visitor count, top pages, downloads, last-updated.
- **Done when:** real numbers show on admin home.

### Slice 8 — SEO, performance & polish

- Dynamic per-page metadata, OpenGraph, Twitter cards, Schema.org Person, `sitemap.xml`, `robots.txt`, canonicals.
- Image optimization, lazy loading, code splitting.
- Sticky "Hire Me" / quick actions (résumé download, LinkedIn, GitHub, email).
- Lighthouse targets: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 100.
- **Done when:** Lighthouse targets met.

### Slice 9 — Résumé parser (separate, opt-in)

- Standalone FastAPI service: pdfplumber / python-docx + an LLM extraction pass → returns structured JSON.
- Human-in-the-loop: owner reviews extracted fields in admin before they populate anything. Never blind auto-fill.
- **Done when:** upload → review → accept into DB works.

> Slices 0–4 are the spine. After Slice 4 the core promise is met. 5–9 are additive and reorderable; parser and analytics are the most droppable.

---

## Seed content (Swapnil's résumé — source of truth for Slice 1/2)

**Identity:** Swapnil Kharche · Software Development Manager · Pune, India · swapnil.d.kharche@gmail.com · +91-9699668592 · LinkedIn. 12+ years across Government, Healthcare, E-commerce, Financial domains.

**Headline:** Software Development Manager and Technical Lead with 12+ years modernizing mission-critical platforms.

**Metrics:** 12+ years · 5,000+ users on modernized government platform · 52 partner interfaces unified · 300+ screens secured with audit & access governance.

**Experience — Deloitte Consulting LLP (Jul 2016–present), Software Development Manager.** Groups:

- _Leadership & People:_ led/mentored 4 cross-functional teams (15+ engineers, QA, designers); Jira UAT enablement cut onboarding 30%, lifted productivity 15%; ran stakeholder/defect-triage/UAT governance.
- _Architecture:_ 360° Unified Portal consolidating 40+ legacy screens (case access −70%); centralized Interface Hub integrating 52 partner interfaces; audit trail + RBAC across 300+ screens.
- _Backend/Distributed:_ REST APIs (latency −40%); Dockerized Java (env defects −30%); GraphQL API POC on AWS; JUnit TDD, Log4j, JMeter.
- _Cloud-native:_ AWS EC2/S3/IAM/SES/CloudWatch; Dockerized DB2 & SQL Server; AI pipeline auto-generating Excel storyboards from Figma + legacy UI metadata (40–70× gain, −6–12h/screen).
- _DevOps/CI-CD:_ automated 10+ batch processes (−95% effort, 3 days/cycle saved); owned Jenkins + AWS CodePipeline; automated DB backup/archival (−75% cost).
- _Scale/Data:_ government platform 5,000+ users & millions of transactions, full legacy parity; 100% batch-job availability; checksum reconciliation tool DB2→Oracle across 300+ tables (−90% manual verify); DB2→SQL Server migration via SSMA.

**Experience — Florida State University (Oct 2014–May 2016), Research Assistant, Dept. of Economics.** Scraped 100M+ web records in Python; standalone search engine (data access −96%). Open-source: jEdit word-wrap, hyper-search highlighting, bug-submission feature.

**Selected work (case studies):** 360° Unified Portal · Interface Hub (52 interfaces) · RAG Documentation Assistant (Flask + ChromaDB over OCR'd PDFs, time-to-info −75%+, 2–3h/dev/week reclaimed) · Ticket Intelligence System (OpenAI + AWS Lambda + n8n, human-in-the-loop, 91% accuracy, 3K+ tickets/mo).

**AI patterns:** RAG over enterprise docs · human-in-the-loop classification at production scale · AI-driven artifact generation in delivery workflows.

**Skills (group these):**

- Languages/Frameworks: Java, Spring Boot, Microservices, Python, Flask, REST, GraphQL, JPA, Hibernate, Angular, React, HTML, CSS.
- Cloud/Infra: AWS (EC2, S3, IAM, Lambda, SES, CloudFront, CloudWatch, CodeCommit), Azure (API Mgmt, DevOps, AI Fundamentals), MS Entra (SSO), Docker, Kubernetes, Tomcat, WebSphere.
- DevOps/Quality: Jenkins, AWS CodePipeline, SonarQube, JaCoCo, JUnit, TDD, JMeter, Maven, Git, SVN, TFS, OpCon Scheduler.
- Data/Messaging: Oracle, SQL Server, MySQL, DB2, NoSQL, Kafka, ChromaDB.
- AI: RAG, OpenAI, LLM Integration, Prompt Engineering, n8n, CUDA, Vector DB, OCR pipelines.
- Legacy/Mainframe: COBOL, CoolGen, CopyBooks, JCL, Log4j.
- Process/Leadership: Engineering Management, Mentorship, Stakeholder Mgmt, Agile/Scrum, Sprint Management, Compliance & Audit Workflows, Architecture Reviews, Roadmap Planning.
- Collaboration/Docs: JIRA, X-Ray, Swagger, Confluence, Figma, Draw.io, Excel, Lovable.

**Certifications:** Azure AI Fundamentals (Microsoft) · CUDA Python — Accelerated Computing (NVIDIA) · Generative AI Engineer (Deloitte) · Generative AI Prompt Engineer (Deloitte) · Scalable Java Microservices w/ Spring Boot & Cloud (Coursera).

**Awards/Publications:** Outstanding Performance Award — Coaching & Team Leadership (Deloitte) · Applause Award — Automation impact (Deloitte) · White paper: Intranet Conferencing Solution (IJETAE).

**Education:** M.S. Computer Science, Florida State University (2013–16) · B.E. Computer Engineering, Pune University (2008–12).

> Placeholders to confirm with owner before launch: real LinkedIn URL, GitHub URL, profile photo, hero background.

---

## Definition of done (whole project)

- [ ] Deployed on Vercel at a real URL with custom domain support.
- [ ] All ~30 content sections editable from `/admin`, persisted in Supabase.
- [ ] Auth-protected admin; no public editing.
- [ ] Contact submissions stored and viewable in admin.
- [ ] Blog with markdown, tags, search.
- [ ] Analytics on the admin dashboard.
- [ ] SEO complete (OG, Twitter, Schema, sitemap, robots).
- [ ] Lighthouse: Perf 95+, A11y 95+, Best Practices 95+, SEO 100.
- [ ] Responsive on desktop/tablet/mobile; WCAG-minded.
- [ ] README, deployment guide, `.env.example`, DB schema, seed data all present.
- [ ] Owner can update the entire site without editing source code.
