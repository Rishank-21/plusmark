import type { Metadata } from "next";
import { AuthPanel } from "@/components/account/AuthPanel";
import { safeNextPath } from "@/lib/validation";

export const metadata: Metadata = { title: "Sign in — Plusmark", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  return <AuthPanel mode="sign-in" next={next} />;
}
