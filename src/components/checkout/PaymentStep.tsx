"use client";

import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RadioCard } from "@/components/ui/Field";
import { formatInr } from "@/lib/format";

export type PaymentChoice = "cod" | "razorpay";

/**
 * Two options, no card fields. Online payments are handed to the gateway's
 * hosted checkout; this page never collects or stores payment credentials.
 */
export function PaymentStep({
  choice,
  onChoose,
  amountDue,
  onlineEnabled,
  onlineReason
}: {
  choice: PaymentChoice;
  onChoose: (next: PaymentChoice) => void;
  amountDue: number | null;
  onlineEnabled: boolean;
  onlineReason: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Payment method</legend>
        <RadioCard
          name="payment-method"
          value="cod"
          checked={choice === "cod"}
          onChange={() => onChoose("cod")}
          title="Cash on delivery"
          description="Pay the courier when the boards arrive."
          meta={<Badge tone="navy">Available</Badge>}
        />
        <RadioCard
          name="payment-method"
          value="razorpay"
          checked={choice === "razorpay"}
          disabled={!onlineEnabled}
          onChange={() => onChoose("razorpay")}
          title="Pay online"
          description="UPI, card or net banking in Razorpay's hosted checkout. Plusmark never sees your details."
          meta={onlineEnabled ? <Badge tone="navy">Available</Badge> : <Badge tone="neutral">Not available</Badge>}
        />
      </fieldset>

      {!onlineEnabled && (
        <p className="flex items-start gap-1.5 text-caption leading-relaxed text-graphite">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {onlineReason}
        </p>
      )}

      <p className="tabular text-caption text-graphite">
        {amountDue === null
          ? "Freight is confirmed on the invoice; the total is not final yet."
          : choice === "cod"
            ? `${formatInr(amountDue)} payable on delivery.`
            : `${formatInr(amountDue)} payable in Razorpay.`}
      </p>
    </div>
  );
}
