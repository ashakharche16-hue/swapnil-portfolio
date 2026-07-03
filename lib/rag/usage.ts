import type { SupabaseClient } from "@supabase/supabase-js";

const num = (name: string, fallback: number) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

/** Tunable RAG cost/abuse guards (all env-overridable). */
export const ragConfig = {
  keepChunks: () => num("RAG_KEEP_CHUNKS", 4),
  chunkChars: () => num("RAG_CHUNK_CHARS", 800),
  /**
   * Documents whose full text is at/under this many characters skip retrieval
   * and use the WHOLE document as context (like uploading a file to ChatGPT) —
   * so whole-document questions ("who is this about?", "summarize") work. Larger
   * docs fall back to retrieval.
   */
  fullDocChars: () => num("RAG_FULLDOC_CHARS", 8000),
  historyMessages: () => num("RAG_HISTORY_MESSAGES", 6),
  maxPerMin: () => num("RAG_MAX_QUESTIONS_PER_MIN", 8),
  maxPerDay: () => num("RAG_MAX_QUESTIONS_PER_DAY", 100),
  dailyTokenBudget: () => num("RAG_DAILY_TOKEN_BUDGET", 300000),
  /**
   * Whether to run the cross-encoder reranker. It improves answer precision but
   * loads a ~90MB model — heavy for serverless cold starts. Defaults ON, but
   * OFF on Vercel (where vector search alone is more reliable). Force with
   * RAG_RERANK=1 / 0.
   */
  rerankEnabled: () =>
    process.env.RAG_RERANK
      ? process.env.RAG_RERANK === "1" || process.env.RAG_RERANK === "true"
      : !process.env.VERCEL,
};

async function countAsks(
  admin: SupabaseClient,
  sinceIso: string,
  ip?: string,
): Promise<number> {
  let q = admin
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "rag_ask")
    .gte("created_at", sinceIso);
  if (ip) q = q.eq("meta->>ip", ip);
  const { count } = await q;
  return count ?? 0;
}

export type LimitResult =
  { ok: true } | { ok: false; status: number; message: string };

/**
 * Per-IP question rate limit (per-minute + per-day). Applies to every question,
 * including cache hits, to stop abuse. Fails open on error / unknown IP.
 */
export async function checkQuestionRate(
  admin: SupabaseClient,
  ip: string,
): Promise<LimitResult> {
  if (!ip) return { ok: true };
  const now = Date.now();
  const minAgo = new Date(now - 60_000).toISOString();
  const dayAgo = new Date(now - 86_400_000).toISOString();
  try {
    const [perMin, perDay] = await Promise.all([
      countAsks(admin, minAgo, ip),
      countAsks(admin, dayAgo, ip),
    ]);
    if (perMin >= ragConfig.maxPerMin() || perDay >= ragConfig.maxPerDay()) {
      return {
        ok: false,
        status: 429,
        message:
          "You're sending questions quickly — please slow down and try again shortly.",
      };
    }
  } catch (err) {
    console.error("[rag] rate check failed:", err);
  }
  return { ok: true };
}

/**
 * Global daily Groq token budget. Only checked on a cache miss (i.e. when we're
 * actually about to spend tokens). Fails open on error.
 */
export async function checkTokenBudget(
  admin: SupabaseClient,
): Promise<LimitResult> {
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  try {
    const { data: today } = await admin
      .from("analytics_events")
      .select("meta")
      .eq("type", "rag_ask")
      .gte("created_at", dayAgo)
      .limit(5000);
    const used = (today ?? []).reduce((sum, r) => {
      const t = Number((r.meta as { tokens?: number } | null)?.tokens);
      return sum + (Number.isFinite(t) ? t : 0);
    }, 0);
    if (used >= ragConfig.dailyTokenBudget()) {
      return {
        ok: false,
        status: 503,
        message:
          "The live demo has reached today's usage limit. Please try again tomorrow.",
      };
    }
  } catch (err) {
    console.error("[rag] budget check failed:", err);
  }
  return { ok: true };
}

/** Records one answered question + its token cost for budgeting/monitoring. */
export async function logAsk(
  admin: SupabaseClient,
  data: {
    ip: string;
    sessionId: string;
    documentId: string;
    tokens: number;
    model: string;
  },
): Promise<void> {
  try {
    await admin.from("analytics_events").insert({
      type: "rag_ask",
      path: "/rag",
      meta: {
        ip: data.ip || null,
        sessionId: data.sessionId,
        documentId: data.documentId,
        tokens: data.tokens,
        model: data.model,
      },
    });
  } catch (err) {
    console.error("[rag] usage log failed:", err);
  }
}
