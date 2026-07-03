import { getSupabaseAdmin } from "@/lib/supabase";
import { ragConfig } from "@/lib/rag/usage";

export interface RagUsageToday {
  tokens: number;
  questions: number;
  budget: number;
}

/**
 * RAG Groq token usage over the last 24h (matches the daily-budget window),
 * for the admin dashboard widget. Returns null if Supabase isn't configured.
 */
export async function getRagUsageToday(): Promise<RagUsageToday | null> {
  try {
    const admin = getSupabaseAdmin();
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const { data, error } = await admin
      .from("analytics_events")
      .select("meta")
      .eq("type", "rag_ask")
      .gte("created_at", dayAgo)
      .limit(5000);
    if (error) return null;
    const rows = data ?? [];
    const tokens = rows.reduce((sum, r) => {
      const t = Number((r.meta as { tokens?: number } | null)?.tokens);
      return sum + (Number.isFinite(t) ? t : 0);
    }, 0);
    return {
      tokens,
      questions: rows.length,
      budget: ragConfig.dailyTokenBudget(),
    };
  } catch {
    return null;
  }
}
