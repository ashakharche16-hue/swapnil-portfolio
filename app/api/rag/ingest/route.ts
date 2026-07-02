import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { extractFromFile } from "@/lib/rag/extract";
import { chunkText } from "@/lib/rag/chunk";
import { embed } from "@/lib/rag/embeddings";
import { toVector } from "@/lib/rag/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_CHUNKS = 120;
const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "The demo isn't configured." },
      { status: 503 },
    );
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Storage isn't configured." },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Upload a PDF or an image (PNG/JPG/WebP)." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 10 MB)." },
      { status: 400 },
    );
  }

  // Best-effort cleanup of expired demo documents (cascades to chunks).
  await admin
    .from("rag_documents")
    .delete()
    .lt("expires_at", new Date().toISOString());

  let extracted;
  try {
    extracted = await extractFromFile(file);
  } catch {
    return NextResponse.json(
      { error: "Could not read that file." },
      { status: 422 },
    );
  }

  if (!extracted.text || extracted.text.length < 20) {
    return NextResponse.json(
      {
        error:
          extracted.kind === "pdf"
            ? "No readable text found — this looks like a scanned PDF. Try a text-based PDF, or upload a page as an image for OCR."
            : "No readable text found in that image.",
      },
      { status: 422 },
    );
  }

  let chunks = chunkText(extracted.text);
  if (chunks.length > MAX_CHUNKS) chunks = chunks.slice(0, MAX_CHUNKS);

  let vectors: number[][];
  try {
    vectors = await embed(chunks);
  } catch {
    return NextResponse.json(
      { error: "Failed to index the document." },
      { status: 500 },
    );
  }

  const { data: doc, error: docError } = await admin
    .from("rag_documents")
    .insert({ filename: file.name, page_count: extracted.pageCount })
    .select("id")
    .single();
  if (docError || !doc) {
    return NextResponse.json(
      { error: "Could not save the document." },
      { status: 500 },
    );
  }

  const rows = chunks.map((content, i) => ({
    document_id: doc.id,
    chunk_index: i,
    content,
    embedding: toVector(vectors[i]),
  }));
  const { error: chunkError } = await admin.from("rag_chunks").insert(rows);
  if (chunkError) {
    return NextResponse.json(
      { error: "Could not index the document." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    documentId: doc.id as string,
    filename: file.name,
    pageCount: extracted.pageCount,
    chunks: chunks.length,
    kind: extracted.kind,
  });
}
