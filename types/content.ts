/**
 * Typed content model for the public site (Slice 1).
 *
 * All visible copy lives in `/db/seed.ts` against these types — never hardcoded
 * in components. In Slice 2 this same shape is what the Supabase `sections`
 * content model will hydrate, so keep it serializable (plain data only).
 *
 * Inline emphasis inside string fields uses a tiny marker syntax rendered by
 * `components/ui/RichText.tsx`:
 *   **bold**     -> emphasized text (body color, medium weight)
 *   __accent__   -> accent-colored text
 *   `mono`       -> accent-colored monospace (the "data/metric" treatment)
 */

export type IconName =
  | "pin"
  | "calendar"
  | "building"
  | "check-circle"
  | "download"
  | "sun"
  | "moon"
  | "mail"
  | "phone"
  | "linkedin"
  | "arrow-up-right"
  | "graduation-cap"
  | "menu"
  | "close"
  | "arrow-up";

export interface NavLink {
  label: string;
  href: string;
}

export interface CTA {
  label: string;
  href: string;
  primary?: boolean;
  download?: boolean;
  icon?: IconName;
}

export interface Chip {
  icon: IconName;
  label: string;
}

/** A run of display text that may be accented/italicized (used in big headlines). */
export interface DisplaySegment {
  text: string;
  accent?: boolean;
  italic?: boolean;
}

export interface SiteIdentity {
  name: string;
  initials: string;
  availabilityLabel: string;
  resumeUrl: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  linkedinHandle: string;
  location: string;
}

export interface HeroContent {
  eyebrow: string[];
  /** First line of the headline, e.g. "Hey, I'm Swapnil,". */
  name: DisplaySegment[];
  /**
   * Second-line roles cycled every few seconds. The "a"/"an" article is
   * derived automatically per role — do not include it here.
   */
  rotatingRoles: string[];
  role: string;
  sub: string;
  chips: Chip[];
  ctas: CTA[];
}

export interface Metric {
  value: string;
  unit?: string;
  label: string;
}

export interface SectionHeading {
  num: string;
  title: string;
  meta: string;
  lead?: string;
}

export interface AboutContent {
  heading: SectionHeading;
  paragraphs: string[];
}

export interface ExperienceGroup {
  label: string;
  bullets: string[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  heading: string;
  summary: string;
  groups: ExperienceGroup[];
}

export interface ExperienceContent {
  heading: SectionHeading;
  items: ExperienceItem[];
}

export interface CaseImpact {
  num: string;
  label: string;
}

export interface CaseStudy {
  index: string;
  tag: string;
  title: string;
  description: string;
  stack: string[];
  impact: CaseImpact[];
}

export interface WorkContent {
  heading: SectionHeading;
  cases: CaseStudy[];
}

export interface AIPattern {
  num: string;
  title: string;
  description: string;
  stack: string[];
}

export interface AIContent {
  heading: SectionHeading;
  patterns: AIPattern[];
}

export interface SkillGroup {
  name: string;
  skills: string[];
}

export interface SkillsContent {
  heading: SectionHeading;
  groups: SkillGroup[];
}

export interface RecItem {
  what: string;
  by: string;
}

export interface RecColumn {
  heading: string;
  items: RecItem[];
  extraHeading?: string;
  extraItems?: RecItem[];
}

export interface RecognitionContent {
  heading: SectionHeading;
  columns: RecColumn[];
}

export interface ContactRow {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
}

export interface ContactContent {
  heading: SectionHeading;
  lead: DisplaySegment[];
  blurb: string;
  /** Short availability line shown as a pill (e.g. "Available for senior roles"). */
  availability: string;
  /** Primary call-to-action button. */
  cta: CTA;
  /** Contact methods rendered as icon cards. */
  rows: ContactRow[];
}

export interface FooterContent {
  copyrightName: string;
  build: string;
}

export interface SiteContent {
  identity: SiteIdentity;
  nav: NavLink[];
  hero: HeroContent;
  metrics: Metric[];
  about: AboutContent;
  experience: ExperienceContent;
  work: WorkContent;
  ai: AIContent;
  skills: SkillsContent;
  recognition: RecognitionContent;
  contact: ContactContent;
  footer: FooterContent;
}

/** Reorderable / hideable body sections (Hero, footer, nav are fixed). */
export type SectionKey =
  | "metrics"
  | "about"
  | "experience"
  | "work"
  | "ai"
  | "skills"
  | "recognition"
  | "contact";

export interface LayoutItem {
  key: SectionKey;
  visible: boolean;
}
