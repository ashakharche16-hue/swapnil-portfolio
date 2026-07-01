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
            Name, headline, rotating roles, and contact identity.
          </p>
        </Link>

        <div className="rounded-xl border border-dashed border-hairline p-5 text-dim">
          <h2 className="font-medium">More editors</h2>
          <p className="mt-1 text-sm">
            About, Experience, Work, Skills, and the rest arrive in Slice 4.
          </p>
        </div>
      </div>
    </div>
  );
}
