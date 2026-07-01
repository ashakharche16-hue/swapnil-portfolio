"use server";

import { revalidatePath } from "next/cache";
import { seed } from "@/db/seed";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase-server";

export interface ProfileFormValues {
  // identity
  name: string;
  initials: string;
  availabilityLabel: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  linkedinHandle: string;
  location: string;
  resumeUrl: string;
  // hero
  greeting: string;
  rotatingRoles: string[];
  role: string;
  sub: string;
}

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveProfile(
  values: ProfileFormValues,
): Promise<SaveResult> {
  // Only an authenticated (owner) session may write.
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  // Load current row so we preserve fields the editor doesn't touch
  // (hero.eyebrow/chips/ctas, footer, nav).
  const { data: current } = await admin
    .from("profile")
    .select("identity, hero, footer, nav")
    .eq("id", 1)
    .single();

  const baseIdentity = current?.identity ?? seed.identity;
  const baseHero = current?.hero ?? seed.hero;

  const identity = {
    ...baseIdentity,
    name: values.name,
    initials: values.initials,
    availabilityLabel: values.availabilityLabel,
    email: values.email,
    phone: values.phone,
    linkedinUrl: values.linkedinUrl,
    linkedinHandle: values.linkedinHandle,
    location: values.location,
    resumeUrl: values.resumeUrl,
  };

  const hero = {
    ...baseHero,
    name: [{ text: values.greeting }],
    rotatingRoles: values.rotatingRoles,
    role: values.role,
    sub: values.sub,
  };

  const { error } = await admin.from("profile").upsert({
    id: 1,
    identity,
    hero,
    footer: current?.footer ?? seed.footer,
    nav: current?.nav ?? seed.nav,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { ok: true };
}
