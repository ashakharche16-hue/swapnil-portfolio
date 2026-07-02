"use client";

import { useState } from "react";
import type { Chip, CTA, IconName } from "@/types/content";
import type { ProfileRow } from "@/services/admin";
import {
  saveProfile,
  uploadResume,
  type ProfileFormValues,
} from "@/app/(admin)/admin/profile/actions";
import {
  Field,
  IconSelect,
  ICON_OPTIONS,
  Repeater,
  TagList,
  TextArea,
  TextInput,
  inputCls,
} from "@/components/admin/fields";

const clean = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);

/** Icon select that also allows "no icon" (for CTAs). */
function OptionalIcon({
  value,
  onChange,
}: {
  value?: IconName;
  onChange: (v?: IconName) => void;
}) {
  return (
    <select
      className={inputCls}
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value || undefined) as IconName)}
    >
      <option value="">(no icon)</option>
      {ICON_OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function ProfileEditor({ initial }: { initial: ProfileRow }) {
  const { identity, hero } = initial;

  const [values, setValues] = useState({
    name: identity.name,
    initials: identity.initials,
    availabilityLabel: identity.availabilityLabel,
    email: identity.email,
    phone: identity.phone,
    linkedinUrl: identity.linkedinUrl,
    linkedinHandle: identity.linkedinHandle,
    location: identity.location,
    resumeUrl: identity.resumeUrl,
    greeting: hero.name.map((s) => s.text).join(""),
    role: hero.role,
    sub: hero.sub,
  });
  const [rotatingRoles, setRotatingRoles] = useState<string[]>(
    hero.rotatingRoles ?? [],
  );
  const [eyebrow, setEyebrow] = useState<string[]>(hero.eyebrow ?? []);
  const [chips, setChips] = useState<Chip[]>(hero.chips ?? []);
  const [ctas, setCtas] = useState<CTA[]>(hero.ctas ?? []);

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<
    | { state: "idle" | "uploading" }
    | { state: "error"; message: string }
    | { state: "done" }
  >({ state: "idle" });

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setStatus("idle");
  }

  async function onResumeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpload({ state: "uploading" });
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadResume(fd);
    if (result.ok) {
      set("resumeUrl", result.url);
      setUpload({ state: "done" });
    } else {
      setUpload({ state: "error", message: result.error });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const payload: ProfileFormValues = {
      name: values.name,
      initials: values.initials,
      availabilityLabel: values.availabilityLabel,
      email: values.email,
      phone: values.phone,
      linkedinUrl: values.linkedinUrl,
      linkedinHandle: values.linkedinHandle,
      location: values.location,
      resumeUrl: values.resumeUrl,
      greeting: values.greeting,
      role: values.role,
      sub: values.sub,
      rotatingRoles: clean(rotatingRoles),
      eyebrow: clean(eyebrow),
      chips: chips
        .map((c) => ({ icon: c.icon, label: c.label.trim() }))
        .filter((c) => c.label),
      ctas: ctas
        .map((c) => ({
          label: c.label.trim(),
          href: c.href.trim(),
          ...(c.icon ? { icon: c.icon } : {}),
          ...(c.primary ? { primary: true } : {}),
          ...(c.download ? { download: true } : {}),
        }))
        .filter((c) => c.label && c.href),
    };

    const result = await saveProfile(payload);
    if (result.ok) {
      setStatus("saved");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <h1 className="font-serif text-3xl text-body">Profile &amp; hero</h1>
      <p className="mt-2 text-muted">
        Everything in the hero and your contact identity. Saving updates the
        live site immediately.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Hero
        </h2>
        <div className="flex flex-col gap-4">
          <Field label="Greeting (first line)">
            <TextInput
              value={values.greeting}
              onChange={(v) => set("greeting", v)}
            />
          </Field>
          <Field
            label="Rotating roles"
            hint="One per line — the article (a/an) is added automatically."
          >
            <TagList
              value={rotatingRoles}
              onChange={setRotatingRoles}
              rows={5}
            />
          </Field>
          <Field
            label="Role line"
            hint="Markers: **bold**, __accent__, `mono`."
          >
            <TextArea value={values.role} onChange={(v) => set("role", v)} />
          </Field>
          <Field label="Sub line">
            <TextArea value={values.sub} onChange={(v) => set("sub", v)} />
          </Field>
          <Field
            label="Eyebrow tags"
            hint="Small mono tags above the name. One per line."
          >
            <TagList value={eyebrow} onChange={setEyebrow} rows={3} />
          </Field>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Hero chips
        </h2>
        <Repeater
          items={chips}
          onChange={setChips}
          create={(): Chip => ({ icon: "pin", label: "" })}
          addLabel="Add chip"
          title={(c) => c.label || "New chip"}
          render={(c, update) => (
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <IconSelect
                value={c.icon}
                onChange={(v) => update({ icon: v })}
              />
              <TextInput
                value={c.label}
                onChange={(v) => update({ label: v })}
              />
            </div>
          )}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Hero buttons (CTAs)
        </h2>
        <Repeater
          items={ctas}
          onChange={setCtas}
          create={(): CTA => ({ label: "", href: "" })}
          addLabel="Add button"
          title={(c) => c.label || "New button"}
          render={(c, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label">
                  <TextInput
                    value={c.label}
                    onChange={(v) => update({ label: v })}
                  />
                </Field>
                <Field label="Link">
                  <TextInput
                    value={c.href}
                    onChange={(v) => update({ href: v })}
                  />
                </Field>
              </div>
              <Field label="Icon">
                <OptionalIcon
                  value={c.icon}
                  onChange={(v) => update({ icon: v })}
                />
              </Field>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={!!c.primary}
                    onChange={(e) => update({ primary: e.target.checked })}
                  />
                  Primary
                </label>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={!!c.download}
                    onChange={(e) => update({ download: e.target.checked })}
                  />
                  Download
                </label>
              </div>
            </>
          )}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Identity
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput value={values.name} onChange={(v) => set("name", v)} />
          </Field>
          <Field label="Initials">
            <TextInput
              value={values.initials}
              onChange={(v) => set("initials", v)}
            />
          </Field>
          <Field label="Availability label">
            <TextInput
              value={values.availabilityLabel}
              onChange={(v) => set("availabilityLabel", v)}
            />
          </Field>
          <Field label="Location">
            <TextInput
              value={values.location}
              onChange={(v) => set("location", v)}
            />
          </Field>
          <Field label="Email">
            <TextInput
              value={values.email}
              onChange={(v) => set("email", v)}
              type="email"
            />
          </Field>
          <Field label="Phone">
            <TextInput value={values.phone} onChange={(v) => set("phone", v)} />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput
              value={values.linkedinUrl}
              onChange={(v) => set("linkedinUrl", v)}
            />
          </Field>
          <Field label="LinkedIn handle">
            <TextInput
              value={values.linkedinHandle}
              onChange={(v) => set("linkedinHandle", v)}
            />
          </Field>
          <Field
            label="Résumé URL"
            hint="Paste a URL, or upload a PDF below to set it automatically."
          >
            <TextInput
              value={values.resumeUrl}
              onChange={(v) => set("resumeUrl", v)}
            />
          </Field>
          <Field label="Upload résumé (PDF → Storage)">
            <input
              type="file"
              accept="application/pdf"
              onChange={onResumeFile}
              className="text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-hairline file:bg-soft file:px-3 file:py-1.5 file:text-body"
            />
            {upload.state === "uploading" && (
              <span className="text-xs text-dim">Uploading…</span>
            )}
            {upload.state === "done" && (
              <span className="text-xs text-signal">
                ✓ Uploaded — remember to Save.
              </span>
            )}
            {upload.state === "error" && (
              <span role="alert" className="text-xs text-red-400">
                {upload.message}
              </span>
            )}
          </Field>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-lg bg-body px-5 py-2.5 font-medium text-bg transition-opacity disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && (
          <span className="font-mono text-xs text-signal">
            ✓ Saved — live now
          </span>
        )}
        {status === "error" && (
          <span role="alert" className="text-sm text-red-400">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
