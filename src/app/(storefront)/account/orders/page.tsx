import type { Metadata } from "next";
import { AccountApp } from "@/components/account/AccountApp";

export const metadata: Metadata = { title: "Order history — Plusmark", robots: { index: false, follow: false } };

export default function AccountOrdersPage() {
  return <AccountApp section="orders" />;
}
