import type { Metadata } from "next";
import { InvoiceView } from "@/components/account/InvoiceView";

export const metadata: Metadata = { title: "Invoice — Plusmark", robots: { index: false, follow: false } };
export const dynamic = "force-static";

export default function InvoicePage() {
  return <InvoiceView />;
}
