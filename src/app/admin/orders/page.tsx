"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate, formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { AdminPageHeader, StatStrip } from "@/components/admin/Metrics";
import { FilterBar, FilterSelect, SearchControl } from "@/components/admin/FilterBar";
import { DataTable, TableLink, type AdminColumn } from "@/components/admin/DataTable";
import { ALL_ORDER_STATUSES, ORDER_STATUS_LABEL, orderUnits, orderValueInr } from "@/components/admin/adminData";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { listAdminOrders } from "@/lib/supabase/admin";
import { useSession } from "@/state/session";
import type { Order } from "@/types";

const ALL = "all";

export default function AdminOrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL);
  const [payment, setPayment] = useState(ALL);
  const session = useSession();
  const data = useAdminQuery<Order[]>(() => listAdminOrders());

  const localOnly = useMemo(() => {
    const server = data.data ?? [];
    const ids = new Set(server.map((order) => order.id));
    const references = new Set(server.map((order) => order.reference));
    return session.orders.filter((order) => !ids.has(order.id) && !references.has(order.reference));
  }, [data.data, session.orders]);

  const allOrders = useMemo(() => {
    const server = data.data ?? [];
    return [...localOnly, ...server].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [data.data, localOnly]);

  const localIds = useMemo(() => new Set(localOnly.map((order) => order.id)), [localOnly]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allOrders.filter((order) => {
      if (status !== ALL && order.status !== status) return false;
      if (payment !== ALL && order.paymentStatus !== payment) return false;
      if (!needle) return true;
      return `${order.reference} ${order.email} ${order.shippingAddress.recipientName} ${order.shippingAddress.city}`
        .toLowerCase()
        .includes(needle);
    });
  }, [allOrders, query, status, payment]);

  const columns: AdminColumn<Order>[] = [
    {
      id: "reference",
      header: "Reference",
      minWidth: "8rem",
      sortValue: (order) => order.reference,
      render: (order) => (
        <span className="flex flex-col gap-0.5">
          <TableLink href={`/admin/orders/${order.id}`}>{order.reference}</TableLink>
          {localIds.has(order.id) && (
            <span className="text-[0.6875rem] leading-tight text-graphite-light">Placed on this device</span>
          )}
        </span>
      )
    },
    { id: "placed", header: "Placed", minWidth: "6.5rem", sortValue: (order) => order.placedAt, render: (order) => formatDate(order.placedAt) },
    {
      id: "customer",
      header: "Customer",
      minWidth: "12rem",
      sortValue: (order) => order.shippingAddress.recipientName,
      render: (order) => (
        <span className="flex flex-col leading-tight">
          <span className="font-medium">{order.shippingAddress.recipientName || "—"}</span>
          <span className="text-caption text-graphite">{order.email}</span>
          <span className="text-caption text-graphite">{order.shippingAddress.city}</span>
        </span>
      )
    },
    { id: "units", header: "Units", numeric: true, minWidth: "3rem", sortValue: orderUnits, render: orderUnits },
    { id: "status", header: "Fulfilment", minWidth: "9rem", sortValue: (order) => order.status, render: (order) => <StatusBadge status={order.status} /> },
    { id: "payment", header: "Payment", minWidth: "7rem", sortValue: (order) => order.paymentStatus, render: (order) => <StatusBadge status={order.paymentStatus} /> },
    {
      id: "method",
      header: "Method",
      minWidth: "6.5rem",
      render: (order) => <span className="text-caption text-graphite">{order.paymentMethod.replace(/_/g, " ")}</span>
    },
    {
      id: "value",
      header: "Value",
      numeric: true,
      minWidth: "7.5rem",
      sortValue: orderValueInr,
      render: (order) =>
        order.totals.totalInr === null ? <span className="text-caption text-graphite">To confirm</span> : formatInr(orderValueInr(order))
    }
  ];

  const total = allOrders.reduce((sum, order) => sum + orderValueInr(order), 0);
  const activeCount = allOrders.filter((order) => !["cancelled", "refunded", "delivered"].includes(order.status)).length;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Orders"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        lede="Orders saved in Supabase, plus any order placed from checkout in this browser. Open an order to move its status; changes to server orders are visible to the customer."
      />

      <StatStrip
        items={[
          { label: "Orders", value: String(allOrders.length), note: session.orders.length ? `${session.orders.length} placed on this device` : undefined },
          { label: "Active", value: String(activeCount), note: "Not delivered, cancelled or refunded" },
          { label: "Booked value", value: formatInr(total), note: "Known totals; freight-pending orders excluded" },
          { label: "Units", value: allOrders.reduce((sum, order) => sum + orderUnits(order), 0).toLocaleString("en-IN") },
          { label: "Payment issues", value: String(allOrders.filter((order) => ["pending", "failed"].includes(order.paymentStatus)).length) },
          { label: "Delivered", value: String(allOrders.filter((order) => order.status === "delivered").length) }
        ]}
      />

      {data.error ? (
        <ErrorState title="Orders could not be loaded" body={data.error} onRetry={data.reload} />
      ) : (
        <>
          <FilterBar
            resultLabel={`${rows.length} of ${allOrders.length} orders match`}
            onReset={
              query || status !== ALL || payment !== ALL
                ? () => {
                    setQuery("");
                    setStatus(ALL);
                    setPayment(ALL);
                  }
                : undefined
            }
          >
            <SearchControl
              label="Search orders"
              value={query}
              onChange={setQuery}
              className="grow"
              width="w-full min-w-[16rem]"
              placeholder="Reference, customer, email or city"
            />
            <FilterSelect
              label="Fulfilment"
              value={status}
              onChange={setStatus}
              options={[{ value: ALL, label: "All statuses" }, ...ALL_ORDER_STATUSES.map((entry) => ({ value: entry, label: ORDER_STATUS_LABEL[entry] }))]}
            />
            <FilterSelect
              label="Payment"
              value={payment}
              onChange={setPayment}
              options={[
                { value: ALL, label: "All payments" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "unpaid", label: "Unpaid" },
                { value: "refunded", label: "Refunded" }
              ]}
            />
          </FilterBar>

          <DataTable
            caption="Orders with customer, unit count, fulfilment status, payment status and order value"
            columns={columns}
            rows={rows}
            keyFor={(order) => order.id}
            resetKey={`${query}|${status}|${payment}`}
            pageSize={12}
            loading={data.loading}
            defaultSort={{ id: "placed", dir: "desc" }}
            emptyTitle="No order matches these filters"
            emptyBody="Clear the search or set fulfilment and payment back to “All”."
            footer={
              <div className="border-t border-hair pt-3">
                <p className="text-[0.6875rem] text-graphite-light">
                  Rows marked “Placed on this device” are checkout records held in this browser&apos;s storage. Their status
                  changes update this browser only until checkout writes orders to Supabase.
                </p>
              </div>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-4">
            <p className="text-[0.6875rem] leading-relaxed text-graphite-light">
              Server orders are protected by row-level security: only an administrator can read all orders or change a
              status.
            </p>
            <Link href="/admin/payments" className="text-caption font-medium text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink">
              Review payment records
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
