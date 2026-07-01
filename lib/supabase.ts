import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase access. Env is read at call time (not module load) so this works
 * in Next.js server components AND in standalone scripts that load .env.local
 * after import (e.g. scripts/seed-db.ts).
 *
 * Until the owner configures Supabase, `getSupabaseClient()` returns null and
 * the data layer falls back to the local seed — the site keeps working with no
 * keys set (and the build stays green).
 */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Public (anon) client for reads — respects row-level security. */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/** Service-role client for seeding/admin writes — bypasses RLS. Server-only. */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
