import type { FeatureExtractionPipeline } from "@huggingface/transformers";

/**
 * Local, zero-cost text embeddings via Transformers.js.
 * Model: bge-small-en-v1.5 → 384-dim vectors (matches the rag_chunks column).
 * The model (~30 MB) downloads once on first use and is cached; the pipeline is
 * a module-level singleton so it loads only once per server process.
 */
let pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

async function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      // Cache under the OS temp dir so it works on serverless (writable /tmp).
      if (process.env.TRANSFORMERS_CACHE)
        env.cacheDir = process.env.TRANSFORMERS_CACHE;
      return pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
    })();
    // If loading fails (e.g. an interrupted first-time model download), clear
    // the cached promise so the NEXT call retries instead of failing forever.
    pipelinePromise.catch((err) => {
      console.error("[rag] embedding model failed to load:", err);
      pipelinePromise = null;
    });
  }
  return pipelinePromise;
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const pipe = await getPipeline();
  const output = await pipe(texts, { pooling: "mean", normalize: true });
  return output.tolist() as number[][];
}

export async function embedOne(text: string): Promise<number[]> {
  const [vector] = await embed([text]);
  return vector;
}
