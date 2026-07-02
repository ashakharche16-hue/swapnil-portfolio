import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SignOutButton } from "@/components/admin/SignOutButton";

// Admin is always live/authenticated — never statically cached.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: the middleware also gates /admin, but re-check here.
  const user = await getAdminUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg text-body">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-mono text-sm font-medium">
            <span className="text-accent">SK</span> / admin
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-xs text-muted hover:text-body"
              target="_blank"
            >
              View site ↗
            </Link>
            <span className="hidden font-mono text-xs text-dim sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-56">
          <AdminSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
