import type { SupabaseClient, User } from "@supabase/supabase-js";
import { requireSupabaseBrowserClient, BackendNotConfiguredError } from "./client";
import type { Json } from "./database.types";
import { normaliseMobile, validateAddress, validateName, validatePhone } from "@/lib/validation";
import type { AddressBookEntry, CustomerAccount, Order, OrderLine } from "@/types";

export class AccountError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "AccountError";
    this.field = field;
  }
}

// The account layer talks to the Plusmark backend schema; rows are mapped by hand below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function client(): SupabaseClient<any, "public", any> {
  try {
    return requireSupabaseBrowserClient() as unknown as SupabaseClient;
  } catch (error) {
    if (error instanceof BackendNotConfiguredError) {
      throw new AccountError("Accounts are not connected in this build. Add the Supabase keys to .env.local.");
    }
    throw error;
  }
}

function failure(error: { code?: string; message?: string } | null, fallback: string): AccountError {
  if (error?.code === "23505") {
    if (error.message?.includes("phone")) return new AccountError("That mobile number is already linked to another account.", "phone");
    if (error.message?.includes("addresses_one_default")) return new AccountError("Only one address can be the default.");
    return new AccountError("This record already exists.", "form");
  }
  if (error?.code === "42501" || error?.code === "PGRST301") {
    return new AccountError("You do not have access to that record. Sign in again.");
  }
  return new AccountError(fallback);
}

/* ------------------------------- Mapping -------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addressFromRow(row: any): AddressBookEntry {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    landmark: row.landmark,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    isDefaultShipping: Boolean(row.is_default_shipping),
    isDefaultBilling: Boolean(row.is_default_billing)
  };
}

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

/* ------------------------------- Profile -------------------------------- */

export async function getProfile(user: User): Promise<CustomerAccount> {
  const supabase = client();
  const [{ data: profile, error: profileError }, { data: addressRows, error: addressError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: true })
  ]);

  if (profileError) throw failure(profileError, "Your profile could not be loaded. Try refreshing.");
  if (addressError) throw failure(addressError, "Your saved addresses could not be loaded.");

  const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const metadataPhone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";

  return {
    id: user.id,
    email: user.email ?? "",
    role: profile?.role === "admin" ? "admin" : "customer",
    fullName: profile?.full_name || metadataName || (user.email ?? "").split("@")[0],
    phone: profile?.phone ?? (metadataPhone ? normaliseMobile(metadataPhone) : null),
    addresses: (addressRows ?? []).map(addressFromRow),
    createdAt: profile?.created_at ?? user.created_at
  };
}

export async function updateProfile(patch: { fullName?: string; phone?: string }): Promise<void> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new AccountError("Sign in again to update your profile.");

  const update: { full_name?: string; phone?: string } = {};

  if (patch.fullName !== undefined) {
    const nameError = validateName(patch.fullName);
    if (nameError) throw new AccountError(nameError, "fullName");
    update.full_name = patch.fullName.trim();
  }

  if (patch.phone !== undefined) {
    const phoneError = validatePhone(patch.phone);
    if (phoneError) throw new AccountError(phoneError, "phone");
    update.phone = normaliseMobile(patch.phone);
  }

  if (Object.keys(update).length === 0) return;

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) throw failure(error, "Your profile could not be saved.");

  if (update.full_name) {
    await supabase.auth.updateUser({ data: { full_name: update.full_name } });
  }
}

export async function changeEmail(newEmail: string): Promise<string> {
  const supabase = client();
  const clean = newEmail.trim().toLowerCase();
  const { error } = await supabase.auth.updateUser({ email: clean });
  if (error) {
    if (error.code === "email_exists" || error.code === "user_already_exists") {
      throw new AccountError("That email is already linked to another account.", "email");
    }
    if (error.code === "over_email_send_rate_limit") {
      throw new AccountError("A confirmation was just sent. Wait a minute before trying again.");
    }
    throw new AccountError("The confirmation email could not be sent. Try again.");
  }
  return `We sent a confirmation link to ${clean}. Your email changes only after you open it.`;
}

