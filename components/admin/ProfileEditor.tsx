"use client";

import { useState } from "react";
import type { ProfileRow } from "@/services/admin";
import {
  saveProfile,
  uploadResume,
  type ProfileFormValues,
} from "@/app/(admin)/admin/profile/actions";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-dim">{hint}</span>}
    </label>
  );
}

const inputCls =
  "rounded-lg border border-hairline bg-bg px-3 py-2 text-body outline-none focus:border-accent";

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
    rotatingRoles: hero.rotatingRoles.join("\n"),
    role: hero.role,
    sub: hero.sub,
  });

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<
    | { state: "idle" | "uploading" }
    | { state: "error"; message: string }
    | { state: "done" }
  >({ state: "idle" });

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

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setStatus("idle");
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
      rotatingRoles: values.rotatingRoles
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
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
      <h1 className="font-serif text-3xl text-body">Profile</h1>
      <p className="mt-2 text-muted">
        Hero headline and contact identity. Saving updates the live site
        immediately.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Hero
        </h2>
        <div className="flex flex-col gap-4">
          <Field label="Greeting (first line)">
            <input
              className={inputCls}
              value={values.greeting}
              onChange={(e) => set("greeting", e.target.value)}
            />
          </Field>
          <Field
            label="Rotating roles"
            hint="One per line — the article (a/an) is added automatically."
          >
            <textarea
              rows={5}
              className={inputCls}
              value={values.rotatingRoles}
              onChange={(e) => set("rotatingRoles", e.target.value)}
            />
          </Field>
          <Field
            label="Role line"
            hint="Markers: **bold**, __accent__, `mono`."
          >
            <textarea
              rows={3}
              className={inputCls}
              value={values.role}
              onChange={(e) => set("role", e.target.value)}
            />
          </Field>
          <Field label="Sub line">
            <textarea
              rows={3}
              className={inputCls}
              value={values.sub}
              onChange={(e) => set("sub", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
          Identity
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputCls}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Initials">
            <input
              className={inputCls}
              value={values.initials}
              onChange={(e) => set("initials", e.target.value)}
            />
          </Field>
          <Field label="Availability label">
            <input
              className={inputCls}
              value={values.availabilityLabel}
              onChange={(e) => set("availabilityLabel", e.target.value)}
            />
          </Field>
          <Field label="Location">
            <input
              className={inputCls}
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              className={inputCls}
              value={values.linkedinUrl}
              onChange={(e) => set("linkedinUrl", e.target.value)}
            />
          </Field>
          <Field label="LinkedIn handle">
            <input
              className={inputCls}
              value={values.linkedinHandle}
              onChange={(e) => set("linkedinHandle", e.target.value)}
            />
          </Field>
          <Field
            label="Résumé URL"
            hint="Paste a URL, or upload a PDF below to set it automatically."
          >
            <input
              className={inputCls}
              value={values.resumeUrl}
              onChange={(e) => set("resumeUrl", e.target.value)}
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
          <span className="font-mono text-xs text-signal">✓ Saved</span>
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
