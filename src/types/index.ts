/**
 * Domain types for the Plusmark storefront.
 *
 * These interfaces mirror the shape the future Supabase/PostgreSQL schema is
 * expected to return, so mock data can be swapped for real queries without
 * touching components. Nothing here is authoritative for prices, stock,
 * payment status or permissions — that belongs to the server.
 */

export type IsoDate = string;
export type PublicId = string;

/** How a variant's price is obtained. Plusmark publishes no list prices. */
export type PriceMode = "fixed" | "on_request";

export interface Money {
  amountInr: number;
  /** True when the figure comes from the prototype rate card, not Plusmark. */
  demo: boolean;
}

export interface ProductSize {
  id: string;
  label: string;
  widthCm: number | null;
  heightCm: number | null;
}

export interface MediaAsset {
  publicId: PublicId;
  alt: string;
  width: number;
  height: number;
  /** "product" = real Plusmark product render, "video-poster" = frame of a Plusmark video. */
  source: "product" | "video-poster" | "industry";
}

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  size: ProductSize;
  priceMode: PriceMode;
  /** null whenever priceMode is "on_request" and no demo rate card is applied. */
  priceInr: number | null;
  compareAtInr: number | null;
  stock: number | null;
  trackInventory: boolean;
  available: boolean;
  leadTimeDays: number | null;
  /** How many boards one unit of this variant contains. Defaults to 1. */
  packQty?: number;
  imageOverride?: MediaAsset;
}

/** Construction type, independent of the writing surface. */
export type BoardType = "non-magnetic" | "magnetic" | "ceramic" | "n/a";
export type SurfaceKind = "marker" | "chalk" | "pin-up" | "other";

/** How hard a board is expected to be used, as stated by its series. */
export type UsageLevel = "light" | "regular" | "daily-intensive";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  seriesId: string | null;
  subcategoryIds: string[];
  surface: string | null;
  frame: string | null;
  corners: string | null;
  magnetic: boolean;
  doubleSided: boolean;
  boardType: BoardType;
  surfaceKind: SurfaceKind;
  usage: string;
  blurb: string;
  description: string;
  features: string[];
  /** Spec rows supplied by Plusmark's own product data. */
  specs: ProductSpec[];
  /** Made to a customer's size, colour or layout rather than a fixed list. */
  customisation: string | null;
  media: MediaAsset[];
  videoId: PublicId | null;
  variants: Variant[];
  priceMode: PriceMode;
  gstRatePercent: number;
  hsnCode: string | null;
  /** Retail minimum is always 1 — never a bulk floor. */
  minimumOrderQuantity: 1;
  /** Quantity at which the bulk-quote path is suggested. */
  bulkSuggestionQuantity: number;
  /** Enquiry-only products cannot be added to the cart. */
  enquiryOnly: boolean;
  /** A catalogue record waiting on specs, sizes, dimensions or photography. */
  needsData: boolean;
  published: boolean;
  featured: boolean;
  createdAt: IsoDate;
}

export interface Subcategory {
  id: string;
  name: string;
  image: PublicId | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  subject: string;
  image: PublicId | null;
  subcategories: Subcategory[];
}

export interface Series {
  id: string;
  name: string;
  rank: number;
  surface: string;
  frame: string;
  corners: string;
  sizes: string[];
}

/* ---------------------------------- Cart --------------------------------- */

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  /** Published colour the shopper picked, when the product offers a list. */
  colour?: string | null;
  quantity: number;
  addedAt: IsoDate;
}

export interface CartLineView extends CartLine {
  product: Product;
  /** null when the stored variant no longer exists in the catalogue. */
  variant: Variant | null;
  lineTotalInr: number | null;
  /** Set when the stored variant no longer exists or is unavailable. */
  problem: "unavailable" | "unknown_variant" | null;
}

export interface CartTotals {
  subtotalInr: number | null;
  discountInr: number;
  gstInr: number;
  shippingInr: number | null;
  totalInr: number | null;
  pricingIncomplete: boolean;
}

/* -------------------------------- Accounts ------------------------------- */

export type CustomerType = "retail" | "institution" | "dealer";

/** A retail customer. Profile, addresses and boards live in Supabase. */
export interface CustomerAccount {
  id: string;
  email: string;
  role: "customer" | "admin";
  fullName: string;
  phone: string | null;
  addresses: AddressBookEntry[];
  createdAt: IsoDate;
}

