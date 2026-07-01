import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for client components (login form, sign-out).
 * Stores the session in cookies so the server/middleware can read it.
 */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
