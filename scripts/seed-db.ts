/**
 * Seed Supabase from the local typed seed (db/seed.ts).
 *
 * Prerequisites:
 *   1. Run db/schema.sql in your Supabase project.
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Run: npm run db:seed   (idempotent — upserts profile + sections)
 */
import { config } from "dotenv";
import { seed } from "../db/seed";
import { getSupabaseAdmin } from "../lib/supabase";

config({ path: ".env.local" });

async function main() {
  const supabase = getSupabaseAdmin();

  const { error: profileError } = await supabase.from("profile").upsert({
    id: 1,
    identity: seed.identity,
    hero: seed.hero,
    footer: seed.footer,
    nav: seed.nav,
  });
  if (profileError) throw profileError;

  const sections = [
    {
      key: "metrics",
      sort_order: 10,
      heading: null,
      content: { metrics: seed.metrics },
    },
    {
      key: "about",
      sort_order: 20,
      heading: seed.about.heading,
      content: { paragraphs: seed.about.paragraphs },
    },
    {
      key: "experience",
      sort_order: 30,
      heading: seed.experience.heading,
      content: { items: seed.experience.items },
    },
    {
      key: "work",
      sort_order: 40,
      heading: seed.work.heading,
      content: { cases: seed.work.cases },
    },
    {
      key: "ai",
      sort_order: 50,
      heading: seed.ai.heading,
      content: { patterns: seed.ai.patterns },
    },
    {
      key: "skills",
      sort_order: 60,
      heading: seed.skills.heading,
      content: { groups: seed.skills.groups },
    },
    {
      key: "recognition",
      sort_order: 70,
      heading: seed.recognition.heading,
      content: { columns: seed.recognition.columns },
    },
    {
      key: "contact",
      sort_order: 80,
      heading: seed.contact.heading,
      content: {
        lead: seed.contact.lead,
        blurb: seed.contact.blurb,
        availability: seed.contact.availability,
        cta: seed.contact.cta,
        rows: seed.contact.rows,
      },
    },
  ].map((s) => ({ ...s, type: s.key, visible: true }));

  const { error: sectionsError } = await supabase
    .from("sections")
    .upsert(sections, { onConflict: "key" });
  if (sectionsError) throw sectionsError;

  console.log(`✓ Seeded profile + ${sections.length} sections into Supabase.`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message ?? err);
  process.exit(1);
});
