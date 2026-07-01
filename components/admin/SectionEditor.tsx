"use client";

import { useState } from "react";
import type {
  AIPattern,
  CaseImpact,
  CaseStudy,
  ContactRow,
  CTA,
  DisplaySegment,
  ExperienceGroup,
  ExperienceItem,
  IconName,
  Metric,
  RecColumn,
  RecItem,
  SectionHeading,
  SectionKey,
  SkillGroup,
} from "@/types/content";
import { saveSection } from "@/app/(admin)/admin/sections/actions";
import {
  Field,
  Repeater,
  SaveBar,
  TagList,
  TextArea,
  TextInput,
  inputCls,
} from "@/components/admin/fields";

const clean = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);

const ICON_OPTIONS: IconName[] = [
  "mail",
  "phone",
  "linkedin",
  "pin",
  "calendar",
  "building",
  "check-circle",
  "graduation-cap",
  "download",
  "arrow-up-right",
];

function IconSelect({
  value,
  onChange,
}: {
  value: IconName;
  onChange: (v: IconName) => void;
}) {
  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value as IconName)}
    >
      {ICON_OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function HeadingFields({
  heading,
  onChange,
  showLead,
}: {
  heading: SectionHeading;
  onChange: (h: SectionHeading) => void;
  showLead: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
        Heading
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Number">
          <TextInput
            value={heading.num}
            onChange={(v) => onChange({ ...heading, num: v })}
          />
        </Field>
        <Field label="Title">
          <TextInput
            value={heading.title}
            onChange={(v) => onChange({ ...heading, title: v })}
          />
        </Field>
        <Field label="Meta">
          <TextInput
            value={heading.meta}
            onChange={(v) => onChange({ ...heading, meta: v })}
          />
        </Field>
      </div>
      {showLead && (
        <Field label="Lead" hint="Markers: **bold**, __accent__, `mono`.">
          <TextArea
            value={heading.lead ?? ""}
            onChange={(v) => onChange({ ...heading, lead: v })}
          />
        </Field>
      )}
    </section>
  );
}

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl text-body">{title}</h1>
      <p className="mt-2 text-muted">
        Changes go live immediately after saving.
      </p>
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </div>
  );
}

// --- per-section editors -----------------------------------------------------

function MetricsEditor({ content }: { content: Record<string, unknown> }) {
  const [metrics, setMetrics] = useState<Metric[]>(
    (content.metrics as Metric[]) ?? [],
  );
  return (
    <Shell title="Metrics">
      <Repeater
        items={metrics}
        onChange={setMetrics}
        create={(): Metric => ({ value: "", label: "" })}
        addLabel="Add metric"
        title={(m) => m.value || "New metric"}
        render={(m, update) => (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Value">
                <TextInput
                  value={m.value}
                  onChange={(v) => update({ value: v })}
                />
              </Field>
              <Field label="Unit (optional)">
                <TextInput
                  value={m.unit ?? ""}
                  onChange={(v) => update({ unit: v })}
                />
              </Field>
            </div>
            <Field label="Label">
              <TextInput
                value={m.label}
                onChange={(v) => update({ label: v })}
              />
            </Field>
          </>
        )}
      />
      <SaveBar onSave={() => saveSection("metrics", null, { metrics })} />
    </Shell>
  );
}

function AboutEditor({
  heading: h0,
  content,
}: {
  heading: SectionHeading;
  content: Record<string, unknown>;
}) {
  const [heading, setHeading] = useState(h0);
  const [paras, setParas] = useState<{ text: string }[]>(
    ((content.paragraphs as string[]) ?? []).map((text) => ({ text })),
  );
  return (
    <Shell title="About">
      <HeadingFields heading={heading} onChange={setHeading} showLead={false} />
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Paragraphs
        </h2>
        <Repeater
          items={paras}
          onChange={setParas}
          create={() => ({ text: "" })}
          addLabel="Add paragraph"
          render={(p, update) => (
            <TextArea
              value={p.text}
              onChange={(v) => update({ text: v })}
              rows={4}
            />
          )}
        />
      </section>
      <SaveBar
        onSave={() =>
          saveSection("about", heading, {
            paragraphs: paras.map((p) => p.text).filter((t) => t.trim()),
          })
        }
      />
    </Shell>
  );
}

