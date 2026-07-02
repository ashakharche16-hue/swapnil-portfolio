export interface Extracted {
  /** Text per page (1 entry per PDF page; single entry for images). */
  pages: string[];
  pageCount: number;
  kind: "pdf" | "image";
}

/**
 * Extracts text from an uploaded file, preserving page boundaries so chunks can
 * carry page numbers for citations.
 *  - PDFs → `unpdf` (text-based; no LLM, no cost).
 *  - Images (PNG/JPG/WebP) → Tesseract OCR (`tesseract.js`), fully local.
 */
export async function extractFromFile(file: File): Promise<Extracted> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text, totalPages } = await extractText(pdf, { mergePages: false });
    const pages = (Array.isArray(text) ? text : [text]).map((p) => p.trim());
    return { pages, pageCount: totalPages, kind: "pdf" };
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return { pages: [data.text.trim()], pageCount: 1, kind: "image" };
  } finally {
    await worker.terminate();
  }
}
