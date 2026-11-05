import type { Metadata } from "next";
import { ForgotPasswordPanel } from "@/components/account/PasswordForms";
import { safeNextPath } from "@/lib/validation";

export const metadata: Metadata = { title: "Reset your password — Plusmark", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  return <ForgotPasswordPanel next={next} />;
}
