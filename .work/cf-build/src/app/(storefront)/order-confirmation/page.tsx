import type { Metadata } from "next";
import { OrderConfirmationPanel } from "@/components/checkout/OrderConfirmationPanel";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false, follow: false } };

export default async function OrderConfirmationPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : null;
  return <OrderConfirmationPanel reference={ref} />;
}
