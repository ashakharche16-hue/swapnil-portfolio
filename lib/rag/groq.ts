import Groq from "groq-sdk";

/** Answer model — larger, for the final grounded answer (streamed). */
export const ANSWER_MODEL = "llama-3.3-70b-versatile";
/** Utility model — small/fast/cheap, for condensing questions & suggestions. */
export const UTILITY_MODEL = "llama-3.1-8b-instant";

export function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");
  return new Groq({ apiKey });
}

type Message = { role: "system" | "user" | "assistant"; content: string };

/** Non-streaming completion, for short utility calls. */
export async function groqText(
  messages: Message[],
  opts: { model: string; maxTokens?: number; temperature?: number },
): Promise<string> {
  const groq = getGroq();
  const res = await groq.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 256,
    messages,
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

/**
 * Rewrites a follow-up question into a standalone one using recent history so
 * retrieval works across turns. Returns the original question on any failure.
 */
export async function condenseQuestion(
  history: { role: string; content: string }[],
  question: string,
): Promise<string> {
  if (history.length === 0) return question;
  try {
    const transcript = history
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");
    const rewritten = await groqText(
      [
        {
          role: "system",
          content:
            "Given the conversation and a follow-up question, rewrite the follow-up as a standalone question that includes any needed context. Output ONLY the rewritten question, nothing else.",
        },
        {
          role: "user",
          content: `Conversation:\n${transcript}\n\nFollow-up: ${question}\n\nStandalone question:`,
        },
      ],
      { model: UTILITY_MODEL, maxTokens: 120, temperature: 0 },
    );
    return rewritten || question;
  } catch {
    return question;
  }
}

/** Generates up to 3 starter questions from the document text. */
export async function suggestQuestions(sample: string): Promise<string[]> {
  try {
    const raw = await groqText(
      [
        {
          role: "system",
          content:
            'Generate exactly 3 short, distinct questions a reader might ask about this document. Respond with ONLY a JSON array of 3 strings, e.g. ["...","...","..."].',
        },
        { role: "user", content: sample.slice(0, 3000) },
      ],
      { model: UTILITY_MODEL, maxTokens: 200, temperature: 0.4 },
    );
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((q): q is string => typeof q === "string")
      .map((q) => q.trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
  }
}
