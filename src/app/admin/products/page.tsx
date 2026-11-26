"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ErrorLine, Input, Loading, Pick, Pill, SimpleTable } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button, ButtonLink } from "@/components/ui/Button";
import { db, inr, rpc, type Json } from "@/lib/backend/admin";
import { useToast } from "@/state/toast";

export default function AdminProductsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [show, setShow] = useState("active");
  const q = useAdminQuery(async () => {
    const client = db();
    const [active, archived, cats] = await Promise.all([
      client.from("product_listing").select("id,slug,name,category_id,published,featured,enquiry_only,min_price_inr,max_price_inr,in_stock,cover_image").order("name").limit(2000),
      client.from("products").select("id,slug,name,category_id").not("deleted_at", "is", null).order("name").limit(500),
      client.from("categories").select("id,name").is("parent_id", null).order("sort_order")
    ]);
    if (active.error) throw new Error(active.error.message);
    return { active: (active.data ?? []) as Json[], archived: (archived.data ?? []) as Json[], cats: (cats.data ?? []) as Json[] };
  });

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const list = show === "archived" ? q.data?.archived ?? [] : q.data?.active ?? [];
    return list.filter((p) => (!needle || p.name.toLowerCase().includes(needle) || p.slug.includes(needle)) && (!category || p.category_id === category))
      .filter((p) => show !== "draft" || !p.published);
  }, [q.data, search, category, show]);

  const act = async (label: string, work: () => Promise<unknown>) => {
    try { await work(); toast.push(label, "success"); q.reload(); } catch (e) { toast.push((e as Error).message, "error"); }
  };

  return (
    <>
      <AdminPageHeader
        title="Products"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
        actions={<ButtonLink href="/admin/products/new" size="sm">New product</ButtonLink>}
      />
      <div className="mb-4 grid gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-3">
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or address" />
        <Pick label="Category" value={category} onChange={setCategory} options={[["", "All"], ...(q.data?.cats ?? []).map((c) => [c.id, c.name] as [string, string])]} />
        <Pick label="Show" value={show} onChange={setShow} options={[["active", "All products"], ["draft", "Drafts (not published)"], ["archived", "Archived"]]} />
      </div>
      {q.error && <ErrorLine message={q.error} onRetry={q.reload} />}
      {q.loading && !q.data ? <Loading what="Loading products" /> : (
        <div className="rounded-md border border-line bg-surface p-2">
          <SimpleTable
            head={["Product", "Category", "Price", "Stock", "Status", ""]}
            empty="No products match."
            rows={rows.slice(0, 300).map((p) => [
              <Link key="n" href={`/admin/products/${p.slug}/edit`} className="font-medium text-primary underline-offset-4 hover:underline">{p.name}</Link>,
              p.category_id,
              p.enquiry_only ? "Enquiry only" : p.min_price_inr === null || p.min_price_inr === undefined ? "On request" : p.min_price_inr === p.max_price_inr ? inr(p.min_price_inr) : `${inr(p.min_price_inr)} – ${inr(p.max_price_inr)}`,
              p.in_stock === undefined ? "" : <Pill key="s" tone={p.in_stock ? "green" : "red"}>{p.in_stock ? "In stock" : "Out of stock"}</Pill>,
              show === "archived" ? <Pill key="a">Archived</Pill> : <Pill key="p" tone={p.published ? "green" : "amber"}>{p.published ? "Published" : "Draft"}</Pill>,
              <div key="a" className="flex gap-2">
                {show === "archived" ? (
                  <Button size="sm" variant="secondary" onClick={() => void act("Restored as a draft", () => rpc("admin_restore_product", { p_product_id: p.id, p_publish: false }))}>Restore</Button>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => void act(p.published ? "Unpublished" : "Published", () => rpc("admin_upsert_product", { p: { id: p.id, published: !p.published } }))}>{p.published ? "Unpublish" : "Publish"}</Button>
                    <Button size="sm" variant="quiet" onClick={() => { if (window.confirm(`Archive "${p.name}"? It disappears from the shop but keeps its order history.`)) void act("Archived", () => rpc("admin_delete_product", { p_product_id: p.id })); }}>Archive</Button>
                  </>
                )}
              </div>
            ])}
          />
          {rows.length > 300 && <p className="px-2 pt-2 text-caption text-muted">Showing the first 300 of {rows.length}. Use search to narrow down.</p>}
        </div>
      )}
    </>
  );
}
