"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Check, ErrorLine, Input, Loading, Pick, Pill, SimpleTable } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button } from "@/components/ui/Button";
import { db, downloadText, rpc, toCsv, when, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

function Inventory() {
  const params = useSearchParams();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(params.get("low") === "1");
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ sku: string; rows: Json[] } | null>(null);
  const [reason, setReason] = useState("purchase");

  const q = useAdminQuery(async () => {
    const [vars, settings] = await Promise.all([
      db().from("product_variants").select("id,sku,title,stock,low_stock_threshold,track_inventory,allow_backorder,available,price_inr,products!inner(name,slug,deleted_at)").is("products.deleted_at", null).order("sku").limit(5000),
      db().from("store_settings").select("low_stock_default").single()
    ]);
    if (vars.error) throw new Error(vars.error.message);
    return { vars: (vars.data ?? []) as Json[], fallback: settings.data?.low_stock_default ?? 5 };
  });

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (q.data?.vars ?? []).filter((v) => {
      const threshold = v.low_stock_threshold ?? q.data?.fallback ?? 5;
      if (lowOnly && !(v.track_inventory && v.stock <= threshold)) return false;
      return !needle || v.sku.toLowerCase().includes(needle) || v.products.name.toLowerCase().includes(needle) || v.title.toLowerCase().includes(needle);
    });
  }, [q.data, search, lowOnly]);

  const apply = async (v: Json, mode: "set" | "add") => {
    const raw = edit[v.id];
    if (raw === undefined || raw === "") return;
    try {
      await rpc("admin_adjust_stock", mode === "set"
        ? { p_variant_id: v.id, p_set_to: Number(raw), p_reason: "correction" }
        : { p_variant_id: v.id, p_delta: Number(raw), p_reason: reason });
      setEdit((e) => { const { [v.id]: _drop, ...rest } = e; void _drop; return rest; });
      toast.push("Stock updated.", "success");
      q.reload();
    } catch (e) { toast.push((e as Error).message, "error"); }
  };

  const showHistory = async (v: Json) => {
    const { data } = await db().from("inventory_movements").select("*").eq("variant_id", v.id).order("created_at", { ascending: false }).limit(30);
    setHistory({ sku: v.sku, rows: data ?? [] });
  };

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Inventory" }]}
        lede="Stock is reserved when an order is placed and returned if it is cancelled. Every change is logged."
        actions={<Button size="sm" variant="secondary" onClick={() => downloadText("inventory.csv", toCsv(rows.map((v) => ({ product: v.products.name, variant: v.title, sku: v.sku, stock: v.stock, price: v.price_inr, tracked: v.track_inventory, selling: v.available }))))}>Export CSV</Button>}
      />
      <div className="mb-4 grid gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-3">
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Product, variant or SKU" />
        <Pick label="Reason for adding stock" value={reason} onChange={setReason} options={[["purchase", "New purchase / production"], ["manual_adjust", "Manual adjustment"], ["damage", "Damaged / lost (use a negative number)"], ["correction", "Stock count correction"]]} />
        <div className="flex items-end"><Check label="Low or out of stock only" checked={lowOnly} onChange={setLowOnly} /></div>
      </div>
      {q.error && <ErrorLine message={q.error} onRetry={q.reload} />}
      {q.loading && !q.data ? <Loading what="Loading stock" /> : (
        <div className="rounded-md border border-line bg-surface p-2">
          <SimpleTable
            head={["Product", "Variant", "SKU", "Stock", "Change", ""]}
            empty="Nothing matches."
            rows={rows.slice(0, 400).map((v) => {
              const threshold = v.low_stock_threshold ?? q.data?.fallback ?? 5;
              return [
                <Link key="p" href={`/admin/products/${v.products.slug}/edit`} className="font-medium text-primary underline-offset-4 hover:underline">{v.products.name}</Link>,
                v.title,
                <span key="s" className="text-caption">{v.sku}</span>,
                !v.track_inventory ? <Pill key="t">Not tracked</Pill> : <span key="st" className="flex items-center gap-2"><span className="tabular font-medium">{v.stock}</span>{v.stock <= 0 ? <Pill tone="red">Out</Pill> : v.stock <= threshold ? <Pill tone="amber">Low</Pill> : null}</span>,
                v.track_inventory ? (
                  <div key="c" className="flex items-center gap-2">
                    <input type="number" aria-label={`Change stock for ${v.sku}`} className="h-9 w-24 rounded-sm border border-line px-2" value={edit[v.id] ?? ""} onChange={(e) => setEdit({ ...edit, [v.id]: e.target.value })} placeholder="qty" />
                    <Button size="sm" variant="secondary" onClick={() => void apply(v, "add")}>Add / remove</Button>
                    <Button size="sm" variant="quiet" onClick={() => void apply(v, "set")}>Set to</Button>
                  </div>
                ) : null,
                <Button key="h" size="sm" variant="quiet" onClick={() => void showHistory(v)}>History</Button>
              ];
            })}
          />
        </div>
      )}
      {history && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Stock history">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-md bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between pb-3"><h2 className="font-display text-h4 font-bold">Stock history · {history.sku}</h2><Button size="sm" variant="secondary" onClick={() => setHistory(null)}>Close</Button></div>
            <SimpleTable head={["When", "Change", "Stock after", "Reason", "Note"]} rows={history.rows.map((m) => [when(m.created_at), m.delta > 0 ? `+${m.delta}` : m.delta, m.stock_after, m.reason.replace(/_/g, " "), m.note ?? ""])} empty="No movements yet." />
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminInventoryPage() {
  return <Suspense fallback={null}><Inventory /></Suspense>;
}