function SkillsEditor({
  heading: h0,
  content,
}: {
  heading: SectionHeading;
  content: Record<string, unknown>;
}) {
  const [heading, setHeading] = useState(h0);
  const [groups, setGroups] = useState<SkillGroup[]>(
    (content.groups as SkillGroup[]) ?? [],
  );
  return (
    <Shell title="Capabilities">
      <HeadingFields heading={heading} onChange={setHeading} showLead />
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Skill groups
        </h2>
        <Repeater
          items={groups}
          onChange={setGroups}
          create={() => ({ name: "", skills: [] })}
          addLabel="Add group"
          title={(g) => g.name || "New group"}
          render={(g, update) => (
            <>
              <Field label="Group name">
                <TextInput
                  value={g.name}
                  onChange={(v) => update({ name: v })}
                />
              </Field>
              <Field label="Skills" hint="One per line.">
                <TagList
                  value={g.skills}
                  onChange={(v) => update({ skills: v })}
                />
              </Field>
            </>
          )}
        />
      </section>
      <SaveBar
        onSave={() =>
          saveSection("skills", heading, {
            groups: groups.map((g) => ({
              name: g.name,
              skills: clean(g.skills),
            })),
          })
        }
      />
    </Shell>
  );
}

function AIEditor({
  heading: h0,
  content,
}: {
  heading: SectionHeading;
  content: Record<string, unknown>;
}) {
  const [heading, setHeading] = useState(h0);
  const [patterns, setPatterns] = useState<AIPattern[]>(
    (content.patterns as AIPattern[]) ?? [],
  );
  return (
    <Shell title="AI Engineering">
      <HeadingFields heading={heading} onChange={setHeading} showLead />
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Patterns
        </h2>
        <Repeater
          items={patterns}
          onChange={setPatterns}
          create={() => ({ num: "", title: "", description: "", stack: [] })}
          addLabel="Add pattern"
          title={(p) => p.title || "New pattern"}
          render={(p, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Eyebrow (e.g. PATTERN 01)">
                  <TextInput
                    value={p.num}
                    onChange={(v) => update({ num: v })}
                  />
                </Field>
                <Field label="Title">
                  <TextInput
                    value={p.title}
                    onChange={(v) => update({ title: v })}
                  />
                </Field>
              </div>
              <Field label="Description">
                <TextArea
                  value={p.description}
                  onChange={(v) => update({ description: v })}
                />
              </Field>
              <Field label="Stack" hint="One per line.">
                <TagList
                  value={p.stack}
                  onChange={(v) => update({ stack: v })}
                />
              </Field>
            </>
          )}
        />
      </section>
      <SaveBar
        onSave={() =>
          saveSection("ai", heading, {
            patterns: patterns.map((p) => ({ ...p, stack: clean(p.stack) })),
          })
        }
      />
    </Shell>
  );
}

function WorkEditor({
  heading: h0,
  content,
}: {
  heading: SectionHeading;
  content: Record<string, unknown>;
}) {
  const [heading, setHeading] = useState(h0);
  const [cases, setCases] = useState<CaseStudy[]>(
    (content.cases as CaseStudy[]) ?? [],
  );
  return (
    <Shell title="Selected Work">
      <HeadingFields heading={heading} onChange={setHeading} showLead />
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Case studies
        </h2>
        <Repeater
          items={cases}
          onChange={setCases}
          create={() => ({
            index: "",
            tag: "",
            title: "",
            description: "",
            stack: [],
            impact: [],
          })}
          addLabel="Add case study"
          title={(c) => c.title || "New case"}
          render={(c, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Index (e.g. 01 / Architecture)">
                  <TextInput
                    value={c.index}
                    onChange={(v) => update({ index: v })}
                  />
                </Field>
                <Field label="Tag">
                  <TextInput
                    value={c.tag}
                    onChange={(v) => update({ tag: v })}
                  />
                </Field>
              </div>
              <Field label="Title">
                <TextInput
                  value={c.title}
                  onChange={(v) => update({ title: v })}
                />
              </Field>
              <Field label="Description" hint="Markers supported.">
                <TextArea
                  value={c.description}
                  onChange={(v) => update({ description: v })}
                />
              </Field>
              <Field label="Stack" hint="One per line.">
                <TagList
                  value={c.stack}
                  onChange={(v) => update({ stack: v })}
                />
              </Field>
              <Field label="Impact stats">
                <Repeater
                  items={c.impact}
                  onChange={(impact) => update({ impact })}
                  create={() => ({ num: "", label: "" })}
                  addLabel="Add stat"
                  render={(im: CaseImpact, upd) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextInput
                        value={im.num}
                        onChange={(v) => upd({ num: v })}
                      />
                      <TextInput
                        value={im.label}
                        onChange={(v) => upd({ label: v })}
                      />
                    </div>
                  )}
                />
              </Field>
            </>
          )}
        />
      </section>
      <SaveBar
        onSave={() =>
          saveSection("work", heading, {
            cases: cases.map((c) => ({ ...c, stack: clean(c.stack) })),
          })
        }
      />
    </Shell>
  );
}

