"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ErrorLine, Loading, Pick, Pill, Section, SimpleTable, statusTone } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button } from "@/components/ui/Button";
import { callFunction, db, downloadText, inr, rpc, toCsv, when, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const q = useAdminQuery(async () => {
    const [pay, ref, evt] = await Promise.all([
      db().from("payments").select("id,provider,provider_order_id,provider_payment_id,amount_inr,status,method,signature_verified,error_description,created_at,orders(id,order_number,email)").order("created_at", { ascending: false }).limit(500),
      db().from("refunds").select("id,amount_inr,reason,status,error,created_at,orders(id,order_number,email)").order("created_at", { ascending: false }).limit(200),
      db().from("payment_events").select("id,event,processed,error,received_at").order("received_at", { ascending: false }).limit(30)
    ]);
    if (pay.error) throw new Error(pay.error.message);
    return { pay: (pay.data ?? []) as Json[], ref: (ref.data ?? []) as Json[], evt: (evt.data ?? []) as Json[] };
  });
  const run = async (label: string, work: () => Promise<unknown>) => {
    try { await work(); toast.push(label, "success"); q.reload(); } catch (e) { toast.push((e as Error).message, "error"); }
  };
  const pays = (q.data?.pay ?? []).filter((p) => !status || p.status === status);
  const todo = (q.data?.ref ?? []).filter((r) => r.status !== "processed");

  return (
    <>
      <AdminPageHeader
        title="Payments and refunds"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Payments" }]}
        actions={<Button size="sm" variant="secondary" onClick={() => downloadText("payments.csv", toCsv(pays.map((p) => ({ date: p.created_at, order: p.orders?.order_number, email: p.orders?.email, provider: p.provider, payment_id: p.provider_payment_id, razorpay_order: p.provider_order_id, method: p.method, amount: p.amount_inr, status: p.status }))))}>Export CSV</Button>}
      />
      {q.error && <ErrorLine message={q.error} onRetry={q.reload} />}
      {q.loading && !q.data ? <Loading what="Loading payments" /> : (
        <div className="flex flex-col gap-4">
          {todo.length > 0 && (
            <Section title={`Refunds waiting for you (${todo.length})`}>
              <SimpleTable
                head={["Order", "Amount", "Reason", "Status", ""]}
                rows={todo.map((r) => [
                  <Link key="o" href={`/admin/orders/${r.orders?.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{r.orders?.order_number}</Link>,
                  inr(r.amount_inr), r.reason,
                  <div key="s"><Pill tone={statusTone(r.status)}>{r.status}</Pill>{r.error && <div className="text-caption text-red-700">{r.error}</div>}</div>,
                  <div key="a" className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void run("Refund sent to Razorpay", () => callFunction("admin-refund", { refund_id: r.id }))}>Refund via Razorpay</Button>
                    <Button size="sm" variant="secondary" onClick={() => { const ref = window.prompt("Reference of the refund you paid (UPI / bank)", "manual"); if (ref !== null) void run("Marked as refunded", () => rpc("admin_mark_refund_done", { p_refund_id: r.id, p_reference: ref })); }}>Paid manually</Button>
                  </div>
                ])}
              />
            </Section>
          )}
          <Section title="Payments" aside={<div className="w-44"><Pick label="" value={status} onChange={setStatus} options={[["", "All"], ["captured", "Captured"], ["failed", "Failed"], ["created", "Started"], ["refunded", "Refunded"], ["partially_refunded", "Part refunded"]]} /></div>}>
            <SimpleTable
              head={["When", "Order", "Provider", "Payment id", "Method", "Amount", "Status"]}
              empty="No payments yet."
              rows={pays.map((p) => [
                when(p.created_at),
                <Link key="o" href={`/admin/orders/${p.orders?.id}`} className="text-primary underline-offset-4 hover:underline">{p.orders?.order_number}</Link>,
                p.provider,
                <span key="i" className="break-all text-caption">{p.provider_payment_id ?? p.provider_order_id}</span>,
                p.method ?? "",
                inr(p.amount_inr),
                <div key="s"><Pill tone={statusTone(p.status)}>{p.status.replace(/_/g, " ")}</Pill>{p.error_description && <div className="text-caption text-red-700">{p.error_description}</div>}</div>
              ])}
            />
          </Section>
          <Section title="Recent Razorpay notifications">
            <SimpleTable head={["Received", "Event", "Handled"]} empty="None yet." rows={(q.data?.evt ?? []).map((e) => [when(e.received_at), e.event, e.processed ? "Yes" : e.error ? `No: ${e.error}` : "Pending"])} />
          </Section>
        </div>
      )}
    </>
  );
}
