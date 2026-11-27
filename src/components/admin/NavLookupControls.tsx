"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, FolderPlus, Layers, Link2, Plus, Search, Trash2 } from "lucide-react";
import { Input, Pick, Pill } from "@/components/admin/kit";
import { Button } from "@/components/ui/Button";
import { collections } from "@/components/static/collection-data";
import { db } from "@/lib/backend/admin";
import { classNames } from "@/lib/format";
import { makeNavId, sanitizeNavHref, type HeaderNavChildItem } from "@/lib/header-nav";
import { imageUrl } from "@/lib/media";
import { useToast } from "@/state/toast";

export interface CatalogLookupProduct {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  seriesId: string | null;
  published: boolean;
  image: string | null;
  skus: string[];
  minPriceInr: number | null;
}

export interface CatalogLookupCategory {
  id: string;
  parentId: string | null;
  name: string;
  description: string | null;
  image: string | null;
  active: boolean;
  sortOrder: number;
}

export function AdminThumb({ image, products }: { image: string | null; products: CatalogLookupProduct[] }) {
  const [failed, setFailed] = useState(false);

  const resolved = useMemo(() => {
    if (!image) return null;
    if (image.startsWith("product:")) {
      const slug = image.slice("product:".length).trim();
      return products.find((p) => p.slug === slug)?.image ?? null;
    }
    return image;
  }, [image, products]);

  if (!resolved || failed) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-line bg-subtle text-muted">
        <Layers className="size-4" aria-hidden />
      </span>
    );
  }

  return (
    <span className="size-10 shrink-0 overflow-hidden rounded-sm border border-line bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl(resolved, { fit: "fill", width: 80, height: 80 })}
        alt=""
        className="size-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export function ProductLookupPicker({
  products,
  categories,
  selectedSlugs,
  onChange
}: {
  products: CatalogLookupProduct[];
  categories: CatalogLookupCategory[];
  selectedSlugs: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const topCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const productBySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products]
  );

  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => {
        if (catFilter && p.categoryId !== catFilter) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.categoryId.toLowerCase().includes(q) ||
          p.skus.some((sku) => sku.toLowerCase().includes(q))
        );
      })
      .slice(0, 20);
  }, [products, query, catFilter]);

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= selectedSlugs.length) return;
    const copy = [...selectedSlugs];
    const [picked] = copy.splice(index, 1);
    copy.splice(target, 0, picked);
    onChange(copy);
  };

  return (
    <div className="flex flex-col gap-4">
      {selectedSlugs.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {selectedSlugs.map((slug, index) => {
            const p = productBySlug.get(slug);
            return (
              <li
                key={slug}
                className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-page p-2.5"
              >
                <AdminThumb image={p?.image ?? null} products={products} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-body-sm font-medium text-ink">
                      {p?.name ?? slug}
                    </span>
                    {!p && <Pill tone="red">Missing</Pill>}
                    {p && !p.published && <Pill tone="amber">Draft (hidden on shop)</Pill>}
                  </div>
                  <p className="truncate text-caption text-muted">
                    /product/{slug}
                    {p?.minPriceInr != null && ` · From ₹${p.minPriceInr.toLocaleString("en-IN")}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="quiet"
                    aria-label="Move product up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="size-3.5" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="quiet"
                    aria-label="Move product down"
                    disabled={index === selectedSlugs.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="size-3.5" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="quiet"
                    aria-label="Remove product"
                    onClick={() => onChange(selectedSlugs.filter((s) => s !== slug))}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-line-strong bg-page px-3 py-3 text-caption text-muted">
          No lookup products pinned yet. When empty, the dropdown automatically shows featured products from the linked category.
        </p>
      )}

      <div className="rounded-md border border-line bg-subtle/40 p-3">
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.06em] text-muted">
          Lookup products from catalogue
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_13rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, slug or SKU…"
              aria-label="Lookup products in catalogue"
              className="h-10 w-full rounded-md border border-line-strong bg-surface pl-9 pr-3 text-body-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            aria-label="Filter product lookup by category"
            className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-body-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All categories</option>
            {topCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <ul className="mt-2.5 flex max-h-60 flex-col gap-1.5 overflow-y-auto pr-1">
          {matches.length === 0 ? (
            <li className="py-4 text-center text-caption text-muted">No matching products found.</li>
          ) : (
            matches.map((p) => {
              const selected = selectedSlugs.includes(p.slug);
              return (
                <li
                  key={p.slug}
                  className="flex items-center gap-2.5 rounded-sm border border-line bg-surface px-2.5 py-2"
                >
                  <AdminThumb image={p.image} products={products} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-body-sm font-medium text-ink">{p.name}</span>
                      {!p.published && <Pill tone="amber">Draft</Pill>}
                    </div>
                    <p className="truncate text-caption text-muted">
                      {categoryNameById.get(p.categoryId) ?? p.categoryId}
                      {p.minPriceInr != null ? ` · ₹${p.minPriceInr.toLocaleString("en-IN")}` : " · On request"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? "quiet" : "secondary"}
                    disabled={selected}
                    onClick={() => onChange([...selectedSlugs, p.slug])}
                  >
                    {selected ? "Added" : "Add"}
                  </Button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

type AddMode = "existing" | "new-category" | "custom";

export function ChildItemAdder({
  parentCategories,
  childCategories,
  products,
  defaultParentCategoryId,
  onAddChildItem,
  onCategoryCreated
}: {
  parentCategories: CatalogLookupCategory[];
  childCategories: CatalogLookupCategory[];
  products: CatalogLookupProduct[];
  defaultParentCategoryId: string | null;
  onAddChildItem: (item: HeaderNavChildItem) => void;
  onCategoryCreated: (created: CatalogLookupCategory) => void;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<AddMode>("existing");
  const [existingId, setExistingId] = useState("");

  // Create brand-new child category in Postgres categories table
  const validDefaultParent =
    defaultParentCategoryId && parentCategories.some((c) => c.id === defaultParentCategoryId)
      ? defaultParentCategoryId
      : parentCategories[0]?.id ?? "";
  const [newParentId, setNewParentId] = useState(validDefaultParent);
  const [newName, setNewName] = useState("");
  const [newId, setNewId] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Add arbitrary custom item / link / collection / product
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");
  const [customImage, setCustomImage] = useState("");

  const parentNameMap = useMemo(
    () => new Map(parentCategories.map((c) => [c.id, c.name])),
    [parentCategories]
  );

  const handleAddExisting = () => {
    if (!existingId) return;
    const sub = childCategories.find((c) => c.id === existingId);
    if (sub && sub.parentId) {
      onAddChildItem({
        id: sub.id,
        label: sub.name,
        href: `/shop/${sub.parentId}/${sub.id}`,
        image: sub.image,
        subcategoryId: sub.id
      });
      setExistingId("");
      return;
    }
    const top = parentCategories.find((c) => c.id === existingId);
    if (top) {
      onAddChildItem({
        id: top.id,
        label: top.name,
        href: `/shop/${top.id}`,
        image: top.image,
        subcategoryId: null
      });
      setExistingId("");
    }
  };

  const handleCreateChildCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = makeNavId(newId || newName);
    const name = newName.trim();
    const parentId = newParentId || validDefaultParent;
    if (!name || !id || !parentId) {
      toast.push("Enter child category name, id, and parent category.", "error");
      return;
    }
    setCreating(true);
    try {
      const sortOrder = childCategories.filter((c) => c.parentId === parentId).length + 1;
      const row = {
        id,
        parent_id: parentId,
        name,
        description: newDesc.trim() || null,
        subject: null,
        image: newImage.trim() || null,
        sort_order: sortOrder,
        active: true
      };
      const { error } = await db().from("categories").insert(row);
      if (error) throw new Error(error.message);

      const created: CatalogLookupCategory = {
        id,
        parentId,
        name,
        description: row.description,
        image: row.image,
        active: true,
        sortOrder
      };
      onCategoryCreated(created);
      onAddChildItem({
        id,
        label: name,
        href: `/shop/${parentId}/${id}`,
        image: row.image,
        subcategoryId: id
      });
      setNewName("");
      setNewId("");
      setNewImage("");
      setNewDesc("");
      toast.push(`Child category "${name}" created & added.`, "success");
    } catch (err) {
      toast.push((err as Error).message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const label = customLabel.trim();
    if (!label) {
      toast.push("Enter a label for the item.", "error");
      return;
    }
    onAddChildItem({
      id: makeNavId(`${label}-${Date.now().toString(36).slice(-4)}`),
      label,
      href: sanitizeNavHref(customHref, "/shop"),
      image: customImage.trim() || null,
      subcategoryId: null
    });
    setCustomLabel("");
    setCustomHref("");
    setCustomImage("");
  };

  const pickTabCls = (active: boolean) =>
    classNames(
      "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-caption font-medium transition-colors",
      active ? "bg-primary text-onprimary" : "bg-surface text-ink-soft hover:bg-subtle hover:text-ink"
    );

  return (
    <div className="rounded-md border border-line bg-subtle/40 p-3">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setMode("existing")} className={pickTabCls(mode === "existing")}>
          <Plus className="size-3.5" aria-hidden />
          Pick existing category
        </button>
        <button type="button" onClick={() => setMode("new-category")} className={pickTabCls(mode === "new-category")}>
          <FolderPlus className="size-3.5" aria-hidden />
          New child category
        </button>
        <button type="button" onClick={() => setMode("custom")} className={pickTabCls(mode === "custom")}>
          <Link2 className="size-3.5" aria-hidden />
          Custom link / product / anything
        </button>
      </div>

      {mode === "existing" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Pick
              label="Child category or top category"
              value={existingId}
              onChange={setExistingId}
              options={[
                ["", "Choose a category or sub-category…"],
                ...childCategories.map(
                  (c) =>
                    [c.id, `${parentNameMap.get(c.parentId ?? "") ?? c.parentId} → ${c.name}`] as [string, string]
                ),
                ...parentCategories.map((c) => [c.id, `Top category: ${c.name}`] as [string, string])
              ]}
            />
          </div>
          <Button type="button" size="sm" variant="secondary" disabled={!existingId} onClick={handleAddExisting}>
            Add to dropdown
          </Button>
        </div>
      )}

      {mode === "new-category" && (
        <form onSubmit={(e) => void handleCreateChildCategory(e)} className="grid gap-3 sm:grid-cols-2">
          <Pick
            label="Parent category"
            value={newParentId || validDefaultParent}
            onChange={setNewParentId}
            options={parentCategories.map((c) => [c.id, c.name] as [string, string])}
          />
          <Input
            label="Child category name"
            value={newName}
            onChange={(e) => {
              const v = e.target.value;
              setNewName(v);
              setNewId(makeNavId(`${newParentId || validDefaultParent}-${v}`));
            }}
            placeholder="e.g. Heavy Stand White Boards"
            required
          />
          <Input
            label="Child category slug (id)"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="white-boards-heavy-stand"
            required
          />
          <Input
            label="Image id, URL or product:<slug>"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="Optional (leave blank or pick below)"
          />
          <Pick
            label="Or borrow thumbnail from a product"
            value=""
            onChange={(slug) => slug && setNewImage(`product:${slug}`)}
            options={[["", "Select product photo (optional)…"], ...products.slice(0, 120).map((p) => [p.slug, p.name] as [string, string])]}
          />
          <Input
            label="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="flex items-end sm:col-span-2">
            <Button type="submit" size="sm" loading={creating} disabled={creating || !parentCategories.length}>
              Create child category & add
            </Button>
          </div>
        </form>
      )}

      {mode === "custom" && (
        <form onSubmit={handleAddCustom} className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Label"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. School Bulk Packs, Custom Size Calculator"
            required
          />
          <Input
            label="Target link"
            value={customHref}
            onChange={(e) => setCustomHref(e.target.value)}
            placeholder="/collections/ceramic-boards or /product/..."
            required
          />
          <Pick
            label="Quick fill from collection or product"
            value=""
            onChange={(val) => {
              if (!val) return;
              if (val.startsWith("col:")) {
                const slug = val.slice(4);
                const col = collections.find((c) => c.slug === slug);
                if (col) {
                  setCustomLabel((prev) => prev || col.name);
                  setCustomHref(`/collections/${col.slug}`);
                }
              } else if (val.startsWith("prod:")) {
                const slug = val.slice(5);
                const prod = products.find((p) => p.slug === slug);
                if (prod) {
                  setCustomLabel((prev) => prev || prod.name);
                  setCustomHref(`/product/${prod.slug}`);
                  if (prod.image) setCustomImage(`product:${prod.slug}`);
                }
              }
            }}
            options={[
              ["", "Fill from catalogue (optional)…"],
              ...collections.map((c) => [`col:${c.slug}`, `Collection: ${c.name}`] as [string, string]),
              ...products.slice(0, 120).map((p) => [`prod:${p.slug}`, `Product: ${p.name}`] as [string, string])
            ]}
          />
          <Input
            label="Thumbnail image (optional)"
            value={customImage}
            onChange={(e) => setCustomImage(e.target.value)}
            placeholder="Cloudinary ID, URL or product:<slug>"
          />
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" variant="secondary">
              Add custom link
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
