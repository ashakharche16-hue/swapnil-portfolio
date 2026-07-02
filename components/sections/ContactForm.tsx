"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — real users leave empty
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  // Returns an error message for the current email, or null if it looks valid.
  function validateEmail(value: string): string | null {
    const v = value.trim();
    if (!v) return null; // don't nag before they've typed anything
    if (!v.includes("@")) return "Please include an '@' in the email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return "Please enter a valid email address.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic client-side email validation (server validates too).
    const emailMsg =
      validateEmail(email) ?? (!email.trim() ? "Email is required." : null);
    if (emailMsg) {
      setEmailError(emailMsg);
      return;
    }

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const field =
    "w-full rounded-lg border border-hairline bg-bg px-3 py-2.5 text-body outline-none focus:border-accent";

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-hairline bg-bg p-6 text-center">
        <p className="font-mono text-xs text-signal">✓ Message sent</p>
        <p className="mt-2 text-sm text-muted">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 font-mono text-xs text-muted hover:text-body"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {/* Honeypot: hidden from users, tempting to bots. Leave empty. */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(ev) => setCompany(ev.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          Name
        </span>
        <input
          className={field}
          value={name}
          maxLength={100}
          required
          onChange={(ev) => setName(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          Email
        </span>
        <input
          type="email"
          className={field}
          value={email}
          maxLength={200}
          required
          aria-invalid={emailError ? true : undefined}
          onChange={(ev) => {
            setEmail(ev.target.value);
            if (emailError) setEmailError(null); // clear while correcting
          }}
          onBlur={() => setEmailError(validateEmail(email))}
        />
        {emailError && (
          <span role="alert" className="text-sm text-red-400">
            {emailError}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          Message
        </span>
        <textarea
          className={field}
          rows={4}
          value={message}
          maxLength={5000}
          required
          onChange={(ev) => setMessage(ev.target.value)}
        />
      </label>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 rounded-lg bg-body px-5 py-2.5 font-medium text-bg transition-opacity disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
