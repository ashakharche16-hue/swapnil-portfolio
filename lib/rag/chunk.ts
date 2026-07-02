/**
 * Splits document text into overlapping chunks for embedding/retrieval.
 * Character-based (~1200 chars, 200 overlap) with a preference for breaking at
 * a paragraph or sentence boundary near the window edge.
 */
export function chunkText(
  input: string,
  {
    maxChars = 1200,
    overlap = 200,
  }: { maxChars?: number; overlap?: number } = {},
): string[] {
  const text = input
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return [];
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);

    if (end < text.length) {
      const window = text.slice(start, end);
      const boundary = Math.max(
        window.lastIndexOf("\n\n"),
        window.lastIndexOf(". "),
        window.lastIndexOf("\n"),
      );
      if (boundary > maxChars * 0.5) end = start + boundary + 1;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= text.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}
