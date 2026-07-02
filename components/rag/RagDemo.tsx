"use client";

import { useEffect, useRef, useState } from "react";

interface Source {
  n: number;
  page: number | null;
  snippet: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  feedback?: "up" | "down";
}

interface Doc {
  documentId: string;
  filename: string;
  chunks: number;
  pageCount: number;
  suggestions: string[];
}

function uuid() {
  return crypto.randomUUID();
}

function decodeSources(header: string | null): Source[] | undefined {
  if (!header) return undefined;
  try {
    const bin = atob(header);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return undefined;
  }
}

export function RagDemo() {
  const [sessionId, setSessionId] = useState("");
  const [doc, setDoc] = useState<Doc | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Restore session + document + conversation on load.
  useEffect(() => {
    let sid = localStorage.getItem("rag-session");
    if (!sid) {
      sid = uuid();
      localStorage.setItem("rag-session", sid);
    }
    setSessionId(sid);
    try {
      const d = localStorage.getItem("rag-doc");
      if (d) setDoc(JSON.parse(d));
      const m = localStorage.getItem("rag-messages");
      if (m) setMessages(JSON.parse(m));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist across refreshes.
  useEffect(() => {
    if (!hydrated) return;
    if (doc) localStorage.setItem("rag-doc", JSON.stringify(doc));
    else localStorage.removeItem("rag-doc");
  }, [doc, hydrated]);
  useEffect(() => {
    if (hydrated)
      localStorage.setItem("rag-messages", JSON.stringify(messages));
  }, [messages, hydrated]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/rag/ingest", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
      } else {
        setDoc({
          documentId: data.documentId,
          filename: data.filename,
          chunks: data.chunks,
          pageCount: data.pageCount,
          suggestions: data.suggestions ?? [],
        });
        setMessages([]);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function ask(text: string) {
    const q = text.trim();
    if (!doc || asking || !q) return;
    setAsking(true);
    setQuestion("");
    const assistantId = uuid();
    setMessages((prev) => [
      ...prev,
      { id: uuid(), role: "user", content: q },
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.documentId,
          sessionId,
          question: q,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = (await res.text()) || "Something went wrong.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: errText } : m,
          ),
        );
        return;
      }

      const sources = decodeSources(res.headers.get("x-rag-sources"));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const token = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + token } : m,
          ),
        );
      }
      if (sources) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, sources } : m)),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m,
        ),
      );
    } finally {
      setAsking(false);
    }
  }

  async function sendFeedback(msg: Message, rating: "up" | "down") {
    if (!doc || msg.feedback) return;
    const idx = messages.findIndex((m) => m.id === msg.id);
    const priorUser = [...messages.slice(0, idx)]
      .reverse()
      .find((m) => m.role === "user");
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, feedback: rating } : m)),
    );
    try {
      await fetch("/api/rag/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.documentId,
          question: priorUser?.content ?? "",
          rating,
        }),
      });
    } catch {
      // non-fatal
    }
  }

  function reset() {
    setDoc(null);
    setMessages([]);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Live demo · RAG
      </p>
      <h1 className="mt-3 font-serif text-4xl text-body">Ask my documents</h1>
      <p className="mt-3 text-muted">
        Upload a PDF (or an image to OCR) and ask questions answered only from
        its contents — with citations and follow-up memory. Parsing, embeddings,
        and reranking run locally at no cost; answers stream from a fast open
        model.
      </p>
      <p className="mt-2 font-mono text-xs text-dim">
        Documents auto-delete after 24 hours. Please don&apos;t upload sensitive
        material.
      </p>

      {/* How to use */}
      <ol className="mt-6 flex flex-col gap-1.5 text-sm text-muted">
        <li>
          <span className="mr-2 font-mono text-xs text-accent">1</span>
          Upload a text-based PDF (or an image to OCR).
        </li>
        <li>
          <span className="mr-2 font-mono text-xs text-accent">2</span>
          Ask a question — or tap a suggested one.
        </li>
        <li>
          <span className="mr-2 font-mono text-xs text-accent">3</span>
          Read the cited answer, then ask follow-ups — it remembers the thread.
        </li>
      </ol>

      {/* Upload / document status */}
      {!doc ? (
        <div className="mt-8 rounded-2xl border border-hairline bg-elev p-5">
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Upload a document
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
              Reading &amp; indexing… (first run downloads the local models)
            </p>
          )}
          {uploadError && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {uploadError}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-hairline bg-elev px-5 py-3">
          <span className="truncate font-mono text-xs text-muted">
            📄 {doc.filename} · {doc.chunks} chunks
            {doc.pageCount ? ` · ${doc.pageCount}p` : ""}
          </span>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 font-mono text-xs text-muted hover:text-body"
          >
            Upload another
          </button>
        </div>
      )}

      {/* Conversation */}
      {doc && (
        <div className="mt-4 flex flex-col gap-4">
          {messages.map((m) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="self-end rounded-2xl rounded-br-sm bg-soft px-4 py-2.5 text-body"
              >
                {m.content}
              </div>
            ) : (
              <div
                key={m.id}
                className="rounded-2xl border border-hairline bg-elev p-4"
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-body">
                  {m.content || (
                    <span className="font-mono text-xs text-dim">
                      Thinking…
                    </span>
                  )}
                </div>

                {m.sources && m.sources.length > 0 && (
                  <details className="mt-3 border-t border-hairline pt-3">
                    <summary className="cursor-pointer font-mono text-xs text-muted">
                      {m.sources.length} sources
                    </summary>
                    <ul className="mt-2 flex flex-col gap-2">
                      {m.sources.map((s) => (
                        <li key={s.n} className="text-xs text-dim">
                          <span className="font-mono text-accent">[{s.n}]</span>
                          {s.page ? (
                            <span className="ml-1 font-mono">p.{s.page}</span>
                          ) : null}{" "}
                          {s.snippet}…
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {m.content && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => sendFeedback(m, "up")}
                      disabled={!!m.feedback}
                      className={`rounded px-1.5 text-sm ${m.feedback === "up" ? "text-signal" : "text-dim hover:text-body"}`}
                      aria-label="Helpful"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => sendFeedback(m, "down")}
                      disabled={!!m.feedback}
                      className={`rounded px-1.5 text-sm ${m.feedback === "down" ? "text-red-400" : "text-dim hover:text-body"}`}
                      aria-label="Not helpful"
                    >
                      ▼
                    </button>
                    {m.feedback && (
                      <span className="font-mono text-xs text-dim">thanks</span>
                    )}
                  </div>
                )}
              </div>
            ),
          )}
          <div ref={endRef} />

          {/* Suggested starter questions */}
          {messages.length === 0 && doc.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {doc.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-hairline bg-elev px-3 py-1.5 text-left text-sm text-muted hover:border-accent hover:text-body"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Ask */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
            className="sticky bottom-4 flex gap-2"
          >
            <input
              type="text"
              value={question}
              maxLength={500}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about the document…"
              disabled={asking}
              className="flex-1 rounded-lg border border-hairline bg-bg px-3 py-2.5 text-body shadow-lg outline-none focus:border-accent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="rounded-lg bg-body px-4 py-2.5 font-medium text-bg shadow-lg transition-opacity disabled:opacity-50"
            >
              {asking ? "…" : "Ask"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
