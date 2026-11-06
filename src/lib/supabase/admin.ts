import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseBrowserClient } from "./client";
import type {
  CategoryRow,
  CouponRow,
  Database,
  Json,
  OrderItemRow,
  OrderRow,
  ProductRow,
  ProductVariantRow,
  ProfileRow,
  ShippingMethodRow
} from "./database.types";
import type {
  AddressBookEntry,
  CartTotals,
  Category,
  Coupon,
  MediaAsset,
  Order,
  OrderLine,
  Product,
  ProductSpec,
  ShippingMethod,
  Variant
} from "@/types";

/**
 * Admin data access. Every call runs with the signed-in admin's JWT; the
 * policies in 20261105140000_plusmark_admin.sql decide what may be read or
 * written. The secret key is never used in the browser.
 */

export class AdminError extends Error {
  field?: string;
  code?: string;

  constructor(message: string, field?: string, code?: string) {
    super(message);
    this.name = "AdminError";
    this.field = field;
    this.code = code;
  }
}

function client(): SupabaseClient<Database> {
  return requireSupabaseBrowserClient();
}

function failure(error: { code?: string; message?: string } | null, fallback: string): AdminError {
  if (!error) return new AdminError(fallback);
  const message = error.message ?? "";
  if (error.code === "23505") {
    if (message.includes("sku")) return new AdminError("That SKU is already used by another variant.", "variants", error.code);
    if (message.includes("slug")) return new AdminError("Another product already uses this URL handle.", "slug", error.code);
    if (message.includes("code")) return new AdminError("That coupon code already exists.", "code", error.code);
    return new AdminError("This record already exists.", "form", error.code);
  }
  if (error.code === "23503") {
    if (message.includes("products_category_id")) return new AdminError("Move or delete the products in this category first.", "form", error.code);
    return new AdminError("A linked record is still using this row.", "form", error.code);
  }
  if (error.code === "23514") return new AdminError("A value failed the database checks. Review the highlighted fields.", "form", error.code);
  if (error.code === "42501" || error.code === "PGRST301") {
    return new AdminError("Your account does not have administrator access. Sign in again.", undefined, error.code);
  }
  if (error.code === "42P01" || error.code === "PGRST205") {
    return new AdminError("The admin tables are missing. Run the 20261105140000 migration.", undefined, error.code);
  }
  if (error.code === "PGRST116") return new AdminError("The record was not found.", undefined, error.code);
  return new AdminError(fallback, undefined, error.code);
}

const sizeId = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function mediaFromJson(value: unknown): MediaAsset[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const raw = item as { publicId?: string; url?: string; alt?: string; width?: number; height?: number; source?: string };
    const publicId = raw.url ?? raw.publicId;
    if (!publicId) return [];
    return [{
      publicId,
      alt: raw.alt ?? "",
      width: raw.width ?? 1400,
      height: raw.height ?? 1400,
      source: raw.source === "video-poster" ? "video-poster" as const : "product" as const
    }];
  });
}

function specsFromJson(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const raw = item as { label?: unknown; value?: unknown };
    if (typeof raw.label !== "string" || typeof raw.value !== "string") return [];
    const label = raw.label.trim();
    const specValue = raw.value.trim();
    return label && specValue ? [{ label, value: specValue }] : [];
  });
}

function variantFromRow(row: ProductVariantRow): Variant {
  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    size: { id: sizeId(row.size_label), label: row.size_label, widthCm: null, heightCm: null },
    priceMode: row.price_mode,
    priceInr: row.price_inr === null ? null : Number(row.price_inr),
    compareAtInr: null,
    stock: row.stock,
    trackInventory: row.track_inventory,
    available: row.available,
    leadTimeDays: row.lead_time_days
  };
}

