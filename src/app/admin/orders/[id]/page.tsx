"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Area, Check, ErrorLine, Input, Loading, Pick, Pill, Section, SimpleTable, statusTone } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button } from "@/components/ui/Button";
import { callFunction, db, inr, openInvoiceAsAdmin, rpc, when, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

const NEXT: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  payment_pending: ["cancelled"],
  payment_failed: ["cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["cancelled"],
  dispatched: [],
  delivered: [],
  return_requested: ["delivered"],
  refund_processing: ["delivered"]
};
const SHIP_STATUS = ["dispatched", "in_transit", "out_for_delivery", "delivered", "failed", "returned"];

const blank = { id: "", carrier_id: "delhivery", carrier_name: "", tracking_number: "", tracking_url: "", status: "dispatched", eta_from: "", eta_to: "", note: "" };

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const q = useAdminQuery(() => rpc<Json>("admin_get_order", { p_order_id: id }));
  const carriers = useAdminQuery(async () => {
    const { data } = await db().from("carriers").select("id,name").eq("active", true).order("name");
    return (data ?? []) as { id: string; name: string }[];
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [ship, setShip] = useState({ ...blank });
  const [adminNotes, setAdminNotes] = useState("");
  const [refund, setRefund] = useState({ amount: "", reason: "" });
  const [manual, setManual] = useState({ amount: "", method: "cod", reference: "" });

  const d = q.data;
  const o = d?.order;
  useEffect(() => {
    if (o) setAdminNotes(o.admin_notes ?? "");
  }, [o?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (label: string, work: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await work();
      toast.push(label, "success");
      q.reload();
    } catch (e) {
      toast.push((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (q.error) return <ErrorLine message={q.error} onRetry={q.reload} />;
  if (!d || !o) return <Loading what="Loading order" />;

  const nextStatuses = NEXT[o.status] ?? [];
  const paid = ["paid", "partially_refunded"].includes(o.payment_status);
  const refundable = Number(o.total_inr) - Number(o.refunded_inr);

  return (
    <>
      <AdminPageHeader
        title={`Order ${o.order_number}`}
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders", href: "/admin/orders" }, { label: o.order_number }]}
        actions={
          <>
            <Pill tone={statusTone(o.status)}>{o.status.replace(/_/g, " ")}</Pill>
            <Pill tone={statusTone(o.payment_status)}>{o.payment_status.replace(/_/g, " ")}</Pill>
            {o.invoice_number && (
              <Button variant="secondary" size="sm" onClick={() => void openInvoiceAsAdmin(o.id).catch((e: Error) => toast.push(e.message, "error"))}>
                GST invoice PDF
              </Button>
            )}
          </>
        }
      />
      {o.needs_attention && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-body-sm text-amber-900">
          <span>⚠ {o.needs_attention}</span>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void run("Marked as handled", () => rpc("admin_resolve_attention", { p_order_id: o.id }))}>
            Mark handled
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-4">
          <Section title="Items">
            <SimpleTable
              head={["Item", "SKU", "Qty", "Unit", "Discount", "GST", "Total"]}
              rows={(d.items as Json[]).map((i) => [
                <div key="n"><div className="font-medium">{i.name}</div><div className="text-caption text-muted">{i.variant_label}{i.returned_qty ? ` · ${i.returned_qty} returned` : ""}</div></div>,
                i.sku,
                i.quantity,
                inr(i.unit_price_inr),
                Number(i.discount_inr) ? `− ${inr(i.discount_inr)}` : "",
                `${inr(i.gst_inr)} (${Number(i.gst_rate)}%)`,
                <span key="t" className="font-medium">{inr(i.line_total_inr)}</span>
              ])}
            />
            <dl className="mt-3 ml-auto grid max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-body-sm">
              <dt className="text-muted">Subtotal</dt><dd className="text-right">{inr(o.subtotal_inr)}</dd>
              {Number(o.discount_inr) > 0 && (<><dt className="text-muted">Discount {o.coupon_code ? `(${o.coupon_code})` : ""}</dt><dd className="text-right">− {inr(o.discount_inr)}</dd></>)}
              <dt className="text-muted">Shipping</dt><dd className="text-right">{inr(o.shipping_inr)}</dd>
              {Number(o.cod_fee_inr) > 0 && (<><dt className="text-muted">COD fee</dt><dd className="text-right">{inr(o.cod_fee_inr)}</dd></>)}
              <dt className="text-muted">Taxable value</dt><dd className="text-right">{inr(o.taxable_inr)}</dd>
              {Number(o.igst_inr) > 0 ? (<><dt className="text-muted">IGST</dt><dd className="text-right">{inr(o.igst_inr)}</dd></>) : (<><dt className="text-muted">CGST</dt><dd className="text-right">{inr(o.cgst_inr)}</dd><dt className="text-muted">SGST</dt><dd className="text-right">{inr(o.sgst_inr)}</dd></>)}
              <dt className="font-semibold">Total</dt><dd className="text-right font-semibold">{inr(o.total_inr)}</dd>
              {Number(o.refunded_inr) > 0 && (<><dt className="text-muted">Refunded</dt><dd className="text-right">{inr(o.refunded_inr)}</dd></>)}
            </dl>
          </Section>

          <Section title="Shipping and tracking" aside={<span className="text-caption text-muted">You ship it yourself and enter the tracking here</span>}>
            <SimpleTable
              head={["Courier", "Tracking", "Status", "Dates", ""]}
              empty="No shipment added yet."
              rows={(d.shipments as Json[]).map((s) => [
                s.carrier_name,
                s.tracking_url ? <a key="u" href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">{s.tracking_number || "Track"}</a> : s.tracking_number,
                <Pill key="s" tone={statusTone(s.status)}>{s.status.replace(/_/g, " ")}</Pill>,
                <span key="d" className="text-caption">{s.shipped_at ? `Shipped ${when(s.shipped_at)}` : ""}{s.eta_from ? ` · ETA ${s.eta_from}${s.eta_to ? ` to ${s.eta_to}` : ""}` : ""}</span>,
                <div key="a" className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShip({ id: s.id, carrier_id: s.carrier_id ?? "other", carrier_name: s.carrier_name ?? "", tracking_number: s.tracking_number ?? "", tracking_url: s.tracking_url ?? "", status: s.status, eta_from: s.eta_from ?? "", eta_to: s.eta_to ?? "", note: s.note ?? "" })}>Edit</Button>
                  <Button size="sm" variant="quiet" disabled={busy} onClick={() => void run("Shipment removed", () => rpc("admin_delete_shipment", { p_shipment_id: s.id }))}>Delete</Button>
                </div>
              ])}
            />
            {["confirmed", "processing", "dispatched"].includes(o.status) && (
              <form
                className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(ship.id ? "Shipment updated" : "Shipment added and customer emailed", async () => {
                    await rpc("admin_set_shipment", {
                      p_order_id: o.id,
                      p_carrier_id: ship.carrier_id || null,
                      p_carrier_name: ship.carrier_name || null,
                      p_tracking_number: ship.tracking_number || null,
                      p_tracking_url: ship.tracking_url || null,
                      p_status: ship.status,
                      p_eta_from: ship.eta_from || null,
                      p_eta_to: ship.eta_to || null,
                      p_note: ship.note || null,
                      p_shipment_id: ship.id || null
                    });
                    setShip({ ...blank });
                  });
                }}
              >
                <h3 className="font-semibold text-ink sm:col-span-2">{ship.id ? "Edit shipment" : "Add a shipment"}</h3>
                <Pick label="Courier" value={ship.carrier_id} onChange={(v) => setShip({ ...ship, carrier_id: v })} options={(carriers.data ?? []).map((c) => [c.id, c.name] as [string, string])} />
                <Input label="Courier name (if different)" value={ship.carrier_name} onChange={(e) => setShip({ ...ship, carrier_name: e.target.value })} />
                <Input label="Tracking number" value={ship.tracking_number} onChange={(e) => setShip({ ...ship, tracking_number: e.target.value })} />
                <Input label="Tracking link" hint="Leave empty to use the courier's standard link" value={ship.tracking_url} onChange={(e) => setShip({ ...ship, tracking_url: e.target.value })} placeholder="https://" />
                <Pick label="Status" value={ship.status} onChange={(v) => setShip({ ...ship, status: v })} options={SHIP_STATUS.map((s) => [s, s.replace(/_/g, " ")] as [string, string])} />
                <Input label="Note for the customer" value={ship.note} onChange={(e) => setShip({ ...ship, note: e.target.value })} />
                <Input label="Expected from" type="date" value={ship.eta_from} onChange={(e) => setShip({ ...ship, eta_from: e.target.value })} />
                <Input label="Expected by" type="date" value={ship.eta_to} onChange={(e) => setShip({ ...ship, eta_to: e.target.value })} />
                <div className="flex gap-2 sm:col-span-2">
                  <Button type="submit" disabled={busy}>{ship.id ? "Save shipment" : "Save and mark dispatched"}</Button>
                  {ship.id && <Button type="button" variant="secondary" onClick={() => setShip({ ...blank })}>Cancel edit</Button>}
                </div>
              </form>
            )}
          </Section>

          {(d.returns as Json[]).length > 0 && (
            <Section title="Returns">
              <div className="flex flex-col gap-4">
                {(d.returns as Json[]).map((r) => (
                  <ReturnCard key={r.return.id} data={r} busy={busy} run={run} />
                ))}
              </div>
            </Section>
          )}

          <Section title="Payments and refunds">
            <SimpleTable
              head={["When", "Provider", "Reference", "Method", "Amount", "Status"]}
              empty="No payment attempts yet."
              rows={(d.payments as Json[]).map((p) => [
                when(p.created_at),
                p.provider,
                <span key="r" className="break-all text-caption">{p.provider_payment_id || p.provider_order_id}</span>,
                p.method ?? "",
                inr(p.amount_inr),
                <Pill key="s" tone={statusTone(p.status)}>{p.status.replace(/_/g, " ")}</Pill>
              ])}
            />
            {(d.refunds as Json[]).length > 0 && (
              <div className="mt-4">
                <h3 className="pb-2 font-semibold text-ink">Refunds</h3>
                <SimpleTable
                  head={["Created", "Amount", "Reason", "Status", ""]}
                  rows={(d.refunds as Json[]).map((r) => [
                    when(r.created_at),
                    inr(r.amount_inr),
                    r.reason,
                    <div key="s"><Pill tone={statusTone(r.status)}>{r.status}</Pill>{r.error && <div className="text-caption text-red-700">{r.error}</div>}</div>,
                    r.status !== "processed" ? (
                      <div key="a" className="flex flex-wrap gap-2">
                        <Button size="sm" disabled={busy} onClick={() => void run("Refund sent to Razorpay", () => callFunction("admin-refund", { refund_id: r.id }))}>Refund via Razorpay</Button>
                        <Button size="sm" variant="secondary" disabled={busy} onClick={() => { const ref = window.prompt("Reference of the refund you paid (UPI / bank)", "manual"); if (ref !== null) void run("Refund marked as done", () => rpc("admin_mark_refund_done", { p_refund_id: r.id, p_reference: ref })); }}>Paid manually</Button>
                      </div>
                    ) : null
                  ])}
                />
              </div>
            )}
            {paid && refundable > 0 && (
              <form
                className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[10rem_1fr_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run("Refund created. Process it with the buttons above.", async () => {
                    await rpc("admin_create_refund", { p_order_id: o.id, p_amount_inr: Number(refund.amount), p_reason: refund.reason });
                    setRefund({ amount: "", reason: "" });
                  });
                }}
              >
                <Input label={`Refund amount (max ${inr(refundable)})`} type="number" step="0.01" min="0.01" value={refund.amount} onChange={(e) => setRefund({ ...refund, amount: e.target.value })} required />
                <Input label="Reason" value={refund.reason} onChange={(e) => setRefund({ ...refund, reason: e.target.value })} required />
                <div className="flex items-end"><Button type="submit" variant="secondary" disabled={busy}>Create refund</Button></div>
              </form>
            )}
            {!paid && o.payment_status !== "refunded" && (
              <form
                className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run("Payment recorded", () => rpc("admin_record_payment", { p_order_id: o.id, p_amount_inr: Number(manual.amount), p_method: manual.method, p_reference: manual.reference || null }));
                }}
              >
                <h3 className="font-semibold text-ink sm:col-span-4">Record a payment received outside Razorpay</h3>
                <Input label="Amount" type="number" step="0.01" value={manual.amount} onChange={(e) => setManual({ ...manual, amount: e.target.value })} placeholder={String(o.total_inr)} required />
                <Pick label="Method" value={manual.method} onChange={(v) => setManual({ ...manual, method: v })} options={[["cod", "Cash on delivery"], ["upi", "UPI"], ["bank", "Bank transfer"], ["cash", "Cash"]]} />
                <Input label="Reference" value={manual.reference} onChange={(e) => setManual({ ...manual, reference: e.target.value })} />
                <div className="flex items-end"><Button type="submit" variant="secondary" disabled={busy}>Record payment</Button></div>
              </form>
            )}
          </Section>

          <Section title="History">
            <ol className="flex flex-col gap-2 text-body-sm">
              {(d.events as Json[]).slice().reverse().map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="w-40 shrink-0 text-caption text-muted">{when(e.created_at)}</span>
                  <span>
                    <span className="font-medium">{e.title}</span>
                    {e.note ? <span className="text-muted"> — {e.note}</span> : null}
                    {!e.customer_visible && <span className="ml-2 text-caption text-muted">(internal)</span>}
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Update status">
            {nextStatuses.length === 0 ? (
              <p className="text-body-sm text-muted">
                {o.status === "dispatched" ? "Mark the shipment as delivered above and the order follows." : "No manual status change is available from here."}
              </p>
            ) : (
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!status) return;
                  void run(`Order moved to ${status.replace(/_/g, " ")}`, async () => {
                    await rpc("admin_update_order_status", { p_order_id: o.id, p_status: status, p_note: note || null, p_notify: notify });
                    setStatus("");
                    setNote("");
                  });
                }}
              >
                <Pick label="Move to" value={status} onChange={setStatus} options={[["", "Choose…"], ...nextStatuses.map((s) => [s, s.replace(/_/g, " ")] as [string, string])]} />
                <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
                <Check label="Email the customer" checked={notify} onChange={setNotify} />
                {status === "cancelled" && paid && <p className="text-caption text-amber-800">A full refund will be queued automatically.</p>}
                <Button type="submit" disabled={busy || !status}>Update</Button>
              </form>
            )}
          </Section>

          <Section title="Customer">
            <dl className="grid gap-1 text-body-sm">
              <dd className="font-medium">{o.customer_name || "—"}</dd>
              <dd>{o.email}</dd>
              <dd>{o.phone}</dd>
              <dd className="text-caption text-muted">{o.user_id ? "Registered customer" : "Guest checkout"}</dd>
            </dl>
            <h3 className="pt-3 font-semibold text-ink">Delivery address</h3>
            <p className="text-body-sm text-ink-soft">{addressLines(o.shipping_address)}</p>
            <h3 className="pt-3 font-semibold text-ink">Billing address</h3>
            <p className="text-body-sm text-ink-soft">{addressLines(o.billing_address)}</p>
            {o.notes && (<><h3 className="pt-3 font-semibold text-ink">Customer note</h3><p className="text-body-sm">{o.notes}</p></>)}
          </Section>

          <Section title="Internal notes">
            <Area label="Only your team sees this" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
            <div className="pt-2"><Button size="sm" variant="secondary" disabled={busy} onClick={() => void run("Notes saved", () => rpc("admin_set_order_notes", { p_order_id: o.id, p_admin_notes: adminNotes }))}>Save notes</Button></div>
          </Section>
        </div>
      </div>
    </>
  );
}

