import { seed } from "@/db/seed";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SectionHeading, SectionKey } from "@/types/content";

export interface AdminSection {
  key: SectionKey;
  sort_order: number;
  visible: boolean;
  heading: SectionHeading | null;
  content: Record<string, unknown>;
}

const ORDER: SectionKey[] = [
  "metrics",
  "about",
  "experience",
  "work",
  "ai",
  "skills",
  "recognition",
  "contact",
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  metrics: "Metrics",
  about: "About",
  experience: "Experience",
  work: "Selected Work",
  ai: "AI Engineering",
  skills: "Capabilities",
  recognition: "Recognition",
  contact: "Contact",
};

/** Seed-derived heading + content, used as a fallback when a DB row is missing. */
function seedSection(
  key: SectionKey,
): Pick<AdminSection, "heading" | "content"> {
  switch (key) {
    case "metrics":
      return { heading: null, content: { metrics: seed.metrics } };
    case "about":
      return {
        heading: seed.about.heading,
        content: { paragraphs: seed.about.paragraphs },
      };
    case "experience":
      return {
        heading: seed.experience.heading,
        content: { items: seed.experience.items },
      };
    case "work":
      return {
        heading: seed.work.heading,
        content: { cases: seed.work.cases },
      };
    case "ai":
      return {
        heading: seed.ai.heading,
        content: { patterns: seed.ai.patterns },
      };
    case "skills":
      return {
        heading: seed.skills.heading,
        content: { groups: seed.skills.groups },
      };
    case "recognition":
      return {
        heading: seed.recognition.heading,
        content: { columns: seed.recognition.columns },
      };
    case "contact":
      return {
        heading: seed.contact.heading,
        content: {
          lead: seed.contact.lead,
          blurb: seed.contact.blurb,
          availability: seed.contact.availability,
          cta: seed.contact.cta,
          rows: seed.contact.rows,
        },
      };
  }
}

interface Row {
  key: string;
  sort_order: number;
  visible: boolean;
  heading: SectionHeading | null;
  content: Record<string, unknown>;
}

export async function getSectionsForAdmin(): Promise<AdminSection[]> {
  let rows: Row[] = [];
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("sections")
      .select("key, sort_order, visible, heading, content")
      .order("sort_order");
    rows = (data as Row[]) ?? [];
  } catch {
    // Not configured — fall back to seed defaults below.
  }

  const byKey = new Map(rows.map((r) => [r.key, r]));

  return ORDER.map((key, i) => {
    const row = byKey.get(key);
    const fallback = seedSection(key);
    return {
      key,
      sort_order: row?.sort_order ?? (i + 1) * 10,
      visible: row?.visible ?? true,
      heading: row?.heading ?? fallback.heading,
      content: row?.content ?? fallback.content,
    };
  }).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getSectionForAdmin(
  key: SectionKey,
): Promise<AdminSection> {
  const all = await getSectionsForAdmin();
  const section = all.find((s) => s.key === key);
  if (section) return section;
  const fallback = seedSection(key);
  return { key, sort_order: 0, visible: true, ...fallback };
}
