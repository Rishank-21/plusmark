import type { CartLineView, CartTotals, Coupon, ShippingMethod } from "@/types";

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard surface dispatch",
    description: "Door delivery by Plusmark's logistics partner. Charge confirmed once the invoice is raised.",
    priceInr: null,
    etaMinDays: null,
    etaMaxDays: null,
    available: true,
    configured: false
  },
  {
    id: "express",
    name: "Express (North & West India)",
    description: "Not yet configured. Shipping rules are still being finalised.",
    priceInr: null,
    etaMinDays: null,
    etaMaxDays: null,
    available: false,
    configured: false
  },
  {
    id: "institutional",
    name: "Full-load / palletised dispatch",
    description: "For many boards at once. Not yet configured — pricing depends on pincode and load.",
    priceInr: null,
    etaMinDays: null,
    etaMaxDays: null,
    available: false,
    configured: false
  },
  {
    id: "pickup",
    name: "Pickup from Ahmedabad",
    description: "Collect from the Narolgam works. No transport charge.",
    priceInr: 0,
    etaMinDays: null,
    etaMaxDays: null,
    available: true,
    configured: true
  }
];

export function defaultShippingMethod(): ShippingMethod {
  return SHIPPING_METHODS.find((m) => m.available) ?? SHIPPING_METHODS[0];
}

export function findCoupon(code: string, coupons: Coupon[]): Coupon | null {
  const needle = code.trim().toUpperCase();
  if (!needle) return null;
  const now = new Date().toISOString();
  return (
    coupons.find(
      (c) => c.code.toUpperCase() === needle && c.active && c.startsAt <= now && (c.endsAt === null || c.endsAt >= now)
    ) ?? null
  );
}

export function couponDiscountInr(coupon: Coupon | null, subtotalInr: number): number {
  if (!coupon || subtotalInr <= 0 || subtotalInr < coupon.minimumOrderInr) return 0;
  const raw = coupon.kind === "percent" ? (subtotalInr * coupon.value) / 100 : coupon.value;
  return Math.min(Math.round(raw), subtotalInr);
}

export function computeTotals(input: {
  lines: CartLineView[];
  gstPercentByProduct?: Record<string, number>;
  coupon?: Coupon | null;
  shippingMethod?: ShippingMethod | null;
}): CartTotals {
  const priced = input.lines.filter((l) => l.lineTotalInr !== null && !l.problem);
  const pricingIncomplete = priced.length !== input.lines.length || input.lines.length === 0;
  const subtotalInr = pricingIncomplete ? null : priced.reduce((sum, l) => sum + (l.lineTotalInr ?? 0), 0);

  if (subtotalInr === null) {
    return {
      subtotalInr: null,
      discountInr: 0,
      gstInr: 0,
      shippingInr: input.shippingMethod?.priceInr ?? null,
      totalInr: null,
      pricingIncomplete: true
    };
  }

  const discountInr = couponDiscountInr(input.coupon ?? null, subtotalInr);
  const netAfterDiscount = subtotalInr - discountInr;

  // GST is levied per line at that product's rate; the prototype uses a single
  // configured rate until the tax engine is wired to the backend.
  let gstInr = 0;
  for (const line of priced) {
    const rate = input.gstPercentByProduct?.[line.product.categoryId] ?? line.product.gstRatePercent ?? 12;
    const lineNet = (line.lineTotalInr ?? 0) - (discountInr * ((line.lineTotalInr ?? 0) / subtotalInr));
    gstInr += (lineNet * rate) / 100;
  }
  gstInr = Math.round(gstInr);

  const shippingInr = input.shippingMethod?.priceInr ?? null;
  const totalInr = shippingInr === null ? null : netAfterDiscount + gstInr + shippingInr;

  return {
    subtotalInr,
    discountInr,
    gstInr,
    shippingInr,
    totalInr,
    pricingIncomplete: totalInr === null
  };
}

export function gstBreakdownByRate(input: {
  lines: CartLineView[];
  discountInr: number;
}): { ratePercent: number; taxableInr: number; gstInr: number }[] {
  const byRate = new Map<number, number>();
  const subtotal = input.lines.reduce((s, l) => s + (l.lineTotalInr ?? 0), 0) || 1;
  for (const line of input.lines) {
    if (line.lineTotalInr === null) continue;
    const share = (line.lineTotalInr / subtotal) * input.discountInr;
    const taxable = line.lineTotalInr - share;
    const rate = line.product.gstRatePercent ?? 12;
    byRate.set(rate, (byRate.get(rate) ?? 0) + taxable);
  }
  return [...byRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ratePercent, taxableInr]) => ({
      ratePercent,
      taxableInr: Math.round(taxableInr),
      gstInr: Math.round((taxableInr * ratePercent) / 100)
    }));
}
