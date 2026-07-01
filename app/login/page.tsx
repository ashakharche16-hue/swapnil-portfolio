import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-elev p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-2xl text-body">Sign in</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          Manage your site content.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <Link
          href="/"
          className="mt-6 inline-block font-mono text-xs text-muted transition-colors hover:text-body"
        >
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
