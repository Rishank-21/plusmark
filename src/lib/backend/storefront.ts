/**
 * Browser reads and quotes from the Plusmark backend. Prices, GST, shipping and coupon rules are
 * decided by the database; this file only asks and maps the answer to the storefront's own types.
 */
import { requireSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CartLineView, CartTotals, Coupon, ShippingMethod } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

async function call<T>(name: string, args: Row = {}): Promise<T> {
  const supabase = requireSupabaseBrowserClient();
  const { data, error } = await supabase.rpc(name as never, args as never);
  if (error) throw new Error(error.message);
  return data as T;
}

export interface PublicSettings {
  priceIncludesGst: boolean;
  shippingFlatInr: number;
  freeShippingOverInr: number | null;
  shippingGstRate: number;
  codEnabled: boolean;
  codFeeInr: number;
  returnWindowDays: number;
  sellerState: string;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const s = await call<Row>("get_public_settings");
  return {
    priceIncludesGst: Boolean(s.price_includes_gst),
    shippingFlatInr: Number(s.shipping_flat_inr ?? 0),
    freeShippingOverInr: s.free_shipping_over_inr === null || s.free_shipping_over_inr === undefined ? null : Number(s.free_shipping_over_inr),
    shippingGstRate: Number(s.shipping_gst_rate ?? 18),
    codEnabled: Boolean(s.cod_enabled),
    codFeeInr: Number(s.cod_fee_inr ?? 0),
    returnWindowDays: Number(s.return_window_days ?? 7),
    sellerState: String(s.seller_state ?? "")
  };
}

export async function fetchPublicCoupons(): Promise<Coupon[]> {
  const rows = await call<Row[]>("public_coupons");
  return (rows ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description ?? "",
    kind: c.kind,
    value: Number(c.value),
    minimumOrderInr: Number(c.minimumOrderInr ?? 0),
    active: Boolean(c.active),
    startsAt: c.startsAt,
    endsAt: c.endsAt ?? null,
    usageLimit: c.usageLimit ?? null,
    usedCount: Number(c.usedCount ?? 0)
  })) as Coupon[];
}

/** Dispatch options as the cart page shows them. The exact fee for the delivery state comes from quoteCart. */
export async function fetchShippingMethods(): Promise<ShippingMethod[]> {
  const s = await fetchPublicSettings();
  return [
    {
      id: "standard",
      name: "Standard delivery",
      description: "Delivered to your door. The exact charge depends on your state and is confirmed at checkout.",
      priceInr: s.shippingFlatInr,
      etaMinDays: null,
      etaMaxDays: null,
      available: true,
      configured: true,
      freeOverInr: s.freeShippingOverInr,
      gstRatePercent: s.shippingGstRate
    }
  ];
}

export interface ServerQuote {
  totals: CartTotals;
  /** Shipping charge before GST, for display next to the GST rows. */
  codFeeInr: number;
  gstRows: { ratePercent: number; taxableInr: number; gstInr: number }[];
  /** For example "Includes CGST ₹43.20 + SGST ₹43.20" (same state) or "Includes IGST ₹86.40" (other states). */
  taxNote: string | null;
  coupon: { code: string; applied: boolean; message: string | null; description?: string } | null;
  error: { code: string; message: string } | null;
}

export type QuoteLine = { ref: string; sku: string; quantity: number; colour?: string };

export function quoteLinesFrom(views: CartLineView[]): QuoteLine[] {
  return views
    .filter((line) => line.variant && line.variant.priceInr !== null && !line.problem)
    .map((line) => ({ ref: line.variant!.id, sku: line.variant!.sku, quantity: line.quantity, colour: line.colour ?? undefined }));
}

export async function quoteCart(input: {
  lines: QuoteLine[];
  couponCode: string | null;
  state: string | null;
  email?: string | null;
  paymentMethod?: "razorpay" | "cod";
}): Promise<ServerQuote> {
  const q = await call<Row>("quote_cart", {
    p_items: input.lines,
    p_coupon: input.couponCode,
    p_state: input.state,
    p_email: input.email ?? null,
    p_payment_method: input.paymentMethod ?? "razorpay"
  });
  if (!q?.ok) {
    return {
      totals: { subtotalInr: null, discountInr: 0, gstInr: 0, shippingInr: null, totalInr: null, pricingIncomplete: true },
      codFeeInr: 0,
      gstRows: [],
      taxNote: null,
      coupon: null,
      error: { code: String(q?.error ?? "error"), message: String(q?.message ?? "Prices could not be confirmed right now.") }
    };
  }
  const exclusive = !q.prices_include_gst;
  const shipping = Number(exclusive ? q.shipping_net : q.shipping) + Number(exclusive ? q.cod_fee_net : q.cod_fee);
  const coupon = q.coupon
    ? { code: String(q.coupon.code), applied: Boolean(q.coupon.applied), message: (q.coupon.message as string | undefined) ?? null }
    : null;
  return {
    totals: {
      subtotalInr: Number(q.subtotal),
      discountInr: Number(q.discount),
      gstInr: Number(q.gst),
      shippingInr: shipping,
      totalInr: Number(q.total),
      pricingIncomplete: false
    },
    codFeeInr: Number(q.cod_fee_net ?? 0),
    gstRows: withShippingRow(
      ((q.gst_breakup ?? []) as Row[]).map((r) => ({ ratePercent: Number(r.rate), taxableInr: Number(r.taxable), gstInr: Number(r.gst) })),
      Number(q.shipping_net ?? 0) + Number(q.cod_fee_net ?? 0),
      Number(q.shipping ?? 0) + Number(q.cod_fee ?? 0) - Number(q.shipping_net ?? 0) - Number(q.cod_fee_net ?? 0)
    ),
    taxNote:
      Number(q.igst) > 0
        ? `Includes IGST ₹${Number(q.igst).toFixed(2)} (delivery outside the seller state).`
        : Number(q.cgst) > 0
          ? `Includes CGST ₹${Number(q.cgst).toFixed(2)} + SGST ₹${Number(q.sgst).toFixed(2)} (delivery within the seller state).`
          : null,
    coupon,
    error: null
  };
}

/** Delivery and cash on delivery fees carry GST too, so they get their own line (or join the same rate). */
function withShippingRow(rows: { ratePercent: number; taxableInr: number; gstInr: number }[], taxable: number, gst: number) {
  if (taxable <= 0.004) return rows;
  const rate = Math.round((gst / taxable) * 100);
  const same = rows.find((row) => row.ratePercent === rate);
  if (same) return rows.map((row) => (row === same ? { ...row, taxableInr: row.taxableInr + taxable, gstInr: row.gstInr + gst } : row));
  return [...rows, { ratePercent: rate, taxableInr: taxable, gstInr: gst }].sort((a, b) => a.ratePercent - b.ratePercent);
}
