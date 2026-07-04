"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE_SUGGESTIONS } from "@/lib/rag/profile-context";

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

type Mode = "profile" | "upload";

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
  const [mode, setMode] = useState<Mode>("profile");
  const [sessionId, setSessionId] = useState("");
  const [doc, setDoc] = useState<Doc | null>(null);
  // Separate thread per mode — kept in state so toggling preserves each
  // conversation, but NOT persisted, so a browser refresh starts fresh.
  const [msgs, setMsgs] = useState<Record<Mode, Message[]>>({
    profile: [],
    upload: [],
  });
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = msgs[mode];
  const updateMsgs = (target: Mode, updater: (prev: Message[]) => Message[]) =>
    setMsgs((all) => ({ ...all, [target]: updater(all[target]) }));

  // Fresh session per page load (a browser refresh resets the demo).
  useEffect(() => {
    setSessionId(uuid());
  }, []);
  // Auto-scroll to the latest turn — but only once a conversation exists.
  // On mount `messages` is empty and the chat anchor already renders (profile
  // mode), so scrolling then would push the page heading off-screen.
  useEffect(() => {
    if (messages.length === 0) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next); // keep both threads; just switch which is shown
    setUploadError(null);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/rag/ingest", { method: "POST", body: fd });
      const raw = await res.text();
      let data: {
        error?: string;
        documentId?: string;
        filename?: string;
        chunks?: number;
        pageCount?: number;
        suggestions?: string[];
      } = {};
      try {
        data = JSON.parse(raw);
      } catch {
        // non-JSON response
      }
      if (!res.ok) {
        setUploadError(
          data.error ??
            `Upload failed (HTTP ${res.status}). ${raw.slice(0, 140)}`,
        );
      } else {
        setDoc({
          documentId: data.documentId!,
          filename: data.filename!,
          chunks: data.chunks!,
          pageCount: data.pageCount!,
          suggestions: data.suggestions ?? [],
        });
        updateMsgs("upload", () => []);
      }
    } catch (err) {
      setUploadError(
        `Upload failed: ${err instanceof Error ? err.message : "network error"}. Please try again.`,
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function ask(text: string) {
    const q = text.trim();
    if (asking || !q) return;
    const askMode = mode;
    if (askMode === "upload" && !doc) return;

    const priorHistory = msgs[askMode].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setAsking(true);
    setQuestion("");
    const assistantId = uuid();
    updateMsgs(askMode, (prev) => [
      ...prev,
      { id: uuid(), role: "user", content: q },
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res =
        askMode === "profile"
          ? await fetch("/api/rag/ask-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: q, history: priorHistory }),
            })
          : await fetch("/api/rag/ask", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentId: doc!.documentId,
                sessionId,
                question: q,
              }),
            });

      if (!res.ok || !res.body) {
        const errText = (await res.text()) || "Something went wrong.";
        updateMsgs(askMode, (prev) =>
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
        updateMsgs(askMode, (prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + token } : m,
          ),
        );
      }
      if (sources) {
        updateMsgs(askMode, (prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, sources } : m)),
        );
      }
    } catch {
      updateMsgs(askMode, (prev) =>
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
    if (msg.feedback) return;
    const idx = messages.findIndex((m) => m.id === msg.id);
    const priorUser = [...messages.slice(0, idx)]
      .reverse()
      .find((m) => m.role === "user");
    updateMsgs(mode, (prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, feedback: rating } : m)),
    );
    try {
      await fetch("/api/rag/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc?.documentId ?? "profile",
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
    updateMsgs("upload", () => []);
  }

  const showChat = mode === "profile" || (mode === "upload" && !!doc);
  const suggestions =
    mode === "profile" ? PROFILE_SUGGESTIONS : (doc?.suggestions ?? []);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Live demo · RAG
      </p>
      <h1 className="mt-3 font-serif text-4xl text-body">
        {mode === "profile" ? "Ask about Swapnil" : "Ask my documents"}
      </h1>
      <p className="mt-3 text-muted">
        {mode === "profile"
          ? "Ask about Swapnil's experience, skills, and impact — answered from his live profile."
          : "Upload a PDF (or an image to OCR) and ask questions answered only from its contents, with citations."}{" "}
        Answers stream from a fast open model; retrieval runs locally.
      </p>
      <p className="mt-2 font-mono text-xs text-dim">
        Runs on a free tier — usage is rate-limited, and answers may pause
        briefly if the daily limit is reached. Please use it sparingly.
      </p>

      {/* Mode picker — clear option cards */}
      <p className="mt-6 font-mono text-xs uppercase tracking-wider text-muted">
        Choose one to start
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(
          [
            {
              m: "profile",
              emoji: "👤",
              title: "Ask about Swapnil",
              desc: "His experience, skills & impact — answered from his profile. No upload needed.",
            },
            {
              m: "upload",
              emoji: "📄",
              title: "Chat with a document",
              desc: "Upload a PDF or image and ask questions about its contents.",
            },
          ] as const
        ).map((opt) => {
          const active = mode === opt.m;
          return (
            <button
              key={opt.m}
              type="button"
              onClick={() => switchMode(opt.m)}
              aria-pressed={active}
              className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors ${
                active
                  ? "bg-accent-soft border-accent"
                  : "hover:border-accent/60 border-hairline bg-elev"
              }`}
            >
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="text-lg">
                  {opt.emoji}
                </span>
                <span className="font-medium text-body">{opt.title}</span>
                {active && (
                  <span aria-hidden="true" className="text-accent">
                    ✓
                  </span>
                )}
              </span>
              <span className="text-sm text-muted">{opt.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Upload mode: how-to + upload/status */}
      {mode === "upload" && (
        <>
          {!doc ? (
            <div className="mt-6 rounded-2xl border border-hairline bg-elev p-5">
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
              <p className="mt-3 font-mono text-xs text-dim">
                Documents auto-delete after 24 hours. Don&apos;t upload
                sensitive material.
              </p>
              {uploading && (
                <p className="mt-2 font-mono text-xs text-dim">
                  Reading &amp; indexing… (first run downloads the local models)
                </p>
              )}
              {uploadError && (
                <p role="alert" className="mt-2 text-sm text-red-400">
                  {uploadError}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-hairline bg-elev px-5 py-3">
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
        </>
      )}

      {/* Conversation */}
      {showChat && (
        <div className="mt-4 flex flex-col gap-4">
          {messages.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => updateMsgs(mode, () => [])}
                className="rounded-lg border border-hairline px-3 py-1.5 font-mono text-xs text-muted hover:border-accent hover:text-body"
              >
                + New chat
              </button>
            </div>
          )}
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
                      className={`rounded p-1 ${m.feedback === "up" ? "text-accent" : "text-accent/50 hover:text-accent"} disabled:cursor-default`}
                      aria-label="Helpful"
                      title="Helpful"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M7 10v12" />
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendFeedback(m, "down")}
                      disabled={!!m.feedback}
                      className={`rounded p-1 ${m.feedback === "down" ? "text-accent" : "text-accent/50 hover:text-accent"} disabled:cursor-default`}
                      aria-label="Not helpful"
                      title="Not helpful"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17 14V2" />
                        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                      </svg>
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
          {messages.length === 0 && suggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Try asking
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
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
              placeholder={
                mode === "profile"
                  ? "Ask about Swapnil…"
                  : "Ask about the document…"
              }
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
