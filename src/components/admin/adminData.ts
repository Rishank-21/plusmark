import { categories, getProduct, products, seriesList } from "@/lib/catalog";
import { dashboardMetrics, demoEnquiries, demoOrders, demoQuotations, inventoryRows } from "@/lib/demo-data";
import type { InventoryRow, Order, OrderStatus, Product } from "@/types";

/**
 * Derivations shared by the admin screens. Mirrors the wording in
 * src/components/ui/Badge.tsx (a shared file the admin scope may not edit) so
 * filter options and status badges never drift apart.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order placed",
  payment_pending: "Payment pending",
  payment_failed: "Payment failed",
  confirmed: "Payment confirmed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return requested",
  refund_processing: "Refund processing",
  refunded: "Refunded"
};

export const ALL_ORDER_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

/** Statuses an operator would act on, in the order the desk works them. */
export const ATTENTION_STATUSES: OrderStatus[] = [
  "payment_pending",
  "payment_failed",
  "placed",
  "return_requested",
  "refund_processing"
];

/**
 * Legal forward moves for the prototype status control. Cancelling is offered
 * separately because it is destructive and sits behind ConfirmDialog.
 */
export const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  placed: ["payment_pending", "confirmed", "cancelled"],
  payment_pending: ["confirmed", "payment_failed", "cancelled"],
  payment_failed: ["payment_pending", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered"],
  delivered: ["return_requested"],
  return_requested: ["refund_processing", "delivered"],
  refund_processing: ["refunded"],
  refunded: [],
  cancelled: []
};

export function orderValueInr(order: Order): number {
  return order.totals.totalInr ?? 0;
}

export function orderUnits(order: Order): number {
  return order.lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Orders the desk should look at today: unpaid, failed, or awaiting movement. */
export function ordersNeedingAttention(): Order[] {
  return demoOrders.filter((order) => ATTENTION_STATUSES.includes(order.status));
}

export function orderById(id: string): Order | undefined {
  return demoOrders.find((order) => order.id === id);
}

export function ordersForCustomer(customerId: string | null): Order[] {
  if (!customerId) return [];
  return demoOrders.filter((order) => order.customerId === customerId);
}

export function enquiriesForContact(email: string) {
  const needle = email.trim().toLowerCase();
  return demoEnquiries.filter((enquiry) => enquiry.email.toLowerCase() === needle);
}

export function categoryCount(id: string): number {
  return products.filter((product) => product.categoryId === id).length;
}

export function categoryName(id: string): string {
  return categories.find((category) => category.id === id)?.name ?? "Uncategorised";
}

export function seriesName(id: string | null): string {
  if (!id) return "Not in a series";
  const match = seriesList.find((series) => series.id === id);
  return match?.name ?? id.replace(/-/g, " ");
}

/** Stock summary for a product row: Plusmark publishes no on-hand quantity. */
export function productStockSummary(product: Product): { tracked: number; untracked: number; total: number } {
  const tracked = product.variants.filter((variant) => variant.trackInventory).length;
  return { tracked, untracked: product.variants.length - tracked, total: product.variants.length };
}

export function isLowStock(row: InventoryRow): boolean {
  return row.trackInventory && row.stock !== null && row.stock <= row.lowStockThreshold;
}

export function isOutOfStock(row: InventoryRow): boolean {
  return row.trackInventory && row.stock !== null && row.stock <= 0;
}

export type StockState = "untracked" | "out" | "low" | "ok";

export function stockState(row: InventoryRow, override?: number): StockState {
  const stock = override ?? row.stock;
  if (!row.trackInventory || stock === null) return "untracked";
  if (stock <= 0) return "out";
  if (stock <= row.lowStockThreshold) return "low";
  return "ok";
}

export function lowStockRows(overrides: Record<string, number> = {}): InventoryRow[] {
  return inventoryRows.filter((row) => stockState(row, overrides[row.variantId]) !== "ok" && row.trackInventory);
}

/* ------------------------------ reports -------------------------------- */

export function ordersByStatus(): { status: OrderStatus; count: number; valueInr: number }[] {
  return ALL_ORDER_STATUSES.map((status) => {
    const list = demoOrders.filter((order) => order.status === status);
    return { status, count: list.length, valueInr: list.reduce((sum, order) => sum + orderValueInr(order), 0) };
  }).filter((row) => row.count > 0);
}

export function revenueByMonth(): { month: string; orders: number; valueInr: number }[] {
  const map = new Map<string, { orders: number; valueInr: number }>();
  for (const order of demoOrders) {
    const date = new Date(order.placedAt);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const current = map.get(key) ?? { orders: 0, valueInr: 0 };
    map.set(key, { orders: current.orders + 1, valueInr: current.valueInr + orderValueInr(order) });
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => ({
      month: new Date(`${key}-01T00:00:00.000Z`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }),
      ...value
    }));
}

export function revenueByCategory(): { label: string; valueInr: number; units: number }[] {
  const map = new Map<string, { valueInr: number; units: number }>();
  for (const order of demoOrders) {
    if (order.status === "cancelled") continue;
    for (const line of order.lines) {
      const product = getProduct(line.slug);
      const label = product ? categoryName(product.categoryId) : "Unmapped product";
      const current = map.get(label) ?? { valueInr: 0, units: 0 };
      map.set(label, { valueInr: current.valueInr + line.lineTotalInr, units: current.units + line.quantity });
    }
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, ...value }))
    .sort((a, b) => b.valueInr - a.valueInr);
}

export function enquiriesByOutcome(): { label: string; value: number }[] {
  const statuses = demoEnquiries.map((enquiry) => enquiry.status);
  const labels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    quote_sent: "Quote sent",
    negotiation: "Negotiation",
    accepted: "Accepted (won)",
    rejected: "Rejected (lost)"
  };
  return [...new Set(statuses)]
    .map((status) => ({ label: labels[status] ?? status, value: statuses.filter((s) => s === status).length }))
    .sort((a, b) => b.value - a.value);
}

export function quotationsByStatus(): { label: string; value: number }[] {
  const statuses: Record<string, number> = {};
  for (const quotation of demoQuotations) {
    statuses[quotation.status] = (statuses[quotation.status] ?? 0) + 1;
  }
  const labels: Record<string, string> = {
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    rejected: "Rejected",
    converted: "Converted to order"
  };
  return Object.entries(statuses).map(([status, value]) => ({ label: labels[status] ?? status, value }));
}

export function dashboardRow() {
  return dashboardMetrics();
}

/** Inclusive date-range filter against an ISO timestamp. */
export function withinRange(iso: string, from: string, to: string): boolean {
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}
