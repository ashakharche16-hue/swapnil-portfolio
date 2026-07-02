"use client";

import { useState, useTransition } from "react";
import type { ContactSubmission } from "@/services/inbox";
import {
  deleteSubmission,
  setHandled,
} from "@/app/(admin)/admin/inbox/actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function Inbox({ initial }: { initial: ContactSubmission[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"new" | "all">("new");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const unhandled = items.filter((i) => !i.handled).length;
  const shown = filter === "new" ? items.filter((i) => !i.handled) : items;

  function toggle(id: string, handled: boolean) {
    setError(null);
    startTransition(async () => {
      const r = await setHandled(id, handled);
      if (r.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, handled } : i)),
        );
      } else setError(r.error);
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this message permanently?")) return;
    setError(null);
    startTransition(async () => {
      const r = await deleteSubmission(id);
      if (r.ok) setItems((prev) => prev.filter((i) => i.id !== id));
      else setError(r.error);
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl text-body">Inbox</h1>
        <span className="font-mono text-xs text-muted">
          {unhandled} new · {items.length} total
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        {(["new", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              filter === f
                ? "border-accent text-accent"
                : "border-hairline text-muted hover:text-body"
            }`}
          >
            {f === "new" ? "New" : "All"}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {shown.length === 0 && (
          <p className="rounded-xl border border-hairline bg-elev p-8 text-center text-muted">
            {filter === "new" ? "No new messages." : "No messages yet."}
          </p>
        )}

        {shown.map((s) => (
          <article
            key={s.id}
            className={`rounded-xl border p-5 ${
              s.handled
                ? "border-hairline bg-bg opacity-70"
                : "border-hairline bg-elev"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-body">{s.name}</span>
                {!s.handled && (
                  <span className="bg-accent/15 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                    New
                  </span>
                )}
              </div>
              <time className="font-mono text-xs text-dim">
                {formatDate(s.created_at)}
              </time>
            </div>

            <a
              href={`mailto:${s.email}`}
              className="mt-0.5 block font-mono text-xs text-muted hover:text-accent"
            >
              {s.email}
            </a>

            <p className="mt-3 whitespace-pre-wrap text-body">{s.message}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs">
              <a
                href={`mailto:${s.email}?subject=Re: your message&body=%0A%0A---%0A${encodeURIComponent(
                  `On ${formatDate(s.created_at)}, ${s.name} wrote:\n${s.message}`,
                )}`}
                className="text-accent hover:underline"
              >
                Reply
              </a>
              <button
                type="button"
                disabled={pending}
                onClick={() => toggle(s.id, !s.handled)}
                className="text-muted hover:text-body disabled:opacity-50"
              >
                {s.handled ? "Mark as new" : "Mark handled"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(s.id)}
                className="text-muted hover:text-red-400 disabled:opacity-50"
              >
                Delete
              </button>
              {s.ip && <span className="text-dim">IP {s.ip}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