export function productFromRow(row: ProductRow & { product_variants?: ProductVariantRow[] }): Product {
  const variants = [...(row.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order).map(variantFromRow);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    seriesId: row.series_id,
    subcategoryIds: row.subcategory_ids ?? [],
    surface: row.surface,
    frame: row.frame,
    corners: row.corners,
    magnetic: row.magnetic,
    doubleSided: row.double_sided,
    boardType: row.board_type,
    surfaceKind: row.surface_kind,
    usage: row.usage,
    blurb: row.blurb,
    description: row.description,
    features: row.features ?? [],
    specs: specsFromJson(row.specs),
    customisation: row.customisation,
    media: mediaFromJson(row.media),
    videoId: row.video_id,
    variants,
    priceMode: row.price_mode,
    gstRatePercent: row.gst_rate_percent,
    hsnCode: row.hsn_code,
    minimumOrderQuantity: 1,
    bulkSuggestionQuantity: row.bulk_suggestion_quantity,
    enquiryOnly: row.enquiry_only,
    needsData: row.needs_data,
    published: row.published,
    featured: row.featured,
    createdAt: row.created_at
  };
}

/* --------------------------------- Categories ---------------------------- */

function categoryFromRow(row: CategoryRow): Category {
  const subs = Array.isArray(row.subcategories) ? row.subcategories : [];
  return {
    id: row.id,
    slug: row.id,
    name: row.name,
    description: row.description,
    subject: row.subject,
    image: row.image,
    subcategories: subs.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const sub = item as { id?: string; name?: string; image?: string | null };
      return sub.id && sub.name ? [{ id: sub.id, name: sub.name, image: sub.image ?? null }] : [];
    })
  };
}

export async function listAdminCategories(): Promise<Category[]> {
  const { data, error } = await client().from("categories").select("*").order("sort_order").order("name");
  if (error) throw failure(error, "Categories could not be loaded.");
  return (data ?? []).map(categoryFromRow);
}

export async function saveCategory(input: {
  id: string;
  name: string;
  description: string;
  subject: string;
  image: string | null;
  subcategories?: Category["subcategories"];
  isNew?: boolean;
}): Promise<Category> {
  const supabase = client();
  const row = {
    id: input.id.trim().toLowerCase(),
    name: input.name.trim(),
    description: input.description.trim(),
    subject: input.subject.trim(),
    image: input.image,
    subcategories: (input.subcategories ?? []) as unknown as Json
  };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.id)) throw new AdminError("Use lowercase letters, numbers and hyphens for the identifier.", "id");
  if (!row.name) throw new AdminError("Enter a category name.", "name");

  if (input.isNew) {
    const { data, error } = await supabase.from("categories").insert(row).select("*").single();
    if (error) throw failure(error, "The category could not be created.");
    return categoryFromRow(data);
  }
  const { data, error } = await supabase.from("categories").update({
    name: row.name, description: row.description, subject: row.subject, image: row.image, subcategories: row.subcategories
  }).eq("id", row.id).select("*").single();
  if (error) throw failure(error, "The category could not be saved.");
  return categoryFromRow(data);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await client().from("categories").delete().eq("id", id);
  if (error) throw failure(error, "The category could not be deleted.");
}

/* --------------------------------- Products ------------------------------ */

const PRODUCT_SELECT = "*, product_variants(*)";

export async function listAdminProducts(): Promise<Product[]> {
  const { data, error } = await client().from("products").select(PRODUCT_SELECT).order("name");
  if (error) throw failure(error, "Products could not be loaded.");
  return ((data ?? []) as unknown as (ProductRow & { product_variants: ProductVariantRow[] })[]).map(productFromRow);
}

export async function getAdminProduct(slug: string): Promise<Product | null> {
  const { data, error } = await client().from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw failure(error, "That product could not be loaded.");
  return data ? productFromRow(data as unknown as ProductRow & { product_variants: ProductVariantRow[] }) : null;
}

export interface AdminVariantInput {
  id?: string;
  sizeLabel: string;
  sku: string;
  priceMode: "fixed" | "on_request";
  priceInr: number | null;
  stock: number | null;
  available: boolean;
  leadTimeDays: number | null;
}

export interface AdminProductInput {
  slug: string;
  name: string;
  categoryId: string;
  seriesId: string | null;
  subcategoryIds: string[];
  surface: string;
  frame: string;
  corners: string;
  magnetic: boolean;
  doubleSided: boolean;
  boardType: "non-magnetic" | "magnetic" | "ceramic" | "n/a";
  surfaceKind: "marker" | "chalk" | "pin-up" | "other";
  usage: string;
  blurb: string;
  description: string;
  features: string[];
  specs: ProductSpec[];
  customisation: string | null;
  media: MediaAsset[];
  videoId: string | null;
  priceMode: "fixed" | "on_request";
  gstRatePercent: number;
  hsnCode: string | null;
  bulkSuggestionQuantity: number;
  enquiryOnly: boolean;
  needsData: boolean;
  published: boolean;
  featured: boolean;
  variants: AdminVariantInput[];
}

