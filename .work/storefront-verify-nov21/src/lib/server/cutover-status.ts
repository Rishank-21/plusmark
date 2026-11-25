/**
 * Admin_App_Cutover status for the Legacy_Admin (Req 25.13, 25.15, 25.16).
 * Reads public.admin_cutover_status() with the anon key and caches it for 60 seconds.
 * Returns the Admin_App URL to redirect to once the cutover is confirmed, otherwise null.
 * A failed read never redirects, so a Supabase outage cannot lock the Legacy_Admin out before the cutover.
 */
export const CUTOVER_STATUS_REVALIDATE_SECONDS = 60;

export function adminAppUrl(): string | null {
  const url = (process.env.ADMIN_APP_URL ?? process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "").trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(url) ? url : null;
}

export async function cutoverRedirectTarget(path = ""): Promise<string | null> {
  const base = adminAppUrl();
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !supabase || !anon) return null;
  try {
    const res = await fetch(`${supabase}/rest/v1/rpc/admin_cutover_status`, {
      method: "POST",
      headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
      body: "{}",
      next: { revalidate: CUTOVER_STATUS_REVALIDATE_SECONDS }
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { cutover_confirmed?: boolean } | null;
    return body?.cutover_confirmed === true ? `${base}${path}` : null;
  } catch {
    return null;
  }
}
