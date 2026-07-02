/**
 * Admin allowlist. `ADMIN_EMAILS` is a comma-separated list of emails allowed
 * into /admin. If it's unset/empty, any authenticated user is allowed (relies
 * on Supabase sign-ups being disabled — the single-owner model). When set, only
 * those emails are treated as admin, even if others somehow authenticate.
 */
export function isAllowedAdmin(email: string | null | undefined): boolean {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw || !raw.trim()) return true;
  if (!email) return false;
  const allow = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}
