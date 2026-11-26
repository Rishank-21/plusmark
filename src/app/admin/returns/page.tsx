"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ErrorLine, Loading, Pick, Pill, SimpleTable, statusTone } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { db, inr, when, type Json } from "@/lib/backend/admin";

export default function AdminReturnsPage() {
  const [status, setStatus] = useState("open");
  const q = useAdminQuery(async () => {
    const { data, error } = await db()
      .from("returns")
      .select("id,return_number,status,reason,reason_code,resolution,refund_inr,created_at,orders(id,order_number,email,customer_name),return_items(quantity)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as Json[];
  });
  const open = ["requested", "approved", "pickup_scheduled", "received"];
  const rows = (q.data ?? []).filter((r) => status === "all" || (status === "open" ? open.includes(r.status) : r.status === status));
  return (
    <>
      <AdminPageHeader title="Returns" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Returns" }]} lede="Open an order to approve, receive and refund a return." />
      <div className="mb-4 max-w-xs">
        <Pick label="Show" value={status} onChange={setStatus} options={[["open", "Open"], ["requested", "Waiting for a decision"], ["received", "Received, refund due"], ["refunded", "Refunded"], ["rejected", "Rejected"], ["all", "All"]]} />
      </div>
      {q.error && <ErrorLine message={q.error} onRetry={q.reload} />}
      {q.loading && !q.data ? <Loading what="Loading returns" /> : (
        <div className="rounded-md border border-line bg-surface p-2">
          <SimpleTable
            head={["Return", "Order", "Customer", "Reason", "Units", "Resolution", "Status", "Refund"]}
            empty="No returns in this list."
            rows={rows.map((r) => [
              <div key="n"><span className="font-medium">{r.return_number}</span><div className="text-caption text-muted">{when(r.created_at)}</div></div>,
              <Link key="o" href={`/admin/orders/${r.orders?.id}`} className="text-primary underline-offset-4 hover:underline">{r.orders?.order_number}</Link>,
              <div key="c">{r.orders?.customer_name || "—"}<div className="text-caption text-muted">{r.orders?.email}</div></div>,
              <span key="r" className="line-clamp-2 max-w-xs">{r.reason}</span>,
              (r.return_items ?? []).reduce((s: number, i: Json) => s + i.quantity, 0),
              r.resolution,
              <Pill key="s" tone={statusTone(r.status)}>{r.status.replace(/_/g, " ")}</Pill>,
              r.refund_inr ? inr(r.refund_inr) : ""
            ])}
          />
        </div>
      )}
    </>
  );
}
