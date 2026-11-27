"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Check, ErrorLine, Input, Loading, Pick, Section, SimpleTable } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button, ButtonLink } from "@/components/ui/Button";
import { db, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

const BLANK = { id: "", parent_id: "", name: "", description: "", subject: "", image: "", sort_order: "0", default_gst_rate: "", active: true, isNew: true };

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [form, setForm] = useState({ ...BLANK });
  const q = useAdminQuery(async () => {
    const { data, error } = await db().from("categories").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as Json[];
  });
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const row = {
      id: form.id.trim(), parent_id: form.parent_id || null, name: form.name.trim(), description: form.description || null, subject: form.subject || null,
      image: form.image || null, sort_order: Number(form.sort_order) || 0, default_gst_rate: form.default_gst_rate === "" ? null : Number(form.default_gst_rate), active: form.active
    };
    const { error } = form.isNew ? await db().from("categories").insert(row) : await db().from("categories").update(row).eq("id", row.id);
    if (error) { toast.push(error.message, "error"); return; }
    toast.push("Category saved.", "success");
    setForm({ ...BLANK });
    q.reload();
  };
  const remove = async (c: Json) => {
    if (!window.confirm(`Delete "${c.name}"? This only works when no product uses it.`)) return;
    const { error } = await db().from("categories").delete().eq("id", c.id);
    if (error) toast.push("That category is still used by products or sub categories.", "error"); else { toast.push("Deleted.", "success"); q.reload(); }
  };
  const tops = (q.data ?? []).filter((c) => !c.parent_id);
  return (
    <>
      <AdminPageHeader
        title="Categories"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
        actions={<ButtonLink href="/admin/navigation" size="sm" variant="secondary">Edit header strip</ButtonLink>}
      />
      {q.error && <ErrorLine message={q.error} onRetry={q.reload} />}
      {!q.data ? <Loading what="Loading categories" /> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <Section title="All categories">
            <SimpleTable
              head={["Name", "Id", "Parent", "Order", "GST %", ""]}
              rows={q.data.map((c) => [<span key="n" className={c.parent_id ? "pl-4" : "font-medium"}>{c.name}{c.active ? "" : " (hidden)"}</span>, c.id, c.parent_id ?? "", c.sort_order, c.default_gst_rate ?? "",
                <div key="a" className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setForm({ id: c.id, parent_id: c.parent_id ?? "", name: c.name, description: c.description ?? "", subject: c.subject ?? "", image: c.image ?? "", sort_order: String(c.sort_order), default_gst_rate: c.default_gst_rate ?? "", active: c.active, isNew: false })}>Edit</Button><Button size="sm" variant="quiet" onClick={() => void remove(c)}>Delete</Button></div>])}
            />
          </Section>
          <Section title={form.isNew ? "Add a category" : `Edit ${form.name}`}>
            <form onSubmit={save} className="flex flex-col gap-3">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, id: form.isNew ? slug(e.target.value) : form.id })} required />
              <Input label="Id (address)" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!form.isNew} required />
              <Pick label="Parent" value={form.parent_id} onChange={(v) => setForm({ ...form, parent_id: v })} options={[["", "None (top level)"], ...tops.filter((t) => t.id !== form.id).map((t) => [t.id, t.name] as [string, string])]} />
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input label="Image id or link" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <Input label="Display order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              <Input label="Default GST %" type="number" value={String(form.default_gst_rate)} onChange={(e) => setForm({ ...form, default_gst_rate: e.target.value })} />
              <Check label="Visible in the shop" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
              <div className="flex gap-2"><Button type="submit">Save</Button>{!form.isNew && <Button type="button" variant="secondary" onClick={() => setForm({ ...BLANK })}>Cancel</Button>}</div>
            </form>
          </Section>
        </div>
      )}
    </>
  );
}
