export interface Extracted {
  /** Text per page (1 entry per PDF page; single entry for images). */
  pages: string[];
  pageCount: number;
  kind: "pdf" | "image";
}

type PdfItem = { str: string; transform: number[]; width?: number };

/**
 * Rebuilds a page's text from positioned glyph items: group items by their
 * baseline (y), order left→right (x), and insert a space where there's a
 * horizontal gap. This preserves table rows and label:value pairs far better
 * than PDF item-boundary line breaks — important for invoices/tables where the
 * default extraction scatters a row's cells across many lines.
 */
function reconstructPage(items: PdfItem[]): string {
  const clean = items.filter(
    (i) => typeof i.str === "string" && i.str.length > 0,
  );
  const Y_TOL = 2.5; // items within this vertical distance share a line
  const GAP = 1.2; // x-gap (pt) that implies a column/word break

  const lines: { y: number; items: PdfItem[] }[] = [];
  for (const it of clean) {
    const y = it.transform[5];
    let line = lines.find((l) => Math.abs(l.y - y) <= Y_TOL);
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push(it);
  }
  lines.sort((a, b) => b.y - a.y); // PDF y grows upward → top first

  return lines
    .map((l) => {
      l.items.sort((a, b) => a.transform[4] - b.transform[4]);
      let out = "";
      let prevEnd: number | null = null;
      for (const it of l.items) {
        const x = it.transform[4];
        if (
          prevEnd !== null &&
          x - prevEnd > GAP &&
          !out.endsWith(" ") &&
          !it.str.startsWith(" ")
        ) {
          out += " ";
        }
        out += it.str;
        prevEnd = x + (it.width ?? 0);
      }
      return out.replace(/[ \t]+/g, " ").trim();
    })
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extracts text from an uploaded file, preserving page boundaries so chunks can
 * carry page numbers for citations.
 *  - PDFs → `unpdf` positioned items, reconstructed into reading order (no LLM,
 *    no cost). Falls back to plain extraction if reconstruction yields nothing.
 *  - Images (PNG/JPG/WebP) → Tesseract OCR (`tesseract.js`), fully local.
 */
export async function extractFromFile(file: File): Promise<Extracted> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const pageCount = pdf.numPages;

    const pages: string[] = [];
    for (let n = 1; n <= pageCount; n++) {
      try {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        pages.push(reconstructPage(content.items as PdfItem[]));
      } catch {
        pages.push("");
      }
    }

    // Fallback: if layout reconstruction produced almost no text (e.g. an
    // unusual PDF or a reconstruction failure), use unpdf's plain extraction.
    if (pages.join("").trim().length < 20) {
      const { text } = await extractText(pdf, { mergePages: false });
      const plain = (Array.isArray(text) ? text : [text]).map((p) => p.trim());
      return {
        pages: plain,
        pageCount: plain.length || pageCount,
        kind: "pdf",
      };
    }

    return { pages, pageCount, kind: "pdf" };
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
