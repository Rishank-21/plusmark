"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Area, Check, ErrorLine, Input, Loading, Pick, Pill, Section, SimpleTable } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button } from "@/components/ui/Button";
import { db, rpc, when, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

const BLANK = {
  id: "", code: "", description: "", kind: "percent", value: "10", max_discount_inr: "", min_order_inr: "0",
  starts_at: "", ends_at: "", usage_limit: "", per_user_limit: "1", audience: "all", category_ids: "", active: true, emails: ""
};
const local = (iso?: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "");
const iso = (v: string) => (v ? new Date(v).toISOString() : null);

export default function AdminCouponsPage() {
  const toast = useToast();
  const [form, setForm] = useState({ ...BLANK });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const q = useAdminQuery(async () => {
    const { data, error } = await db().from("coupons").select("*, coupon_recipients(email,user_id)").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Json[];
  });
  const set = (k: keyof typeof BLANK) => (v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const edit = (c: Json) => {
    setForm({
      id: c.id, code: c.code, description: c.description ?? "", kind: c.kind, value: String(c.value), max_discount_inr: c.max_discount_inr ?? "",
      min_order_inr: String(c.min_order_inr), starts_at: local(c.starts_at), ends_at: local(c.ends_at), usage_limit: c.usage_limit ?? "",
      per_user_limit: c.per_user_limit ?? "", audience: c.audience, category_ids: (c.category_ids ?? []).join(", "), active: c.active,
      emails: (c.coupon_recipients ?? []).map((r: Json) => r.email).filter(Boolean).join("\n")
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const row = {
        code: form.code.trim().toUpperCase(), description: form.description || null, kind: form.kind, value: Number(form.value) || 0,
        max_discount_inr: form.max_discount_inr === "" ? null : Number(form.max_discount_inr), min_order_inr: Number(form.min_order_inr) || 0,
        starts_at: iso(form.starts_at) ?? new Date().toISOString(), ends_at: iso(form.ends_at),
        usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit), per_user_limit: form.per_user_limit === "" ? null : Number(form.per_user_limit),
        audience: form.audience, category_ids: form.category_ids.split(",").map((s) => s.trim()).filter(Boolean), active: form.active
      };
      if (!/^[A-Z0-9_-]{3,24}$/.test(row.code)) throw new Error("The code needs 3 to 24 letters, numbers, - or _.");
      let id = form.id;
      if (id) {
        const { error } = await db().from("coupons").update(row).eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await db().from("coupons").insert(row).select("id").single();
        if (error) throw new Error(error.message);
        id = data.id;
      }
      const emails = form.emails.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (form.audience === "specific") {
        if (!emails.length) throw new Error("Add at least one email address for a code meant for specific people.");
        await rpc("admin_set_coupon_recipients", { p_coupon_id: id, p_emails: emails, p_user_ids: [] });
      }
      toast.push("Coupon saved.", "success");
      setOpen(false);
      setForm({ ...BLANK });
      q.reload();
    } catch (err) {
      toast.push((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: Json) => {
    const { error } = await db().from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) toast.push(error.message, "error"); else q.reload();
  };

  return (
    <>
      <AdminPageHeader
        title="Offers and coupon codes"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Coupons" }]}
        actions={<Button size="sm" onClick={() => { setForm({ ...BLANK }); setOpen(true); }}>New coupon</Button>}
      />
      {open && (
        <Section title={form.id ? `Edit ${form.code}` : "New coupon"} aside={<Button size="sm" variant="quiet" onClick={() => setOpen(false)}>Close</Button>}>
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-3">
            <Input label="Code" value={form.code} onChange={(e) => set("code")(e.target.value.toUpperCase())} required />
            <Pick label="Type" value={form.kind} onChange={set("kind")} options={[["percent", "Percent off"], ["flat", "Flat ₹ off"], ["free_shipping", "Free shipping"]]} />
            <Input label={form.kind === "percent" ? "Percent" : "Amount ₹"} type="number" step="0.01" value={form.value} onChange={(e) => set("value")(e.target.value)} disabled={form.kind === "free_shipping"} />
            <Input label="Description (shown to customers)" value={form.description} onChange={(e) => set("description")(e.target.value)} className="sm:col-span-3" />
            <Input label="Maximum discount ₹" type="number" value={form.max_discount_inr} onChange={(e) => set("max_discount_inr")(e.target.value)} hint="Optional cap for percent codes" />
            <Input label="Minimum order ₹" type="number" value={form.min_order_inr} onChange={(e) => set("min_order_inr")(e.target.value)} />
            <Pick label="Who can use it" value={form.audience} onChange={set("audience")} options={[["all", "Everyone"], ["specific", "Only specific people (by email)"], ["new_customers", "First order only"]]} />
            <Input label="Starts" type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at")(e.target.value)} />
            <Input label="Ends" type="datetime-local" value={form.ends_at} onChange={(e) => set("ends_at")(e.target.value)} hint="Leave empty for no end" />
            <Input label="Total uses allowed" type="number" value={form.usage_limit} onChange={(e) => set("usage_limit")(e.target.value)} hint="Empty = unlimited" />
            <Input label="Uses per customer" type="number" value={form.per_user_limit} onChange={(e) => set("per_user_limit")(e.target.value)} />
            <Input label="Only for categories" value={form.category_ids} onChange={(e) => set("category_ids")(e.target.value)} hint="Category ids, comma separated. Empty = all" className="sm:col-span-2" />
            {form.audience === "specific" && <Area label="Customer emails" hint="One per line. Only these customers can use the code." value={form.emails} onChange={(e) => set("emails")(e.target.value)} className="sm:col-span-3" />}
            <Check label="Active" checked={form.active} onChange={set("active")} />
            <div className="flex gap-2 sm:col-span-3"><Button type="submit" loading={busy} disabled={busy}>Save coupon</Button></div>
          </form>
        </Section>
      )}
      {q.error && <ErrorLine message={q.error} onRetry={q.reload} />}
      {q.loading && !q.data ? <Loading what="Loading coupons" /> : (
        <div className="mt-4 rounded-md border border-line bg-surface p-2">
          <SimpleTable
            head={["Code", "Offer", "Who", "Valid", "Used", "Status", ""]}
            empty="No coupons yet."
            rows={(q.data ?? []).map((c) => [
              <div key="c"><span className="font-semibold tracking-wide">{c.code}</span><div className="text-caption text-muted">{c.description}</div></div>,
              c.kind === "percent" ? `${Number(c.value)}% off${c.max_discount_inr ? ` (max ₹${Number(c.max_discount_inr)})` : ""}` : c.kind === "flat" ? `₹${Number(c.value)} off` : "Free shipping",
              <span key="a">{c.audience === "all" ? "Everyone" : c.audience === "new_customers" ? "First order" : `${(c.coupon_recipients ?? []).length} people`}{(c.category_ids ?? []).length ? ` · ${c.category_ids.join(", ")}` : ""}</span>,
              <span key="v" className="text-caption">{when(c.starts_at)}{c.ends_at ? ` → ${when(c.ends_at)}` : ""}{Number(c.min_order_inr) ? ` · min ₹${Number(c.min_order_inr)}` : ""}</span>,
              `${c.used_count}${c.usage_limit ? ` / ${c.usage_limit}` : ""}`,
              <Pill key="s" tone={c.active && (!c.ends_at || new Date(c.ends_at) > new Date()) ? "green" : "grey"}>{!c.active ? "Off" : c.ends_at && new Date(c.ends_at) < new Date() ? "Ended" : "Live"}</Pill>,
              <div key="b" className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => edit(c)}>Edit</Button><Button size="sm" variant="quiet" onClick={() => void toggle(c)}>{c.active ? "Turn off" : "Turn on"}</Button></div>
            ])}
          />
        </div>
      )}
    </>
  );
}
