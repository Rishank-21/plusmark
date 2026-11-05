"use client";

import { RadioCard } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Notice } from "@/components/ui/States";
import { useLiveShipping } from "@/components/checkout/shipping-store";
import { SHIPPING_METHODS } from "@/lib/pricing";
import { formatInr } from "@/lib/format";
import type { ShippingMethod } from "@/types";

/**
 * Shipping picker. Unavailable methods are shown and explained rather than
 * hidden, and an unconfigured method never gets an invented amount or ETA.
 */
export function ShippingStep({
  selectedId,
  onSelect
}: {
  selectedId: string;
  onSelect: (method: ShippingMethod) => void;
}) {
  const feed = useLiveShipping();
  const methods = feed.state === "ready" ? feed.methods : SHIPPING_METHODS;

  return (
    <div className="flex flex-col gap-md">
      <p className="text-body-sm text-graphite">
        Only the dispatch methods configured in the operations desk are offered. A method without a configured charge
        means the freight figure is fixed on the invoice, after the pincode and load are known.
      </p>

      {feed.state === "error" ? (
        <Notice tone="warning" title="Live freight options could not be loaded">
          Showing the last published list. Charges and availability may be out of date until the connection returns.
        </Notice>
      ) : null}

      {feed.state === "ready" && feed.methods.length === 0 ? (
        <Notice tone="warning" title="No dispatch method is configured">
          The works has not published a freight option yet. Contact Plusmark before paying; no charge has been invented
          here.
        </Notice>
      ) : null}

      <fieldset className="flex flex-col gap-2.5">
        <legend className="pm-eyebrow mb-2">Dispatch method</legend>
        {methods.map((method) => {
          const selected = method.id === selectedId;
          return (
            <RadioCard
              key={method.id}
              name="shipping-method"
              value={method.id}
              checked={selected}
              disabled={!method.available}
              onChange={() => onSelect(method)}
              title={method.name}
              description={method.description}
              meta={<FreightMeta method={method} />}
            />
          );
        })}
      </fieldset>

      <Notice
        tone="neutral"
        title="Delivery dates are not published on this page"
        icon={<Badge tone="neutral">Configurable</Badge>}
      >
        Lead time depends on the series, the size and whether the consignment is palletised. The works confirms it with
        the invoice. These cards are driven from the same freight table the admin maintains.
      </Notice>
    </div>
  );
}

function FreightMeta({ method }: { method: ShippingMethod }) {
  if (!method.available) return <Badge tone="neutral">Not available yet</Badge>;
  if (method.priceInr === null) return <Badge tone="warning">Charge not configured</Badge>;
  return <span className="tabular">{method.priceInr === 0 ? "No charge" : formatInr(method.priceInr)}</span>;
}
