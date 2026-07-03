import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getRagUsageToday } from "@/services/analytics";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const usage = await getRagUsageToday();
  const pct = usage
    ? Math.min(100, Math.round((usage.tokens / usage.budget) * 100))
    : 0;

  return (
    <div>
      <h1 className="font-serif text-3xl text-body">Dashboard</h1>
      <p className="mt-2 text-muted">
        Edit your site content here — changes go live immediately.
      </p>

      {usage && (
        <div className="mt-6 rounded-xl border border-hairline bg-elev p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
              RAG tokens · last 24h
            </h2>
            <span className="font-mono text-xs text-muted">
              {usage.questions} question{usage.questions === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-2 font-mono text-2xl text-body">
            {usage.tokens.toLocaleString()}{" "}
            <span className="text-sm text-muted">
              / {usage.budget.toLocaleString()} tokens
            </span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg">
            <div
              className={`h-full rounded-full ${pct >= 100 ? "bg-red-400" : "bg-accent"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-dim">
            {pct}% of the daily Groq budget used
            {pct >= 100 ? " — answering is paused until it resets" : ""}.
          </p>
        </div>
      )}

      {!isSupabaseConfigured() && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-hairline bg-elev p-4 text-sm text-muted"
        >
          Supabase isn&apos;t configured — set your keys in{" "}
          <code>.env.local</code> and restart the dev server to enable saving.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/profile"
          className="rounded-xl border border-hairline bg-elev p-5 transition-colors hover:border-accent"
        >
          <h2 className="font-medium text-body">Profile</h2>
          <p className="mt-1 text-sm text-muted">
            Name, headline, rotating roles, contact identity, and résumé upload.
          </p>
        </Link>

        <Link
          href="/admin/sections"
          className="rounded-xl border border-hairline bg-elev p-5 transition-colors hover:border-accent"
        >
          <h2 className="font-medium text-body">Sections</h2>
          <p className="mt-1 text-sm text-muted">
            Edit every section, reorder them, and show or hide them.
          </p>
        </Link>
      </div>
    </div>
  );
}
