import type { Metadata } from "next";
import { TrackOrderPanel } from "@/components/account/TrackOrderPanel";

export const metadata: Metadata = { title: "Track an order — Plusmark" };

export default async function TrackOrderPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <TrackOrderPanel initialReference={typeof params.ref === "string" ? params.ref : ""} />;
}
