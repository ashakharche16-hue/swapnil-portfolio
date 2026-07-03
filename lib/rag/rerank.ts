import os from "os";
import path from "path";
import type {
  PreTrainedModel,
  PreTrainedTokenizer,
} from "@huggingface/transformers";

/**
 * Cross-encoder reranking (local, zero-cost) with ms-marco-MiniLM.
 * Retrieval casts a wide net (top-N by vector similarity); the cross-encoder
 * scores each (question, chunk) pair directly for a big precision boost, and we
 * keep the best `topK`. Falls back to the original order on any failure.
 */
let modelPromise: Promise<{
  tokenizer: PreTrainedTokenizer;
  model: PreTrainedModel;
}> | null = null;

async function getReranker() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const { AutoTokenizer, AutoModelForSequenceClassification, env } =
        await import("@huggingface/transformers");
      env.cacheDir =
        process.env.TRANSFORMERS_CACHE || path.join(os.tmpdir(), "hf-cache");
      env.allowLocalModels = false;
      const id = "Xenova/ms-marco-MiniLM-L-6-v2";
      const [tokenizer, model] = await Promise.all([
        AutoTokenizer.from_pretrained(id),
        AutoModelForSequenceClassification.from_pretrained(id),
      ]);
      return { tokenizer, model };
    })();
    // Don't cache a rejected promise (self-heal on transient load failure).
    modelPromise.catch((err) => {
      console.error("[rag] reranker failed to load:", err);
      modelPromise = null;
    });
  }
  return modelPromise;
}

export async function rerank<T extends { content: string }>(
  query: string,
  docs: T[],
  topK: number,
): Promise<T[]> {
  if (docs.length <= topK) return docs;
  try {
    const { tokenizer, model } = await getReranker();
    const inputs = tokenizer(
      docs.map(() => query),
      {
        text_pair: docs.map((d) => d.content),
        padding: true,
        truncation: true,
      },
    );
    const output = await model(inputs);
    const logits = output.logits.tolist() as number[][];
    return docs
      .map((doc, i) => ({ doc, score: logits[i]?.[0] ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.doc);
  } catch {
    return docs.slice(0, topK);
  }
}
