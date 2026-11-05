"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, formatDateTime, formatInr } from "@/lib/format";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { TextField } from "@/components/ui/Field";
import { AdminPageHeader, AdminPanel, StatStrip } from "@/components/admin/Metrics";
import { StatusTimeline } from "@/components/admin/StatusTimeline";
import { ORDER_STATUS_LABEL, ORDER_TRANSITIONS } from "@/components/admin/adminData";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import { getAdminOrder, updateOrderStatus, updateOrderTracking } from "@/lib/supabase/admin";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";
import type { Order, OrderStatus } from "@/types";

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const session = useSession();
  const toast = useToast();
  const query = useAdminQuery<Order | null>(() => getAdminOrder(orderId));
  const [pendingMove, setPendingMove] = useState<OrderStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [tracking, setTracking] = useState({ courierName: "", trackingNumber: "", trackingUrl: "" });
  const [trackingSaving, setTrackingSaving] = useState(false);

  const deviceOrder = session.orders.find((entry) => entry.id === orderId);
  const order = query.data ?? deviceOrder;
  const isDeviceOrder = !query.data && Boolean(deviceOrder);
  const isLocalOnly = isDeviceOrder && !query.loading;

  useEffect(() => {
    if (!order) return;
    setTracking({
      courierName: order.shipment?.carrier ?? "",
      trackingNumber: order.shipment?.awb ?? "",
      trackingUrl: order.trackingUrl ?? ""
    });
  }, [order?.id, order?.shipment?.carrier, order?.shipment?.awb, order?.trackingUrl]);

  if (!order && query.loading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-live="polite">
        <span className="sr-only">Loading the order record</span>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order && query.error) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader title="Order" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders", href: "/admin/orders" }, { label: "Order" }]} />
        <ErrorState title="That order could not be loaded" body={query.error} onRetry={query.reload} />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Order record not found"
        body="This order does not exist in Supabase or in this browser. It may have been mistyped."
        action={{ label: "Back to orders", href: "/admin/orders" }}
      />
    );
  }

  const transitions = ORDER_TRANSITIONS[order.status] ?? [];

  const applyMove = async (next: OrderStatus) => {
    if (saving || query.loading) return;
    setSaving(true);
    try {
      if (isLocalOnly) {
        session.updateOrderStatus(order.id, next);
        toast.push(`${order.reference} moved to ${ORDER_STATUS_LABEL[next]} in this browser.`);
      } else {
        await updateOrderStatus(order.id, next);
        query.setData((current) => (current ? { ...current, status: next } : current));
        toast.push(`${order.reference} moved to ${ORDER_STATUS_LABEL[next]}.`);
      }
    } catch (reason) {
      toast.push(errorMessage(reason, "The order status could not be saved."), "error");
    } finally {
      setSaving(false);
    }
  };

  const saveTracking = async () => {
    if (trackingSaving || isLocalOnly) return;
    setTrackingSaving(true);
    try {
      await updateOrderTracking(order.id, {
        courierName: tracking.courierName || null,
        trackingNumber: tracking.trackingNumber || null,
        trackingUrl: tracking.trackingUrl || null
      });
      query.setData((current) =>
        current
          ? {
              ...current,
              shipment:
                tracking.courierName || tracking.trackingNumber
                  ? {
                      awb: tracking.trackingNumber || null,
                      carrier: tracking.courierName || null,
                      etaFrom: null,
                      etaTo: null,
                      events: []
                    }
                  : null,
              trackingUrl: tracking.trackingUrl || null
            }
          : current
      );
      toast.push("Tracking details saved. The customer sees them on the order.", "success");
    } catch (reason) {
      toast.push(errorMessage(reason, "The tracking details could not be saved."), "error");
    } finally {
      setTrackingSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={order.reference}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: order.reference }
        ]}
        lede={`Placed ${formatDateTime(order.placedAt)} · ${order.email}`}
        actions={
          <ButtonLink href="/admin/orders" variant="secondary">
            All orders
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        {isLocalOnly && <Badge tone="demo">Placed on this device</Badge>}
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus} />
        <Badge tone="demo">{order.paymentMethod.replace(/_/g, " ")}</Badge>
        <span className="text-caption text-graphite">{formatDate(order.placedAt)}</span>
      </div>

      {isLocalOnly && (
        <p className="rounded-xs border border-warning/30 bg-warning-wash px-3 py-2 text-caption text-ink">
          This order exists only in this browser. A status change here is saved locally, and the customer sees it only on
          this device. Guest orders are not written to Supabase.
        </p>
      )}

      <StatStrip
        items={[
          { label: "Units", value: order.lines.reduce((sum, line) => sum + line.quantity, 0).toLocaleString("en-IN") },
          { label: "Subtotal", value: formatInr(order.totals.subtotalInr ?? 0) },
          { label: "GST", value: formatInr(order.totals.gstInr) },
          { label: "Freight", value: order.totals.shippingInr === null ? "To confirm" : formatInr(order.totals.shippingInr) },
          { label: "Total", value: order.totals.totalInr === null ? "To confirm" : formatInr(order.totals.totalInr) },
          { label: "Lines", value: String(order.lines.length) }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminPanel title="Order lines" description="Recorded line items, prices and quantities." padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-left">
                <thead className="bg-sand/45">
                  <tr>
                    {["Product", "Size / SKU", "Qty", "Unit", "Line total"].map((label, index) => (
                      <th
                        key={label}
                        scope="col"
                        className={`px-4 py-3 text-label font-medium uppercase tracking-[0.1em] text-graphite ${index > 2 ? "text-right" : ""}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair">
                  {order.lines.map((line) => (
                    <tr key={line.id}>
                      <th scope="row" className="px-4 py-3 text-body-sm font-medium text-ink">
                        <Link href={`/product/${line.slug}`} className="underline decoration-hair-strong underline-offset-4 hover:decoration-ink">
                          {line.name}
                        </Link>
                      </th>
                      <td className="px-4 py-3 text-caption text-graphite">
                        {line.variantLabel}
                        <span className="block tabular">{line.sku}</span>
                      </td>
                      <td className="tabular px-4 py-3 text-right text-body-sm">{line.quantity}</td>
                      <td className="tabular px-4 py-3 text-right text-body-sm">{formatInr(line.unitPriceInr)}</td>
                      <td className="tabular px-4 py-3 text-right text-body-sm font-medium">{formatInr(line.lineTotalInr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminPanel>

          <AdminPanel
            title="Dispatch record"
            description={order.shipment ? `${order.shipment.carrier ?? "Carrier not set"} · AWB ${order.shipment.awb ?? "not assigned"}` : "No shipment events are recorded for this order."}
          >
            <StatusTimeline events={order.shipment?.events ?? []} currentStatus={order.status} />
          </AdminPanel>

          <AdminPanel
            title="Change fulfilment status"
            description="The new status is written to the order and shown in the customer's account."
          >
            {transitions.length ? (
              <div className="flex flex-wrap gap-2">
                {transitions.map((next) => (
                  <Button
                    key={next}
                    variant={next === "cancelled" ? "secondary" : "primary"}
                    size="sm"
                    disabled={saving}
                    onClick={() => setPendingMove(next)}
                  >
                    {ORDER_STATUS_LABEL[next]}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-graphite">This status has no forward transition.</p>
            )}
            <p className="pt-3 text-caption leading-relaxed text-graphite">
              Status changes do not alter the payment record. A payment is only marked paid by a verified server-side
              gateway confirmation.
            </p>
          </AdminPanel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminPanel title="Customer">
            <div className="flex flex-col gap-1 text-body-sm">
              <span className="font-medium text-ink">{order.shippingAddress.recipientName || "—"}</span>
              <span className="break-all text-graphite">{order.email}</span>
              <span className="text-graphite">{order.shippingAddress.phone}</span>
              {order.customerId && (
                <Link href={`/admin/customers/${order.customerId}`} className="pm-link pt-2 text-caption font-medium">
                  Open customer record
                </Link>
              )}
            </div>
          </AdminPanel>

          <AdminPanel title="Delivery address">
            <address className="text-body-sm not-italic leading-relaxed text-graphite">
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.line2 && (
                <>
                  {order.shippingAddress.line2}
                  <br />
                </>
              )}
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </address>
          </AdminPanel>

          <AdminPanel title="Courier & tracking">
            {isLocalOnly ? (
              <p className="text-caption leading-relaxed text-graphite">
                Guest orders exist only in this browser, so tracking details cannot be stored for them. Ask the customer
                to place the order while signed in.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <TextField
                  id="order-courier"
                  label="Courier"
                  value={tracking.courierName}
                  onChange={(event) => setTracking((current) => ({ ...current, courierName: event.target.value }))}
                  placeholder="e.g. Delhivery"
                />
                <TextField
                  id="order-awb"
                  label="Tracking / AWB number"
                  value={tracking.trackingNumber}
                  onChange={(event) => setTracking((current) => ({ ...current, trackingNumber: event.target.value }))}
                />
                <TextField
                  id="order-tracking-url"
                  label="Tracking link"
                  optional
                  value={tracking.trackingUrl}
                  onChange={(event) => setTracking((current) => ({ ...current, trackingUrl: event.target.value }))}
                  placeholder="https://…"
                />
                <Button size="sm" onClick={() => void saveTracking()} loading={trackingSaving} disabled={trackingSaving}>
                  Save tracking
                </Button>
                <p className="text-caption leading-relaxed text-graphite">
                  Saved tracking appears on the customer&apos;s order page. It does not change the order status.
                </p>
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="Payment">
            <dl className="flex flex-col gap-2 text-body-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Status</dt>
                <dd><StatusBadge status={order.paymentStatus} /></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Method</dt>
                <dd className="text-ink">{order.paymentMethod.replace(/_/g, " ")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-graphite">Total</dt>
                <dd className="tabular font-medium">{order.totals.totalInr === null ? "To confirm" : formatInr(order.totals.totalInr)}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-hair pt-3 text-caption leading-relaxed text-graphite">
              Payment state is read-only here. It changes only when a server-verified gateway event arrives.
            </p>
          </AdminPanel>
        </div>
      </div>

      <ConfirmDialog
        open={pendingMove !== null}
        onClose={() => setPendingMove(null)}
        onConfirm={() => {
          if (pendingMove) void applyMove(pendingMove);
        }}
        title={pendingMove ? `Move to “${ORDER_STATUS_LABEL[pendingMove]}”?` : "Change status"}
        body={
          pendingMove
            ? `Order ${order.reference} will move from “${ORDER_STATUS_LABEL[order.status]}” to “${ORDER_STATUS_LABEL[pendingMove]}”. The customer will see the new status on their order.`
            : ""
        }
        confirmLabel="Save status"
        destructive={pendingMove === "cancelled" || pendingMove === "refunded"}
      />
    </div>
  );
}
