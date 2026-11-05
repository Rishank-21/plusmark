import type { Metadata } from "next";
import { AccountApp } from "@/components/account/AccountApp";

export const metadata: Metadata = { title: "Saved boards — Plusmark", robots: { index: false, follow: false } };

export default function AccountWishlistPage() {
  return <AccountApp section="wishlist" />;
}
