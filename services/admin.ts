import { seed } from "@/db/seed";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { HeroContent, SiteIdentity } from "@/types/content";

export interface ProfileRow {
  identity: SiteIdentity;
  hero: HeroContent;
}

/**
 * Reads the profile row for the admin editor (service role, server-only).
 * Falls back to the local seed when Supabase isn't configured or the row is
 * missing, so the editor always renders something to work with.
 */
export async function getProfileForAdmin(): Promise<ProfileRow> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("profile")
      .select("identity, hero")
      .eq("id", 1)
      .single();
    if (data?.identity && data?.hero) {
      return { identity: data.identity, hero: data.hero };
    }
  } catch {
    // Not configured / no row — fall through to seed.
  }
  return { identity: seed.identity, hero: seed.hero };
}
