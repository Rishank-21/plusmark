"use client";

import { useState } from "react";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { classNames } from "@/lib/format";
import { DEMO_PRICING_ENABLED, DEMO_PRICING_LABEL } from "@/lib/config";
import { formatInr } from "@/lib/format";
import type { CartLineView, CartTotals, Coupon, ShippingMethod } from "@/types";

export interface GstRow {
  ratePercent: number;
  taxableInr: number;
  gstInr: number;
}

/**
 * Totals panel for cart and checkout. Every figure is flagged with
 * DEMO_PRICING_LABEL because the storefront publishes no list prices, and the
 * unconfigured freight state is shown instead of an invented amount.
 */
export function OrderSummary({
  lines,
  totals,
  shippingMethod,
  coupon,
  gstRows,
  heading = "Order summary",
  children
}: {
  lines: CartLineView[];
  totals: CartTotals;
  shippingMethod: ShippingMethod;
  coupon: Coupon | null;
  gstRows: GstRow[];
  heading?: string;
  children?: React.ReactNode;
}) {
  const [showGst, setShowGst] = useState(false);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const freightPending = totals.shippingInr === null && !totals.pricingIncomplete;
  const linesUnpriced = lines.some((line) => line.lineTotalInr === null || line.problem !== null);

  return (
    <section aria-label={heading} className="flex flex-col gap-4 rounded-sm border border-hair bg-surface p-md">
      <header className="flex items-baseline justify-between gap-3 border-b border-hair pb-3">
        <h2 className="font-display text-h4">{heading}</h2>
        <p className="tabular text-caption text-graphite">
          {itemCount} {itemCount === 1 ? "unit" : "units"}
        </p>
      </header>

      <dl className="flex flex-col text-body-sm">
        <SummaryRow label="Subtotal">
          {totals.subtotalInr === null ? (
            <UnpricedValue />
          ) : (
            <Money value={totals.subtotalInr} suffix={<DemoBadge label="Demo" />} />
          )}
        </SummaryRow>

        {coupon && (
          <SummaryRow label={`Coupon ${coupon.code}`} hint={coupon.description}>
            {totals.discountInr > 0 ? (
              <span className="tabular text-body-sm font-medium text-success">
                − {formatInr(totals.discountInr)}
              </span>
            ) : (
              <span className="text-caption text-warning">Not applicable yet</span>
            )}
          </SummaryRow>
        )}

        <SummaryRow label="GST">
          {totals.subtotalInr === null ? (
            <span className="text-caption text-graphite">On the confirmed invoice</span>
          ) : (
            <Money value={totals.gstInr} />
          )}
        </SummaryRow>

        {gstRows.length > 0 && (
          <div className="border-b border-hair py-2">
            <button
              type="button"
              onClick={() => setShowGst((current) => !current)}
              aria-expanded={showGst}
              className="text-caption font-medium text-ink underline decoration-hair-strong underline-offset-4 transition-colors hover:decoration-ink"
            >
              {showGst ? "Hide" : "Show"} GST breakdown by rate
            </button>
            {showGst && (
              <table className="mt-2 w-full text-caption">
                <caption className="sr-only">GST split by rate, on demo prices</caption>
                <thead>
                  <tr className="text-left text-graphite">
                    <th scope="col" className="font-medium">
                      Rate
                    </th>
                    <th scope="col" className="text-right font-medium">
                      Taxable
                    </th>
                    <th scope="col" className="text-right font-medium">
                      GST
                    </th>
                  </tr>
                </thead>
                <tbody className="tabular divide-y divide-hair">
                  {gstRows.map((row) => (
                    <tr key={row.ratePercent}>
                      <td className="py-1.5">{row.ratePercent}%</td>
                      <td className="py-1.5 text-right">{formatInr(row.taxableInr)}</td>
                      <td className="py-1.5 text-right">{formatInr(row.gstInr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <SummaryRow label={`Freight — ${shippingMethod.name}`}>
          {shippingMethod.priceInr === null ? (
            <span className="text-right text-caption font-medium text-warning">To be confirmed</span>
          ) : (
            <span className="tabular text-body-sm font-medium text-ink">
              {shippingMethod.priceInr === 0 ? "No charge" : formatInr(shippingMethod.priceInr)}
            </span>
          )}
        </SummaryRow>
        {shippingMethod.priceInr === null && (
          <p className="border-b border-hair pb-3 text-caption leading-relaxed text-graphite">
            Freight for {shippingMethod.name.toLowerCase()} is not configured yet, so no amount is shown. Plusmark
            confirms it on the invoice once the pincode and load are fixed.
          </p>
        )}

        <div className="flex items-baseline justify-between gap-4 pt-3">
          <dt className="text-body font-medium text-ink">Total</dt>
          <dd>
            {totals.totalInr === null ? (
              <span className="text-body-sm font-medium text-graphite">
                {linesUnpriced ? "Price on request" : freightPending ? "Confirmed with freight" : "To be confirmed"}
              </span>
            ) : (
              <span className="tabular text-price font-medium text-ink">{formatInr(totals.totalInr)}</span>
            )}
          </dd>
        </div>
      </dl>

      {DEMO_PRICING_ENABLED && (
        <p className="rounded-xs border border-dashed border-hair-strong bg-sand/40 px-3 py-2 text-caption leading-relaxed text-graphite">
          <DemoBadge label="Demo pricing" className="mr-2 align-middle" />
          {DEMO_PRICING_LABEL}. Plusmark does not publish list prices, so these totals exist only to exercise the
          ordering flow.
        </p>
      )}

      {totals.subtotalInr !== null && (
        <p className="text-caption leading-relaxed text-graphite">
          Indicative only. Prices, stock and GST are confirmed by the Plusmark order desk; this page is never
          authoritative for any of them.
        </p>
      )}

      {children && <div className="flex flex-col gap-2 border-t border-hair pt-4">{children}</div>}

      <div className="flex flex-wrap items-center gap-2 border-t border-hair pt-3">
        <Badge tone="neutral">Not a reservation</Badge>
        <p className="text-caption text-graphite-light">Adding to the cart does not hold stock or a price.</p>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hair py-2.5">
      <dt className={classNames("text-graphite", hint && "flex flex-col gap-0.5")}>
        {hint ? (
          <>
            <span className="text-body-sm">{label}</span>
            <span className="text-caption text-graphite-light">{hint}</span>
          </>
        ) : (
          label
        )}
      </dt>
      <dd className="shrink-0 text-right">{children}</dd>
    </div>
  );
}

function Money({ value, suffix }: { value: number; suffix?: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="tabular text-body-sm font-medium text-ink">{formatInr(value)}</span>
      {suffix}
    </span>
  );
}

function UnpricedValue() {
  return <span className="text-caption font-medium text-graphite">Price on request</span>;
}
