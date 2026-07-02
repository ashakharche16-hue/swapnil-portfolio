-- ============================================================================
-- Swapnil Kharche — Portfolio · Supabase schema (Slice 2)
--
-- Run this in the Supabase SQL editor (or `psql`) once, on a fresh project.
-- It is idempotent — safe to re-run. After running, seed the content with
-- `npm run db:seed` (requires SUPABASE_SERVICE_ROLE_KEY in .env.local).
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists vector;     -- pgvector, for the Slice 4.5 RAG demo

-- ---------------------------------------------------------------------------
-- profile — singleton row holding site-wide identity, hero, footer, nav.
-- ---------------------------------------------------------------------------
create table if not exists profile (
  id         int primary key default 1,
  identity   jsonb not null,
  hero       jsonb not null,
  footer     jsonb not null,
  nav        jsonb not null,
  updated_at timestamptz not null default now(),
  constraint profile_singleton check (id = 1)
);

-- ---------------------------------------------------------------------------
-- sections — typed, ordered, show/hide-able content blocks. One row per
-- section (metrics, about, experience, work, ai, skills, recognition, contact).
-- `heading` is the SectionHeading; `content` is the section-specific payload.
-- ---------------------------------------------------------------------------
create table if not exists sections (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  type       text not null,
  sort_order int  not null default 0,
  visible    boolean not null default true,
  heading    jsonb,
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists sections_sort_order_idx on sections (sort_order);

-- ---------------------------------------------------------------------------
-- contact_submissions — public contact form (Slice 5 writes; inbox in admin).
-- ---------------------------------------------------------------------------
create table if not exists contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blog_posts — markdown blog (Slice 6).
-- ---------------------------------------------------------------------------
create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  body_md      text not null default '',
  tags         text[] not null default '{}',
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- analytics_events — lightweight event log (Slice 7).
-- ---------------------------------------------------------------------------
create table if not exists analytics_events (
  id         uuid primary key default gen_random_uuid(),
  type       text not null,        -- 'page_view' | 'resume_download' | 'blog_view'
  path       text,
  meta       jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RAG demo groundwork (Slice 4.5). 384-dim vectors = bge-small-en / MiniLM.
-- ---------------------------------------------------------------------------
create table if not exists rag_documents (
  id         uuid primary key default gen_random_uuid(),
  filename   text not null,
  session_id text,
  page_count int,
  suggested  jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
-- Migration-safe (existing installs):
alter table rag_documents add column if not exists suggested jsonb;

create table if not exists rag_chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references rag_documents (id) on delete cascade,
  chunk_index int  not null,
  content     text not null,
  embedding   vector(384),
  created_at  timestamptz not null default now()
);
create index if not exists rag_chunks_document_id_idx on rag_chunks (document_id);
create index if not exists rag_chunks_embedding_idx
  on rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Cosine similarity search within one document.
create or replace function match_chunks (
  query_embedding   vector(384),
  match_document_id uuid,
  match_count       int default 5
) returns table (id uuid, content text, chunk_index int, similarity float)
language sql stable as $$
  select c.id, c.content, c.chunk_index,
         1 - (c.embedding <=> query_embedding) as similarity
  from rag_chunks c
  where c.document_id = match_document_id
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- Row-Level Security
-- Public site reads with the anon key; admin/seed writes use the service role
-- (which bypasses RLS entirely).
-- ============================================================================
alter table profile             enable row level security;
alter table sections            enable row level security;
alter table blog_posts          enable row level security;
alter table contact_submissions enable row level security;
alter table analytics_events    enable row level security;
alter table rag_documents       enable row level security;
alter table rag_chunks          enable row level security;

-- Public read of site content.
drop policy if exists "public read profile" on profile;
create policy "public read profile" on profile for select using (true);

drop policy if exists "public read sections" on sections;
create policy "public read sections" on sections for select using (true);

-- Public read of published posts only.
drop policy if exists "public read published posts" on blog_posts;
create policy "public read published posts" on blog_posts for select using (published = true);

-- Public can submit the contact form, but not read submissions.
drop policy if exists "public insert submissions" on contact_submissions;
create policy "public insert submissions" on contact_submissions for insert with check (true);

-- Public can log analytics events.
drop policy if exists "public insert analytics" on analytics_events;
create policy "public insert analytics" on analytics_events for insert with check (true);

-- RAG demo: public insert + read (tighten/scope in Slice 4.5).
drop policy if exists "public rw rag_documents" on rag_documents;
create policy "public rw rag_documents" on rag_documents for all using (true) with check (true);

drop policy if exists "public rw rag_chunks" on rag_chunks;
create policy "public rw rag_chunks" on rag_chunks for all using (true) with check (true);

-- ============================================================================
-- Storage — public `media` bucket for uploads (résumé PDF, images).
-- Uploads happen server-side via the service role; the bucket is public so the
-- files are readable by anyone with the URL.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
