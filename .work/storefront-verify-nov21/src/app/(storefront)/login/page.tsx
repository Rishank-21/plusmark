import type { Metadata } from "next";
import { AuthPanel } from "@/components/account/AuthPanel";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-static";

export default function LoginPage() {
  return <AuthPanel mode="sign-in" />;
}
