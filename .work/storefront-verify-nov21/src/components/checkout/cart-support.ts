import { STORAGE_KEYS } from "@/lib/config";
import { readJson, writeJson } from "@/lib/storage";
import { findCoupon } from "@/lib/pricing";
import { liveCoupons } from "@/components/checkout/coupon-store";
import type { CartLineView, Coupon, Order } from "@/types";

/**
 * Helpers for the shopping flow. Deliberately kept out of the shared state and
 * pricing modules so the cart store stays the single source of truth for lines.
 */

export type CouponCheck =
  | { kind: "valid"; coupon: Coupon }
  | { kind: "expired"; code: string; endsAt: string | null }
  | { kind: "not_started"; code: string }
  | { kind: "retired"; code: string }
  | { kind: "unknown"; code: string }
  | { kind: "empty" };

/**
 * Resolves a code against the live coupon list and separates the states the
 * shopper needs to see — an ended code is different from a typo.
 */
export function checkCoupon(rawCode: string): CouponCheck {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { kind: "empty" };

  const known = liveCoupons().find((coupon) => coupon.code.toUpperCase() === code);
  if (!known) return { kind: "unknown", code };

  const active = findCoupon(code, [known]);
  if (active) return { kind: "valid", coupon: active };

  const now = new Date().toISOString();
  if (!known.active) return { kind: "retired", code };
  if (known.endsAt && known.endsAt < now) return { kind: "expired", code, endsAt: known.endsAt };
  return { kind: "not_started", code };
}

/** The code is entered but the order is below its minimum spend. */
export function couponMeetsMinimum(coupon: Coupon, subtotalInr: number | null): boolean {
  if (subtotalInr === null) return false;
  return subtotalInr >= coupon.minimumOrderInr;
}

/**
 * True when every line carries a price. This is the real checkout gate: a null
 * freight figure is a separate, honest state and must not block the flow.
 */
export function allLinesPriced(views: CartLineView[]): boolean {
  return (
    views.length > 0 &&
    views.every((line) => line.problem === null && line.variant !== null && line.variant.priceInr !== null)
  );
}

export function firstUnpricedLine(views: CartLineView[]): CartLineView | null {
  return views.find((line) => line.problem !== null || line.variant?.priceInr === null) ?? null;
}

/* --------------------------- checkout draft ------------------------------ */

export interface DraftLine {
  productId: string;
  variantId: string;
  colour?: string | null;
  quantity: number;
}

export interface CheckoutDraft {
  savedAt: string;
  lines: DraftLine[];
  contact: { email: string; fullName: string; phone: string };
  shippingMethodId: string | null;
}

/** Snapshot key doubles as lost-cart recovery: the cart itself lives elsewhere. */
export function readDraft(): CheckoutDraft | null {
  return readJson<CheckoutDraft | null>(STORAGE_KEYS.savedCheckout, null);
}

export function writeDraft(draft: CheckoutDraft): void {
  writeJson(STORAGE_KEYS.savedCheckout, draft);
}

export function clearDraft(): void {
  writeJson(STORAGE_KEYS.savedCheckout, null);
}

/* ------------------------------- references ------------------------------ */

/**
 * Generates the next local order reference. Plusmark's real numbering comes from
 * the ERP; this continues a separate local sequence so a prototype order can
 * never be mistaken for one of the synthetic admin demonstration records.
 */
export function nextOrderReference(existing: Order[]): string {
  const tail = (ref: string): number => {
    const last = ref.split("-").pop() ?? "";
    const parsed = Number.parseInt(last, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const max = existing.reduce((acc, order) => Math.max(acc, tail(order.reference)), 70000);
  /* A browser-local sequence alone collides with orders placed from other
     devices, so the clock floor keeps new references ahead of the old block. */
  const stamp = Number(Date.now().toString().slice(-6));
  return `PM-26-${Math.max(max + 1, stamp)}`;
}

export function localId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Normalises the lookup pair so "pm-26-10431" finds "PM-26-10431". */
export function matchesLookup(order: Order, reference: string, contact: string): boolean {
  const refOk = order.reference.toUpperCase() === reference.trim().toUpperCase();
  if (!refOk) return false;
  const needle = contact.trim().toLowerCase();
  if (!needle) return false;
  const digits = needle.replace(/\D/g, "");
  if (order.email.toLowerCase() === needle) return true;
  const phoneDigits = (order.shippingAddress.phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 && phoneDigits.endsWith(digits.slice(-10));
}
