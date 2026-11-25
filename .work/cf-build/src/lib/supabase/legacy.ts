import { getProduct } from "@/lib/catalog";
import { STORAGE_KEYS } from "@/lib/config";
import type { AddressBookEntry, CustomerAccount, Order } from "@/types";
import { normaliseMobile, validateAddress, validateName, validatePhone } from "@/lib/validation";
import { addSavedBoard, saveAddress, updateProfile } from "./account";
import { requireSupabaseBrowserClient } from "./client";
import type { Json } from "./database.types";

const IMPORTED_FLAG = "plusmark.legacy.imported.v1";

interface LegacyAccount extends Partial<CustomerAccount> {
  /* Older prototype fields are accepted and dropped. */
  organisationName?: string | null;
  gstin?: string | null;
  customerType?: string | null;
}

export interface LegacySnapshot {
  fullName: string | null;
  phone: string | null;
  addresses: AddressBookEntry[];
  wishlist: string[];
  orders: Order[];
}

export interface LegacyImportResult {
  profileUpdated: boolean;
  addressesImported: number;
  boardsImported: number;
  ordersImported: number;
  skipped: string[];
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function isAddressEntry(value: unknown): value is AddressBookEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<AddressBookEntry>;
  return Boolean(entry.line1 && entry.city && entry.state && entry.pincode && entry.recipientName);
}

/** Reads only the prototype keys this feature migrates; B2B fields are ignored. */
export function readLegacySnapshot(): LegacySnapshot | null {
  if (typeof window === "undefined") return null;
  if (window.localStorage.getItem(IMPORTED_FLAG)) return null;

  const account = readJson<LegacyAccount>(STORAGE_KEYS.session);
  const wishlist = readJson<string[]>(STORAGE_KEYS.wishlist) ?? [];
  const orders = readJson<Order[]>("plusmark.orders.v1") ?? [];
  const addresses = Array.isArray(account?.addresses) ? account!.addresses.filter(isAddressEntry) : [];

  const fullName = typeof account?.fullName === "string" ? account.fullName.trim() : "";
  const phone = typeof account?.phone === "string" ? normaliseMobile(account.phone) : "";
  const validPhone = phone && validatePhone(phone) === null ? phone : null;

  if (!fullName && !validPhone && addresses.length === 0 && wishlist.length === 0 && orders.length === 0) {
    return null;
  }

  return {
    fullName: fullName && validateName(fullName) === null ? fullName : null,
    phone: validPhone,
    addresses,
    wishlist: wishlist.filter((slug) => typeof slug === "string" && Boolean(getProduct(slug))),
    orders: orders.filter((order) => Boolean(order?.reference && Array.isArray(order.lines)))
  };
}

export function markLegacyHandled(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(IMPORTED_FLAG, new Date().toISOString());
  } catch {
    /* Storage may be unavailable; the prompt simply returns next time. */
  }
}

export function clearLegacyKeys(): void {
  if (typeof window === "undefined") return;
  for (const key of [STORAGE_KEYS.session, STORAGE_KEYS.wishlist, "plusmark.orders.v1"]) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Copies the prototype profile, addresses, saved boards and orders into the
 * signed-in account. Keys are only cleared by the caller once this resolves.
 */
export async function importLegacySnapshot(snapshot: LegacySnapshot): Promise<LegacyImportResult> {
  const result: LegacyImportResult = {
    profileUpdated: false,
    addressesImported: 0,
    boardsImported: 0,
    ordersImported: 0,
    skipped: []
  };

  if (snapshot.fullName || snapshot.phone) {
    try {
      await updateProfile({
        ...(snapshot.fullName ? { fullName: snapshot.fullName } : {}),
        ...(snapshot.phone ? { phone: snapshot.phone } : {})
      });
      result.profileUpdated = true;
    } catch (error) {
      result.skipped.push(error instanceof Error ? `Profile: ${error.message}` : "Profile could not be imported.");
    }
  }

  for (const [index, entry] of snapshot.addresses.entries()) {
    const errors = validateAddress({
      recipientName: entry.recipientName,
      phone: entry.phone,
      line1: entry.line1,
      city: entry.city,
      state: entry.state,
      pincode: entry.pincode
    });
    if (errors.length > 0) {
      result.skipped.push(`Address ${index + 1}: ${errors[0].message}`);
      continue;
    }
    try {
      await saveAddress({
        ...entry,
        /* A blank id tells the repository to insert a fresh row. */
        id: "",
        label: entry.label?.trim() || "Home",
        isDefaultShipping: index === 0,
        isDefaultBilling: index === 0
      });
      result.addressesImported += 1;
    } catch (error) {
      result.skipped.push(error instanceof Error ? `Address ${index + 1}: ${error.message}` : `Address ${index + 1} skipped.`);
    }
  }

  for (const slug of snapshot.wishlist) {
    try {
      await addSavedBoard(slug);
      result.boardsImported += 1;
    } catch (error) {
      result.skipped.push(error instanceof Error ? `Saved board ${slug}: ${error.message}` : `Board ${slug} skipped.`);
    }
  }

  if (snapshot.orders.length > 0) {
    const supabase = requireSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      for (const order of snapshot.orders) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .insert({
              user_id: user.id,
              reference: order.reference,
              contact_email: order.email,
              status: order.status,
              payment_status: order.paymentStatus,
              payment_method: order.paymentMethod,
              total: order.totals.totalInr ?? 0,
              totals: order.totals as unknown as Json,
              shipping_address: order.shippingAddress as unknown as Json,
              billing_address: order.billingAddress as unknown as Json,
              coupon_code: order.couponCode,
              created_at: order.placedAt
            })
            .select("id")
            .single();

          if (error || !data) {
            result.skipped.push(`Order ${order.reference}: ${error?.message ?? "not saved"}`);
            continue;
          }

          if (order.lines.length > 0) {
            const { error: itemsError } = await supabase.from("order_items").insert(
              order.lines.map((line) => ({
                order_id: data.id,
                product_id: line.slug,
                name: line.name,
                variant_label: line.variantLabel || null,
                sku: line.sku || null,
                price: line.unitPriceInr,
                quantity: line.quantity
              }))
            );
            if (itemsError) {
              result.skipped.push(`Order ${order.reference}: lines could not be copied.`);
              continue;
            }
          }
          result.ordersImported += 1;
        } catch (error) {
          result.skipped.push(error instanceof Error ? `Order ${order.reference}: ${error.message}` : `Order ${order.reference} skipped.`);
        }
      }
    }
  }

  return result;
}
