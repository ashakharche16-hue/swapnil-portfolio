import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Cookie-aware Supabase client for server components, server actions, and route
 * handlers — reads the auth session from cookies. Returns null when Supabase
 * isn't configured. Writes/admin operations use the service-role client in
 * `lib/supabase.ts`; this one is only for reading the signed-in user.
 */
export function createServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component (cookies are read-only there).
          // The middleware refreshes the session cookies, so this is safe to ignore.
        }
      },
    },
  });
}

/** The signed-in user, or null. Use to gate admin pages/actions. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