function productDbRow(input: AdminProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    category_id: input.categoryId,
    series_id: input.seriesId || null,
    subcategory_ids: input.subcategoryIds,
    surface: input.surface || null,
    frame: input.frame || null,
    corners: input.corners || null,
    magnetic: input.magnetic,
    double_sided: input.doubleSided,
    board_type: input.boardType,
    surface_kind: input.surfaceKind,
    usage: input.usage,
    blurb: input.blurb,
    description: input.description,
    features: input.features,
    specs: input.specs as unknown as Json,
    customisation: input.customisation || null,
    media: input.media.map((asset) => ({
      publicId: asset.publicId,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
      source: asset.source
    })),
    video_id: input.videoId || null,
    price_mode: input.priceMode,
    gst_rate_percent: input.gstRatePercent,
    hsn_code: input.hsnCode || null,
    bulk_suggestion_quantity: input.bulkSuggestionQuantity,
    enquiry_only: input.enquiryOnly,
    needs_data: input.needsData,
    published: input.published,
    featured: input.featured
  };
}

export async function createAdminProduct(input: AdminProductInput): Promise<Product> {
  const supabase = client();
  const { data: created, error } = await supabase.from("products").insert(productDbRow(input)).select("id").single();
  if (error) throw failure(error, "The product could not be created.");

  const rows = input.variants.map((variant, index) => ({
    product_id: created.id,
    size_label: variant.sizeLabel,
    sku: variant.sku,
    price_mode: variant.priceMode,
    price_inr: variant.priceMode === "fixed" ? variant.priceInr : null,
    stock: variant.stock,
    track_inventory: false,
    available: variant.available,
    lead_time_days: variant.leadTimeDays,
    sort_order: index
  }));
  const { error: variantError } = await supabase.from("product_variants").insert(rows);
  if (variantError) throw failure(variantError, "The product was created but its sizes could not be saved.");

  const stored = await getAdminProduct(input.slug);
  if (!stored) throw new AdminError("The product was saved but could not be read back.");
  return stored;
}

export async function updateAdminProduct(
  productId: string,
  input: AdminProductInput,
  originalSlug: string
): Promise<Product> {
  const supabase = client();
  const slugChanged = input.slug !== originalSlug;
  const { error } = await supabase.from("products").update(productDbRow(input)).eq("id", productId);
  if (error) throw failure(error, "The product could not be saved.");
  if (slugChanged) {
    /* Order lines keep the catalogue slug as a plain text reference. */
    await supabase.from("order_items").update({ product_id: input.slug }).eq("product_id", originalSlug);
  }

  const { data: existing, error: readError } = await supabase
    .from("product_variants")
    .select("id, sku")
    .eq("product_id", productId);
  if (readError) throw failure(readError, "Sizes could not be read before saving.");

  const kept = new Set<string>();
  for (const [index, variant] of input.variants.entries()) {
    const payload = {
      size_label: variant.sizeLabel,
      sku: variant.sku,
      price_mode: variant.priceMode,
      price_inr: variant.priceMode === "fixed" ? variant.priceInr : null,
      stock: variant.stock,
      available: variant.available,
      lead_time_days: variant.leadTimeDays,
      sort_order: index
    };
    const match = variant.id ? existing?.find((row) => row.id === variant.id) : undefined;
    if (match) {
      kept.add(match.id);
      const { error: rowError } = await supabase.from("product_variants").update(payload).eq("id", match.id);
      if (rowError) throw failure(rowError, "A size row could not be saved.");
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("product_variants")
        .insert({ ...payload, product_id: productId })
        .select("id")
        .single();
      if (insertError) throw failure(insertError, "A size row could not be added.");
      kept.add(inserted.id);
    }
  }
  const removed = (existing ?? []).map((row) => row.id).filter((id) => !kept.has(id));
  if (removed.length) {
    const { error: deleteError } = await supabase.from("product_variants").delete().in("id", removed);
    if (deleteError) throw failure(deleteError, "Removed size rows could not be deleted.");
  }

  const stored = await getAdminProduct(input.slug);
  if (!stored) throw new AdminError("The product was saved but could not be read back.");
  return stored;
}

