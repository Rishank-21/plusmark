import type { User } from "@supabase/supabase-js";
import { requireSupabaseBrowserClient, BackendNotConfiguredError } from "./client";
import type { AddressRow, Database, Json } from "./database.types";
import { normaliseMobile, validateAddress, validateName, validatePhone } from "@/lib/validation";
import type { AddressBookEntry, CartTotals, CustomerAccount, Order, OrderLine } from "@/types";

export class AccountError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "AccountError";
    this.field = field;
  }
}

function client() {
  try {
    return requireSupabaseBrowserClient();
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

export function addressFromRow(row: AddressRow): AddressBookEntry {
  return {
    id: row.id,
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

  const update: Database["public"]["Tables"]["profiles"]["Update"] = {};

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
    .order("is_default", { ascending: false })
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
    full_name: entry.recipientName.trim(),
    phone: normaliseMobile(entry.phone),
    line1: entry.line1.trim(),
    line2: entry.line2?.trim() || null,
    landmark: entry.landmark?.trim() || null,
    city: entry.city.trim(),
    state: entry.state,
    pincode: entry.pincode.trim(),
    is_default: Boolean(entry.isDefaultShipping)
  };

  const existingId = entry.id.startsWith("addr_") || entry.id === "" ? null : entry.id;

  /* The partial unique index allows a single default per user, so clear the old
     one before promoting this row. */
  if (fields.is_default) {
    let clear = supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
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

interface OrderWithItems {
  id: string;
  user_id: string;
  reference: string;
  contact_email: string;
  status: Order["status"];
  payment_status: Order["paymentStatus"];
  payment_method: Order["paymentMethod"];
  total: number;
  totals: unknown;
  shipping_address: unknown;
  billing_address: unknown;
  coupon_code: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  return_reason: string | null;
  invoice_number: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    name: string;
    variant_label: string | null;
    sku: string | null;
    price: number;
    quantity: number;
  }[];
}

function orderFromRow(row: OrderWithItems): Order {
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
        ? {
            awb: row.tracking_number,
            carrier: row.courier_name,
            etaFrom: null,
            etaTo: null,
            events: []
          }
        : null,
    couponCode: row.coupon_code,
    invoiceNumber: row.invoice_number,
    trackingUrl: row.tracking_url,
    returnReason: row.return_reason,
    isDemo: true
  };
}

export async function listOrders(): Promise<Order[]> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw failure(error, "Your orders could not be loaded.");
  return ((data ?? []) as OrderWithItems[]).map(orderFromRow);
}

function bumpReference(reference: string): string {
  const tail = reference.split("-").pop() ?? "";
  const parsed = Number.parseInt(tail, 10);
  if (Number.isNaN(parsed)) return `${reference}-${Date.now().toString(36)}`;
  return `${reference.slice(0, reference.length - tail.length)}${parsed + 1}`;
}

export async function saveOrder(order: Order): Promise<Order> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new AccountError("Sign in to save this order to your account.");

  /* The reference comes from the browser's local sequence, which cannot see
     orders placed elsewhere. Walk the sequence forward on a collision instead
     of failing the checkout. */
  let data: { reference: string } | null = null;
  let candidate = order.reference;
  for (let attempt = 0; attempt < 6 && !data; attempt += 1) {
    const result = await supabase.rpc("place_order", {
      p_reference: candidate,
      p_contact_email: order.email,
      p_payment_method: order.paymentMethod,
      p_shipping_method_id: order.shippingMethodId ?? "standard",
      p_shipping_address: order.shippingAddress as unknown as Json,
      p_billing_address: order.billingAddress as unknown as Json,
      p_coupon_code: order.couponCode,
      p_items: order.lines.map((line) => ({
        product_id: line.slug,
        variant_label: line.variantLabel,
        quantity: line.quantity
      })) as unknown as Json
    });
    if (!result.error) {
      data = result.data;
      break;
    }
    if (result.error.code !== "23505") throw failure(result.error, "The order could not be saved to your account.");
    candidate = bumpReference(candidate);
  }
  if (!data) throw new AccountError("A free order reference could not be allocated. Try again in a moment.");

  const saved = await getOrderByReference(data.reference);
  if (!saved) throw new AccountError("The order was saved but could not be read back. Contact Plusmark with your reference.");
  return saved;
}

export async function cancelOwnOrder(orderId: string): Promise<Order> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new AccountError("Sign in to cancel this order.");
  const { data, error } = await supabase.rpc("cancel_own_order", { p_order_id: orderId });
  if (error) throw failure(error, "The order could not be cancelled.");
  const saved = await getOrderByReference(data.reference);
  if (!saved) throw new AccountError("The cancellation was saved but could not be read back.");
  return saved;
}

export async function requestOrderReturn(orderId: string, reason: string): Promise<Order> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new AccountError("Sign in to request a return.");
  const { data, error } = await supabase.rpc("request_order_return", {
    p_order_id: orderId,
    p_reason: reason
  });
  if (error) throw failure(error, "The return request could not be recorded.");
  const saved = await getOrderByReference(data.reference);
  if (!saved) throw new AccountError("The return request was saved but could not be read back.");
  return saved;
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .eq("reference", reference)
    .maybeSingle();

  if (error) throw failure(error, "That order could not be loaded.");
  return data ? orderFromRow(data as OrderWithItems) : null;
}
