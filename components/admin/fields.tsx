"use client";

import { useState } from "react";
import type { IconName } from "@/types/content";

export type SaveResult = { ok: true } | { ok: false; error: string };

export const inputCls =
  "w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-body outline-none focus:border-accent";

export const ICON_OPTIONS: IconName[] = [
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

export function IconSelect({
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

export function Field({
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

export function TextInput({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Edits a string[] as a newline-separated textarea. Empty lines are dropped on save. */
export function TagList({
  value,
  onChange,
  rows = 4,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      className={inputCls}
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
    />
  );
}

/** Generic add / remove / reorder list of objects. */
export function Repeater<T>({
  items,
  onChange,
  create,
  render,
  addLabel = "Add item",
  title,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (
    item: T,
    update: (patch: Partial<T>) => void,
    index: number,
  ) => React.ReactNode;
  addLabel?: string;
  title?: (item: T, index: number) => string;
}) {
  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }
  function update(index: number, patch: Partial<T>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-hairline bg-elev p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-dim">
              {title ? title(item, i) : `#${i + 1}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                className="rounded px-2 py-1 text-xs text-muted hover:text-body disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === items.length - 1}
                className="rounded px-2 py-1 text-xs text-muted hover:text-body disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {render(item, (patch) => update(i, patch), i)}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        className="self-start rounded-lg border border-dashed border-hairline px-3 py-2 text-sm text-muted hover:border-accent hover:text-body"
      >
        + {addLabel}
      </button>
    </div>
  );
}

/** Standard save button with idle/saving/saved/error states. */
export function SaveBar({ onSave }: { onSave: () => Promise<SaveResult> }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setStatus("saving");
    setError(null);
    const result = await onSave();
    if (result.ok) {
      setStatus("saved");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <div className="sticky bottom-4 mt-8 flex items-center gap-4">
      <button
        type="button"
        onClick={handle}
        disabled={status === "saving"}
        className="rounded-lg bg-body px-5 py-2.5 font-medium text-bg shadow-lg transition-opacity disabled:opacity-60"
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
  );
}
