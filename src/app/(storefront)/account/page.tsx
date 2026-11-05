import type { Metadata } from "next";
import { AccountApp } from "@/components/account/AccountApp";

export const metadata: Metadata = { title: "My account — Plusmark", robots: { index: false, follow: false } };

export default function AccountPage() {
  return <AccountApp section="overview" />;
}
