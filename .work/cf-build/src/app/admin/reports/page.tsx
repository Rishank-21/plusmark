"use client";

import { useMemo, useState } from "react";
import { formatInr } from "@/lib/format";
import { ErrorState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/Badge";
import { AdminPageHeader, AdminPanel, DemoBars, StatStrip } from "@/components/admin/Metrics";
import { DateControl, FilterBar } from "@/components/admin/FilterBar";
import { DataTable, type AdminColumn } from "@/components/admin/DataTable";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { ALL_ORDER_STATUSES, orderValueInr } from "@/components/admin/adminData";
import { listAdminCategories, listAdminOrders, listAdminProducts } from "@/lib/supabase/admin";
import type { Order } from "@/types";

interface MonthRow { month: string; orders: number; valueInr: number }

export default function AdminReportsPage() {
  const query = useAdminQuery(async () => {
    const [orders, products, categories] = await Promise.all([
      listAdminOrders(),
      listAdminProducts(),
      listAdminCategories()
    ]);
    return { orders, products, categories };
  });
  const orders = query.data?.orders ?? [];
  const products = query.data?.products ?? [];
  const categories = query.data?.categories ?? [];

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const scoped = useMemo(
    () => orders.filter((order) => {
      const day = order.placedAt.slice(0, 10);
      return (!from || day >= from) && (!to || day <= to);
    }),
    [orders, from, to]
  );

  const active = scoped.filter((order) => order.status !== "cancelled");
  const value = active.reduce((sum, order) => sum + orderValueInr(order), 0);
  const delivered = active.filter((order) => order.status === "delivered");
  const average = active.length ? Math.round(value / active.length) : 0;
  const units = active.reduce((sum, order) => sum + order.lines.reduce((lineSum, line) => lineSum + line.quantity, 0), 0);

  const monthRows = useMemo<MonthRow[]>(() => {
    const map = new Map<string, MonthRow>();
    scoped.forEach((order) => {
      const month = order.placedAt.slice(0, 7);
      const row = map.get(month) ?? { month, orders: 0, valueInr: 0 };
      row.orders += 1;
      row.valueInr += orderValueInr(order);
      map.set(month, row);
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [scoped]);

  const statusRows = useMemo(
    () => ALL_ORDER_STATUSES.map((status) => ({
      status,
      count: scoped.filter((order) => order.status === status).length,
      valueInr: scoped.filter((order) => order.status === status).reduce((sum, order) => sum + orderValueInr(order), 0)
    })),
    [scoped]
  );

  const categoryRows = useMemo(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product.categoryId]));
    const byCategory = new Map<string, { valueInr: number; units: number }>();
    active.forEach((order) => {
      order.lines.forEach((line) => {
        const categoryId = bySlug.get(line.slug) ?? "uncategorised";
        const entry = byCategory.get(categoryId) ?? { valueInr: 0, units: 0 };
        entry.valueInr += line.lineTotalInr;
        entry.units += line.quantity;
        byCategory.set(categoryId, entry);
      });
    });
    return Array.from(byCategory.entries())
      .map(([id, entry]) => ({
        label: categories.find((category) => category.id === id)?.name ?? "Uncategorised",
        valueInr: entry.valueInr,
        units: entry.units
      }))
      .sort((a, b) => b.valueInr - a.valueInr);
  }, [active, products, categories]);

  const columns: AdminColumn<MonthRow>[] = [
    { id: "month", header: "Month", sortValue: (row) => row.month, render: (row) => row.month },
    { id: "orders", header: "Orders", numeric: true, sortValue: (row) => row.orders, render: (row) => row.orders },
    { id: "value", header: "Booked value", numeric: true, sortValue: (row) => row.valueInr, render: (row) => formatInr(row.valueInr) }
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Reports"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]}
        lede="Counts and values computed from the live orders table. No figure here is a forecast, benchmark or Plusmark trading claim."
      />
      {query.error ? (
        <ErrorState title="Reports could not be loaded" body={query.error} onRetry={query.reload} />
      ) : (
        <>
          <FilterBar
            resultLabel={`${scoped.length} of ${orders.length} orders in the selected range`}
            onReset={from || to ? () => { setFrom(""); setTo(""); } : undefined}
          >
            <DateControl label="From" value={from} onChange={setFrom} />
            <DateControl label="To" value={to} onChange={setTo} />
          </FilterBar>
          <StatStrip
            caption="Selected range"
            items={[
              { label: "Orders", value: query.loading ? "—" : scoped.length.toLocaleString("en-IN") },
              { label: "Active value", value: query.loading ? "—" : formatInr(value), note: "Cancelled excluded" },
              { label: "Delivered", value: query.loading ? "—" : delivered.length.toLocaleString("en-IN") },
              { label: "Average order", value: query.loading ? "—" : formatInr(average), note: "Active orders only" },
              { label: "Units", value: query.loading ? "—" : units.toLocaleString("en-IN"), note: "Active orders only" },
              { label: "Cancelled", value: query.loading ? "—" : scoped.filter((order) => order.status === "cancelled").length.toLocaleString("en-IN") }
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <DemoBars
              title="Orders by status"
              unit="orders"
              rows={statusRows.map((row) => ({ label: row.status.replace(/_/g, " "), value: row.count, secondary: formatInr(row.valueInr) }))}
              note="Status vocabulary matches the order desk. Zero-count states are listed for reference."
            />
            <DemoBars
              title="Value by category"
              unit="booked value"
              rows={categoryRows.map((row) => ({ label: row.label, value: row.valueInr, secondary: `${row.units} units` }))}
              note="Line values from live orders, matched to the catalogue by product slug. Cancelled orders are excluded."
            />
          </div>
          <AdminPanel title="Monthly volume" description="Every order in scope grouped by its placed month. The table ignores the range filter." padded={false}>
            <div className="p-3">
              <DataTable
                caption="Monthly order count and value"
                columns={columns}
                rows={monthRows}
                keyFor={(row) => row.month}
                loading={query.loading}
                defaultSort={{ id: "month", dir: "asc" }}
                emptyTitle="No orders in this range"
                emptyBody="Clear the date range or wait until orders exist."
              />
            </div>
          </AdminPanel>
          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title="Status definitions" description="What each state means.">
              <ul className="flex flex-col divide-y divide-hair">
                {ALL_ORDER_STATUSES.map((status) => (
                  <li key={status} className="flex items-center justify-between gap-3 py-2.5">
                    <StatusBadge status={status} />
                    <span className="text-caption text-graphite">{scoped.filter((order) => order.status === status).length} records</span>
                  </li>
                ))}
              </ul>
            </AdminPanel>
            <AdminPanel title="What these numbers are not" description="A deliberate limit on this screen.">
              <p className="text-body-sm leading-relaxed text-graphite">
                These totals describe the orders recorded in this database. They are not Plusmark trading history, do not
                establish a bestseller, and must not be used as a demand forecast, conversion rate or performance claim.
                Orders placed only in a customer’s browser are not visible here.
              </p>
            </AdminPanel>
          </div>
        </>
      )}
    </div>
  );
}
