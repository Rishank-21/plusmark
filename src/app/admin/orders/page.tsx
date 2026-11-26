"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Check, ErrorLine, Input, Loading, Pick, Pill, SimpleTable, statusTone } from "@/components/admin/kit";
import { Button } from "@/components/ui/Button";
import { downloadText, inr, rpc, toCsv, when } from "@/lib/backend/admin";

const STATUSES = ["placed", "payment_pending", "payment_failed", "confirmed", "processing", "dispatched", "delivered", "cancelled", "return_requested", "refund_processing", "refunded"];
const PAGE = 25;

interface Row {
  id: string;
  order_number: string;
  placed_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  email: string;
  phone: string;
  customer_name: string | null;
  total_inr: number;
  coupon_code: string | null;
  state: string;
  city: string;
  needs_attention: string | null;
  units: number;
  items: string;
  is_guest: boolean;
  shipments: { carrier: string; tracking: string; status: string }[] | null;
}

function Orders() {
  const params = useSearchParams();
  const [f, setF] = useState<Record<string, string>>({
    search: "",
    status: params.get("status") ?? "",
    payment_status: "",
    payment_method: "",
    date_from: "",
    date_to: "",
    state: "",
    coupon: "",
    customer_type: "",
    min_total: "",
    max_total: "",
    shipment: "",
    attention: params.get("attention") ?? ""
  });
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ total: number; rows: Row[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filters = useCallback(
    (offset: number, limit: number) => {
      const out: Record<string, unknown> = { limit, offset };
      if (f.search.trim()) out.search = f.search.trim();
      if (f.status) out.status = [f.status];
      if (f.payment_status) out.payment_status = [f.payment_status];
      if (f.payment_method) out.payment_method = f.payment_method;
      if (f.date_from) out.date_from = new Date(`${f.date_from}T00:00:00+05:30`).toISOString();
      if (f.date_to) out.date_to = new Date(new Date(`${f.date_to}T00:00:00+05:30`).getTime() + 86_400_000).toISOString();
      if (f.state.trim()) out.state = f.state.trim();
      if (f.coupon.trim()) out.coupon = f.coupon.trim();
      if (f.customer_type) out.customer_type = f.customer_type;
      if (f.min_total) out.min_total = Number(f.min_total);
      if (f.max_total) out.max_total = Number(f.max_total);
      if (f.shipment === "none") out.no_tracking = true;
      if (f.attention) out.needs_attention = true;
      return out;
    },
    [f]
  );

  useEffect(() => {
    setPage(0);
  }, [f]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(() => {
      rpc<{ total: number; rows: Row[] }>("admin_list_orders", { p_filters: filters(page * PAGE, PAGE) })
        .then((r) => {
          if (alive) {
            setData(r);
            setError(null);
          }
        })
        .catch((e: Error) => alive && setError(e.message))
        .finally(() => alive && setLoading(false));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [filters, page]);

  const exportCsv = async () => {
    const all: Row[] = [];
    for (let offset = 0; offset < 5000; offset += 200) {
      const chunk = await rpc<{ rows: Row[]; total: number }>("admin_list_orders", { p_filters: filters(offset, 200) });
      all.push(...chunk.rows);
      if (all.length >= chunk.total) break;
    }
    downloadText(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(all.map((o) => ({ ...o, shipments: (o.shipments ?? []).map((s) => `${s.carrier} ${s.tracking}`).join("; ") })))
    );
  };

  const set = (key: string) => (value: string) => setF((cur) => ({ ...cur, [key]: value }));
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE));

  return (
    <>
      <AdminPageHeader
        title="Orders"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        actions={<Button variant="secondary" size="sm" onClick={() => void exportCsv().catch((e: Error) => setError(e.message))}>Export CSV</Button>}
      />
      <div className="mb-4 grid gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Search" placeholder="Order no, email, phone, name, tracking, invoice" value={f.search} onChange={(e) => set("search")(e.target.value)} className="lg:col-span-2" />
        <Pick label="Order status" value={f.status} onChange={set("status")} options={[["", "Any"], ...STATUSES.map((s) => [s, s.replace(/_/g, " ")] as [string, string])]} />
        <Pick label="Payment" value={f.payment_status} onChange={set("payment_status")} options={[["", "Any"], ["paid", "paid"], ["pending", "pending"], ["unpaid", "unpaid (COD)"], ["failed", "failed"], ["partially_refunded", "partly refunded"], ["refunded", "refunded"]]} />
        <Pick label="Method" value={f.payment_method} onChange={set("payment_method")} options={[["", "Any"], ["razorpay", "Razorpay"], ["cod", "Cash on delivery"], ["manual", "Manual"]]} />
        <Input label="From date" type="date" value={f.date_from} onChange={(e) => set("date_from")(e.target.value)} />
        <Input label="To date" type="date" value={f.date_to} onChange={(e) => set("date_to")(e.target.value)} />
        <Input label="State" value={f.state} onChange={(e) => set("state")(e.target.value)} />
        <Input label="Coupon" value={f.coupon} onChange={(e) => set("coupon")(e.target.value)} />
        <Pick label="Customer" value={f.customer_type} onChange={set("customer_type")} options={[["", "Any"], ["registered", "Registered"], ["guest", "Guest"]]} />
        <Input label="Min total (₹)" type="number" value={f.min_total} onChange={(e) => set("min_total")(e.target.value)} />
        <Input label="Max total (₹)" type="number" value={f.max_total} onChange={(e) => set("max_total")(e.target.value)} />
        <Pick label="Tracking" value={f.shipment} onChange={set("shipment")} options={[["", "Any"], ["none", "No tracking added"]]} />
        <div className="flex items-end">
          <Check label="Needs attention only" checked={Boolean(f.attention)} onChange={(v) => set("attention")(v ? "1" : "")} />
        </div>
      </div>

      {error && <ErrorLine message={error} />}
      {loading && !data ? (
        <Loading what="Loading orders" />
      ) : (
        <div className="rounded-md border border-line bg-surface p-2">
          <SimpleTable
            head={["Order", "Placed", "Customer", "Items", "Total", "Status", "Payment", "Shipment"]}
            empty="No orders match these filters."
            rows={(data?.rows ?? []).map((o) => [
              <div key="n">
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{o.order_number}</Link>
                {o.needs_attention && <div className="text-caption text-red-700">⚠ {o.needs_attention}</div>}
              </div>,
              when(o.placed_at),
              <div key="c">
                {o.customer_name || "—"}
                <div className="text-caption text-muted">{o.email} · {o.phone}</div>
                <div className="text-caption text-muted">{o.city}, {o.state}{o.is_guest ? " · guest" : ""}</div>
              </div>,
              <div key="i" className="max-w-[16rem]">
                <div className="truncate" title={o.items}>{o.items}</div>
                <div className="text-caption text-muted">{o.units} unit{o.units === 1 ? "" : "s"}{o.coupon_code ? ` · ${o.coupon_code}` : ""}</div>
              </div>,
              <span key="t" className="tabular whitespace-nowrap font-medium">{inr(o.total_inr)}</span>,
              <Pill key="s" tone={statusTone(o.status)}>{o.status.replace(/_/g, " ")}</Pill>,
              <div key="p">
                <Pill tone={statusTone(o.payment_status)}>{o.payment_status.replace(/_/g, " ")}</Pill>
                <div className="text-caption text-muted">{o.payment_method}</div>
              </div>,
              (o.shipments ?? []).length ? (
                <div key="sh" className="text-caption">
                  {(o.shipments ?? []).map((s, i) => <div key={i}>{s.carrier} {s.tracking}</div>)}
                </div>
              ) : <span key="sh" className="text-caption text-muted">—</span>
            ])}
          />
          <div className="flex items-center justify-between gap-3 border-t border-line px-2 pt-3 text-body-sm">
            <span className="text-muted">{(data?.total ?? 0).toLocaleString("en-IN")} orders</span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span>Page {page + 1} of {pages}</span>
              <Button variant="secondary" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <Orders />
    </Suspense>
  );
}
