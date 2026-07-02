import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { seed } from "@/db/seed";

export const runtime = "nodejs";

const num = (name: string, fallback: number) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

// Counts submissions since a timestamp (optionally for one IP). Cheap head query.
async function countSince(
  admin: SupabaseClient,
  sinceIso: string,
  ip?: string,
): Promise<number> {
  let q = admin
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sinceIso);
  if (ip) q = q.eq("ip", ip);
  const { count } = await q;
  return count ?? 0;
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    message?: string;
    company?: string; // honeypot
  };

  // 0) Honeypot — bots fill the hidden "company" field. Silently accept + drop.
  if ((body.company ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const n = (body.name ?? "").trim();
  const e = (body.email ?? "").trim();
  const m = (body.message ?? "").trim();

  if (!n || !e || !m) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }
  if (n.length > 100 || e.length > 200 || m.length > 5000) {
    return NextResponse.json(
      { error: "That's a bit too long." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";

  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  let admin: SupabaseClient | null = null;
  try {
    admin = getSupabaseAdmin();
  } catch {
    admin = null;
  }

  // 1) Per-IP rate limit (only if we can read the DB and know the IP).
  if (admin && ip) {
    try {
      const [perHour, perDay] = await Promise.all([
        countSince(admin, hourAgo, ip),
        countSince(admin, dayAgo, ip),
      ]);
      if (
        perHour >= num("CONTACT_MAX_PER_IP_HOUR", 3) ||
        perDay >= num("CONTACT_MAX_PER_IP_DAY", 10)
      ) {
        return NextResponse.json(
          { error: "Too many messages — please try again later." },
          { status: 429 },
        );
      }
    } catch (err) {
      console.error("[contact] rate-limit check failed:", err);
    }
  }

  // 2) Store in Supabase.
  let stored = false;
  if (admin) {
    try {
      const { error } = await admin
        .from("contact_submissions")
        .insert({ name: n, email: e, message: m, ip: ip || null });
      if (error) console.error("[contact] store failed:", error);
      else stored = true;
    } catch (err) {
      console.error("[contact] store threw:", err);
    }
  }

  // 3) Email the owner — but only under the daily + monthly send caps, so we
  //    can never exceed Resend's free tier (3,000/mo, 100/day).
  let emailed = false;
  const key = process.env.RESEND_API_KEY;
  if (key) {
    let underCaps = true;
    if (admin) {
      try {
        const [today, month] = await Promise.all([
          countSince(admin, dayAgo),
          countSince(admin, monthAgo),
        ]);
        // `today`/`month` already include the row we just stored.
        if (
          today > num("CONTACT_DAILY_EMAIL_CAP", 90) ||
          month > num("CONTACT_MONTHLY_EMAIL_CAP", 2900)
        ) {
          underCaps = false;
          console.warn(
            "[contact] email cap reached — stored only, not emailed.",
          );
        }
      } catch (err) {
        console.error("[contact] cap check failed:", err);
      }
    }

    if (underCaps) {
      try {
        const resend = new Resend(key);
        const to = process.env.CONTACT_TO_EMAIL || seed.identity.email;
        const from =
          process.env.RESEND_FROM || "Portfolio <onboarding@resend.dev>";
        const { error } = await resend.emails.send({
          from,
          to,
          replyTo: e,
          subject: `Portfolio inquiry from ${n}`,
          text: `From: ${n} <${e}>\n\n${m}`,
        });
        if (error) console.error("[contact] email failed:", error);
        else emailed = true;
      } catch (err) {
        console.error("[contact] email threw:", err);
      }
    }
  }

  if (!stored && !emailed) {
    return NextResponse.json(
      {
        error: "Couldn't send your message right now — please try again later.",
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
