"use client";

import { useState } from "react";
import type { NavLink } from "@/types/content";
import { saveNav } from "@/app/(admin)/admin/profile/actions";
import { Field, Repeater, SaveBar, TextInput } from "@/components/admin/fields";

export function NavEditor({ initial }: { initial: NavLink[] }) {
  const [links, setLinks] = useState<NavLink[]>(initial);

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-body">Navigation</h1>
      <p className="mb-8 mt-2 text-muted">
        The top-bar links. Reorder with the arrows; use <code>#section</code>{" "}
        for on-page anchors (e.g. <code>#work</code>) or a path like{" "}
        <code>/rag</code>. Changes go live immediately.
      </p>

      <Repeater
        items={links}
        onChange={setLinks}
        create={() => ({ label: "", href: "" })}
        addLabel="Add link"
        title={(l) => l.label || "New link"}
        render={(l, update) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label">
              <TextInput
                value={l.label}
                onChange={(v) => update({ label: v })}
              />
            </Field>
            <Field label="Link (href)">
              <TextInput value={l.href} onChange={(v) => update({ href: v })} />
            </Field>
          </div>
        )}
      />

      <SaveBar onSave={() => saveNav(links)} />
    </div>
  );
}