export async function setProductPublished(id: string, published: boolean): Promise<void> {
  const { error } = await client().from("products").update({ published }).eq("id", id);
  if (error) throw failure(error, "The publishing state could not be saved.");
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const supabase = client();
  const { data: product } = await supabase.from("products").select("media, video_id").eq("id", id).maybeSingle();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw failure(error, "The product could not be deleted.");

  /* The catalogue row is gone; Cloudinary files are removed best-effort so a
     storage hiccup never blocks the delete the admin asked for. */
  const media = Array.isArray(product?.media) ? product.media : [];
  const assets = media
    .map((entry) => (entry as { publicId?: string } | null)?.publicId)
    .filter((publicId): publicId is string => typeof publicId === "string" && !publicId.startsWith("/"));
  if (product?.video_id) assets.push(product.video_id);
  if (assets.length === 0) return;

  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) return;
  await Promise.allSettled(
    assets.map((publicId) =>
      fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ publicId, resourceType: publicId === product?.video_id ? "video" : "image" })
      })
    )
  );
}

export async function updateVariant(
  id: string,
  patch: { stock?: number | null; trackInventory?: boolean; available?: boolean; priceInr?: number | null; priceMode?: "fixed" | "on_request" }
): Promise<void> {
  const row: Database["public"]["Tables"]["product_variants"]["Update"] = {};
  if (patch.stock !== undefined) row.stock = patch.stock;
  if (patch.trackInventory !== undefined) row.track_inventory = patch.trackInventory;
  if (patch.available !== undefined) row.available = patch.available;
  if (patch.priceMode !== undefined) row.price_mode = patch.priceMode;
  if (patch.priceInr !== undefined) row.price_inr = patch.priceInr;
  const { error } = await client().from("product_variants").update(row).eq("id", id);
  if (error) throw failure(error, "That size row could not be saved.");
}

/* ---------------------------------- Orders ------------------------------- */

type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

function addressFromJson(value: unknown, id: string): AddressBookEntry {
  const raw = (value ?? {}) as Partial<AddressBookEntry>;
  return {
    id,
    label: raw.label ?? "Delivery",
    recipientName: raw.recipientName ?? "",
    phone: raw.phone ?? "",
    line1: raw.line1 ?? "",
    line2: raw.line2 ?? null,
    landmark: raw.landmark ?? null,
    city: raw.city ?? "",
    state: raw.state ?? "",
    pincode: raw.pincode ?? "",
    isDefaultShipping: Boolean(raw.isDefaultShipping),
    isDefaultBilling: Boolean(raw.isDefaultBilling)
  };
}

function totalsFromJson(value: unknown): CartTotals {
  const raw = (value ?? {}) as Partial<CartTotals>;
  return {
    subtotalInr: typeof raw.subtotalInr === "number" ? raw.subtotalInr : null,
    discountInr: typeof raw.discountInr === "number" ? raw.discountInr : 0,
    gstInr: typeof raw.gstInr === "number" ? raw.gstInr : 0,
    shippingInr: typeof raw.shippingInr === "number" ? raw.shippingInr : null,
    totalInr: typeof raw.totalInr === "number" ? raw.totalInr : null,
    pricingIncomplete: Boolean(raw.pricingIncomplete)
  };
}

export function orderFromRow(row: OrderWithItems): Order {
  const lines: OrderLine[] = (row.order_items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.product_id,
    variantLabel: item.variant_label ?? "",
    sku: item.sku ?? "",
    quantity: item.quantity,
    unitPriceInr: Number(item.price),
    lineTotalInr: Number(item.price) * item.quantity
  }));
  return {
    id: row.id,
    reference: row.reference,
    customerId: row.user_id,
    email: row.contact_email,
    placedAt: row.created_at,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    lines,
    totals: totalsFromJson(row.totals),
    shippingAddress: addressFromJson(row.shipping_address, `${row.id}-ship`),
    billingAddress: addressFromJson(row.billing_address, `${row.id}-bill`),
    shipment:
      row.courier_name || row.tracking_number
        ? { awb: row.tracking_number, carrier: row.courier_name, etaFrom: null, etaTo: null, events: [] }
        : null,
    couponCode: row.coupon_code,
    invoiceNumber: row.invoice_number,
    trackingUrl: row.tracking_url,
    returnReason: row.return_reason,
    isDemo: false
  };
}

