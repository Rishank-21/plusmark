import type { Metadata } from "next";
import { TrackOrderPanel } from "@/components/account/TrackOrderPanel";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Track an order",
  path: "/track-order",
  description: "Look up a Plusmark order with the reference from your confirmation.",
  noindex: true
});

export default async function TrackOrderPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <TrackOrderPanel initialReference={typeof params.ref === "string" ? params.ref : ""} />;
}
