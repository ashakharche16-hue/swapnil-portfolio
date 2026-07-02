/**
 * Non-destructive patch: adds the "rag demo" nav link and refreshes the AI
 * "projects" (PROJECT labels + /rag link on project 1) from db/seed.ts.
 * Only touches profile.nav and the `ai` section — nothing else.
 *
 * Run: npm run db:patch-rag
 */
import { config } from "dotenv";
import { seed } from "../db/seed";
import { getSupabaseAdmin } from "../lib/supabase";

config({ path: ".env.local" });

async function main() {
  const admin = getSupabaseAdmin();

  // --- nav: append { label: "rag demo", href: "/rag" } if missing ---
  const { data: profile } = await admin
    .from("profile")
    .select("nav")
    .eq("id", 1)
    .single();
  const nav = (profile?.nav ?? seed.nav) as { label: string; href: string }[];
  if (!nav.some((n) => n.href === "/rag")) {
    const contactIdx = nav.findIndex((n) => n.href === "#contact");
    const item = { label: "rag demo", href: "/rag" };
    if (contactIdx >= 0) nav.splice(contactIdx, 0, item);
    else nav.push(item);
    const { error } = await admin.from("profile").update({ nav }).eq("id", 1);
    if (error) throw error;
    console.log("✓ nav: added 'rag demo' → /rag");
  } else {
    console.log("• nav already has /rag");
  }

  // --- ai section: set patterns to the seed (PROJECT labels + /rag link) ---
  const { data: ai } = await admin
    .from("sections")
    .select("content")
    .eq("key", "ai")
    .single();
  const content = (ai?.content ?? {}) as Record<string, unknown>;
  content.patterns = seed.ai.patterns;
  const { error: aiError } = await admin
    .from("sections")
    .update({ content })
    .eq("key", "ai");
  if (aiError) throw aiError;
  console.log("✓ ai: projects updated (PROJECT 01 links to /rag)");
}

main().catch((err) => {
  console.error("✗ patch failed:", err.message ?? err);
  process.exit(1);
});
