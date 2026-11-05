import type { Metadata } from "next";
import { WishlistView } from "@/components/account/WishlistView";

export const metadata: Metadata = { title: "Saved boards — Plusmark" };

export default function WishlistPage() {
  return <WishlistView />;
}
