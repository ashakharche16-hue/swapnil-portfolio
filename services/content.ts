import { seed } from "@/db/seed";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  AIContent,
  ContactContent,
  ExperienceContent,
  FooterContent,
  HeroContent,
  Metric,
  NavLink,
  RecognitionContent,
  SectionHeading,
  SiteContent,
  SiteIdentity,
  SkillsContent,
  WorkContent,
} from "@/types/content";

/**
 * Single entry point for public-site content. Reads from Supabase when
 * configured; otherwise (or on any error) returns the local seed so the site
 * always renders. Components never touch Supabase directly — they go through
 * this layer (per CLAUDE.md).
 */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabaseClient();
  if (!supabase) return seed;

  try {
    const [profileRes, sectionsRes] = await Promise.all([
      supabase
        .from("profile")
        .select("identity, hero, footer, nav")
        .eq("id", 1)
        .single(),
      supabase
        .from("sections")
        .select("key, heading, content, visible, sort_order")
        .order("sort_order"),
    ]);

    if (profileRes.error || sectionsRes.error || !profileRes.data) {
      console.error(
        "[content] Supabase read failed, using seed:",
        profileRes.error ?? sectionsRes.error,
      );
      return seed;
    }

    return assemble(
      profileRes.data as ProfileRow,
      sectionsRes.data as SectionRow[],
    );
  } catch (err) {
    console.error("[content] Supabase read threw, using seed:", err);
    return seed;
  }
}

// --- DB row shapes (JSONB columns are dynamically shaped, hence the casts) ---

interface ProfileRow {
  identity: SiteIdentity;
  hero: HeroContent;
  footer: FooterContent;
  nav: NavLink[];
}

interface SectionRow {
  key: string;
  heading: SectionHeading | null;
  content: Record<string, unknown>;
  visible: boolean;
}

function assemble(profile: ProfileRow, rows: SectionRow[]): SiteContent {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const content = (key: string): Record<string, unknown> =>
    byKey.get(key)?.content ?? {};
  const heading = (key: string): SectionHeading | undefined =>
    byKey.get(key)?.heading ?? undefined;

  return {
    identity: profile.identity ?? seed.identity,
    nav: profile.nav ?? seed.nav,
    hero: profile.hero ?? seed.hero,
    footer: profile.footer ?? seed.footer,

    metrics: (content("metrics").metrics as Metric[]) ?? seed.metrics,

    about: {
      heading: heading("about") ?? seed.about.heading,
      paragraphs:
        (content("about").paragraphs as string[]) ?? seed.about.paragraphs,
    },

    experience: {
      heading: heading("experience") ?? seed.experience.heading,
      items:
        (content("experience").items as ExperienceContent["items"]) ??
        seed.experience.items,
    },

    work: {
      heading: heading("work") ?? seed.work.heading,
      cases: (content("work").cases as WorkContent["cases"]) ?? seed.work.cases,
    },

    ai: {
      heading: heading("ai") ?? seed.ai.heading,
      patterns:
        (content("ai").patterns as AIContent["patterns"]) ?? seed.ai.patterns,
    },

    skills: {
      heading: heading("skills") ?? seed.skills.heading,
      groups:
        (content("skills").groups as SkillsContent["groups"]) ??
        seed.skills.groups,
    },

    recognition: {
      heading: heading("recognition") ?? seed.recognition.heading,
      columns:
        (content("recognition").columns as RecognitionContent["columns"]) ??
        seed.recognition.columns,
    },

    contact: {
      heading: heading("contact") ?? seed.contact.heading,
      lead:
        (content("contact").lead as ContactContent["lead"]) ??
        seed.contact.lead,
      blurb: (content("contact").blurb as string) ?? seed.contact.blurb,
      availability:
        (content("contact").availability as string) ??
        seed.contact.availability,
      cta:
        (content("contact").cta as ContactContent["cta"]) ?? seed.contact.cta,
      rows:
        (content("contact").rows as ContactContent["rows"]) ??
        seed.contact.rows,
    },
  };
}
