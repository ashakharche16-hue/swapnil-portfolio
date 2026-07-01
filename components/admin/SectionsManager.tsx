"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { SectionKey } from "@/types/content";
import {
  reorderSections,
  setSectionVisible,
} from "@/app/(admin)/admin/sections/actions";

interface Item {
  key: SectionKey;
  label: string;
  visible: boolean;
}

export function SectionsManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    setItems(next);
    startTransition(async () => {
      const r = await reorderSections(next.map((x) => x.key));
      setMessage(r.ok ? "Order saved" : `Error: ${r.error}`);
    });
  }

  function toggle(index: number) {
    const next = items.map((x, i) =>
      i === index ? { ...x, visible: !x.visible } : x,
    );
    setItems(next);
    const item = next[index];
    startTransition(async () => {
      const r = await setSectionVisible(item.key, item.visible);
      setMessage(r.ok ? "Saved" : `Error: ${r.error}`);
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div
            key={item.key}
            className="flex items-center gap-3 rounded-xl border border-hairline bg-elev p-3"
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="px-1 text-muted hover:text-body disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="px-1 text-muted hover:text-body disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
            </div>

            <span
              className={`flex-1 font-medium ${item.visible ? "text-body" : "text-dim line-through"}`}
            >
              {item.label}
            </span>

            <button
              type="button"
              onClick={() => toggle(i)}
              className="rounded-lg border border-hairline px-3 py-1.5 font-mono text-xs text-muted hover:text-body"
            >
              {item.visible ? "Visible" : "Hidden"}
            </button>

            <Link
              href={`/admin/sections/${item.key}`}
              className="rounded-lg bg-soft px-3 py-1.5 text-sm text-body hover:bg-hairline"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-4 h-5 font-mono text-xs text-dim">
        {pending ? "Saving…" : (message ?? "")}
      </p>
    </div>
  );
}
