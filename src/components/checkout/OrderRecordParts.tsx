"use client";

import Link from "next/link";
import { Banknote, ExternalLink, Info, MapPin } from "lucide-react";
import { Badge, DemoBadge, StatusBadge } from "@/components/ui/Badge";
import { paymentMethodLabel, paymentWording } from "@/components/checkout/order-display";
import { classNames, formatInr } from "@/lib/format";
import { DEMO_PRICING_LABEL } from "@/lib/config";
import type { AddressBookEntry, Order } from "@/types";

/** Shared read-only blocks for a recorded order: totals, addresses, lines. */

export function TotalsTable({ order, showDemoFlag = true }: { order: Order; showDemoFlag?: boolean }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Subtotal",
      value: order.totals.subtotalInr === null ? "On request" : formatInr(order.totals.subtotalInr)
    },
    {
      label: "Discount",
      value: order.totals.discountInr > 0 ? `− ${formatInr(order.totals.discountInr)}` : "None"
    },
    { label: "GST", value: formatInr(order.totals.gstInr) },
    {
      label: "Freight",
      value:
        order.totals.shippingInr === null ? (
          <span className="text-warning">To be confirmed</span>
        ) : order.totals.shippingInr === 0 ? (
          "No charge"
        ) : (
          formatInr(order.totals.shippingInr)
        )
    },
    {
      label: "Total",
      value:
        order.totals.totalInr === null ? (
          <span className="text-muted">Confirmed with freight</span>
        ) : (
          <span className="tabular text-price font-medium text-ink">{formatInr(order.totals.totalInr)}</span>
        )
    }
  ];

  return (
    <div className="flex flex-col">
      <table className="w-full text-body-sm">
        <caption className="sr-only">Order totals</caption>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="py-2.5 text-left font-normal text-muted">
                {row.label}
              </th>
              <td className="tabular py-2.5 text-right text-ink">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showDemoFlag && (
        <p className="mt-2 text-caption leading-relaxed text-muted">
          <DemoBadge label="Demo" className="mr-1.5 align-middle" />
          {DEMO_PRICING_LABEL}. The GST figure follows the demo rate card; Plusmark’s tax treatment is fixed on the
          invoice.
        </p>
      )}
      {order.totals.shippingInr === null && (
        <p className="mt-2 text-caption leading-relaxed text-warning">
          Freight is still open on this order, so the total is not final. Plusmark confirms it once the pincode and load
          are fixed.
        </p>
      )}
    </div>
  );
}

export function AddressBlock({
  title,
  address
}: {
  title: string;
  address: AddressBookEntry;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-sm border border-line bg-page p-4">
      <h3 className="pm-eyebrow flex items-center gap-1.5">
        <MapPin className="size-3.5" aria-hidden />
        {title}
      </h3>
      <p className="text-body-sm font-medium text-ink">{address.recipientName}</p>
      <p className="text-caption leading-relaxed text-muted">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p className="text-caption text-muted">
        {address.city}, {address.state} {address.pincode}
      </p>
      <p className="tabular text-caption text-muted">{address.phone}</p>
    </div>
  );
}

export function OrderLinesTable({ order }: { order: Order }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full min-w-[36rem] text-body-sm">
        <caption className="sr-only">Items in this order</caption>
        <thead>
          <tr className="border-b border-line bg-subtle/40 text-left text-caption text-muted">
            <th scope="col" className="px-3 py-2 font-medium">
              Item
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Size
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              SKU
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Qty
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Unit
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {order.lines.map((line) => (
            <tr key={line.id}>
              <td className="px-3 py-2.5">
                <Link
                  href={`/product/${line.slug}`}
                  className="rounded-xs text-ink transition-colors hover:text-ink hover:underline hover:decoration-line-strong hover:underline-offset-4"
                >
                  {line.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-muted">{line.variantLabel}</td>
              <td className="tabular px-3 py-2.5 text-caption text-muted">{line.sku}</td>
              <td className="tabular px-3 py-2.5 text-right text-ink">{line.quantity}</td>
              <td className="tabular px-3 py-2.5 text-right text-muted">{formatInr(line.unitPriceInr)}</td>
              <td className="tabular px-3 py-2.5 text-right font-medium text-ink">{formatInr(line.lineTotalInr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {order.lines.length === 0 && (
        <p className="border-t border-line px-3 py-3 text-caption text-muted">
          No item detail was stored with this record.
        </p>
      )}
    </div>
  );
}

export function PaymentStateNote({ order, settled }: { order: Order; settled: boolean }) {
  return (
    <div
      className={classNames(
        "flex items-start gap-3 rounded-sm border p-4",
        settled ? "border-line bg-subtle/40" : "border-warning/30 bg-warning-wash"
      )}
    >
      <Banknote className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-center gap-2 text-body-sm font-medium text-ink">
          <span>Payment — {order.paymentStatus.replace(/_/g, " ")}</span>
          <StatusBadge status={order.paymentStatus} demo />
        </p>
        <p className="text-caption leading-relaxed text-muted">{paymentWording(order.paymentStatus)}</p>
        <p className="text-caption text-muted">
          Method on record: {paymentMethodLabel(order.paymentMethod)}. Nothing on this page is evidence of a settled
          transaction — payment state becomes authoritative only when the server confirms it.
        </p>
      </div>
    </div>
  );
}

export function DispatchBlock({ order }: { order: Order }) {
  const shipment = order.shipment;
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-line bg-page p-4">
      <h3 className="pm-eyebrow flex items-center gap-1.5">
        <Info className="size-3.5" aria-hidden />
        Dispatch
      </h3>
      <p className="text-body-sm text-ink">
        {shipment?.carrier ?? "Not yet handed to a carrier"}
        {shipment?.carrier && <span className="text-caption text-muted"> · surface transit</span>}
      </p>
      {shipment?.awb && (
        <p className="tabular text-caption text-muted">
          Consignment number: {shipment.awb}
          <DemoBadge label="Carrier feed not integrated" className="ml-1.5 align-middle" />
        </p>
      )}
      {order.trackingUrl && (
        <a
          href={order.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-caption font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          Open carrier tracking
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
      {shipment?.etaTo && (
        <p className="text-caption text-muted">
          Window logged on the demo record: {new Date(shipment.etaFrom ?? shipment.etaTo).toLocaleDateString("en-IN")} –{" "}
          {new Date(shipment.etaTo).toLocaleDateString("en-IN")}
        </p>
      )}
      {!shipment && (
        <p className="text-caption leading-relaxed text-muted">
          No consignment exists for this order yet, so there is no tracking number to show. Plusmark publishes one only
          after the dispatch scan.
        </p>
      )}
      <p className="text-caption text-muted">
        Delivery dates are not invented here: freight rules and lead times are still being configured by Plusmark.
      </p>
      <Badge tone="neutral">Carrier feed not integrated</Badge>
    </div>
  );
}
