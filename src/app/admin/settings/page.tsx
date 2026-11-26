"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Check, ErrorLine, Input, Loading, Pill, Section, SimpleTable, statusTone } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button } from "@/components/ui/Button";
import { db, rpc, when, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

export default function AdminSettingsPage() {
  const toast = useToast();
  const q = useAdminQuery(async () => {
    const [s, z, c, m] = await Promise.all([
      db().from("store_settings").select("*").single(),
      db().from("shipping_zones").select("*").order("state"),
      db().from("carriers").select("*").order("name"),
      db().from("email_outbox").select("id,to_email,template,subject,status,attempts,error,created_at,sent_at").order("created_at", { ascending: false }).limit(40)
    ]);
    if (s.error) throw new Error(s.error.message);
    return { s: s.data as Json, zones: (z.data ?? []) as Json[], carriers: (c.data ?? []) as Json[], mails: (m.data ?? []) as Json[] };
  });
  const [s, setS] = useState<Json | null>(null);
  const [zone, setZone] = useState({ state: "", fee_inr: "", eta_min_days: "", eta_max_days: "" });
  const [carrier, setCarrier] = useState({ id: "", name: "", tracking_url_template: "" });
  useEffect(() => { if (q.data) setS(q.data.s); }, [q.data]);

  const act = async (label: string, work: () => Promise<unknown>) => {
    try { await work(); toast.push(label, "success"); q.reload(); } catch (e) { toast.push((e as Error).message, "error"); }
  };
  const check = (r: { error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); };
  const f = (k: string, v: unknown) => setS((cur: Json | null) => ({ ...(cur ?? {}), [k]: v }));
  if (q.error) return <ErrorLine message={q.error} onRetry={q.reload} />;
  if (!q.data || !s) return <Loading what="Loading settings" />;
  const n = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

  return (
    <>
      <AdminPageHeader title="Settings" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]} lede="Store details, delivery charges, couriers and the email log." />
      <div className="flex flex-col gap-4">
        <Section title="Store and tax">
          <form className="grid gap-3 sm:grid-cols-3" onSubmit={(e) => {
            e.preventDefault();
            void act("Settings saved", async () => check(await db().from("store_settings").update({
              seller_name: s.seller_name, seller_gstin: s.seller_gstin || null, seller_state: s.seller_state, seller_address: s.seller_address || null,
              seller_phone: s.seller_phone || null, seller_email: s.seller_email || null, price_includes_gst: s.price_includes_gst,
              shipping_flat_inr: n(s.shipping_flat_inr) ?? 0, free_shipping_over_inr: n(s.free_shipping_over_inr), shipping_gst_rate: n(s.shipping_gst_rate) ?? 18,
              cod_enabled: s.cod_enabled, cod_fee_inr: n(s.cod_fee_inr) ?? 0, return_window_days: n(s.return_window_days) ?? 7,
              unpaid_order_expiry_minutes: n(s.unpaid_order_expiry_minutes) ?? 60, low_stock_default: n(s.low_stock_default) ?? 5, invoice_prefix: s.invoice_prefix
            }).eq("id", true)));
          }}>
            <Input label="Business name" value={s.seller_name ?? ""} onChange={(e) => f("seller_name", e.target.value)} />
            <Input label="GSTIN" value={s.seller_gstin ?? ""} onChange={(e) => f("seller_gstin", e.target.value)} />
            <Input label="Your state (decides CGST+SGST or IGST)" value={s.seller_state ?? ""} onChange={(e) => f("seller_state", e.target.value)} />
            <Input label="Address on invoices" value={s.seller_address ?? ""} onChange={(e) => f("seller_address", e.target.value)} className="sm:col-span-3" />
            <Input label="Phone" value={s.seller_phone ?? ""} onChange={(e) => f("seller_phone", e.target.value)} />
            <Input label="Email for new order alerts" type="email" value={s.seller_email ?? ""} onChange={(e) => f("seller_email", e.target.value)} />
            <Input label="Invoice number prefix" value={s.invoice_prefix ?? ""} onChange={(e) => f("invoice_prefix", e.target.value)} />
            <Check label="Listed prices already include GST" checked={Boolean(s.price_includes_gst)} onChange={(v) => f("price_includes_gst", v)} hint="Off means GST is added on top ('+ GST')" />
            <Input label="Standard delivery charge ₹ (before GST)" type="number" value={s.shipping_flat_inr ?? ""} onChange={(e) => f("shipping_flat_inr", e.target.value)} hint="Used when a state has no price below" />
            <Input label="Free delivery above ₹" type="number" value={s.free_shipping_over_inr ?? ""} onChange={(e) => f("free_shipping_over_inr", e.target.value)} hint="Empty = never free" />
            <Input label="GST on delivery charge %" type="number" value={s.shipping_gst_rate ?? ""} onChange={(e) => f("shipping_gst_rate", e.target.value)} />
            <Check label="Allow cash on delivery" checked={Boolean(s.cod_enabled)} onChange={(v) => f("cod_enabled", v)} />
            <Input label="Cash on delivery fee ₹" type="number" value={s.cod_fee_inr ?? ""} onChange={(e) => f("cod_fee_inr", e.target.value)} />
            <Input label="Return window (days after delivery)" type="number" value={s.return_window_days ?? ""} onChange={(e) => f("return_window_days", e.target.value)} />
            <Input label="Cancel unpaid online orders after (minutes)" type="number" value={s.unpaid_order_expiry_minutes ?? ""} onChange={(e) => f("unpaid_order_expiry_minutes", e.target.value)} />
            <Input label="Low stock warning at" type="number" value={s.low_stock_default ?? ""} onChange={(e) => f("low_stock_default", e.target.value)} />
            <div className="sm:col-span-3"><Button type="submit">Save settings</Button></div>
          </form>
        </Section>

        <Section title="Delivery charge by state">
          <SimpleTable
            head={["State", "Charge ₹ (before GST)", "Days", ""]}
            empty="No state prices. The standard charge applies everywhere."
            rows={q.data.zones.map((z) => [z.state, Number(z.fee_inr), z.eta_min_days ? `${z.eta_min_days} to ${z.eta_max_days ?? z.eta_min_days}` : "", <Button key="d" size="sm" variant="quiet" onClick={() => void act("Removed", async () => check(await db().from("shipping_zones").delete().eq("state", z.state)))}>Remove</Button>])}
          />
          <form className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-[1fr_8rem_6rem_6rem_auto]" onSubmit={(e) => {
            e.preventDefault();
            void act("Saved", async () => { check(await db().from("shipping_zones").upsert({ state: zone.state.trim(), fee_inr: Number(zone.fee_inr), eta_min_days: n(zone.eta_min_days), eta_max_days: n(zone.eta_max_days) })); setZone({ state: "", fee_inr: "", eta_min_days: "", eta_max_days: "" }); });
          }}>
            <Input label="State" value={zone.state} onChange={(e) => setZone({ ...zone, state: e.target.value })} required />
            <Input label="Charge ₹" type="number" min="0" value={zone.fee_inr} onChange={(e) => setZone({ ...zone, fee_inr: e.target.value })} required />
            <Input label="Min days" type="number" value={zone.eta_min_days} onChange={(e) => setZone({ ...zone, eta_min_days: e.target.value })} />
            <Input label="Max days" type="number" value={zone.eta_max_days} onChange={(e) => setZone({ ...zone, eta_max_days: e.target.value })} />
            <div className="flex items-end"><Button type="submit" variant="secondary">Add or update</Button></div>
          </form>
        </Section>

        <Section title="Couriers (for tracking links)">
          <SimpleTable
            head={["Id", "Name", "Tracking link pattern", "Active", ""]}
            rows={q.data.carriers.map((c) => [c.id, c.name, <span key="t" className="break-all text-caption">{c.tracking_url_template ?? "—"}</span>, c.active ? "Yes" : "No",
              <div key="a" className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setCarrier({ id: c.id, name: c.name, tracking_url_template: c.tracking_url_template ?? "" })}>Edit</Button><Button size="sm" variant="quiet" onClick={() => void act(c.active ? "Hidden" : "Shown", async () => check(await db().from("carriers").update({ active: !c.active }).eq("id", c.id)))}>{c.active ? "Hide" : "Show"}</Button></div>])}
          />
          <form className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-[10rem_1fr_2fr_auto]" onSubmit={(e) => {
            e.preventDefault();
            void act("Saved", async () => { check(await db().from("carriers").upsert({ id: carrier.id.trim().toLowerCase(), name: carrier.name.trim(), tracking_url_template: carrier.tracking_url_template.trim() || null, active: true })); setCarrier({ id: "", name: "", tracking_url_template: "" }); });
          }}>
            <Input label="Short id" value={carrier.id} onChange={(e) => setCarrier({ ...carrier, id: e.target.value })} required />
            <Input label="Name" value={carrier.name} onChange={(e) => setCarrier({ ...carrier, name: e.target.value })} required />
            <Input label="Tracking link pattern" hint="Use {tracking} where the number goes" value={carrier.tracking_url_template} onChange={(e) => setCarrier({ ...carrier, tracking_url_template: e.target.value })} placeholder="https://courier.example/track/{tracking}" />
            <div className="flex items-end"><Button type="submit" variant="secondary">Save courier</Button></div>
          </form>
        </Section>

        <Section title="Email log" aside={<Button size="sm" variant="secondary" onClick={q.reload}>Refresh</Button>}>
          <SimpleTable
            head={["When", "To", "Email", "Status", ""]}
            empty="No emails yet."
            rows={q.data.mails.map((m) => [when(m.created_at), m.to_email, m.subject,
              <div key="s"><Pill tone={statusTone(m.status)}>{m.status}</Pill>{m.error && <div className="max-w-xs text-caption text-red-700">{m.error}</div>}</div>,
              ["failed", "skipped"].includes(m.status) ? <Button key="r" size="sm" variant="secondary" onClick={() => void act("Queued again", () => rpc("admin_retry_email", { p_id: m.id }))}>Send again</Button> : null])}
          />
        </Section>
      </div>
    </>
  );
}
