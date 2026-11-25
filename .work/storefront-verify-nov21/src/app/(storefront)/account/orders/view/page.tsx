import type { Metadata } from "next";
import { AccountApp } from "@/components/account/AccountApp";

export const metadata: Metadata = { title: "Order details — Plusmark", robots: { index: false, follow: false } };
export const dynamic = "force-static";

export default function AccountOrderViewPage() {
  return <AccountApp section="order" />;
}
