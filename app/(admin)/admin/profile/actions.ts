"use server";

import { revalidatePath } from "next/cache";
import { seed } from "@/db/seed";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase-server";
import type { Chip, CTA, NavLink } from "@/types/content";

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
  eyebrow: string[];
  chips: Chip[];
  ctas: CTA[];
}

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveProfile(
  values: ProfileFormValues,
): Promise<SaveResult> {
  // Only an authenticated, allowlisted admin may write.
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Not authorized." };

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  // Load current row so we preserve fields the editor doesn't touch (footer, nav).
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
    eyebrow: values.eyebrow,
    chips: values.chips,
    ctas: values.ctas,
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

export async function saveNav(nav: NavLink[]): Promise<SaveResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Not authorized." };

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const cleaned = nav
    .map((n) => ({ label: n.label.trim(), href: n.href.trim() }))
    .filter((n) => n.label && n.href);

  const { error } = await admin
    .from("profile")
    .update({ nav: cleaned, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/navigation");
  return { ok: true };
}

export type UploadResult =
  { ok: true; url: string } | { ok: false; error: string };

/**
 * Uploads the résumé PDF to the public `media` Storage bucket and returns its
 * public URL (to be saved into identity.resumeUrl). Requires a bucket named
 * `media` (public) in Supabase Storage.
 */
export async function uploadResume(formData: FormData): Promise<UploadResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (file.type !== "application/pdf")
    return { ok: false, error: "File must be a PDF." };
  if (file.size > 10 * 1024 * 1024)
    return { ok: false, error: "File must be under 10 MB." };

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const path = "resume/Swapnil_Kharche_Resume.pdf";
  const { error } = await admin.storage.from("media").upload(path, file, {
    upsert: true,
    contentType: "application/pdf",
  });
  if (error) return { ok: false, error: error.message };

  const { data } = admin.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
