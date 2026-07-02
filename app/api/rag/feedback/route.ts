import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const { documentId, question, rating } = (await req.json()) as {
    documentId?: string;
    question?: string;
    rating?: "up" | "down";
  };
  if (rating !== "up" && rating !== "down") {
    return NextResponse.json(
      { ok: false, error: "Invalid rating." },
      { status: 400 },
    );
  }

  await admin.from("analytics_events").insert({
    type: "rag_feedback",
    path: "/rag",
    meta: { documentId, question: (question ?? "").slice(0, 500), rating },
  });

  return NextResponse.json({ ok: true });
}