export interface AddressBookEntry {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

/* --------------------------------- Orders -------------------------------- */

export type OrderStatus =
  | "placed"
  | "payment_pending"
  | "payment_failed"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "refund_processing"
  | "refunded";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export interface OrderLine {
  id: string;
  name: string;
  slug: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
}

export interface Order {
  id: string;
  reference: string;
  customerId: string | null;
  email: string;
  placedAt: IsoDate;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "razorpay" | "cod_placeholder" | "quotation_invoice";
  lines: OrderLine[];
  totals: CartTotals;
  shippingAddress: AddressBookEntry;
  billingAddress: AddressBookEntry;
  shipment: Shipment | null;
  couponCode: string | null;
  invoiceNumber?: string | null;
  trackingUrl?: string | null;
  returnReason?: string | null;
  shippingMethodId?: string;
  isDemo: boolean;
}

export interface Shipment {
  awb: string | null;
  carrier: string | null;
  etaFrom: IsoDate | null;
  etaTo: IsoDate | null;
  events: ShipmentEvent[];
}

export interface ShipmentEvent {
  at: IsoDate;
  status: OrderStatus;
  note: string;
  location: string | null;
}

/* ------------------------------- Quotations ------------------------------ */

export type EnquiryStatus = "new" | "contacted" | "quote_sent" | "negotiation" | "accepted" | "rejected";

export interface EnquiryLine {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  note: string | null;
}

export interface BulkEnquiry {
  id: string;
  reference: string;
  createdAt: IsoDate;
  status: EnquiryStatus;
  contactName: string;
  email: string;
  phone: string;
  organisationName: string;
  customerType: "school" | "college" | "office" | "factory" | "coaching" | "dealer" | "government" | "other";
  gstin: string | null;
  city: string;
  pincode: string;
  lines: EnquiryLine[];
  additionalRequirements: string | null;
  attachmentName: string | null;
  internalNotes: InternalNote[];
  quotationId: string | null;
  isDemo: true;
}

export interface InternalNote {
  id: string;
  at: IsoDate;
  author: string;
  body: string;
}

export interface QuotationLine {
  id: string;
  label: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
}

export interface Quotation {
  id: string;
  reference: string;
  enquiryId: string;
  issuedAt: IsoDate;
  validUntil: IsoDate;
  lines: QuotationLine[];
  discountInr: number;
  gstPercent: number;
  shippingInr: number;
  totalInr: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "converted";
  terms: string;
  orderId: string | null;
  isDemo: true;
}

/* --------------------------- Content & support --------------------------- */

export interface Review {
  id: string;
  productName: string;
  productSlug: string;
  author: string;
  rating: number;
  body: string;
  verifiedPurchase: boolean;
  createdAt: IsoDate;
  status: "published" | "pending" | "rejected";
  isDemo: true;
}

export interface FaqItem {
  id: string;
  section: string;
  question: string;
  answer: string;
  source: "verified" | "demo";
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: number;
  minimumOrderInr: number;
  active: boolean;
  startsAt: IsoDate;
  endsAt: IsoDate;
  usageLimit: number | null;
  usedCount: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  priceInr: number | null;
  etaMinDays: number | null;
  etaMaxDays: number | null;
  available: boolean;
  configured: boolean;
}

export interface PaymentRecord {
  id: string;
  orderReference: string;
  gateway: "razorpay";
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  amountInr: number;
  status: PaymentStatus;
  mode: "demo";
  at: IsoDate;
}

export interface InventoryRow {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  sku: string;
  sizeLabel: string;
  stock: number | null;
  trackInventory: boolean;
  lowStockThreshold: number;
  updatedAt: IsoDate;
}

export interface AnnouncementBar {
  text: string;
  linkHref: string | null;
  linkLabel: string | null;
  active: boolean;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  supporting: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  imagePublicId: PublicId;
  imageAlt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  customerType: CustomerType;
  organisationName: string | null;
  city: string | null;
  orderCount: number;
  lifetimeValueInr: number;
  status: "active" | "blocked";
  joinedAt: IsoDate;
  isDemo: true;
}

/* --------------------------------- Search -------------------------------- */

export interface SearchSuggestion {
  kind: "product" | "category" | "series";
  label: string;
  sublabel: string | null;
  href: string;
  imagePublicId: PublicId | null;
}

/* -------------------------------- Filters -------------------------------- */

export interface ProductFilterState {
  categoryId: string | null;
  subcategoryId: string | null;
  seriesIds: string[];
  boardType: "any" | "non-magnetic" | "magnetic" | "ceramic";
  surfaceKind: "any" | "marker" | "chalk" | "pin-up" | "other";
  magnetic: "any" | "yes" | "no";
  doubleSided: "any" | "yes" | "no";
  sizeIds: string[];
  priceBand: PriceBand | null;
  availability: "any" | "in_stock" | "on_request";
  inStockOnly: boolean;
  query: string;
}

export type PriceBand = "under_2000" | "2000_5000" | "5000_10000" | "over_10000" | "on_request";

export type SortKey = "featured" | "price_asc" | "price_desc" | "newest" | "popular" | "name_asc";
