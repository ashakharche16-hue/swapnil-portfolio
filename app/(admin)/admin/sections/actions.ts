"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase-server";
import type { SectionHeading, SectionKey } from "@/types/content";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Result = { ok: true } | { ok: false; error: string };

async function authedAdmin(): Promise<SupabaseClient> {
  const user = await getAdminUser();
  if (!user) throw new Error("Not authorized.");
  return getSupabaseAdmin();
}

export async function saveSection(
  key: SectionKey,
  heading: SectionHeading | null,
  content: Record<string, unknown>,
): Promise<Result> {
  try {
    const admin = await authedAdmin();
    const { error } = await admin.from("sections").upsert(
      {
        key,
        type: key,
        heading,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath(`/admin/sections/${key}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setSectionVisible(
  key: SectionKey,
  visible: boolean,
): Promise<Result> {
  try {
    const admin = await authedAdmin();
    const { error } = await admin
      .from("sections")
      .update({ visible })
      .eq("key", key);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/sections");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function reorderSections(
  orderedKeys: SectionKey[],
): Promise<Result> {
  try {
    const admin = await authedAdmin();
    const results = await Promise.all(
      orderedKeys.map((key, i) =>
        admin
          .from("sections")
          .update({ sort_order: (i + 1) * 10 })
          .eq("key", key),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return { ok: false, error: failed.error.message };
    revalidatePath("/");
    revalidatePath("/admin/sections");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
