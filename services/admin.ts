import { seed } from "@/db/seed";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { HeroContent, NavLink, SiteIdentity } from "@/types/content";

export interface ProfileRow {
  identity: SiteIdentity;
  hero: HeroContent;
  nav: NavLink[];
}

/**
 * Reads the profile row for the admin editors (service role, server-only).
 * Falls back to the local seed when Supabase isn't configured or the row is
 * missing, so the editors always render something to work with.
 */
export async function getProfileForAdmin(): Promise<ProfileRow> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("profile")
      .select("identity, hero, nav")
      .eq("id", 1)
      .single();
    if (data?.identity && data?.hero) {
      return {
        identity: data.identity,
        hero: data.hero,
        nav: data.nav ?? seed.nav,
      };
    }
  } catch {
    // Not configured / no row — fall through to seed.
  }
  return { identity: seed.identity, hero: seed.hero, nav: seed.nav };
}
