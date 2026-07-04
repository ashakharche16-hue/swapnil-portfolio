import type { PublicSite } from "@/services/content";

/** Strip inline emphasis markers (**bold**, __accent__, `mono`). */
const clean = (s: string) => s.replace(/\*\*|__|`/g, "").trim();

/**
 * Assembles a plain-text profile of the owner from the live site content, for
 * the "Ask about Swapnil" recruiter mode. Always in sync with what's edited in
 * /admin. Kept compact so it fits comfortably in the model context.
 */
export function buildProfileContext(content: PublicSite): string {
  const { identity, hero, about, experience, work, ai, skills, recognition } =
    content;
  const out: string[] = [];

  out.push(`Name: ${identity.name}`);
  out.push(`Title: Software Development Manager & Engineering Leader`);
  out.push(`Headline: ${clean(hero.role)}`);
  if (hero.sub) out.push(clean(hero.sub));
  out.push(`Location: ${identity.location}`);
  out.push(`LinkedIn: ${identity.linkedinHandle}`);

  out.push(`\n== Summary ==`);
  about.paragraphs.forEach((p) => out.push(clean(p)));

  out.push(`\n== Experience ==`);
  experience.items.forEach((it) => {
    out.push(`${it.role} — ${it.company} (${it.period})`);
    if (it.heading) out.push(clean(it.heading));
    if (it.summary) out.push(clean(it.summary));
    it.groups.forEach((g) => {
      out.push(`${g.label}:`);
      g.bullets.forEach((b) => out.push(`- ${clean(b)}`));
    });
  });

  out.push(`\n== Selected work ==`);
  work.cases.forEach((c) => {
    out.push(`${c.title} (${c.tag}): ${clean(c.description)}`);
    if (c.stack.length) out.push(`Stack: ${c.stack.join(", ")}`);
    if (c.impact.length)
      out.push(
        `Impact: ${c.impact.map((i) => `${i.num} ${i.label}`).join("; ")}`,
      );
  });

  out.push(`\n== AI / engineering projects ==`);
  ai.patterns.forEach((p) => {
    out.push(`${p.title}: ${clean(p.description)}`);
    if (p.stack.length) out.push(`Stack: ${p.stack.join(", ")}`);
  });

  out.push(`\n== Skills ==`);
  skills.groups.forEach((g) => out.push(`${g.name}: ${g.skills.join(", ")}`));

  out.push(`\n== Recognition & education ==`);
  recognition.columns.forEach((col) => {
    out.push(`${col.heading}:`);
    col.items.forEach((i) => out.push(`- ${i.what} (${i.by})`));
    if (col.extraHeading) {
      out.push(`${col.extraHeading}:`);
      col.extraItems?.forEach((i) => out.push(`- ${i.what} (${i.by})`));
    }
  });

  return out.join("\n");
}

/** Starter questions a recruiter might ask. */
export const PROFILE_SUGGESTIONS = [
  "How many years of engineering leadership experience does he have?",
  "What's his experience with AWS and cloud-native systems?",
  "Has he led teams? How large?",
  "What AI / RAG work has he done?",
];
