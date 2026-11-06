import type { Metadata } from "next";
import { VerifyEmailPanel } from "@/components/account/PasswordForms";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false, follow: false } };

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";
  const verified = params.verified === "1";
  return <VerifyEmailPanel email={email} verified={verified} />;
}