function ExperienceEditor({
  heading: h0,
  content,
}: {
  heading: SectionHeading;
  content: Record<string, unknown>;
}) {
  const [heading, setHeading] = useState(h0);
  const [items, setItems] = useState<ExperienceItem[]>(
    (content.items as ExperienceItem[]) ?? [],
  );
  return (
    <Shell title="Experience">
      <HeadingFields heading={heading} onChange={setHeading} showLead />
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Roles
        </h2>
        <Repeater
          items={items}
          onChange={setItems}
          create={() => ({
            role: "",
            company: "",
            period: "",
            heading: "",
            summary: "",
            groups: [],
          })}
          addLabel="Add role"
          title={(it) => it.company || "New role"}
          render={(it, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role">
                  <TextInput
                    value={it.role}
                    onChange={(v) => update({ role: v })}
                  />
                </Field>
                <Field label="Company">
                  <TextInput
                    value={it.company}
                    onChange={(v) => update({ company: v })}
                  />
                </Field>
              </div>
              <Field label="Period">
                <TextInput
                  value={it.period}
                  onChange={(v) => update({ period: v })}
                />
              </Field>
              <Field label="Heading">
                <TextInput
                  value={it.heading}
                  onChange={(v) => update({ heading: v })}
                />
              </Field>
              <Field label="Summary" hint="Markers supported.">
                <TextArea
                  value={it.summary}
                  onChange={(v) => update({ summary: v })}
                />
              </Field>
              <Field label="Groups">
                <Repeater
                  items={it.groups}
                  onChange={(groups) => update({ groups })}
                  create={() => ({ label: "", bullets: [] })}
                  addLabel="Add group"
                  title={(g: ExperienceGroup) => g.label || "New group"}
                  render={(g: ExperienceGroup, upd) => (
                    <>
                      <Field label="Group label">
                        <TextInput
                          value={g.label}
                          onChange={(v) => upd({ label: v })}
                        />
                      </Field>
                      <Field
                        label="Bullets"
                        hint="One per line. Markers supported."
                      >
                        <TagList
                          value={g.bullets}
                          onChange={(v) => upd({ bullets: v })}
                          rows={5}
                        />
                      </Field>
                    </>
                  )}
                />
              </Field>
            </>
          )}
        />
      </section>
      <SaveBar
        onSave={() =>
          saveSection("experience", heading, {
            items: items.map((it) => ({
              ...it,
              groups: it.groups.map((g) => ({
                label: g.label,
                bullets: clean(g.bullets),
              })),
            })),
          })
        }
      />
    </Shell>
  );
}

function RecognitionEditor({
  heading: h0,
  content,
}: {
  heading: SectionHeading;
  content: Record<string, unknown>;
}) {
  const [heading, setHeading] = useState(h0);
  const [columns, setColumns] = useState<RecColumn[]>(
    (content.columns as RecColumn[]) ?? [],
  );

  const itemsRepeater = (
    items: RecItem[],
    onChange: (v: RecItem[]) => void,
    label: string,
  ) => (
    <Field label={label}>
      <Repeater
        items={items}
        onChange={onChange}
        create={() => ({ what: "", by: "" })}
        addLabel="Add entry"
        render={(item: RecItem, upd) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput value={item.what} onChange={(v) => upd({ what: v })} />
            <TextInput value={item.by} onChange={(v) => upd({ by: v })} />
          </div>
        )}
      />
    </Field>
  );

  return (
    <Shell title="Recognition">
      <HeadingFields heading={heading} onChange={setHeading} showLead />
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Columns
        </h2>
        <Repeater
          items={columns}
          onChange={setColumns}
          create={() => ({ heading: "", items: [] })}
          addLabel="Add column"
          title={(c) => c.heading || "New column"}
          render={(c, update) => (
            <>
              <Field label="Column heading">
                <TextInput
                  value={c.heading}
                  onChange={(v) => update({ heading: v })}
                />
              </Field>
              {itemsRepeater(c.items, (items) => update({ items }), "Entries")}
              <Field label="Second heading (optional, e.g. Education)">
                <TextInput
                  value={c.extraHeading ?? ""}
                  onChange={(v) => update({ extraHeading: v })}
                />
              </Field>
              {itemsRepeater(
                c.extraItems ?? [],
                (extraItems) => update({ extraItems }),
                "Second entries",
              )}
            </>
          )}
        />
      </section>
      <SaveBar
        onSave={() => saveSection("recognition", heading, { columns })}
      />
    </Shell>
  );
}

