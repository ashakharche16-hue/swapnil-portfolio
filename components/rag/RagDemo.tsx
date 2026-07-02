"use client";

import { useRef, useState } from "react";

interface Doc {
  documentId: string;
  filename: string;
  chunks: number;
  pageCount: number;
}

export function RagDemo() {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setDoc(null);
    setAnswer("");
    setAskError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/rag/ingest", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
      } else {
        setDoc(data);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!doc || !question.trim() || asking) return;
    setAsking(true);
    setAskError(null);
    setAnswer("");

    try {
      const res = await fetch("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.documentId, question }),
      });

      if (!res.ok || !res.body) {
        setAskError((await res.text()) || "Something went wrong.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setAskError("Something went wrong. Please try again.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Live demo · RAG
      </p>
      <h1 className="mt-3 font-serif text-4xl text-body">Ask my documents</h1>
      <p className="mt-3 text-muted">
        Upload a PDF (or an image to OCR), then ask questions answered only from
        its contents — with citations. Parsing and embeddings run locally at no
        cost; answers stream from a fast open model. Documents auto-delete after
        24 hours.
      </p>

      {/* Upload */}
      <div className="mt-8 rounded-2xl border border-hairline bg-elev p-5">
        <label className="font-mono text-xs uppercase tracking-wider text-muted">
          1 · Upload a document
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={onUpload}
          disabled={uploading}
          className="mt-3 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-hairline file:bg-soft file:px-4 file:py-2 file:text-body disabled:opacity-60"
        />
        {uploading && (
          <p className="mt-3 font-mono text-xs text-dim">
            Reading & indexing… (first run downloads the embedding model)
          </p>
        )}
        {uploadError && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {uploadError}
          </p>
        )}
        {doc && (
          <p className="mt-3 font-mono text-xs text-signal">
            ✓ {doc.filename} — indexed {doc.chunks} chunks
            {doc.pageCount ? ` · ${doc.pageCount} pages` : ""}
          </p>
        )}
      </div>

      {/* Ask */}
      <form
        onSubmit={onAsk}
        className="mt-4 rounded-2xl border border-hairline bg-elev p-5"
      >
        <label className="font-mono text-xs uppercase tracking-wider text-muted">
          2 · Ask a question
        </label>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={question}
            maxLength={500}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              doc ? "What is this document about?" : "Upload a document first"
            }
            disabled={!doc || asking}
            className="flex-1 rounded-lg border border-hairline bg-bg px-3 py-2.5 text-body outline-none focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!doc || asking || !question.trim()}
            className="rounded-lg bg-body px-4 py-2.5 font-medium text-bg transition-opacity disabled:opacity-50"
          >
            {asking ? "…" : "Ask"}
          </button>
        </div>

        {askError && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {askError}
          </p>
        )}

        {(answer || asking) && (
          <div className="mt-4 whitespace-pre-wrap rounded-lg border border-hairline bg-bg p-4 text-sm leading-relaxed text-body">
            {answer || (
              <span className="font-mono text-xs text-dim">Thinking…</span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
