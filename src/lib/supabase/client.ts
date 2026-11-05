import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

export type SupabaseBrowserClient = SupabaseClient<Database>;

let browserClient: SupabaseBrowserClient | null = null;

export function getSupabaseBrowserClient(): SupabaseBrowserClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { flowType: "pkce", detectSessionInUrl: true }
    });
  }
  return browserClient;
}

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    this.name = "BackendNotConfiguredError";
  }
}

export function requireSupabaseBrowserClient(): SupabaseBrowserClient {
  const client = getSupabaseBrowserClient();
  if (!client) throw new BackendNotConfiguredError();
  return client;
}
