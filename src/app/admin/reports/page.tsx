"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ErrorLine, Input, Loading, Pick, Section, SimpleTable } from "@/components/admin/kit";
import { Button } from "@/components/ui/Button";
import { downloadText, rpc, toCsv, type Json } from "@/lib/backend/admin";

interface ReportDef { id: string; label: string; fn: string; dates: boolean; extra?: Record<string, unknown>; note: string }
const REPORTS: ReportDef[] = [
  { id: "sales_day", label: "Sales by day", fn: "report_sales", dates: true, extra: { p_group: "day" }, note: "Orders, goods value, discounts, shipping, GST, total, refunds and net." },
  { id: "sales_week", label: "Sales by week", fn: "report_sales", dates: true, extra: { p_group: "week" }, note: "Same as above, grouped by week." },
  { id: "sales_month", label: "Sales by month", fn: "report_sales", dates: true, extra: { p_group: "month" }, note: "Same as above, grouped by month." },
  { id: "gst", label: "GST report (CGST / SGST / IGST)", fn: "report_gst", dates: true, note: "Taxable value and tax by month and GST rate. Use for your GST return." },
  { id: "top", label: "Best selling products", fn: "report_top_products", dates: true, extra: { p_limit: 50 }, note: "By revenue, with units, orders and returned units." },
  { id: "category", label: "Sales by category", fn: "report_category_sales", dates: true, note: "Units and revenue per category." },
  { id: "options", label: "Sizes, colours and options sold", fn: "report_variant_options", dates: true, note: "Which sizes and colours (and custom options) sell." },
  { id: "payments", label: "Payments", fn: "report_payments", dates: true, note: "By method and status, refunds, failure rate and orders needing attention." },
  { id: "inventory", label: "Stock and cover", fn: "report_inventory", dates: false, note: "Stock value, units sold in 30 days and days of cover." },
  { id: "inventory_low", label: "Low stock only", fn: "report_inventory", dates: false, extra: { p_only_low: true }, note: "Items at or below their low stock level." },
  { id: "customers", label: "Customers", fn: "report_customers", dates: true, note: "Top customers, new vs returning, sign ups, guest share." },
  { id: "coupons", label: "Coupons", fn: "report_coupons", dates: true, note: "Discount given and order value per code." },
  { id: "returns", label: "Returns", fn: "report_returns", dates: true, note: "Return rate, reasons and the products returned most." },
  { id: "geo", label: "Sales by state and city", fn: "report_geo", dates: true, note: "Where your orders go." },
  { id: "fulfilment", label: "Fulfilment speed and funnel", fn: "report_fulfilment", dates: true, note: "Placed to paid to dispatched to delivered, and orders overdue to ship." },
  { id: "time", label: "Busy days and hours", fn: "report_time_patterns", dates: true, note: "Orders by weekday and hour (IST)." },
  { id: "cohorts", label: "Customer cohorts", fn: "report_cohorts", dates: false, extra: { p_months: 12 }, note: "How each month's new customers keep buying." }
];

const isRows = (v: unknown): v is Json[] => Array.isArray(v) && v.every((x) => x && typeof x === "object" && !Array.isArray(x));
const label = (k: string) => k.replace(/_/g, " ");
const show = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v));

function Table({ rows }: { rows: Json[] }) {
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return <SimpleTable head={cols.map(label)} rows={rows.map((r) => cols.map((c) => <span key={c} className="tabular whitespace-nowrap">{show(r[c])}</span>))} empty="No data for this period." />;
}

export default function AdminReportsPage() {
  const [id, setId] = useState(REPORTS[0].id);
  const [from, setFrom] = useState(() => new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const def = REPORTS.find((r) => r.id === id) ?? REPORTS[0];

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const args: Record<string, unknown> = { ...(def.extra ?? {}) };
      if (def.dates) {
        args.p_from = new Date(`${from}T00:00:00+05:30`).toISOString();
        args.p_to = new Date(new Date(`${to}T00:00:00+05:30`).getTime() + 86_400_000).toISOString();
      }
      setData(await rpc(def.fn, args));
    } catch (e) {
      setError((e as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const csv = () => {
    const rows = isRows(data) ? data : data && typeof data === "object" ? Object.values(data).find(isRows) : null;
    if (rows) downloadText(`${def.id}.csv`, toCsv(rows));
  };

  return (
    <>
      <AdminPageHeader title="Reports" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]} lede="Counts only real sales: cancelled, unpaid and failed orders are left out. Dates use Indian time." />
      <div className="mb-4 grid gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-[1fr_10rem_10rem_auto]">
        <Pick label="Report" value={id} onChange={(v) => { setId(v); setData(null); }} options={REPORTS.map((r) => [r.id, r.label] as [string, string])} hint={def.note} />
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={!def.dates} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={!def.dates} />
        <div className="flex items-end gap-2"><Button onClick={() => void run()} disabled={loading}>Run report</Button><Button variant="secondary" onClick={csv} disabled={!data}>CSV</Button></div>
      </div>
      {error && <ErrorLine message={error} />}
      {loading && <Loading what="Running report" />}
      {!loading && data !== null && (
        isRows(data) ? <div className="rounded-md border border-line bg-surface p-2"><Table rows={data} /></div> : (
          <div className="flex flex-col gap-4">
            {Object.entries(data as Json).map(([key, value]) => (
              <Section key={key} title={label(key)}>
                {isRows(value) ? <Table rows={value} /> : value && typeof value === "object" ? <dl className="grid gap-1 text-body-sm sm:grid-cols-2">{Object.entries(value as Json).map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line/60 py-1"><dt className="text-muted">{label(k)}</dt><dd className="tabular font-medium">{show(v)}</dd></div>)}</dl> : <p className="tabular text-h3 font-bold">{show(value) || "—"}</p>}
              </Section>
            ))}
          </div>
        )
      )}
    </>
  );
}
