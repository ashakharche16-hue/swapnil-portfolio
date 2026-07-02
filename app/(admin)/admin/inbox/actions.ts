"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase-server";

export type Result = { ok: true } | { ok: false; error: string };

export async function setHandled(
  id: string,
  handled: boolean,
): Promise<Result> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Not authorized." };
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("contact_submissions")
      .update({ handled })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inbox");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteSubmission(id: string): Promise<Result> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Not authorized." };
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("contact_submissions")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inbox");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
