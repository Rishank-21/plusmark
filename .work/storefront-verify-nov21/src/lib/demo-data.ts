import { baseVariants, priceRangeFor, products } from "@/lib/catalog";
import { variantLabel } from "@/lib/format";
import type {
  BulkEnquiry,
  Coupon,
  Customer,
  EnquiryLine,
  InventoryRow,
  Order,
  OrderLine,
  PaymentRecord,
  Quotation,
  ShippingMethod,
  FaqItem
} from "@/types";

/**
 * Deterministic operational demo data for the admin dashboard only.
 * Every record carries isDemo: true and the dashboard renders a visible
 * "demonstration data" banner. None of it is Plusmark business history.
 */

let seed = 20261028;
function rand(): number {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
function pick<T>(list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)] as T;
}
function intBetween(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function daysAgo(days: number): string {
  const d = new Date("2026-10-20T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}
function daysAhead(days: number): string {
  const d = new Date("2026-10-20T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

const CITIES: [string, string, string][] = [
  ["Ahmedabad", "Gujarat", "380009"],
  ["Surat", "Gujarat", "395007"],
  ["Vadodara", "Gujarat", "390005"],
  ["Mumbai", "Maharashtra", "400070"],
  ["Pune", "Maharashtra", "411045"],
  ["Delhi", "Delhi", "110019"],
  ["Jaipur", "Rajasthan", "302003"],
  ["Lucknow", "Uttar Pradesh", "226010"],
  ["Kolkata", "West Bengal", "700019"],
  ["Bengaluru", "Karnataka", "560066"],
  ["Hyderabad", "Telangana", "500018"],
  ["Chennai", "Tamil Nadu", "600042"],
  ["Indore", "Madhya Pradesh", "452001"],
  ["Nagpur", "Maharashtra", "440010"],
  ["Patna", "Bihar", "800001"]
];

const FIRST = ["Anil", "Sunita", "Rakesh", "Meera", "Vikram", "Neha", "Suresh", "Pooja", "Imran", "Latha", "Devendra", "Kavita"];
const LAST = ["Sharma", "Patel", "Reddy", "Iyer", "Verma", "Goswami", "Kulkarni", "Mehta", "Nanda", "Bose"];
const ORGS = [
  "Delhi Public School",
  "Kendriya Vidyalaya",
  "Jawahar Navodaya Vidyalaya",
  "Gujarat University",
  "IIT Kharagpur",
  "Amul Dairy",
  "Banas Dairy",
  "Mahi Dairy",
  "Tata Sky",
  "Gem Public School"
];

const sellable = products.filter((p) => p.variants.some((v) => v.priceInr !== null));

function orderLines(count: number): OrderLine[] {
  const lines: OrderLine[] = [];
  for (let i = 0; i < count; i += 1) {
    const product = pick(sellable);
    const variant = pick(product.variants.filter((v) => v.priceInr !== null));
    const quantity = intBetween(1, 4);
    const unit = variant.priceInr ?? 0;
    lines.push({
      id: `ln_${i}_${variant.id}`,
      name: product.name,
      slug: product.slug,
      variantLabel: variantLabel(variant),
      sku: variant.sku,
      quantity,
      unitPriceInr: unit,
      lineTotalInr: unit * quantity
    });
  }
  return lines;
}

const ADDRESSES = CITIES.map(([city, state, pincode], i) => ({
  id: `addr_${i}`,
  label: "Registered",
  recipientName: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
  phone: `+91 9${(800000000 + i * 1234567).toString().slice(0, 9)}`,
  line1: `${intBetween(1, 400)}, ${pick(["Gandhi Road", "Station Road", "Industrial Estate", "Model Town", "Ring Road"])}`,
  line2: pick([null, "Near bus stand", "Opp. municipal school"]),
  city,
  state,
  pincode,
  isDefaultShipping: true,
  isDefaultBilling: true
}));

const ORDER_STATUS_POOL: Order["status"][] = [
  "placed", "confirmed", "processing", "processing", "dispatched", "delivered", "delivered",
  "payment_pending", "payment_failed", "cancelled", "return_requested", "refund_processing", "refunded"
];

export const demoOrders: Order[] = Array.from({ length: 34 }, (_, i) => {
  const status = ORDER_STATUS_POOL[i % ORDER_STATUS_POOL.length];
  const lines = orderLines(intBetween(1, 3));
  const subtotalInr = lines.reduce((s, l) => s + l.lineTotalInr, 0);
  const gstInr = Math.round(subtotalInr * 0.12);
  const shippingInr = i % 5 === 0 ? 0 : intBetween(350, 1400);
  const address = ADDRESSES[i % ADDRESSES.length];
  const placedAt = daysAgo(i * 2 + 1);
  const paymentStatus: PaymentRecord["status"] =
    status === "payment_failed" ? "failed" : status === "payment_pending" ? "pending" : status === "cancelled" ? "unpaid" : status === "placed" ? "pending" : "paid";

  return {
    id: `o_${1000 + i}`,
    reference: `PM-26-${(10431 + i).toString()}`,
    customerId: `dc_${i % 20}`,
    email: `${(address.recipientName.split(" ")[0] ?? "customer").toLowerCase()}.${i}@example.in`,
    placedAt,
    status,
    paymentStatus,
    paymentMethod: i % 4 === 0 ? "quotation_invoice" : "razorpay",
    lines,
    totals: {
      subtotalInr,
      discountInr: 0,
      gstInr,
      shippingInr,
      totalInr: subtotalInr + gstInr + shippingInr,
      pricingIncomplete: false
    },
    shippingAddress: address,
    billingAddress: address,
    shipment:
      status === "dispatched" || status === "delivered"
        ? {
            awb: `PMX${700000 + i * 37}`,
            carrier: pick(["Blue Dart", "Delhivery", "DTDC", "GATI"]),
            etaFrom: daysAgo(i * 2 - 2),
            etaTo: daysAhead(4),
            events: [
              { at: placedAt, status: "placed", note: "Order received", location: address.city },
              { at: daysAgo(i * 2), status: "confirmed", note: "Payment confirmed", location: "Ahmedabad" },
              { at: daysAgo(Math.max(0, i * 2 - 3)), status: "processing", note: "Framing and packing", location: "Ahmedabad" },
              { at: daysAgo(Math.max(0, i * 2 - 5)), status: "dispatched", note: "Handed to carrier", location: "Ahmedabad" },
              ...(status === "delivered"
                ? [{ at: daysAgo(Math.max(0, i * 2 - 8)), status: "delivered" as const, note: "Delivered and signed for", location: address.city }]
                : [])
            ]
          }
        : null,
    couponCode: null,
    isDemo: true
  };
});

export const demoCustomers: Customer[] = Array.from({ length: 20 }, (_, i) => {
  const address = ADDRESSES[i % ADDRESSES.length];
  const type: Customer["customerType"] = i % 3 === 0 ? "institution" : i % 5 === 0 ? "dealer" : "retail";
  const theirOrders = demoOrders.filter((o) => o.customerId === `dc_${i}`);
  return {
    id: `dc_${i}`,
    name: address.recipientName,
    email: `${(address.recipientName.split(" ")[0] ?? "customer").toLowerCase()}.${i}@example.in`,
    phone: address.phone,
    customerType: type,
    organisationName: type === "retail" ? null : pick(ORGS),
    city: address.city,
    orderCount: theirOrders.length,
    lifetimeValueInr: theirOrders.reduce((s, o) => s + (o.totals.totalInr ?? 0), 0),
    status: i === 17 ? "blocked" : "active",
    joinedAt: daysAgo(200 - i * 7),
    isDemo: true
  };
});

const ENQUIRY_STATUSES: BulkEnquiry["status"][] = ["new", "contacted", "quote_sent", "negotiation", "accepted", "rejected"];

export const demoEnquiries: BulkEnquiry[] = Array.from({ length: 14 }, (_, i) => {
  const address = ADDRESSES[(i + 3) % ADDRESSES.length];
  const lineCount = intBetween(1, 4);
  const lines: EnquiryLine[] = Array.from({ length: lineCount }, (_, j) => {
    const product = pick(products);
    const variant = pick(baseVariants(product));
    return {
      id: `eq_ln_${i}_${j}`,
      productId: product.slug,
      variantId: variant.id,
      quantity: intBetween(10, 240),
      note: j === 0 ? pick([null, "Wall mounting hardware required", "Please quote with spare corners"]) : null
    };
  });
  const status = ENQUIRY_STATUSES[i % ENQUIRY_STATUSES.length];
  return {
    id: `e_${500 + i}`,
    reference: `ENQ-26-${(4101 + i).toString()}`,
    createdAt: daysAgo(i * 3 + 2),
    status,
    contactName: address.recipientName,
    email: `${(address.recipientName.split(" ")[0] ?? "estate").toLowerCase()}@example.in`,
    phone: address.phone,
    organisationName: pick(ORGS),
    customerType: pick(["school", "college", "office", "factory", "coaching", "dealer", "government"]),
    gstin: i % 2 === 0 ? `24A${pick(["B","C","D"])}CSG${intBetween(1000,9999)}${pick(["A","B","C"])}${i % 10}Z${pick(["5","7"])}` : null,
    city: address.city,
    pincode: address.pincode,
    lines,
    additionalRequirements: i % 3 === 0 ? "Delivery in two phases across three campuses." : null,
    attachmentName: i % 4 === 0 ? "requirement-sheet.xlsx" : null,
    internalNotes:
      i % 3 === 0
        ? [{ id: `n_${i}`, at: daysAgo(i * 3), author: "Sales desk", body: "Asked for phase-wise delivery. Checking freight to the second campus." }]
        : [],
    quotationId: status === "quote_sent" || status === "accepted" || status === "negotiation" ? `q_${500 + i}` : null,
    isDemo: true
  };
});

export const demoQuotations: Quotation[] = demoEnquiries
  .filter((e) => e.quotationId)
  .map((enquiry) => {
    const lines = enquiry.lines.map((line, i) => {
      const product = products.find((p) => p.slug === enquiry.lines[i].productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      const unit = variant?.priceInr ?? priceRangeFor(product ?? sellable[0]).min ?? 2400;
      const bulk = Math.max(0.6, 1 - Math.min(line.quantity, 400) / 1600);
      const unitPriceInr = Math.round((unit * bulk) / 10) * 10;
      return {
        id: `ql_${enquiry.id}_${i}`,
        label: `${product?.name ?? "Board"} — ${variant ? variantLabel(variant) : "Standard size"}`,
        quantity: line.quantity,
        unitPriceInr,
        lineTotalInr: unitPriceInr * line.quantity
      };
    });
    const gross = lines.reduce((s, l) => s + l.lineTotalInr, 0);
    const discountInr = Math.round(gross * 0.02);
    const shippingInr = intBetween(4000, 26000);
    const gstInr = Math.round((gross - discountInr) * 0.12);
    return {
      id: enquiry.quotationId as string,
      reference: `Q-26-${enquiry.reference.slice(-4)}`,
      enquiryId: enquiry.id,
      issuedAt: daysAgo(2),
      validUntil: daysAhead(12),
      lines,
      discountInr,
      gstPercent: 12,
      shippingInr,
      totalInr: gross - discountInr + gstInr + shippingInr,
      status: enquiry.status === "accepted" ? "accepted" : enquiry.status === "quote_sent" ? "sent" : "draft",
      terms:
        "Prices are ex-works Ahmedabad and exclude GST and freight unless shown above. Valid for the period stated. Frame finish and corner colour may vary within the series specification. Manufactured to order; dispatch after confirmation and advance.",
      orderId: enquiry.status === "accepted" ? demoOrders[0]?.reference ?? null : null,
      isDemo: true
    };
  });

export const demoCoupons: Coupon[] = [
  {
    id: "cp_1", code: "INSTITUTION10", description: "10% off institutional orders above ₹25,000",
    kind: "percent", value: 10, minimumOrderInr: 25000, active: true,
    startsAt: daysAgo(120), endsAt: daysAhead(120), usageLimit: 500, usedCount: 38
  },
  {
    id: "cp_2", code: "FREIGHT500", description: "₹500 off freight on single-board retail orders",
    kind: "flat", value: 500, minimumOrderInr: 8000, active: true,
    startsAt: daysAgo(30), endsAt: daysAhead(30), usageLimit: null, usedCount: 12
  },
  {
    id: "cp_3", code: "EXPIRED2025", description: "Last-season pilot coupon",
    kind: "percent", value: 5, minimumOrderInr: 0, active: false,
    startsAt: daysAgo(400), endsAt: daysAgo(100), usageLimit: 100, usedCount: 100
  }
];

export const inventoryRows: InventoryRow[] = products.flatMap((product) =>
  baseVariants(product).map((variant) => ({
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    variantId: variant.id,
    sku: variant.sku,
    sizeLabel: variantLabel(variant),
    stock: variant.stock,
    trackInventory: variant.trackInventory,
    lowStockThreshold: 5,
    updatedAt: daysAgo(intBetween(1, 40))
  }))
);

export const paymentRecords: PaymentRecord[] = demoOrders
  .filter((o) => o.paymentStatus !== "unpaid")
  .map((o, i) => ({
    id: `pay_${i}`,
    orderReference: o.reference,
    gateway: "razorpay",
    gatewayOrderId: o.paymentStatus === "pending" ? null : `order_NZ${(810000 + i * 71).toString()}`,
    gatewayPaymentId: o.paymentStatus === "paid" || o.paymentStatus === "refunded" ? `pay_NZ${(940000 + i * 13).toString()}` : null,
    amountInr: o.totals.totalInr ?? 0,
    status: o.paymentStatus,
    mode: "demo",
    at: o.placedAt
  }));

export const dashboardMetrics = () => {
  const delivered = demoOrders.filter((o) => o.status === "delivered");
  const revenue = demoOrders
    .filter((o) => ["confirmed", "processing", "dispatched", "delivered"].includes(o.status))
    .reduce((s, o) => s + (o.totals.totalInr ?? 0), 0);
  return {
    totalOrders: demoOrders.length,
    revenueInr: revenue,
    pendingOrders: demoOrders.filter((o) => ["placed", "confirmed", "processing"].includes(o.status)).length,
    pendingPayments: demoOrders.filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "failed").length,
    newEnquiries: demoEnquiries.filter((e) => e.status === "new").length,
    openQuotations: demoQuotations.filter((q) => q.status !== "converted").length,
    deliveredValueInr: delivered.reduce((s, o) => s + (o.totals.totalInr ?? 0), 0),
    lowStockVariants: inventoryRows.filter((r) => r.trackInventory && (r.stock ?? 0) <= r.lowStockThreshold).length,
    publishedProducts: products.length,
    recentOrders: demoOrders.slice(0, 8)
  };
};

export const demoShippingMethods: ShippingMethod[] = [
  { id: "standard", name: "Standard surface dispatch", description: "Partner courier, pan-India", priceInr: null, etaMinDays: null, etaMaxDays: null, available: true, configured: false },
  { id: "pickup", name: "Pickup from Ahmedabad", description: "Collect from Narolgam works", priceInr: 0, etaMinDays: null, etaMaxDays: null, available: true, configured: true }
];

export const contentDefaults = {
  announcement: { text: "QUALITY BOARDS · DIRECT FROM PLUSMARK · PAN INDIA SUPPLY", linkHref: "/shop", linkLabel: null, active: true },
  hero: {
    eyebrow: "Plusmark · Ahmedabad",
    headline: "Writing & Display Systems, Thoughtfully Made.",
    supporting:
      "Explore quality writing boards, notice boards and display solutions for classrooms, offices and institutions across India.",
    primaryCta: { label: "Explore Collection", href: "/shop" },
    secondaryCta: { label: "Shop Bestsellers", href: "/shop?series=metallic-premium" },
    imagePublicId: "plusmark/industries/schools",
    imageAlt: "Teacher teaching mathematics on a Plusmark navy board in a school classroom with students"
  }
};

/** Homepage FAQ picks the verified questions that matter before a purchase. */
export function homepageFaq(items: FaqItem[], limit = 7): FaqItem[] {
  const preferred = [
    "Which board sizes are available?",
    "Should I choose a magnetic board or a ceramic board?",
    "Does Plusmark supply across India?",
    "How do I get a price quotation?",
    "Do Plusmark products come with a warranty?",
    "Can I order a custom design or layout?",
    "What is the difference between an HPL white board and a melamine white board?"
  ];
  const picked = preferred
    .map((q) => items.find((i) => i.question === q))
    .filter((i): i is FaqItem => Boolean(i));
  return picked.slice(0, limit);
}
