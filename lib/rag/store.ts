/** Formats a number[] as a pgvector literal string ("[0.1,0.2,...]"). */
export function toVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
