export interface Extracted {
  text: string;
  pageCount: number;
  kind: "pdf" | "image";
}

/**
 * Extracts text from an uploaded file:
 *  - PDFs → `unpdf` (text-based PDFs; no LLM, no cost).
 *  - Images (PNG/JPG/WebP) → Tesseract OCR (`tesseract.js`), fully local.
 * Both libraries are dynamically imported so they only load on the ingest path.
 */
export async function extractFromFile(file: File): Promise<Extracted> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text, totalPages } = await extractText(pdf, { mergePages: true });
    const merged = Array.isArray(text) ? text.join("\n\n") : text;
    return { text: merged.trim(), pageCount: totalPages, kind: "pdf" };
  }

  // Image → OCR
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return { text: data.text.trim(), pageCount: 1, kind: "image" };
  } finally {
    await worker.terminate();
  }
}
