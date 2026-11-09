"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
    <section aria-label={heading} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-card lg:gap-4 lg:rounded-2xl lg:p-5">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-h4 font-bold text-ink">{heading}</h2>
        <p className="tabular text-caption text-muted">
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
            <span className="text-caption text-muted">On the confirmed invoice</span>
          ) : (
            <Money value={totals.gstInr} />
          )}
        </SummaryRow>

        {gstRows.length > 0 && (
          <div className="border-b border-line py-0.5 lg:border-0 lg:py-2">
            <button
              type="button"
              onClick={() => setShowGst((current) => !current)}
              aria-expanded={showGst}
              className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-[0.875rem] font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink lg:min-h-0 lg:text-caption"
            >
              <span>
                {showGst ? "Hide" : "Show"} GST breakdown by rate
              </span>
              <ChevronDown
                className={classNames("size-4 shrink-0 text-muted transition-transform lg:hidden", showGst && "rotate-180")}
                aria-hidden
              />
            </button>
            {showGst && (
              <table className="mt-2 w-full text-caption">
                <caption className="sr-only">GST split by rate, on demo prices</caption>
                <thead>
                  <tr className="text-left text-muted">
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
                <tbody className="tabular divide-y divide-line">
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
          <p className="pb-1 text-caption leading-relaxed text-muted">
            Freight for {shippingMethod.name.toLowerCase()} is not configured yet, so no amount is shown. Plusmark
            confirms it on the invoice once the pincode and load are fixed.
          </p>
        )}

        <div className="mt-1 flex items-baseline justify-between gap-4 rounded-xl bg-subtle/70 px-4 py-3">
          <dt className="text-body font-semibold text-ink">Total</dt>
          <dd>
            {totals.totalInr === null ? (
              <span className="text-body-sm font-medium text-muted">
                {linesUnpriced ? "Price on request" : freightPending ? "Confirmed with freight" : "To be confirmed"}
              </span>
            ) : (
              <span className="tabular font-display text-price font-bold text-ink">{formatInr(totals.totalInr)}</span>
            )}
          </dd>
        </div>
      </dl>

      {DEMO_PRICING_ENABLED && (
        <p className="rounded-xs border border-dashed border-line-strong bg-subtle/70 px-3 py-2 text-caption leading-relaxed text-muted">
          <DemoBadge label="Demo pricing" className="mr-2 align-middle" />
          {DEMO_PRICING_LABEL}. Plusmark does not publish list prices, so these totals exist only to exercise the
          ordering flow.
        </p>
      )}

      {totals.subtotalInr !== null && (
        <p className="text-caption leading-relaxed text-muted">
          Indicative only. Prices, stock and GST are confirmed by the Plusmark order desk; this page is never
          authoritative for any of them.
        </p>
      )}

      {children && <div className="flex flex-col gap-2 pt-1">{children}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">Not a reservation</Badge>
        <p className="text-caption text-muted">Adding to the cart does not hold stock or a price.</p>
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
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
      <dt className={classNames("text-muted", hint && "flex flex-col gap-0.5")}>
        {hint ? (
          <>
            <span className="text-body-sm">{label}</span>
            <span className="text-caption text-muted">{hint}</span>
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
  return <span className="text-caption font-medium text-muted">Price on request</span>;
}