/* ------------------------------- Addresses ------------------------------ */

export async function listAddresses(): Promise<AddressBookEntry[]> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default_shipping", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw failure(error, "Your addresses could not be loaded.");
  return (data ?? []).map(addressFromRow);
}

export async function saveAddress(entry: AddressBookEntry): Promise<AddressBookEntry> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new AccountError("Sign in again to save an address.");

  const errors = validateAddress({
    recipientName: entry.recipientName,
    phone: entry.phone,
    line1: entry.line1,
    city: entry.city,
    state: entry.state,
    pincode: entry.pincode
  });
  if (errors.length > 0) throw new AccountError(errors[0].message, errors[0].field);

  const fields = {
    label: entry.label.trim() || "Home",
    recipient_name: entry.recipientName.trim(),
    phone: normaliseMobile(entry.phone),
    line1: entry.line1.trim(),
    line2: entry.line2?.trim() || null,
    landmark: entry.landmark?.trim() || null,
    city: entry.city.trim(),
    state: entry.state,
    pincode: entry.pincode.trim(),
    is_default_shipping: Boolean(entry.isDefaultShipping),
    is_default_billing: Boolean(entry.isDefaultShipping)
  };

  const existingId = entry.id.startsWith("addr_") || entry.id === "" ? null : entry.id;

  /* The partial unique index allows a single default per user, so clear the old
     one before promoting this row. */
  if (fields.is_default_shipping) {
    let clear = supabase.from("addresses").update({ is_default_shipping: false, is_default_billing: false }).eq("user_id", user.id);
    if (existingId) clear = clear.neq("id", existingId);
    const { error: clearError } = await clear;
    if (clearError) throw failure(clearError, "The default address could not be updated.");
  }

  if (existingId) {
    const { data, error } = await supabase.from("addresses").update(fields).eq("id", existingId).select("*").single();
    if (error) throw failure(error, "That address could not be saved.");
    return addressFromRow(data);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...fields, user_id: user.id })
    .select("*")
    .single();
  if (error) throw failure(error, "That address could not be saved.");
  return addressFromRow(data);
}

export async function deleteAddress(id: string): Promise<void> {
  const supabase = client();
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw failure(error, "That address could not be removed.");
}

/* ---------------------------- Saved boards ------------------------------ */

export async function listSavedBoards(): Promise<string[]> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_boards")
    .select("product_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw failure(error, "Your saved boards could not be loaded.");
  return (data ?? []).map((row) => row.product_id);
}

export async function addSavedBoard(productId: string): Promise<void> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new AccountError("Sign in again to save this board.");

  const { error } = await supabase.from("saved_boards").insert({ user_id: user.id, product_id: productId });
  if (error && error.code !== "23505") throw failure(error, "That board could not be saved.");
}

export async function removeSavedBoard(productId: string): Promise<void> {
  const supabase = client();
  const { error } = await supabase.from("saved_boards").delete().eq("product_id", productId);
  if (error) throw failure(error, "That board could not be removed.");
}


/* -------------------------------- Orders -------------------------------- */
/* Orders live in the Plusmark backend (see supabase/migrations). Placing, paying, cancelling and
   returning go through server functions; the browser never decides a price or a payment status. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const GUEST_KEY = "plusmark.guest-orders.v1";
interface GuestOrderRef {
  id: string;
  token: string;
  number: string;
  email: string;
}
function readGuestOrders(): Record<string, GuestOrderRef> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(GUEST_KEY) ?? "{}") as Record<string, GuestOrderRef>;
  } catch {
    return {};
  }
}
/** Guests prove ownership of an order with a private token that stays in this browser. */
export function rememberGuestOrder(ref: GuestOrderRef): void {
  if (typeof window === "undefined") return;
  const all = readGuestOrders();
  all[ref.id] = ref;
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(all));
}
export function guestTokenFor(orderId: string): string | null {
  return readGuestOrders()[orderId]?.token ?? null;
}
export function guestOrderRefs(): GuestOrderRef[] {
  return Object.values(readGuestOrders());
}

