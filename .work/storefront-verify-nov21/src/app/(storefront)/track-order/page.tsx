import type { Metadata } from "next";
import { TrackOrderPanel } from "@/components/account/TrackOrderPanel";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Track an order",
  path: "/track-order",
  description: "Look up a Plusmark order with the reference from your confirmation.",
  noindex: true
});
export const dynamic = "force-static";

export default function TrackOrderPage() {
  return <TrackOrderPanel />;
}
