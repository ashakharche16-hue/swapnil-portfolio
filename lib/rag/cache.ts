import type { SupabaseClient } from "@supabase/supabase-js";

export interface CachedAnswer {
  answer: string;
  sources: unknown[];
}

/** Normalizes a question so trivial variations share a cache entry. */
export function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?!.]+$/g, "")
    .trim();
}

/**
 * Returns a cached answer for (document, normalized question), or null on a
 * miss / any error (e.g. the table isn't migrated yet — fails open).
 */
export async function getCachedAnswer(
  admin: SupabaseClient,
  documentId: string,
  questionNorm: string,
): Promise<CachedAnswer | null> {
  try {
    const { data, error } = await admin
      .from("rag_answer_cache")
      .select("answer, sources")
      .eq("document_id", documentId)
      .eq("question_norm", questionNorm)
      .maybeSingle();
    if (error || !data) return null;
    return { answer: data.answer, sources: (data.sources ?? []) as unknown[] };
  } catch {
    return null;
  }
}

/** Stores an answer for future hits (best-effort; ignores conflicts/errors). */
export async function putCachedAnswer(
  admin: SupabaseClient,
  documentId: string,
  questionNorm: string,
  question: string,
  answer: string,
  sources: unknown[],
): Promise<void> {
  try {
    await admin.from("rag_answer_cache").upsert(
      {
        document_id: documentId,
        question_norm: questionNorm,
        question,
        answer,
        sources,
      },
      { onConflict: "document_id,question_norm" },
    );
  } catch {
    // non-fatal — the table may not be migrated yet
  }
}
