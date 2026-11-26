/**
 * Admin calls to the Plusmark backend. Every call runs with the signed-in administrator's session:
 * the database only answers when the role is admin AND the authenticator code (TOTP) was entered.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseBrowserClient } from "@/lib/supabase/client";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function db(): SupabaseClient<any, "public", any> {
  return requireSupabaseBrowserClient() as unknown as SupabaseClient;
}

function friendly(message: string): string {
  if (/TOTP verification required/i.test(message)) return "Your admin session needs the authenticator code. Sign in again.";
  if (/permission denied|row-level security/i.test(message)) return "You do not have permission to do that. Sign in again with your authenticator code.";
  if (/duplicate key/i.test(message)) return "That value already exists. Choose a different one.";
  if (/violates foreign key/i.test(message)) return "That is still in use by other records.";
  return message;
}

export async function rpc<T = Json>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await db().rpc(name, args);
  if (error) throw new Error(friendly(error.message));
  return data as T;
}

/** Table read with a builder callback, for simple screens. */
export async function select<T = Json[]>(table: string, build: (q: ReturnType<ReturnType<typeof db>["from"]>) => PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await build(db().from(table));
  if (error) throw new Error(friendly(error.message));
  return (data ?? []) as T;
}

export async function write(promise: PromiseLike<{ error: { message: string } | null }>): Promise<void> {
  const { error } = await promise;
  if (error) throw new Error(friendly(error.message));
}

export async function callFunction<T = Json>(name: string, body: unknown): Promise<T> {
  const { data } = await db().auth.getSession();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${data.session?.access_token ?? SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };
  if (!response.ok) throw new Error(payload.message ?? payload.error ?? "The request failed.");
  return payload;
}

export async function openInvoiceAsAdmin(orderId: string): Promise<void> {
  const { data } = await db().auth.getSession();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify({ order_id: orderId })
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? "The invoice could not be opened.");
  }
  const url = URL.createObjectURL(await response.blob());
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export const inr = (value: unknown): string =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const when = (value: unknown): string =>
  value ? new Date(String(value)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : "";

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const cell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((c) => cell(row[c])).join(","))].join("\n");
}

export function downloadText(filename: string, text: string, type = "text/csv"): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}
