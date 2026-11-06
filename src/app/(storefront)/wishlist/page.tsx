import type { Metadata } from "next";
import { WishlistView } from "@/components/account/WishlistView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Saved boards",
  path: "/wishlist",
  description: "Boards saved on this device or Plusmark account.",
  noindex: true
});

export default function WishlistPage() {
  return <WishlistView />;
}