function addressLines(a: Json): string {
  if (!a) return "";
  return [a.recipientName, a.line1, a.line2, a.landmark, `${a.city ?? ""}, ${a.state ?? ""} ${a.pincode ?? ""}`, a.phone && `Phone ${a.phone}`].filter(Boolean).join("\n");
}

function ReturnCard({ data, busy, run }: { data: Json; busy: boolean; run: (label: string, work: () => Promise<unknown>) => Promise<void> }) {
  const r = data.return;
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const act = (action: string, extra: Record<string, unknown> = {}) =>
    void run(`Return ${action}`, () => rpc("admin_decide_return", { p_return_id: r.id, p_action: action, p_note: note || null, ...extra }));
  return (
    <div className="rounded-md border border-line p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{r.return_number}</span>
        <Pill tone={statusTone(r.status)}>{r.status.replace(/_/g, " ")}</Pill>
        <span className="text-caption text-muted">{r.resolution} · {when(r.created_at)}</span>
      </div>
      <p className="py-1 text-body-sm">{r.reason}</p>
      <p className="text-caption text-muted">{(data.items ?? []).map((i: Json) => `${i.quantity} × item`).join(", ")}</p>
      {!["refunded", "closed", "rejected"].includes(r.status) && (
        <div className="mt-2 flex flex-col gap-2">
          <Input label="Note to customer" value={note} onChange={(e) => setNote(e.target.value)} />
          {r.status === "received" && <Input label="Refund amount (blank = value of returned items)" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />}
          <div className="flex flex-wrap gap-2">
            {r.status === "requested" && (<><Button size="sm" disabled={busy} onClick={() => act("approve")}>Approve</Button><Button size="sm" variant="danger" disabled={busy} onClick={() => act("reject")}>Reject</Button></>)}
            {["approved", "pickup_scheduled"].includes(r.status) && (<Button size="sm" disabled={busy} onClick={() => act("receive")}>Received and restock</Button>)}
            {r.status === "received" && r.resolution === "refund" && (<Button size="sm" disabled={busy} onClick={() => act("refund", amount ? { p_refund_inr: Number(amount) } : {})}>Create refund</Button>)}
            <Button size="sm" variant="quiet" disabled={busy} onClick={() => act("close")}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
