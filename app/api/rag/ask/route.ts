import Groq from "groq-sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import { embedOne } from "@/lib/rag/embeddings";
import { toVector } from "@/lib/rag/store";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Match {
  content: string;
  chunk_index: number;
  similarity: number;
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey)
    return new Response("The demo isn't configured.", { status: 503 });

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return new Response("Storage isn't configured.", { status: 503 });
  }

  const { documentId, question } = (await req.json()) as {
    documentId?: string;
    question?: string;
  };
  if (!documentId || typeof question !== "string" || !question.trim()) {
    return new Response("Missing document or question.", { status: 400 });
  }
  if (question.length > 500) {
    return new Response("Question too long (max 500 characters).", {
      status: 400,
    });
  }

  const queryEmbedding = await embedOne(question);
  const { data: matches, error } = await admin.rpc("match_chunks", {
    query_embedding: toVector(queryEmbedding),
    match_document_id: documentId,
    match_count: 5,
  });

  if (error) return new Response("Search failed.", { status: 500 });
  const rows = (matches ?? []) as Match[];
  if (rows.length === 0) {
    return new Response(
      "This document has expired or is empty — please upload it again.",
      { status: 404 },
    );
  }

  const context = rows.map((m, i) => `[${i + 1}] ${m.content}`).join("\n\n");

  const system =
    "You answer questions about a document the user uploaded. Use ONLY the provided context. " +
    "If the answer isn't in the context, say you couldn't find it in the document. " +
    "Be concise and cite snippet numbers like [1], [2] where relevant.";
  const user = `Context from the document:\n\n${context}\n\nQuestion: ${question.trim()}`;

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    stream: true,
    temperature: 0.2,
    max_tokens: 800,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) controller.enqueue(encoder.encode(token));
        }
      } catch {
        controller.enqueue(
          encoder.encode("\n\n[Error generating the answer.]"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
