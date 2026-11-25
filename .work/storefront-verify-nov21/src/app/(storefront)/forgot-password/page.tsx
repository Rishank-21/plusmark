import type { Metadata } from "next";
import { ForgotPasswordPanel } from "@/components/account/PasswordForms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false, follow: false } };
export const dynamic = "force-static";

export default function ForgotPasswordPage() {
  return <ForgotPasswordPanel />;
}
