"use client";

import { useMemo, useState } from "react";
import { formatDateTime, formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { Notice, ErrorState } from "@/components/ui/States";
import { AdminPageHeader, StatStrip } from "@/components/admin/Metrics";
import { FilterBar, FilterSelect, SearchControl } from "@/components/admin/FilterBar";
import { DataTable, TableLink, type AdminColumn } from "@/components/admin/DataTable";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { listAdminOrders } from "@/lib/supabase/admin";
import type { Order } from "@/types";

const ALL = "all";

const METHOD_LABEL: Record<Order["paymentMethod"], string> = {
  razorpay: "Razorpay",
  cod_placeholder: "Cash on delivery",
  quotation_invoice: "Invoice"
};

export default function AdminPaymentsPage() {
  const query = useAdminQuery(() => listAdminOrders());
  const orders = query.data ?? [];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== ALL && order.paymentStatus !== status) return false;
      return !needle || `${order.reference} ${order.email}`.toLowerCase().includes(needle);
    });
  }, [orders, search, status]);

  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const collected = paid.reduce((sum, order) => sum + (order.totals.totalInr ?? 0), 0);

  const columns: AdminColumn<Order>[] = [
    {
      id: "reference",
      header: "Order",
      minWidth: "9rem",
      sortValue: (order) => order.reference,
      render: (order) => <TableLink href={`/admin/orders/${order.id}`}>{order.reference}</TableLink>
    },
    {
      id: "customer",
      header: "Customer",
      minWidth: "13rem",
      sortValue: (order) => order.email,
      render: (order) => <span className="text-caption text-graphite">{order.email}</span>
    },
    {
      id: "method",
      header: "Method",
      minWidth: "8.5rem",
      sortValue: (order) => order.paymentMethod,
      render: (order) => METHOD_LABEL[order.paymentMethod]
    },
    {
      id: "status",
      header: "Payment",
      minWidth: "7rem",
      sortValue: (order) => order.paymentStatus,
      render: (order) => <StatusBadge status={order.paymentStatus} />
    },
    {
      id: "amount",
      header: "Amount",
      numeric: true,
      minWidth: "7rem",
      sortValue: (order) => order.totals.totalInr ?? 0,
      render: (order) => (order.totals.totalInr === null ? "—" : formatInr(order.totals.totalInr))
    },
    {
      id: "placed",
      header: "Placed",
      minWidth: "10.5rem",
      sortValue: (order) => order.placedAt,
      render: (order) => <span className="tabular text-caption">{formatDateTime(order.placedAt)}</span>
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Payments"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Payments" }]}
        lede="Payment state as recorded against each order. This screen is read-only: a browser must never mark money as received."
      />
      <Notice tone="warning" title="Payment status is server-authoritative">
        <p>
          Only the signed gateway webhook (or a server-side reconciliation job) may move an order to paid. There is no
          verify button here because this build has no gateway integration to verify against.
        </p>
      </Notice>

      {query.error ? (
        <ErrorState title="Payments could not be loaded" body={query.error} onRetry={query.reload} />
      ) : (
        <>
          <StatStrip
            items={[
              { label: "Orders", value: query.loading ? "—" : String(orders.length) },
              { label: "Paid", value: query.loading ? "—" : String(paid.length) },
              { label: "Recorded value", value: query.loading ? "—" : formatInr(collected), note: "Paid orders" },
              { label: "Pending", value: query.loading ? "—" : String(orders.filter((order) => order.paymentStatus === "pending").length) },
              { label: "Failed", value: query.loading ? "—" : String(orders.filter((order) => order.paymentStatus === "failed").length) },
              { label: "Refunded", value: query.loading ? "—" : String(orders.filter((order) => order.paymentStatus === "refunded").length) }
            ]}
          />
          <FilterBar
            resultLabel={`${rows.length} of ${orders.length} orders match`}
            onReset={search || status !== ALL ? () => { setSearch(""); setStatus(ALL); } : undefined}
          >
            <SearchControl label="Search payments" value={search} onChange={setSearch} className="grow" width="w-full min-w-[16rem]" placeholder="Order reference or email" />
            <FilterSelect
              label="Payment status"
              value={status}
              onChange={setStatus}
              options={[
                { value: ALL, label: "All statuses" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "unpaid", label: "Unpaid" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" }
              ]}
            />
          </FilterBar>
          <DataTable
            caption="Orders with payment method, status, amount and placed time"
            columns={columns}
            rows={rows}
            keyFor={(order) => order.id}
            loading={query.loading}
            resetKey={`${search}|${status}`}
            pageSize={12}
            defaultSort={{ id: "placed", dir: "desc" }}
            emptyTitle="No order matches these filters"
            emptyBody="Reset the payment status filter or clear the search."
          />
          <p className="text-[0.6875rem] leading-relaxed text-graphite-light">
            Amounts come from the order record. Gateway identifiers are not displayed because gateway reconciliation is
            not connected in this build.
          </p>
        </>
      )}
    </div>
  );
}