function backendBase(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
}
async function bearer(): Promise<string> {
  const supabase = client();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
}
export async function callBackendFunction<T = Row>(name: string, body: unknown): Promise<{ status: number; data: T }> {
  const response = await fetch(`${backendBase()}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      Authorization: `Bearer ${await bearer()}`
    },
    body: JSON.stringify(body)
  });
  const data = (await response.json().catch(() => ({}))) as T;
  return { status: response.status, data };
}

function mapPaymentStatus(status: string): Order["paymentStatus"] {
  if (status === "partially_refunded") return "paid";
  return (["unpaid", "pending", "paid", "failed", "refunded"].includes(status) ? status : "unpaid") as Order["paymentStatus"];
}

export function orderFromPayload(payload: Row): Order {
  const o = payload.order as Row;
  const items = (payload.items ?? []) as Row[];
  const shipments = (payload.shipments ?? []) as Row[];
  const events = (payload.events ?? []) as Row[];
  const returns = (payload.returns ?? []) as Row[];
  const gross = !o.prices_include_gst;
  const shipping = Number(o.shipping_inr ?? 0) + Number(o.cod_fee_inr ?? 0);
  const first = shipments[0];
  const lines: OrderLine[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug ?? "",
    variantLabel: item.variant_label ?? "",
    sku: item.sku ?? "",
    quantity: item.quantity,
    unitPriceInr: Number(item.unit_price_inr),
    lineTotalInr: Number(item.line_amount_inr)
  }));
  return {
    id: o.id,
    reference: o.order_number,
    customerId: o.user_id ?? null,
    email: o.email,
    placedAt: o.placed_at,
    status: o.status,
    paymentStatus: mapPaymentStatus(o.payment_status),
    paymentMethod: o.payment_method === "razorpay" ? "razorpay" : "cod_placeholder",
    lines,
    totals: {
      subtotalInr: Number(o.subtotal_inr),
      discountInr: Number(o.discount_inr),
      gstInr: Number(o.gst_inr),
      shippingInr: shipping,
      totalInr: Number(o.total_inr),
      pricingIncomplete: false
    },
    shippingAddress: addressFromJson(o.shipping_address, `${o.id}-ship`),
    billingAddress: addressFromJson(o.billing_address, `${o.id}-bill`),
    shipment: first
      ? {
          awb: first.tracking_number ?? null,
          carrier: first.carrier_name ?? null,
          etaFrom: first.eta_from ?? null,
          etaTo: first.eta_to ?? null,
          events: events
            .filter((e) => e.status)
            .map((e) => ({ at: e.at, status: e.status, note: e.note ?? e.title, location: null }))
        }
      : null,
    couponCode: o.coupon_code ?? null,
    invoiceNumber: o.invoice_number ?? null,
    trackingUrl: first?.tracking_url ?? null,
    returnReason: returns[0]?.reason ?? null,
    shippingMethodId: gross ? undefined : undefined,
    isDemo: false
  };
}

export async function listOrders(): Promise<Order[]> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.rpc("my_orders" as never, { p_limit: 100 } as never);
  if (error) throw failure(error, "Your orders could not be loaded.");
  return ((data ?? []) as Row[]).map(orderFromPayload);
}

/** Places the order on the server (guests included). The server re-prices everything. */
export async function saveOrder(order: Order, options?: { captchaToken?: string }): Promise<Order> {
  const { status, data } = await callBackendFunction<Row>("place-order", {
    items: order.lines.map((line) => ({ ref: line.variantId, sku: line.sku, quantity: line.quantity, colour: line.colour ?? undefined })),
    email: order.email,
    phone: order.shippingAddress.phone,
    customer_name: order.shippingAddress.recipientName,
    shipping_address: order.shippingAddress,
    billing_address: order.billingAddress,
    coupon: order.couponCode,
    payment_method: order.paymentMethod === "razorpay" ? "razorpay" : "cod",
    captcha_token: options?.captchaToken
  });
  if (!data?.ok) {
    throw new AccountError(
      (data?.message as string | undefined) ??
        (status === 429 ? "Too many attempts. Please wait a few minutes." : "The order could not be placed.")
    );
  }
  if (data.guest_token) {
    rememberGuestOrder({ id: data.order_id, token: data.guest_token, number: data.order_number, email: order.email });
  }
  const saved = await getOrderByReference(data.order_number, order.email);
  if (!saved) throw new AccountError("The order was placed but could not be read back. Contact Plusmark with your order number.");
  return saved;
}

export async function cancelOwnOrder(orderId: string): Promise<Order> {
  const supabase = client();
  const { data, error } = await supabase.rpc("cancel_own_order" as never, {
    p_order_id: orderId,
    p_guest_token: guestTokenFor(orderId)
  } as never);
  if (error) throw failure(error, "The order could not be cancelled.");
  const result = data as unknown as Row;
  if (!result?.ok) throw new AccountError((result?.message as string | undefined) ?? "The order could not be cancelled.");
  const saved = await findOrderById(orderId);
  if (!saved) throw new AccountError("The cancellation was saved but could not be read back.");
  return saved;
}

export async function requestOrderReturn(orderId: string, reason: string): Promise<Order> {
  const supabase = client();
  const current = await findOrderById(orderId);
  if (!current) throw new AccountError("That order could not be found.");
  const { data, error } = await supabase.rpc("request_return" as never, {
    p_order_id: orderId,
    p_items: current.lines.map((line) => ({ order_item_id: line.id, quantity: line.quantity })),
    p_reason: reason,
    p_guest_token: guestTokenFor(orderId)
  } as never);
  if (error) throw failure(error, "The return request could not be recorded.");
  const result = data as unknown as Row;
  if (!result?.ok) throw new AccountError((result?.message as string | undefined) ?? "The return request could not be recorded.");
  const saved = await findOrderById(orderId);
  if (!saved) throw new AccountError("The return request was saved but could not be read back.");
  return saved;
}

async function findOrderById(orderId: string): Promise<Order | null> {
  const mine = (await listOrders().catch(() => [])).find((o) => o.id === orderId);
  if (mine) return mine;
  const guest = guestOrderRefs().find((g) => g.id === orderId);
  return guest ? getOrderByReference(guest.number, guest.email) : null;
}

/** Signed-in customers see their own orders; guests need the order number plus the email used. */
export async function getOrderByReference(reference: string, email?: string, token?: string): Promise<Order | null> {
  const supabase = client();
  const guest = guestOrderRefs().find((g) => g.number.toUpperCase() === reference.toUpperCase());
  const { data, error } = await supabase.rpc("track_order" as never, {
    p_order_number: reference,
    p_email: email ?? guest?.email ?? null,
    p_guest_token: token ?? guest?.token ?? null
  } as never);
  if (error) throw failure(error, "That order could not be loaded.");
  const result = data as unknown as Row;
  if (!result?.ok) return null;
  const order = orderFromPayload(result);
  // A private link proves ownership: keep it so Pay now, cancel and return keep working from this browser.
  if (token && !order.customerId) rememberGuestOrder({ id: order.id, token, number: order.reference, email: order.email });
  return order;
}
/** Opens the GST tax invoice PDF for an order in a new tab. Only paid or dispatched orders have one. */
export async function openInvoicePdf(order: Order): Promise<void> {
  const response = await fetch(`${backendBase()}/functions/v1/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      Authorization: `Bearer ${await bearer()}`
    },
    body: JSON.stringify({ order_id: order.id, guest_token: guestTokenFor(order.id), email: order.email })
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new AccountError(body.message ?? "The invoice could not be opened.");
  }
  const url = URL.createObjectURL(await response.blob());
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
