import { getSupabaseAdmin } from "@/lib/supabase";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  ip: string | null;
  handled: boolean;
  created_at: string;
}

/**
 * Reads contact form submissions for the admin inbox (service role, server-only).
 * Newest first. Returns [] when Supabase isn't configured.
 */
export async function getSubmissions(): Promise<ContactSubmission[]> {
  try {
    const admin = getSupabaseAdmin();
    // select("*") so this works whether or not the optional `ip` column has
    // been migrated yet (run db/schema.sql to add it).
    const { data, error } = await admin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error("[inbox] read failed:", error);
      return [];
    }
    return (data ?? []) as ContactSubmission[];
  } catch {
    return [];
  }
}
