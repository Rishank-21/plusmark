import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { requestUser } from "@/lib/server/request-auth";
import { serverSupabase } from "@/lib/server/supabase-admin";

type AdminResult = { user: User; response?: never } | { user?: never; response: NextResponse };

/** Server-side admin gate for media routes; the profile role is the authority. */
export async function requestAdmin(request: Request): Promise<AdminResult> {
  const user = await requestUser(request);
  if (!user) {
    return { response: NextResponse.json({ error: "Sign in as an administrator." }, { status: 401 }) };
  }

  try {
    const { data, error } = await serverSupabase()
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (data?.role !== "admin") {
      return { response: NextResponse.json({ error: "Administrator access is required." }, { status: 403 }) };
    }
  } catch {
    return { response: NextResponse.json({ error: "The administrator check could not be completed." }, { status: 503 }) };
  }

  return { user };
}