function ContactEditor({
  heading: h0,
  content,
}: {
  heading: SectionHeading;
  content: Record<string, unknown>;
}) {
  const [heading, setHeading] = useState(h0);

  const lead = (content.lead as DisplaySegment[]) ?? [];
  const accentIdx = lead.findIndex((s) => s.accent || s.italic);
  const [leadText, setLeadText] = useState(
    lead
      .slice(0, accentIdx < 0 ? lead.length : accentIdx)
      .map((s) => s.text)
      .join(""),
  );
  const [leadAccent, setLeadAccent] = useState(
    accentIdx >= 0 ? lead[accentIdx].text : "",
  );
  const [leadAfter, setLeadAfter] = useState(
    accentIdx >= 0
      ? lead
          .slice(accentIdx + 1)
          .map((s) => s.text)
          .join("")
      : "",
  );

  const [blurb, setBlurb] = useState((content.blurb as string) ?? "");
  const [availability, setAvailability] = useState(
    (content.availability as string) ?? "",
  );
  const cta0 = (content.cta as CTA) ?? { label: "", href: "" };
  const [ctaLabel, setCtaLabel] = useState(cta0.label);
  const [ctaHref, setCtaHref] = useState(cta0.href);
  const [ctaIcon, setCtaIcon] = useState<IconName>(cta0.icon ?? "mail");
  const [rows, setRows] = useState<ContactRow[]>(
    (content.rows as ContactRow[]) ?? [],
  );

  function build() {
    const segments: DisplaySegment[] = [];
    if (leadText) segments.push({ text: leadText });
    if (leadAccent)
      segments.push({ text: leadAccent, accent: true, italic: true });
    if (leadAfter) segments.push({ text: leadAfter });
    return saveSection("contact", heading, {
      lead: segments,
      blurb,
      availability,
      cta: { ...cta0, label: ctaLabel, href: ctaHref, icon: ctaIcon },
      rows,
    });
  }

  return (
    <Shell title="Contact">
      <HeadingFields heading={heading} onChange={setHeading} showLead={false} />

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
          Lead (big serif line)
        </h2>
        <Field label="Text before accent">
          <TextInput value={leadText} onChange={setLeadText} />
        </Field>
        <Field label="Accent word (italic, accent color)">
          <TextInput value={leadAccent} onChange={setLeadAccent} />
        </Field>
        <Field label="Text after accent">
          <TextInput value={leadAfter} onChange={setLeadAfter} />
        </Field>
        <Field label="Availability pill">
          <TextInput value={availability} onChange={setAvailability} />
        </Field>
        <Field label="Blurb">
          <TextArea value={blurb} onChange={setBlurb} />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
          Primary button
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Label">
            <TextInput value={ctaLabel} onChange={setCtaLabel} />
          </Field>
          <Field label="Link">
            <TextInput value={ctaHref} onChange={setCtaHref} />
          </Field>
          <Field label="Icon">
            <IconSelect value={ctaIcon} onChange={setCtaIcon} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Contact methods
        </h2>
        <Repeater
          items={rows}
          onChange={setRows}
          create={(): ContactRow => ({ icon: "mail", label: "", value: "" })}
          addLabel="Add method"
          title={(r) => r.label || "New method"}
          render={(r, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Icon">
                  <IconSelect
                    value={r.icon}
                    onChange={(v) => update({ icon: v })}
                  />
                </Field>
                <Field label="Label">
                  <TextInput
                    value={r.label}
                    onChange={(v) => update({ label: v })}
                  />
                </Field>
              </div>
              <Field label="Value">
                <TextInput
                  value={r.value}
                  onChange={(v) => update({ value: v })}
                />
              </Field>
              <Field label="Link (optional)">
                <TextInput
                  value={r.href ?? ""}
                  onChange={(v) => update({ href: v })}
                />
              </Field>
            </>
          )}
        />
      </section>

      <SaveBar onSave={build} />
    </Shell>
  );
}

export function SectionEditor({
  sectionKey,
  heading,
  content,
}: {
  sectionKey: SectionKey;
  heading: SectionHeading | null;
  content: Record<string, unknown>;
}) {
  const h = heading ?? { num: "", title: "", meta: "" };
  switch (sectionKey) {
    case "metrics":
      return <MetricsEditor content={content} />;
    case "about":
      return <AboutEditor heading={h} content={content} />;
    case "experience":
      return <ExperienceEditor heading={h} content={content} />;
    case "work":
      return <WorkEditor heading={h} content={content} />;
    case "ai":
      return <AIEditor heading={h} content={content} />;
    case "skills":
      return <SkillsEditor heading={h} content={content} />;
    case "recognition":
      return <RecognitionEditor heading={h} content={content} />;
    case "contact":
      return <ContactEditor heading={h} content={content} />;
  }
}
