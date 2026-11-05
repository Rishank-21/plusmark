"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AddressBlock, DispatchBlock, OrderLinesTable, PaymentStateNote, TotalsTable } from "@/components/checkout/OrderRecordParts";
import { OrderTimeline, timelineSummary } from "@/components/checkout/OrderTimeline";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Breadcrumbs } from "@/components/ui/Nav";
import { EmptyState, Notice } from "@/components/ui/States";
import { demoOrders } from "@/lib/demo-data";
import { validateEmail } from "@/lib/validation";
import { useSession } from "@/state/session";
import type { Order } from "@/types";

export function TrackOrderPanel({ initialReference }: { initialReference: string }) {
  const session = useSession();
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const lookup = (event: React.FormEvent) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    if (!reference.trim() || emailError) {
      setError(!reference.trim() ? "Enter the order reference." : emailError);
      setOrder(null);
      return;
    }
    const needle = reference.trim().toUpperCase();
    const match = [...session.orders, ...demoOrders].find(
      (candidate) => candidate.reference.toUpperCase() === needle && candidate.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!match) {
      setOrder(null);
      setError("No order in this browser matches that reference and email. Prototype orders do not transfer between devices.");
      return;
    }
    setError(null);
    setOrder(match);
  };

  return (
    <div className="pm-shell py-2xl lg:py-3xl [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_h4]:font-sans">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Track an order" }]} />
      <div className="mt-md grid items-start gap-2xl lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <h1 className="font-sans text-h1 text-navy">Track an order</h1>
          <p className="max-w-reading text-body-sm leading-relaxed text-graphite">
            Enter the reference and email on the order. Only stages actually recorded are shown; delivery dates are never guessed.
          </p>
          <Notice tone="info" title="Browser-local prototype tracking">
            This looks up records stored on this device plus clearly labelled demonstration records. It is not connected to
            Plusmark or a carrier, and it cannot show the status of a real order.
          </Notice>
        </div>
        <form onSubmit={lookup} noValidate className="flex flex-col gap-md rounded-sm border border-hair bg-surface p-lg">
          <TextField
            id="track-reference"
            label="Order reference"
            required
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="PM-26-1001"
            autoCapitalize="characters"
          />
          <TextField
            id="track-email"
            label="Email on the order"
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error && <p role="alert" className="text-body-sm font-medium text-danger">{error}</p>}
          <Button type="submit">
            <Search className="size-4" aria-hidden />
            Find this order
          </Button>
        </form>
      </div>

      {order && (
        <section aria-labelledby="tracking-result" className="mt-3xl border-t border-hair pt-2xl">
          <p className="sr-only" aria-live="polite">{timelineSummary(order)}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="tracking-result" className="font-sans text-h2 text-navy">Order {order.reference}</h2>
            <StatusBadge status={order.status} demo />
            <Badge tone="neutral">No live carrier feed</Badge>
          </div>
          <div className="mt-xl grid items-start gap-xl lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="flex flex-col gap-xl">
              <OrderTimeline order={order} />
              <OrderLinesTable order={order} />
              <div className="grid gap-md md:grid-cols-2">
                <DispatchBlock order={order} />
                <PaymentStateNote order={order} settled={order.paymentStatus === "paid"} />
              </div>
              <AddressBlock title="Delivery address" address={order.shippingAddress} />
            </div>
            <aside className="rounded-sm border border-hair bg-surface p-md">
              <TotalsTable order={order} />
              <ButtonLink href={`/order-confirmation?ref=${encodeURIComponent(order.reference)}`} variant="secondary" fullWidth className="mt-md">
                Open full order record
              </ButtonLink>
            </aside>
          </div>
        </section>
      )}

      {session.hydrated && session.orders.length === 0 && !order && (
        <div className="mt-2xl">
          <EmptyState
            compact
            title="No prototype orders recorded on this device yet"
            body="Place an order through the checkout to create a local record you can look up here, or browse the catalogue."
            action={{ label: "Browse boards", href: "/shop" }}
          />
        </div>
      )}
    </div>
  );
}
