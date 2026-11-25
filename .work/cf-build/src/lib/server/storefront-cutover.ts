/**
 * Storefront_Cutover status for the Legacy_Storefront (Req 23.5, 23.6, 23.7).
 * Reads public.storefront_cutover_status() with the anon key and caches it for 60 seconds.
 * A failed read never redirects, so a Supabase outage cannot take the Legacy_Storefront down before the cutover.
 */
export const STOREFRONT_CUTOVER_REVALIDATE_SECONDS = 60;
/** Payments created before the confirmation keep being processed by the Razorpay webhook for 7 days. */
export const WEBHOOK_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export interface StorefrontCutoverStatus {
  confirmed: boolean;
  confirmedAt: Date | null;
}

export function storefrontUrl(): string | null {
  const url = (process.env.STOREFRONT_URL ?? process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "").trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(url) ? url : null;
}

/** 301 target: the same path and query at the Storefront URL. */
export function storefrontRedirectUrl(base: string, pathname: string, search = ""): string {
  return `${base.replace(/\/+$/, "")}${pathname.startsWith("/") ? pathname : `/${pathname}`}${search}`;
}

/** Routes that must keep answering on the Legacy_Storefront after the confirmation: the payment webhook and the order route's own 410. */
export function isLegacyApiRoute(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function webhookWindowOpen(status: StorefrontCutoverStatus, now: Date = new Date()): boolean {
  if (!status.confirmed) return true;
  if (!status.confirmedAt) return false;
  return now.getTime() - status.confirmedAt.getTime() <= WEBHOOK_GRACE_MS;
}

export async function storefrontCutoverStatus(): Promise<StorefrontCutoverStatus> {
  const open: StorefrontCutoverStatus = { confirmed: false, confirmedAt: null };
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabase || !anon) return open;
  try {
    const res = await fetch(`${supabase}/rest/v1/rpc/storefront_cutover_status`, {
      method: "POST",
      headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
      body: "{}",
      next: { revalidate: STOREFRONT_CUTOVER_REVALIDATE_SECONDS }
    });
    if (!res.ok) return open;
    const body = (await res.json()) as { cutover_confirmed?: boolean; confirmed_at?: string | null } | null;
    if (body?.cutover_confirmed !== true) return open;
    const at = body.confirmed_at ? new Date(body.confirmed_at) : null;
    return { confirmed: true, confirmedAt: at && !Number.isNaN(at.getTime()) ? at : null };
  } catch {
    return open;
  }
}

/** Returns the Storefront URL to 301 to once the cutover is confirmed, otherwise null. */
export async function storefrontRedirectTarget(pathname: string, search = ""): Promise<string | null> {
  const base = storefrontUrl();
  if (!base) return null;
  const status = await storefrontCutoverStatus();
  return status.confirmed ? storefrontRedirectUrl(base, pathname, search) : null;
}
