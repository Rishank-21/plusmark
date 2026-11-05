"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { paymentMethodLabel } from "@/components/checkout/order-display";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Notice, Skeleton } from "@/components/ui/States";
import { formatDate, formatInr } from "@/lib/format";
import { listOrders } from "@/lib/supabase/account";
import { useSession } from "@/state/session";
import type { Order } from "@/types";

export function InvoiceView({ orderId }: { orderId: string }) {
  const session = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const local = session.orders.find((entry) => entry.id === orderId) ?? null;
    if (local) {
      setOrder(local);
      setLoading(false);
      return;
    }
    if (!session.user) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    listOrders()
      .then((rows) => {
        if (alive) setOrder(rows.find((entry) => entry.id === orderId) ?? null);
      })
      .catch((cause) => {
        if (alive) setError(cause instanceof Error ? cause.message : "The invoice could not be loaded.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [orderId, session.user, session.orders]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10" role="status" aria-live="polite">
        <span className="sr-only">Loading the invoice</span>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <Notice tone="danger" title="Invoice could not be loaded">
          {error}
        </Notice>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <Notice tone="warning" title="Invoice not available">
          This order is not in your account.{" "}
          <Link href="/login?next=/account/orders" className="underline decoration-hair-strong underline-offset-4">
            Sign in
          </Link>{" "}
          with the account that placed it, or contact the store with the order reference.
        </Notice>
      </div>
    );
  }

  const amountDue = order.paymentStatus !== "paid" && order.paymentStatus !== "refunded";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="pm-print-hide mb-5 flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href={`/account/orders/${order.id}`} variant="secondary" size="sm" className="h-10 rounded-lg">
          <ArrowLeft className="size-4" aria-hidden />
          Back to order
        </ButtonLink>
        <Button size="sm" className="h-10 rounded-lg" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden />
          Print / save as PDF
        </Button>
      </div>

      <div className="pm-invoice rounded-md border border-hair bg-white p-6 shadow-card sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-hair pb-6">
          <div>
            <p className="text-[1.35rem] font-semibold tracking-[-0.01em] text-ink">Plusmark Retail</p>
            <p className="mt-1 text-caption leading-relaxed text-graphite">
              Writing &amp; display boards
              <br />
              Ahmedabad, Gujarat, India
            </p>
          </div>
          <div className="text-right">
            <p className="text-label font-medium uppercase tracking-[0.12em] text-graphite">Tax invoice</p>
            <p className="tabular mt-1 text-body font-semibold text-ink">{order.invoiceNumber ?? "Not assigned"}</p>
            <p className="tabular mt-1 text-caption text-graphite">Order {order.reference}</p>
            <p className="mt-1 text-caption text-graphite">{formatDate(order.placedAt)}</p>
          </div>
        </div>

        <div className="grid gap-6 border-b border-hair py-6 sm:grid-cols-2">
          <div>
            <p className="text-label font-medium uppercase tracking-[0.12em] text-graphite">Billed to</p>
            <address className="mt-2 text-body-sm not-italic leading-relaxed text-ink">
              {order.billingAddress.recipientName}
              <br />
              {order.billingAddress.line1}
              {order.billingAddress.line2 && (
                <>
                  <br />
                  {order.billingAddress.line2}
                </>
              )}
              <br />
              {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.pincode}
              <br />
              {order.billingAddress.phone}
              <br />
              {order.email}
            </address>
          </div>
          <div>
            <p className="text-label font-medium uppercase tracking-[0.12em] text-graphite">Delivered to</p>
            <address className="mt-2 text-body-sm not-italic leading-relaxed text-ink">
              {order.shippingAddress.recipientName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              )}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </address>
          </div>
        </div>

        <div className="overflow-x-auto py-6">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair">
                {["Item", "SKU", "Qty", "Rate", "Amount"].map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className={`pb-2 text-label font-medium uppercase tracking-[0.1em] text-graphite ${index > 2 ? "text-right" : ""}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {order.lines.map((line) => (
                <tr key={line.id}>
                  <th scope="row" className="py-3 pr-3 text-body-sm font-medium text-ink">
                    {line.name}
                    <span className="block text-caption font-normal text-graphite">{line.variantLabel}</span>
                  </th>
                  <td className="tabular py-3 pr-3 text-caption text-graphite">{line.sku}</td>
                  <td className="tabular py-3 pr-3 text-body-sm">{line.quantity}</td>
                  <td className="tabular py-3 pr-3 text-right text-body-sm">{formatInr(line.unitPriceInr)}</td>
                  <td className="tabular py-3 text-right text-body-sm font-medium">{formatInr(line.lineTotalInr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto flex w-full max-w-xs flex-col gap-2 border-t border-hair pt-4 text-body-sm">
          <div className="flex justify-between gap-4">
            <span className="text-graphite">Subtotal</span>
            <span className="tabular">{order.totals.subtotalInr === null ? "—" : formatInr(order.totals.subtotalInr)}</span>
          </div>
          {order.totals.discountInr > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-graphite">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span className="tabular">− {formatInr(order.totals.discountInr)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-graphite">GST</span>
            <span className="tabular">{formatInr(order.totals.gstInr)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-graphite">Freight</span>
            <span className="tabular">{order.totals.shippingInr === null ? "To confirm" : formatInr(order.totals.shippingInr)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-4 border-t border-hair pt-2 text-body font-semibold text-ink">
            <span>Total</span>
            <span className="tabular">{order.totals.totalInr === null ? "To confirm" : formatInr(order.totals.totalInr)}</span>
          </div>
          <p className="mt-2 text-caption leading-relaxed text-graphite">
            {paymentMethodLabel(order.paymentMethod)} ·{" "}
            {amountDue ? "Payment is recorded as pending. It is never marked paid from a browser." : "Recorded as paid."}
          </p>
        </div>

        <div className="mt-8 border-t border-hair pt-4 text-caption leading-relaxed text-graphite">
          <p className="font-medium text-ink">This template needs business verification before it is a GST document.</p>
          <p className="mt-1">
            The seller legal name, GSTIN, registered address, place of supply and HSN/SAC codes are not configured in this
            build, so they are deliberately left out rather than invented. Totals come from the recorded order. Add the
            seller details and serial-number series before issuing this invoice for tax purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
