"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ErrorLine, Input, Loading, Pill, SimpleTable } from "@/components/admin/kit";
import { Button } from "@/components/ui/Button";
import { downloadText, inr, rpc, toCsv, when, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

const PAGE = 25;

export default function AdminCustomersPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ total: number; rows: Json[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => { setPage(0); }, [search]);
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      rpc<{ total: number; rows: Json[] }>("admin_list_customers", { p_search: search || null, p_limit: PAGE, p_offset: page * PAGE })
        .then((r) => alive && (setData(r), setError(null)))
        .catch((e: Error) => alive && setError(e.message));
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [search, page, nonce]);

  const block = async (c: Json) => {
    try { await rpc("admin_set_customer_blocked", { p_user_id: c.id, p_blocked: !c.blocked }); toast.push(c.blocked ? "Customer unblocked." : "Customer blocked from ordering and reviewing.", "success"); setNonce((n) => n + 1); }
    catch (e) { toast.push((e as Error).message, "error"); }
  };
  const exportAll = async () => {
    const all: Json[] = [];
    for (let o = 0; o < 5000; o += 200) {
      const r = await rpc<{ total: number; rows: Json[] }>("admin_list_customers", { p_search: search || null, p_limit: 200, p_offset: o });
      all.push(...r.rows);
      if (all.length >= r.total) break;
    }
    downloadText("customers.csv", toCsv(all));
  };
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE));

  return (
    <>
      <AdminPageHeader title="Customers" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers" }]} actions={<Button size="sm" variant="secondary" onClick={() => void exportAll().catch((e: Error) => setError(e.message))}>Export CSV</Button>} />
      <div className="mb-4 max-w-md"><Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or phone" /></div>
      {error && <ErrorLine message={error} />}
      {!data ? <Loading what="Loading customers" /> : (
        <div className="rounded-md border border-line bg-surface p-2">
          <SimpleTable
            head={["Customer", "Phone", "Orders", "Lifetime value", "Last order", "Joined", ""]}
            empty="No customers found."
            rows={data.rows.map((c) => [
              <div key="n"><Link href={`/admin/customers/${c.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{c.full_name || c.email}</Link><div className="text-caption text-muted">{c.email}</div></div>,
              c.phone ?? "",
              c.orders,
              inr(c.lifetime_value_inr),
              c.last_order_at ? when(c.last_order_at) : "—",
              when(c.created_at),
              <div key="a" className="flex items-center gap-2">{c.role === "admin" && <Pill tone="blue">Admin</Pill>}{c.blocked && <Pill tone="red">Blocked</Pill>}{c.role !== "admin" && <Button size="sm" variant="quiet" onClick={() => void block(c)}>{c.blocked ? "Unblock" : "Block"}</Button>}</div>
            ])}
          />
          <div className="flex items-center justify-between border-t border-line px-2 pt-3 text-body-sm">
            <span className="text-muted">{data.total.toLocaleString("en-IN")} customers</span>
            <div className="flex items-center gap-2"><Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button><span>Page {page + 1} of {pages}</span><Button size="sm" variant="secondary" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</Button></div>
          </div>
        </div>
      )}
    </>
  );
}
