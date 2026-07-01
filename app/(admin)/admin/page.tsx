import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-body">Dashboard</h1>
      <p className="mt-2 text-muted">
        Edit your site content here — changes go live immediately.
      </p>

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
