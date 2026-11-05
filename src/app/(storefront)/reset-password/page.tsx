import type { Metadata } from "next";
import { ResetPasswordPanel } from "@/components/account/PasswordForms";

export const metadata: Metadata = { title: "Choose a new password — Plusmark", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return <ResetPasswordPanel />;
}
