"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { classNames, formatDate, formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { AdminPageHeader, AdminPanel, MetricsTable, StatStrip } from "@/components/admin/Metrics";
import { DataTable, TableLink, type AdminColumn } from "@/components/admin/DataTable";
import { ATTENTION_STATUSES, orderValueInr } from "@/components/admin/adminData";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { countAdminCustomers, listAdminOrders, listAdminProducts } from "@/lib/supabase/admin";
import { useSession } from "@/state/session";
import type { Order } from "@/types";

const ORDER_COLUMNS: AdminColumn<Order>[] = [
  {
    id: "reference",
    header: "Reference",
    minWidth: "9.5rem",
    render: (order) => <TableLink href={`/admin/orders/${order.id}`}>{order.reference}</TableLink>
  },
  { id: "placed", header: "Placed", sortValue: (o) => o.placedAt, render: (o) => formatDate(o.placedAt), minWidth: "7.5rem" },
  {
    id: "customer",
    header: "Customer",
    minWidth: "12rem",
    sortValue: (o) => o.shippingAddress.recipientName,
    render: (o) => (
      <span className="flex flex-col leading-tight">
        <span className="font-medium">{o.shippingAddress.recipientName || "—"}</span>
        <span className="text-caption text-graphite">{o.email}</span>
      </span>
    )
  },
  {
    id: "units",
    header: "Units",
    numeric: true,
    minWidth: "3.75rem",
    sortValue: (o) => o.lines.reduce((sum, l) => sum + l.quantity, 0),
    render: (o) => o.lines.reduce((sum, l) => sum + l.quantity, 0)
  },
  {
    id: "status",
    header: "Status",
    minWidth: "9.5rem",
    sortValue: (o) => o.status,
    render: (o) => <StatusBadge status={o.status} />
  },
  {
    id: "payment",
    header: "Payment",
    minWidth: "8rem",
    sortValue: (o) => o.paymentStatus,
    render: (o) => <StatusBadge status={o.paymentStatus} />
  },
  {
    id: "value",
    header: "Value",
    numeric: true,
    minWidth: "7.5rem",
    sortValue: (o) => orderValueInr(o),
    render: (o) => formatInr(orderValueInr(o))
  }
];

interface Summary {
  orders: Order[];
  productCount: number;
  publishedCount: number;
  lowStockCount: number;
  customerCount: number;
}

