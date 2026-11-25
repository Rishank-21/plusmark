import type { Metadata } from "next";
import { VerifyEmailPanel } from "@/components/account/PasswordForms";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false, follow: false } };
export const dynamic = "force-static";

export default function VerifyEmailPage() {
  return <VerifyEmailPanel />;
}