export async function listAdminOrders(): Promise<Order[]> {
  const { data, error } = await client()
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw failure(error, "Orders could not be loaded.");
  return ((data ?? []) as unknown as OrderWithItems[]).map(orderFromRow);
}

export async function getAdminOrder(id: string): Promise<Order | null> {
  const { data, error } = await client().from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw failure(error, "That order could not be loaded.");
  return data ? orderFromRow(data as unknown as OrderWithItems) : null;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const { error } = await client().from("orders").update({ status }).eq("id", id);
  if (error) throw failure(error, "The order status could not be saved.");
}

export async function updateOrderTracking(
  id: string,
  input: { courierName: string | null; trackingNumber: string | null; trackingUrl: string | null }
): Promise<void> {
  const url = input.trackingUrl?.trim() || null;
  if (url && !/^https?:\/\//i.test(url)) {
    throw new AdminError("Tracking links must start with http:// or https://.", "trackingUrl");
  }
  const { error } = await client()
    .from("orders")
    .update({
      courier_name: input.courierName?.trim() || null,
      tracking_number: input.trackingNumber?.trim() || null,
      tracking_url: url
    })
    .eq("id", id);
  if (error) throw failure(error, "The tracking details could not be saved.");
}

/* -------------------------------- Customers ------------------------------ */

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin";
  joinedAt: string;
  orderCount: number;
  lifetimeValueInr: number;
}

function customerFromRow(row: ProfileRow, orders: Order[]): AdminCustomer {
  const mine = orders.filter((order) => order.customerId === row.id);
  return {
    id: row.id,
    fullName: row.full_name || (row.email ?? "").split("@")[0] || "Unnamed customer",
    email: row.email ?? "",
    phone: row.phone,
    role: row.role,
    joinedAt: row.created_at,
    orderCount: mine.length,
    lifetimeValueInr: mine.reduce((sum, order) => sum + (order.totals.totalInr ?? 0), 0)
  };
}

export async function countAdminCustomers(): Promise<number> {
  const { count, error } = await client().from("profiles").select("id", { count: "exact", head: true });
  if (error) throw failure(error, "The customer count could not be loaded.");
  return count ?? 0;
}

export async function listAdminCustomers(): Promise<AdminCustomer[]> {  const supabase = client();
  const [{ data: profiles, error }, orders] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    listAdminOrders()
  ]);
  if (error) throw failure(error, "Customers could not be loaded.");
  return ((profiles ?? []) as ProfileRow[]).map((row) => customerFromRow(row, orders));
}

export async function getAdminCustomer(id: string): Promise<{
  customer: AdminCustomer;
  addresses: AddressBookEntry[];
  orders: Order[];
} | null> {
  const supabase = client();
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw failure(error, "That customer could not be loaded.");
  if (!profile) return null;
  const [{ data: addressRows }, orders] = await Promise.all([
    supabase.from("addresses").select("*").eq("user_id", id).order("created_at"),
    listAdminOrders()
  ]);
  const mine = orders.filter((order) => order.customerId === id);
  return {
    customer: customerFromRow(profile as ProfileRow, orders),
    addresses: (addressRows ?? []).map((row) => addressFromJson({
      label: row.label,
      recipientName: row.full_name,
      phone: row.phone,
      line1: row.line1,
      line2: row.line2,
      landmark: row.landmark,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      isDefaultShipping: row.is_default,
      isDefaultBilling: row.is_default
    }, row.id)),
    orders: mine
  };
}

/* --------------------------------- Coupons ------------------------------- */

export function couponFromRow(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    kind: row.kind,
    value: Number(row.value),
    minimumOrderInr: Number(row.minimum_order_inr),
    active: row.active,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    usageLimit: row.usage_limit,
    usedCount: row.used_count
  };
}

export async function listAdminCoupons(): Promise<Coupon[]> {
  const { data, error } = await client().from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw failure(error, "Coupons could not be loaded.");
  return (data ?? []).map(couponFromRow);
}