export default function AdminDashboardPage() {
  const session = useSession();
  const query = useAdminQuery<Summary>(async () => {
    const [serverOrders, products, customerCount] = await Promise.all([
      listAdminOrders(),
      listAdminProducts(),
      countAdminCustomers()
    ]);
    const variants = products.flatMap((product) => product.variants);
    return {
      orders: serverOrders,
      productCount: products.length,
      publishedCount: products.filter((product) => product.published).length,
      lowStockCount: variants.filter((variant) => variant.trackInventory && (variant.stock ?? 0) <= 5).length,
      customerCount
    };
  });

  /* Checkout still keeps orders in this browser; show them beside the server records. */
  const localOnlyOrders = useMemo(() => {
    const server = query.data?.orders ?? [];
    const ids = new Set(server.map((order) => order.id));
    const references = new Set(server.map((order) => order.reference));
    return session.orders.filter((order) => !ids.has(order.id) && !references.has(order.reference));
  }, [query.data, session.orders]);

  const allOrders = useMemo(() => {
    const server = query.data?.orders ?? [];
    return [...localOnlyOrders, ...server].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [query.data, localOnlyOrders]);

  const attention = allOrders.filter((order) => ATTENTION_STATUSES.includes(order.status));
  const recentOrders = allOrders.slice(0, 8);
  const pendingOrders = allOrders.filter((order) => ["placed", "confirmed", "processing"].includes(order.status)).length;
  const pendingPayments = allOrders.filter((order) => order.paymentStatus === "pending" || order.paymentStatus === "failed").length;
  const bookedValue = allOrders
    .filter((order) => ["confirmed", "processing", "dispatched", "delivered"].includes(order.status))
    .reduce((sum, order) => sum + orderValueInr(order), 0);
  const deliveredValue = allOrders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + orderValueInr(order), 0);

  const quickLinks = [
    { href: "/admin/orders", label: "Order desk", note: `${pendingOrders} orders not yet dispatched` },
    { href: "/admin/products/new", label: "Add a product", note: "Create a catalogue record with sizes and images" },
    { href: "/admin/inventory", label: "Inventory", note: `${query.data?.lowStockCount ?? 0} tracked sizes at or below 5` },
    { href: "/admin/customers", label: "Customers", note: `${query.data?.customerCount ?? 0} registered accounts` },
    { href: "/admin/coupons", label: "Coupons", note: "Create and pause discount codes" },
    { href: "/admin/content", label: "Storefront content", note: "Announcement bar and hero copy" },
    { href: "/admin/reports", label: "Reports", note: "Counts and revenue from live orders" }
  ];

  if (query.loading) {
    return (
      <div className="flex flex-col gap-6" role="status" aria-live="polite">
        <span className="sr-only">Loading the dashboard</span>
        <Skeleton className="h-9 w-56" />
        <div className="grid grid-cols-2 gap-px border border-hair bg-hair sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24 bg-surface" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="flex flex-col gap-6">
        <AdminPageHeader title="Dashboard" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]} />
        <ErrorState title="The dashboard could not be loaded" body={query.error} onRetry={query.reload} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
        lede="Live counts from Supabase orders and the catalogue, plus any order placed in this browser whose checkout has not yet been moved to the server."
        actions={
          <Link
            href="/admin/orders"
            className="inline-flex h-11 items-center gap-2 rounded-xs bg-ink px-4 text-body-sm font-medium text-canvas transition-colors hover:bg-ink-soft"
          >
            Open the order desk
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />

      <StatStrip
        caption="Revenue and volume"
        items={[
          { label: "Booked value", value: formatInr(bookedValue), note: "Confirmed through delivered" },
          {
            label: "Orders",
            value: allOrders.length.toLocaleString("en-IN"),
            note: localOnlyOrders.length ? `${localOnlyOrders.length} placed on this device` : "All states, incl. cancelled"
          },
          { label: "Delivered value", value: formatInr(deliveredValue), note: "Delivered orders only" },
          { label: "Needs attention", value: attention.length.toLocaleString("en-IN"), note: "Unpaid, failed, new or returns" },
          { label: "Payment issues", value: pendingPayments.toLocaleString("en-IN"), note: "Pending or failed" },
          {
            label: "Products live",
            value: (query.data?.publishedCount ?? 0).toLocaleString("en-IN"),
            note: `${query.data?.productCount ?? 0} in the database`
          }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminPanel
            title="Orders needing attention"
            description="Unpaid, failed, newly placed, or awaiting a return decision."
            aside={
              <Link href="/admin/orders" className="text-caption font-medium text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink">
                All {allOrders.length} orders
              </Link>
            }
            padded={false}
          >
            <div className="p-3">
              <DataTable
                caption="Orders needing attention"
                columns={ORDER_COLUMNS}
                rows={attention}
                keyFor={(order) => order.id}
                defaultSort={{ id: "placed", dir: "desc" }}
                pageSize={6}
                emptyTitle="Nothing is waiting on the desk"
                emptyBody="No order is currently unpaid, failed, or awaiting a return decision."
              />
            </div>
          </AdminPanel>

          <AdminPanel
            title="Recent orders"
            description="The eight most recent records, newest first, including orders placed on this device."
            padded={false}
          >
            <div className="p-3">
              <DataTable
                caption="Recent orders"
                columns={ORDER_COLUMNS}
                rows={recentOrders}
                keyFor={(order) => order.id}
                emptyTitle="No orders yet"
                emptyBody="New orders appear here as soon as a customer places one."
              />
            </div>
          </AdminPanel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <MetricsTable
            title="Operating figures"
            rows={[
              { label: "Customers", value: (query.data?.customerCount ?? 0).toLocaleString("en-IN"), href: "/admin/customers" },
              { label: "Orders unpaid", value: pendingPayments.toLocaleString("en-IN"), href: "/admin/payments" },
              { label: "Low-stock sizes", value: (query.data?.lowStockCount ?? 0).toLocaleString("en-IN"), href: "/admin/inventory" },
              { label: "Published products", value: (query.data?.publishedCount ?? 0).toLocaleString("en-IN"), href: "/admin/products" }
            ]}
            note="Low stock counts sizes with tracking switched on and five units or fewer. Plusmark boards are made to order, so untracked sizes are not counted."
          />

          <AdminPanel title="Go to" description="Every admin area, one click deep.">
            <ul className="flex flex-col divide-y divide-hair">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={classNames("group flex min-h-11 items-center gap-3 py-2 text-body-sm transition-colors")}>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium text-ink">{link.label}</span>
                      <span className="truncate text-caption text-graphite">{link.note}</span>
                    </span>
                    <ArrowRight className="ml-auto size-4 shrink-0 text-hair-strong transition-colors group-hover:text-ink" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
