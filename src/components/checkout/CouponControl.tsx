"use client";

import { useState } from "react";
import { BadgeCheck, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { formatInr } from "@/lib/format";
import type { CartTotals } from "@/types";

/**
 * Coupon entry. Every code is checked by the server for this exact cart, shopper and delivery state,
 * so public codes, codes meant for one customer and first-order codes all work the same way here.
 */
export interface CouponStatus {
  applied: boolean;
  message: string | null;
}

function AppliedCoupon({
  code,
  totals,
  status,
  onClear
}: {
  code: string;
  totals: CartTotals;
  status: CouponStatus | null;
  onClear: () => void;
}) {
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
      {totals.discountInr > 0 ? (
        <p className="text-caption leading-relaxed text-success">
          Discount of {formatInr(totals.discountInr)} is included in the totals below.
        </p>
      ) : (
        <p role="status" className="text-caption leading-relaxed text-warning">
          {status?.message ?? "No discount is showing for this cart yet."}
        </p>
      )}
    </div>
  );
}

export function CouponControl({
  appliedCode,
  totals,
  status,
  validate,
  onApply,
  onClear
}: {
  appliedCode: string | null;
  totals: CartTotals;
  status?: CouponStatus | null;
  /** Asks the server whether this code works for the cart. Resolves with a message when it does not. */
  validate: (code: string) => Promise<{ ok: boolean; message?: string }>;
  onApply: (code: string) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  if (appliedCode) return <AppliedCoupon code={appliedCode} totals={totals} status={status ?? null} onClear={onClear} />;

  const submit = async (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) {
      setError("Enter a code first.");
      return;
    }
    setChecking(true);
    try {
      const result = await validate(value);
      if (result.ok) {
        setError(null);
        setCode("");
        onApply(value);
      } else {
        setError(result.message ?? `${value} is not a valid code.`);
      }
    } catch {
      setError("The code could not be checked right now. Try again shortly.");
    } finally {
      setChecking(false);
    }
  };

  return (
    // A div, not a form: this control also sits inside the checkout form and forms cannot nest.
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <TextField
          label="Coupon code"
          hint="Codes are checked for your cart when you apply them."
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Enter your Plusmark code"
          autoComplete="off"
          maxLength={24}
          style={{ textTransform: "uppercase" }}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit(event);
          }}
          className="min-w-0 flex-1"
          error={error}
        />
        <Button type="button" onClick={() => void submit()} variant="secondary" className="shrink-0" disabled={checking}>
          <Ticket className="size-4" aria-hidden />
          {checking ? "Checking" : "Apply"}
        </Button>
      </div>
    </div>
  );
}
