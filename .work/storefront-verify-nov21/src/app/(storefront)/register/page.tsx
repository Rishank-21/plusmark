import type { Metadata } from "next";
import { AuthPanel } from "@/components/account/AuthPanel";

export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };
export const dynamic = "force-static";

export default function RegisterPage() {
  return <AuthPanel mode="register" />;
}