export async function saveCoupon(input: {
  id?: string;
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: number;
  minimumOrderInr: number;
  active: boolean;
  startsAt: string;
  endsAt: string;
  usageLimit: number | null;
}): Promise<Coupon> {
  const row = {
    code: input.code.trim().toUpperCase(),
    description: input.description.trim(),
    kind: input.kind,
    value: input.value,
    minimum_order_inr: input.minimumOrderInr,
    active: input.active,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    usage_limit: input.usageLimit
  };
  if (!/^[A-Z0-9-]{3,32}$/.test(row.code)) throw new AdminError("Codes use 3–32 letters, numbers or hyphens.", "code");
  if (!row.description) throw new AdminError("Add a customer-facing description.", "description");
  if (!(row.value > 0)) throw new AdminError("The discount must be greater than zero.", "value");
  if (row.kind === "percent" && row.value > 100) throw new AdminError("A percentage cannot exceed 100%.", "value");
  if (row.ends_at < row.starts_at) throw new AdminError("The end date must be on or after the start date.", "endsAt");

  const supabase = client();
  const query = input.id
    ? supabase.from("coupons").update(row).eq("id", input.id)
    : supabase.from("coupons").insert(row);
  const { data, error } = await query.select("*").single();
  if (error) throw failure(error, "The coupon could not be saved.");
  return couponFromRow(data);
}

export async function setCouponActive(id: string, active: boolean): Promise<void> {
  const { error } = await client().from("coupons").update({ active }).eq("id", id);
  if (error) throw failure(error, "The coupon state could not be saved.");
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await client().from("coupons").delete().eq("id", id);
  if (error) throw failure(error, "The coupon could not be deleted.");
}

export async function listActiveCoupons(): Promise<Coupon[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await client()
    .from("coupons")
    .select("*")
    .eq("active", true)
    .lte("starts_at", today)
    .gte("ends_at", today);
  if (error) throw failure(error, "Coupons could not be loaded.");
  return (data ?? []).map(couponFromRow);
}

/* ------------------------------ Content/shipping ------------------------- */

export async function getSiteContent(): Promise<Record<string, unknown>> {
  const { data, error } = await client().from("site_content").select("key, value");
  if (error) throw failure(error, "Site content could not be loaded.");
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
}

export async function saveSiteContent(key: string, value: unknown): Promise<void> {
  const supabase = client();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("site_content").upsert({
    key,
    value: value as Database["public"]["Tables"]["site_content"]["Insert"]["value"],
    updated_by: auth.user?.id ?? null
  });
  if (error) throw failure(error, "The content could not be saved.");
}

function shippingFromRow(row: ShippingMethodRow): ShippingMethod {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceInr: row.price_inr === null ? null : Number(row.price_inr),
    etaMinDays: row.eta_min_days,
    etaMaxDays: row.eta_max_days,
    available: row.available,
    configured: row.price_inr !== null && row.eta_min_days !== null && row.eta_max_days !== null
  };
}

export async function listShippingMethods(): Promise<ShippingMethod[]> {
  const { data, error } = await client().from("shipping_methods").select("*").order("sort_order");
  if (error) throw failure(error, "Shipping methods could not be loaded.");
  return (data ?? []).map(shippingFromRow);
}

export async function saveShippingMethod(method: ShippingMethod): Promise<void> {
  const { error } = await client().from("shipping_methods").upsert({
    id: method.id,
    name: method.name,
    description: method.description,
    price_inr: method.priceInr,
    eta_min_days: method.etaMinDays,
    eta_max_days: method.etaMaxDays,
    available: method.available
  });
  if (error) throw failure(error, "The shipping method could not be saved.");
}

export async function createShippingMethod(input: { id: string; name: string; description: string }): Promise<void> {
  const id = input.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (!id) throw new AdminError("Give the method a short identifier.", "id");
  const { error } = await client().from("shipping_methods").insert({
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    available: false
  });
  if (error) throw failure(error, "The shipping method could not be added.");
}

export async function deleteShippingMethod(id: string): Promise<void> {
  const { error } = await client().from("shipping_methods").delete().eq("id", id);
  if (error) throw failure(error, "The shipping method could not be deleted.");
}
