"use client";

import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { AddressBlock, DispatchBlock, OrderLinesTable, PaymentStateNote, TotalsTable } from "@/components/checkout/OrderRecordParts";
import { OrderTimeline } from "@/components/checkout/OrderTimeline";
import { Badge, DemoBadge, StatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { Breadcrumbs } from "@/components/ui/Nav";
import { DEMO_PRICING_LABEL } from "@/lib/config";
import { demoOrders } from "@/lib/demo-data";
import { formatDate, formatInr } from "@/lib/format";
import { useSession } from "@/state/session";

/**
 * Confirmation screen. Reads the order back out of the session's records so the
 * reference on the URL is a real lookup, not a hard-coded success message.
 */
export function OrderConfirmationPanel({ reference }: { reference: string | null }) {
  const session = useSession();

  if (!session.hydrated) {
    return (
      <div className="pm-shell py-2xl lg:py-3xl" role="status" aria-live="polite">
        <span className="sr-only">Loading your order record</span>
        <Skeleton className="h-12 w-80" />
        <Skeleton className="mt-2xl h-64 w-full" />
      </div>
    );
  }

  if (!reference || !reference.trim()) {
    return (
      <div className="pm-shell py-2xl lg:py-3xl">
        <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Order confirmation" }]} />
        <h1 className="mt-md font-display text-display-sm">Which order?</h1>
        <p className="mt-md max-w-reading text-body-sm text-graphite">
          A confirmation needs the reference the order was recorded under. Look one up publicly, or open your order
          history if you placed it in this browser.
        </p>
        <div className="mt-lg flex flex-wrap gap-2">
          <ButtonLink href="/track-order">
            <Search className="size-4" aria-hidden />
            Track an order
          </ButtonLink>
          <ButtonLink href="/account/orders" variant="secondary">
            Order history
          </ButtonLink>
        </div>
      </div>
    );
  }

  const needle = reference.trim().toUpperCase();
  const order =
    session.orders.find((o) => o.reference.toUpperCase() === needle) ??
    demoOrders.find((o) => o.reference.toUpperCase() === needle) ??
    null;

  if (!order) {
    return (
      <div className="pm-shell py-2xl lg:py-3xl">
        <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Order confirmation" }]} />
        <h1 className="mt-md font-display text-display-sm">No record of {needle}</h1>
        <div className="mt-2xl">
          <ErrorState
            title="That reference is not in this browser"
            body="Orders placed here are stored on this device only. A different device, a cleared storage state or a mistyped reference all produce this screen — it does not mean the order was never placed."
            detail={`Searched: ${needle}`}
          />
          <div className="mt-lg flex flex-wrap gap-2">
            <ButtonLink href="/track-order" variant="secondary">
              Look it up by reference and email
            </ButtonLink>
            <ButtonLink href="/account/orders" variant="quiet">
              Open order history
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const local = session.orders.some((o) => o.reference.toUpperCase() === needle);
  const storedOnline = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.id);
  const paidOnline = storedOnline && order.paymentStatus === "paid";
  const totals = order.totals;

  return (
    <div className="pm-shell py-2xl lg:py-3xl">
      <Breadcrumbs
        trail={[{ label: "Home", href: "/" }, { label: "Checkout", href: "/checkout" }, { label: `Order ${order.reference}` }]}
      />

      <header className="mt-md flex flex-col gap-4 border-b border-hair pb-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <CheckCircle2 className="size-7 text-navy-deep" aria-hidden />
          <h1 className="font-display text-display-sm">Order {order.reference} recorded</h1>
          <StatusBadge status={order.status} demo />
        </div>
        <p className="max-w-reading text-body-sm text-graphite">
          {storedOnline ? (
            <>
              The order is recorded in your Plusmark account and the server has reserved stock against it.{" "}
              {paidOnline ? (
                <>
                  Razorpay&apos;s payment was verified on the server, so the order is marked{" "}
                  <strong className="font-medium text-ink">paid</strong>.
                </>
              ) : order.paymentMethod === "razorpay" ? (
                <>Payment is still pending gateway confirmation — it is never marked paid from the browser.</>
              ) : (
                <>Pay the courier on delivery; no payment has been taken yet.</>
              )}
            </>
          ) : (
            <>
              The order now exists as a record on this device, so tracking, order history and the fulfilment timeline all
              have genuine state to render. Nothing has been sent to Plusmark, no stock is held, and{" "}
              <strong className="font-medium text-ink">no payment has been taken</strong>.
            </>
          )}
        </p>
        <dl className="flex flex-wrap gap-x-2xl gap-y-3 text-caption">
          <div>
            <dt className="text-graphite-light">Placed</dt>
            <dd className="tabular mt-0.5 text-ink">{formatDate(order.placedAt)}</dd>
          </div>
          <div>
            <dt className="text-graphite-light">Order email</dt>
            <dd className="mt-0.5 text-ink">{order.email}</dd>
          </div>
          <div>
            <dt className="text-graphite-light">Total</dt>
            <dd className="tabular mt-0.5 text-ink">
              {totals.totalInr === null ? "Confirmed with freight" : formatInr(totals.totalInr)}
            </dd>
          </div>
          <div>
            <dt className="text-graphite-light">Stored</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-ink">
              {storedOnline ? "Your account (Supabase)" : local ? "This browser (localStorage)" : "Demonstration record"}
              {!storedOnline && <DemoBadge />}
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-2xl grid items-start gap-xl lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-2xl">
          <section aria-labelledby="confirm-items">
            <h2 id="confirm-items" className="mb-md font-display text-h2">
              What you ordered
            </h2>
            <OrderLinesTable order={order} />
          </section>

          <section aria-labelledby="confirm-addresses">
            <h2 id="confirm-addresses" className="mb-md font-display text-h2">
              Addresses on the order
            </h2>
            <div className="grid gap-md sm:grid-cols-2">
              <AddressBlock title="Deliver to" address={order.shippingAddress} />
              <AddressBlock
                title={order.billingAddress.id === order.shippingAddress.id ? "Invoice to (same as delivery)" : "Invoice to"}
                address={order.billingAddress}
              />
            </div>
          </section>

          <section aria-labelledby="confirm-dispatch">
            <h2 id="confirm-dispatch" className="mb-md font-display text-h2">
              Dispatch and payment
            </h2>
            <div className="grid gap-md sm:grid-cols-2">
              <DispatchBlock order={order} />
              <PaymentStateNote order={order} settled={order.paymentStatus === "paid"} />
            </div>
            <div className="mt-lg">
              <h3 className="mb-md font-display text-h4">Where this order stands</h3>
              <OrderTimeline order={order} compact />
            </div>
          </section>

          <section aria-labelledby="confirm-next">
            <h2 id="confirm-next" className="mb-md font-display text-h2">
              What happens next
            </h2>
            <ol className="flex flex-col gap-3 border-y border-hair py-lg">
              {[
                "In production, the Plusmark order desk reads the specification and confirms the size, series and finish with you.",
                "Freight is fixed for your pincode and load, and the GST invoice is raised — until then the total above is not final.",
                "Manufacturing starts at the Narolgam works after the advance or proforma is agreed.",
                "A dispatch note with the consignment label follows. The carrier feed is not connected here, so the last logged stage is what you will see."
              ].map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-hair-strong text-[0.6875rem] text-graphite">
                    {index + 1}
                  </span>
                  <span className="text-body-sm text-graphite">{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-md text-caption leading-relaxed text-graphite">
              {storedOnline
                ? `The order is in the store database. Manufacturing, courier booking and email delivery are handled manually in this build. ${DEMO_PRICING_LABEL}.`
                : `In this prototype none of those steps is started automatically. ${DEMO_PRICING_LABEL}, and a recorded order is not a placed order with the works.`}
            </p>
          </section>
        </div>

        <aside className="flex flex-col gap-lg lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <div className="rounded-sm border border-hair bg-surface p-md">
            <h2 className="mb-md font-display text-h4">Order value</h2>
            <TotalsTable order={order} />
          </div>

          <nav aria-label="Order follow-up" className="flex flex-col gap-2 rounded-sm border border-hair bg-canvas p-md">
            <h2 className="font-display text-h4">Keep an eye on it</h2>
            <ButtonLink href={`/track-order?ref=${encodeURIComponent(order.reference)}`} fullWidth>
              Track this order
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href={`/account/orders/${order.id}`} variant="secondary" fullWidth>
              Open the order file
            </ButtonLink>
            <ButtonLink href="/account" variant="secondary" fullWidth>
              My account
            </ButtonLink>
            <ButtonLink href="/shop" variant="quiet" fullWidth className="justify-start">
              Continue shopping
            </ButtonLink>
            {!storedOnline && !session.user && (
              <div className="mt-1 flex flex-col gap-2 rounded-md border border-dashed border-hair-strong p-3">
                <p className="text-caption leading-relaxed text-graphite">
                  Keep this order and track future ones from any device.
                </p>
                <ButtonLink href="/register?next=/account" variant="secondary" fullWidth>
                  Create an account
                </ButtonLink>
              </div>
            )}
            <p className="text-caption leading-relaxed text-graphite">
              {storedOnline
                ? "This order is saved in your account, so the reference above is enough to reopen it on any device."
                : "Tracking needs the reference above plus the email on the order. Keep both — this browser is the only place the record exists."}
            </p>
            {!storedOnline && <Badge tone="neutral">Prototype order record</Badge>}
          </nav>
        </aside>
      </div>
    </div>
  );
}
