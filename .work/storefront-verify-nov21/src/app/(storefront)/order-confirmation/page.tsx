import type { Metadata } from "next";
import { OrderConfirmationPanel } from "@/components/checkout/OrderConfirmationPanel";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false, follow: false } };
export const dynamic = "force-static";

export default function OrderConfirmationPage() {
  return <OrderConfirmationPanel />;
}
