"use client";

import { useState } from "react";
import { BadgeCheck, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { checkCoupon, couponMeetsMinimum } from "@/components/checkout/cart-support";
import { useLiveCoupons } from "@/components/checkout/coupon-store";
import { formatDate, formatInr } from "@/lib/format";
import type { CartTotals } from "@/types";

/**
 * Coupon entry with the four honest states: applied, applied but below the
 * minimum spend, ended, and unknown. Codes are validated against the live
 * coupon table the admin writes to.
 */
function AppliedCoupon({ code, totals, onClear }: { code: string; totals: CartTotals; onClear: () => void }) {
  const resolved = checkCoupon(code);
  const coupon = resolved.kind === "valid" ? resolved.coupon : null;
  const belowMinimum = coupon !== null && !couponMeetsMinimum(coupon, totals.subtotalInr);

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-line bg-subtle/40 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-body-sm font-medium text-ink">
          <BadgeCheck className="size-4 text-success" aria-hidden />
          <span className="tabular uppercase tracking-[0.06em]">{code}</span>
          <span className="sr-only">Coupon applied</span>
        </p>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-xs px-1.5 py-1 text-caption text-muted transition-colors hover:bg-subtle hover:text-danger"
        >
          <X className="size-3.5" aria-hidden />
          Remove
        </button>
      </div>
      {coupon && <p className="text-caption leading-relaxed text-muted">{coupon.description}</p>}
      {totals.discountInr > 0 ? (
        <p className="text-caption leading-relaxed text-success">
          Discount of {formatInr(totals.discountInr)} is included in the totals below.
        </p>
      ) : (
        <p role="status" className="text-caption leading-relaxed text-warning">
          {belowMinimum && coupon
            ? `No discount yet — ${code} needs an order of at least ${formatInr(coupon.minimumOrderInr)} before it applies.`
            : "No discount is showing. Whether a code still has uses left is verified on the server, not in this panel."}
        </p>
      )}
    </div>
  );
}

export function CouponControl({
  appliedCode,
  totals,
  onApply,
  onClear
}: {
  appliedCode: string | null;
  totals: CartTotals;
  onApply: (code: string) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  useLiveCoupons();

  if (appliedCode) return <AppliedCoupon code={appliedCode} totals={totals} onClear={onClear} />;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const check = checkCoupon(code);
    switch (check.kind) {
      case "empty":
        setMessage({ tone: "error", text: "Enter a code first." });
        return;
      case "valid":
        setMessage(null);
        setCode("");
        onApply(check.coupon.code);
        return;
      case "expired":
        setMessage({
          tone: "error",
          text: `${check.code} expired${check.endsAt ? ` on ${formatDate(check.endsAt)}` : ""}. Codes are withdrawn on their end date.`
        });
        return;
      case "retired":
        setMessage({ tone: "error", text: `${check.code} has been withdrawn by Plusmark and is no longer active.` });
        return;
      case "not_started":
        setMessage({ tone: "error", text: `${check.code} is not live yet.` });
        return;
      default:
        setMessage({
          tone: "error",
          text: `${check.code} is not a code Plusmark has issued. Discount codes are set up by Plusmark, not by the storefront.`
        });
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <TextField
          label="Coupon code"
          hint="Only codes Plusmark has issued will be recognised."
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setMessage(null);
          }}
          placeholder="Enter your Plusmark code"
          autoComplete="off"
          maxLength={24}
          style={{ textTransform: "uppercase" }}
          className="min-w-0 flex-1"
          error={message?.tone === "error" ? message.text : null}
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          <Ticket className="size-4" aria-hidden />
          Apply
        </Button>
      </div>
      {message?.tone === "info" && <p className="text-caption text-muted">{message.text}</p>}
    </form>
  );
}
