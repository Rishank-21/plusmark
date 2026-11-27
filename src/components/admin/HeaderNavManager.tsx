"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Check, ErrorLine, Input, Loading, Pick, Pill, Section } from "@/components/admin/kit";
import {
  AdminThumb,
  ChildItemAdder,
  ProductLookupPicker,
  type CatalogLookupCategory,
  type CatalogLookupProduct
} from "@/components/admin/NavLookupControls";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { collections } from "@/components/static/collection-data";
import { Button, ButtonLink } from "@/components/ui/Button";
import { db, type Json } from "@/lib/backend/admin";
import { categories as builtinCategories, products as builtinProducts, seriesList as builtinSeries } from "@/lib/catalog";
import { classNames } from "@/lib/format";
import {
  autoMegaCategories,
  autoRangesForCategory,
  buildDefaultHeaderNav,
  buildStripItemFromCategory,
  makeNavId,
  normalizeHeaderNav,
  sanitizeNavHref,
  type HeaderNavChildItem,
  type HeaderNavConfig,
  type HeaderNavCustomLink,
  type HeaderNavMiddleMode,
  type HeaderNavRangesMode,
  type HeaderNavStripItem
} from "@/lib/header-nav";
import { useToast } from "@/state/toast";
import type { Category, Product } from "@/types";

interface DbCategoryRow {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  active: boolean;
}

interface DbProductRow {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  series_id: string | null;
  subcategory_ids: string[] | null;
  published: boolean;
  product_media?: { public_id: string; sort_order: number }[];
  product_variants?: { sku: string; price_inr: number | string | null; price_mode: string }[];
}

interface DbSeriesRow {
  id: string;
  name: string;
  surface: string | null;
  rank: number;
}

type StripAddTab = "category" | "collection" | "custom";

function mapBuiltinCategories(): CatalogLookupCategory[] {
  const rows: CatalogLookupCategory[] = [];
  builtinCategories.forEach((c, idx) => {
    rows.push({
      id: c.id,
      parentId: null,
      name: c.name,
      description: c.description,
      image: c.image,
      active: true,
      sortOrder: idx + 1
    });
    c.subcategories.forEach((s, subIdx) => {
      rows.push({
        id: s.id,
        parentId: c.id,
        name: s.name,
        description: null,
        image: s.image,
        active: true,
        sortOrder: subIdx + 1
      });
    });
  });
  return rows;
}

function mapBuiltinProducts(): CatalogLookupProduct[] {
  return builtinProducts.map((p) => {
    const prices = p.variants.map((v) => v.priceInr).filter((v): v is number => v !== null);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      categoryId: p.categoryId,
      seriesId: p.seriesId,
      published: p.published,
      image: p.media[0]?.publicId ?? null,
      skus: p.variants.map((v) => v.sku),
      minPriceInr: prices.length ? Math.min(...prices) : null
    };
  });
}

function toCategoryTree(rows: CatalogLookupCategory[]): Category[] {
  const tops = rows.filter((c) => !c.parentId && c.active);
  return tops.map((c) => ({
    id: c.id,
    slug: c.id,
    name: c.name,
    description: c.description ?? "",
    subject: c.name,
    image: c.image,
    subcategories: rows
      .filter((s) => s.parentId === c.id && s.active)
      .map((s) => ({ id: s.id, name: s.name, image: s.image }))
  }));
}

function toLightProducts(rows: DbProductRow[]): Product[] {
  return rows
    .filter((p) => p.published)
    .map((p) => {
      const firstMedia = [...(p.product_media ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        ...builtinProducts[0],
        id: p.slug,
        slug: p.slug,
        name: p.name,
        categoryId: p.category_id,
        seriesId: p.series_id,
        subcategoryIds: p.subcategory_ids ?? [],
        media: firstMedia ? [{ publicId: firstMedia.public_id, alt: p.name, width: 800, height: 800, source: "product" }] : []
      };
    });
}

export function HeaderNavManager() {
  const toast = useToast();
  const q = useAdminQuery(async () => {
    const client = db();
    const [contentRes, catsRes, prodsRes, seriesRes] = await Promise.all([
      client.from("site_content").select("value").eq("key", "header_nav").maybeSingle(),
      client.from("categories").select("id,parent_id,name,description,image,sort_order,active").order("sort_order"),
      client
        .from("products")
        .select("id,slug,name,category_id,series_id,subcategory_ids,published,product_media(public_id,sort_order),product_variants(sku,price_inr,price_mode)")
        .is("deleted_at", null)
        .order("name")
        .limit(1000),
      client.from("series").select("id,name,surface,rank").order("rank")
    ]);
    if (contentRes.error) throw new Error(contentRes.error.message);

    const dbCats = ((catsRes.data ?? []) as DbCategoryRow[]).map<CatalogLookupCategory>((r) => ({
      id: r.id,
      parentId: r.parent_id,
      name: r.name,
      description: r.description,
      image: r.image,
      active: r.active,
      sortOrder: r.sort_order
    }));

    const dbProdsRaw = (prodsRes.data ?? []) as DbProductRow[];
    const dbProds: CatalogLookupProduct[] = dbProdsRaw.map((p) => {
      const sortedMedia = [...(p.product_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      const prices = (p.product_variants ?? [])
        .filter((v) => v.price_mode === "fixed" && v.price_inr !== null)
        .map((v) => Number(v.price_inr))
        .filter((n) => Number.isFinite(n));
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        categoryId: p.category_id,
        seriesId: p.series_id,
        published: p.published,
        image: sortedMedia[0]?.public_id ?? null,
        skus: (p.product_variants ?? []).map((v) => v.sku),
        minPriceInr: prices.length ? Math.min(...prices) : null
      };
    });

    const dbSeries = ((seriesRes.data ?? []) as DbSeriesRow[]).map((s) => ({
      id: s.id,
      name: s.name,
      surface: s.surface ?? ""
    }));

    return {
      savedNav: contentRes.data?.value ? normalizeHeaderNav(contentRes.data.value) : null,
      categories: dbCats.length ? dbCats : mapBuiltinCategories(),
      products: dbProds.length ? dbProds : mapBuiltinProducts(),
      lightProducts: dbProdsRaw.length ? toLightProducts(dbProdsRaw) : builtinProducts,
      series: dbSeries.length ? dbSeries : builtinSeries
    };
  });

  const [draft, setDraft] = useState<HeaderNavConfig>(() => buildDefaultHeaderNav());
  const [createdCategories, setCreatedCategories] = useState<CatalogLookupCategory[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("mega");

  // Add strip item state
  const [addTab, setAddTab] = useState<StripAddTab>("category");
  const [pickCatId, setPickCatId] = useState("");
  const [pickCollectionSlug, setPickCollectionSlug] = useState("");
  const [customTabLabel, setCustomTabLabel] = useState("");
  const [customTabHref, setCustomTabHref] = useState("");

  // Middle column custom link draft
  const [midLabel, setMidLabel] = useState("");
  const [midSubtitle, setMidSubtitle] = useState("");
  const [midHref, setMidHref] = useState("");

  useEffect(() => {
    if (!q.data) return;
    setDraft(q.data.savedNav ?? buildDefaultHeaderNav());
    setDirty(false);
    setSelectedKey((prev) => {
      if (prev === "mega") return "mega";
      const items = (q.data?.savedNav ?? buildDefaultHeaderNav()).items;
      return items.some((x) => x.id === prev) ? prev : items[0]?.id ?? "mega";
    });
  }, [q.data]);

  const allCategories = useMemo(() => {
    const base = q.data?.categories ?? [];
    const seen = new Set(base.map((c) => c.id));
    return [...base, ...createdCategories.filter((c) => !seen.has(c.id))];
  }, [q.data?.categories, createdCategories]);

  const parentCategories = useMemo(
    () => allCategories.filter((c) => !c.parentId),
    [allCategories]
  );
  const childCategories = useMemo(
    () => allCategories.filter((c) => Boolean(c.parentId)),
    [allCategories]
  );
  const categoryTree = useMemo(() => toCategoryTree(allCategories), [allCategories]);

  const mutateDraft = (updater: (cur: HeaderNavConfig) => HeaderNavConfig) => {
    setDraft((cur) => updater(cur));
    setDirty(true);
  };

  const selectedStripItem =
    selectedKey === "mega" ? null : draft.items.find((item) => item.id === selectedKey) ?? null;

  const activeData = selectedKey === "mega" ? draft.megaMenu : selectedStripItem;

  const patchActive = (patch: Partial<HeaderNavStripItem>) => {
    if (selectedKey === "mega") {
      mutateDraft((cur) => ({
        ...cur,
        megaMenu: {
          ...cur.megaMenu,
          label: patch.label ?? cur.megaMenu.label,
          rangesHeading: patch.rangesHeading ?? cur.megaMenu.rangesHeading,
          rangesMode: patch.rangesMode ?? cur.megaMenu.rangesMode,
          ranges: patch.ranges ?? cur.megaMenu.ranges,
          middleHeading: patch.middleHeading ?? cur.megaMenu.middleHeading,
          middleMode: patch.middleMode ?? cur.megaMenu.middleMode,
          middleLinks: patch.middleLinks ?? cur.megaMenu.middleLinks,
          featuredHeading: patch.featuredHeading ?? cur.megaMenu.featuredHeading,
          showFeatured: patch.showFeatured ?? cur.megaMenu.showFeatured,
          featuredSlugs: patch.featuredSlugs ?? cur.megaMenu.featuredSlugs,
          ctaLabel: patch.ctaLabel ?? cur.megaMenu.ctaLabel,
          ctaHref: patch.ctaHref ?? cur.megaMenu.ctaHref
        }
      }));
      return;
    }
    if (!selectedStripItem) return;
    mutateDraft((cur) => ({
      ...cur,
      items: cur.items.map((it) => (it.id === selectedStripItem.id ? { ...it, ...patch } : it))
    }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const normalized = normalizeHeaderNav(draft);
      const { error } = await db()
        .from("site_content")
        .upsert({ key: "header_nav", value: normalized as unknown as Json });
      if (error) throw new Error(error.message);
      setDraft(normalized);
      setDirty(false);
      toast.push("Header navigation saved to storefront.", "success");
      q.reload();
    } catch (err) {
      toast.push((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!window.confirm("Reset the header category strip and dropdowns back to the built-in default configuration?")) return;
    const def = buildDefaultHeaderNav();
    setDraft(def);
    setSelectedKey("mega");
    setDirty(true);
  };

  const moveStripItem = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= draft.items.length) return;
    mutateDraft((cur) => {
      const next = [...cur.items];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...cur, items: next };
    });
  };

  const removeStripItem = (id: string) => {
    mutateDraft((cur) => {
      const next = cur.items.filter((item) => item.id !== id);
      if (selectedKey === id) setSelectedKey(next[0]?.id ?? "mega");
      return { ...cur, items: next };
    });
  };

  const ensureUniqueStripId = (seed: string) => {
    const base = makeNavId(seed);
    let candidate = base;
    let n = 2;
    const existing = new Set(draft.items.map((i) => i.id));
    while (existing.has(candidate)) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    return candidate;
  };

  const handleAddCategoryStrip = () => {
    const cat = parentCategories.find((c) => c.id === pickCatId);
    if (!cat) return;
    const item = buildStripItemFromCategory({
      id: ensureUniqueStripId(cat.id),
      label: cat.name,
      href: `/shop/${cat.id}`,
      categoryId: cat.id
    });
    mutateDraft((cur) => ({ ...cur, items: [...cur.items, item] }));
    setSelectedKey(item.id);
    setPickCatId("");
  };

  const handleAddCollectionStrip = () => {
    const col = collections.find((c) => c.slug === pickCollectionSlug);
    if (!col) return;
    const isCeramic = col.slug === "ceramic-boards";
    const item: HeaderNavStripItem = {
      id: ensureUniqueStripId(col.slug),
      label: col.slug === "ceramic-boards" ? "Ceramic Boards" : col.name,
      href: `/collections/${col.slug}`,
      visible: true,
      categoryId: isCeramic ? "ceramic-boards" : null,
      rangesHeading: "Product ranges",
      showRanges: isCeramic,
      rangesMode: isCeramic ? "auto" : "custom",
      ranges: [],
      middleHeading: "By series",
      middleMode: "series",
      middleLinks: [],
      featuredHeading: "Start here",
      showFeatured: true,
      featuredSlugs: [],
      ctaLabel: `Browse ${col.name.toLowerCase()}`,
      ctaHref: `/collections/${col.slug}`
    };
    mutateDraft((cur) => ({ ...cur, items: [...cur.items, item] }));
    setSelectedKey(item.id);
    setPickCollectionSlug("");
  };

  const handleAddCustomStrip = (e: React.FormEvent) => {
    e.preventDefault();
    const label = customTabLabel.trim();
    if (!label) return;
    const href = sanitizeNavHref(customTabHref, "/shop");
    const item: HeaderNavStripItem = {
      id: ensureUniqueStripId(label),
      label,
      href,
      visible: true,
      categoryId: null,
      rangesHeading: "Quick links",
      showRanges: true,
      rangesMode: "custom",
      ranges: [],
      middleHeading: "By series",
      middleMode: "hidden",
      middleLinks: [],
      featuredHeading: "Featured products",
      showFeatured: true,
      featuredSlugs: [],
      ctaLabel: `View ${label.toLowerCase()}`,
      ctaHref: href
    };
    mutateDraft((cur) => ({ ...cur, items: [...cur.items, item] }));
    setSelectedKey(item.id);
    setCustomTabLabel("");
    setCustomTabHref("");
  };

  const getAutoRangesForActive = (): HeaderNavChildItem[] => {
    const products = q.data?.lightProducts ?? builtinProducts;
    if (selectedKey === "mega") {
      return autoMegaCategories(categoryTree);
    }
    return autoRangesForCategory(selectedStripItem?.categoryId ?? null, categoryTree, products);
  };

  const importRangesFromCategory = () => {
    const autoList = getAutoRangesForActive();
    if (autoList.length === 0) {
      toast.push("No child categories found for this linked category yet.", "error");
      return;
    }
    const existing = activeData?.ranges ?? [];
    const seenHref = new Set(existing.map((r) => r.href));
    const merged = [...existing, ...autoList.filter((a) => !seenHref.has(a.href))];
    patchActive({ rangesMode: "custom", showRanges: true, ranges: merged });
    toast.push(`Loaded ${autoList.length} child items into editable list.`, "success");
  };

  const addChildToActive = (child: HeaderNavChildItem) => {
    if (!activeData) return;
    let baseList = activeData.ranges;
    if (activeData.rangesMode === "auto") {
      const autoList = getAutoRangesForActive();
      const seenHref = new Set(baseList.map((r) => r.href));
      baseList = [...autoList, ...baseList.filter((r) => !seenHref.has(r.href) && !autoList.some((a) => a.href === r.href))];
    }
    patchActive({
      showRanges: true,
      rangesMode: "custom",
      ranges: [...baseList, child]
    });
  };

  const patchChildItem = (index: number, patch: Partial<HeaderNavChildItem>) => {
    if (!activeData) return;
    const next = activeData.ranges.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    patchActive({ rangesMode: "custom", ranges: next });
  };

  const moveChildItem = (index: number, delta: -1 | 1) => {
    if (!activeData) return;
    const target = index + delta;
    if (target < 0 || target >= activeData.ranges.length) return;
    const next = [...activeData.ranges];
    const [picked] = next.splice(index, 1);
    next.splice(target, 0, picked);
    patchActive({ rangesMode: "custom", ranges: next });
  };

  const importSeriesToMiddle = () => {
    const series = q.data?.series ?? builtinSeries;
    const links: HeaderNavCustomLink[] = series.map((s) => ({
      id: s.id,
      label: s.name,
      subtitle: s.surface,
      href: `/shop?series=${s.id}`
    }));
    patchActive({ middleMode: "custom", middleLinks: links });
  };

  const addCustomMiddleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeData || !midLabel.trim()) return;
    const next: HeaderNavCustomLink = {
      id: makeNavId(`${midLabel}-${Date.now().toString(36).slice(-4)}`),
      label: midLabel.trim(),
      subtitle: midSubtitle.trim() || null,
      href: sanitizeNavHref(midHref, "/shop")
    };
    patchActive({
      middleMode: "custom",
      middleLinks: [...activeData.middleLinks, next]
    });
    setMidLabel("");
    setMidSubtitle("");
    setMidHref("");
  };

  const moveMiddleLink = (index: number, delta: -1 | 1) => {
    if (!activeData) return;
    const target = index + delta;
    if (target < 0 || target >= activeData.middleLinks.length) return;
    const next = [...activeData.middleLinks];
    const [picked] = next.splice(index, 1);
    next.splice(target, 0, picked);
    patchActive({ middleLinks: next });
  };

  if (q.error) return <ErrorLine message={q.error} onRetry={q.reload} />;
  if (q.loading && !q.data) return <Loading what="Loading header navigation" />;

  const addTabCls = (active: boolean) =>
    classNames(
      "rounded-sm px-2.5 py-1 text-caption font-medium transition-colors",
      active ? "bg-primary text-onprimary" : "bg-subtle text-ink-soft hover:text-ink"
    );

  return (
    <>
      <AdminPageHeader
        title="Header navigation"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Header navigation" }]}
        lede="Manage categories on the dark storefront header strip, dropdown sub-categories, custom links, and featured lookup products."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty && <Pill tone="amber">Unsaved changes</Pill>}
            <ButtonLink href="/admin/categories" size="sm" variant="secondary">
              All categories
            </ButtonLink>
            <Button type="button" size="sm" variant="secondary" onClick={resetToDefault}>
              <RotateCcw className="size-3.5" aria-hidden />
              Reset default
            </Button>
            <Button type="button" size="sm" loading={saving} disabled={saving} onClick={() => void saveAll()}>
              <Save className="size-3.5" aria-hidden />
              Save & publish
            </Button>
          </div>
        }
      />

      {/* Live Preview of the storefront charcoal category strip */}
      <div className="mb-4 overflow-hidden rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <span className="text-caption font-medium text-muted">
            Storefront strip preview — click any tab below to edit its dropdown, child categories & lookup products
          </span>
          <span className="text-caption text-muted">
            {draft.items.filter((i) => i.visible).length} visible items
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-[#181816] px-4 py-2.5 text-[#FAF9F6]">
          {draft.megaMenu.enabled && (
            <button
              type="button"
              onClick={() => setSelectedKey("mega")}
              className={classNames(
                "rounded-xs px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.11em] transition-colors",
                selectedKey === "mega" ? "bg-white/20 text-white ring-1 ring-white/50" : "text-white/90 hover:bg-white/10"
              )}
            >
              {draft.megaMenu.label}
            </button>
          )}
          {draft.items.filter((it) => it.visible).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedKey(item.id)}
              className={classNames(
                "rounded-xs px-2.5 py-1 text-xs uppercase tracking-[0.11em] transition-colors",
                selectedKey === item.id ? "bg-white/20 font-semibold text-white ring-1 ring-white/50" : "text-white/80 hover:bg-white/10"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[21rem_1fr]">
        {/* Left Sidebar: Strip order + Add controls */}
        <div className="flex flex-col gap-4">
          <Section title="Header strip items">
            <div className="flex flex-col gap-2">
              <div
                className={classNames(
                  "flex items-center justify-between gap-2 rounded-md border px-3 py-2.5",
                  selectedKey === "mega" ? "border-primary bg-primary/5" : "border-line bg-surface"
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedKey("mega")}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-body-sm font-semibold text-ink">{draft.megaMenu.label}</span>
                    <Pill tone={draft.megaMenu.enabled ? "green" : "grey"}>
                      {draft.megaMenu.enabled ? "Mega menu" : "Off"}
                    </Pill>
                  </div>
                  <p className="text-caption text-muted">Leftmost All-Categories menu</p>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant="quiet"
                  aria-label={draft.megaMenu.enabled ? "Hide All Boards button" : "Show All Boards button"}
                  onClick={() =>
                    mutateDraft((cur) => ({
                      ...cur,
                      megaMenu: { ...cur.megaMenu, enabled: !cur.megaMenu.enabled }
                    }))
                  }
                >
                  {draft.megaMenu.enabled ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                </Button>
              </div>

              {draft.items.map((item, index) => (
                <div
                  key={item.id}
                  className={classNames(
                    "flex items-center gap-1.5 rounded-md border px-3 py-2",
                    selectedKey === item.id ? "border-primary bg-primary/5" : "border-line bg-surface"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedKey(item.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={classNames("truncate text-body-sm font-medium", item.visible ? "text-ink" : "text-muted line-through")}>
                        {item.label}
                      </span>
                      {!item.visible && <Pill tone="grey">Hidden</Pill>}
                    </div>
                    <p className="truncate text-caption text-muted">
                      {item.href}
                      {item.featuredSlugs.length > 0 ? ` · ${item.featuredSlugs.length} pinned` : ""}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      aria-label={`Move ${item.label} left`}
                      disabled={index === 0}
                      onClick={() => moveStripItem(index, -1)}
                      className="flex size-7 items-center justify-center rounded-xs text-muted hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${item.label} right`}
                      disabled={index === draft.items.length - 1}
                      onClick={() => moveStripItem(index, 1)}
                      className="flex size-7 items-center justify-center rounded-xs text-muted hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={item.visible ? `Hide ${item.label}` : `Show ${item.label}`}
                      onClick={() =>
                        mutateDraft((cur) => ({
                          ...cur,
                          items: cur.items.map((x) => (x.id === item.id ? { ...x, visible: !x.visible } : x))
                        }))
                      }
                      className="flex size-7 items-center justify-center rounded-xs text-muted hover:bg-subtle hover:text-ink"
                    >
                      {item.visible ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.label} from strip`}
                      onClick={() => removeStripItem(item.id)}
                      className="flex size-7 items-center justify-center rounded-xs text-muted hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Add to header strip">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setAddTab("category")} className={addTabCls(addTab === "category")}>
                Category
              </button>
              <button type="button" onClick={() => setAddTab("collection")} className={addTabCls(addTab === "collection")}>
                Collection
              </button>
              <button type="button" onClick={() => setAddTab("custom")} className={addTabCls(addTab === "custom")}>
                Custom / Link
              </button>
            </div>

            {addTab === "category" && (
              <div className="flex flex-col gap-3">
                <Pick
                  label="Choose a catalogue category"
                  value={pickCatId}
                  onChange={setPickCatId}
                  options={[
                    ["", "Select category…"],
                    ...parentCategories.map((c) => [c.id, c.name] as [string, string])
                  ]}
                />
                <Button type="button" size="sm" variant="secondary" disabled={!pickCatId} onClick={handleAddCategoryStrip}>
                  <Plus className="size-3.5" aria-hidden />
                  Add category to strip
                </Button>
              </div>
            )}

            {addTab === "collection" && (
              <div className="flex flex-col gap-3">
                <Pick
                  label="Choose a collection"
                  value={pickCollectionSlug}
                  onChange={setPickCollectionSlug}
                  options={[
                    ["", "Select collection…"],
                    ...collections.map((c) => [c.slug, c.name] as [string, string])
                  ]}
                />
                <Button type="button" size="sm" variant="secondary" disabled={!pickCollectionSlug} onClick={handleAddCollectionStrip}>
                  <Plus className="size-3.5" aria-hidden />
                  Add collection to strip
                </Button>
              </div>
            )}

            {addTab === "custom" && (
              <form onSubmit={handleAddCustomStrip} className="flex flex-col gap-3">
                <Input
                  label="Strip tab label"
                  value={customTabLabel}
                  onChange={(e) => setCustomTabLabel(e.target.value)}
                  placeholder="e.g. Custom Sizes, Benches, School Packs"
                  required
                />
                <Input
                  label="Target link"
                  value={customTabHref}
                  onChange={(e) => setCustomTabHref(e.target.value)}
                  placeholder="/shop or /contact"
                  required
                />
                <Button type="submit" size="sm" variant="secondary">
                  <Plus className="size-3.5" aria-hidden />
                  Add custom strip item
                </Button>
              </form>
            )}
          </Section>
        </div>

        {/* Right Inspector */}
        {activeData ? (
          <div className="flex flex-col gap-4">
            <Section title={selectedKey === "mega" ? `Edit "${draft.megaMenu.label}" mega menu` : `Edit "${selectedStripItem?.label}" tab`}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Display label on strip"
                  value={activeData.label}
                  onChange={(e) => patchActive({ label: e.target.value })}
                  required
                />
                {selectedKey === "mega" ? (
                  <div className="flex items-end pb-1">
                    <Check
                      label="Show All Boards mega-menu button on strip"
                      checked={draft.megaMenu.enabled}
                      onChange={(enabled) =>
                        mutateDraft((cur) => ({ ...cur, megaMenu: { ...cur.megaMenu, enabled } }))
                      }
                    />
                  </div>
                ) : (
                  <>
                    <Input
                      label="Tab click URL"
                      value={selectedStripItem?.href ?? ""}
                      onChange={(e) => patchActive({ href: e.target.value })}
                    />
                    <Pick
                      label="Linked catalogue category (for auto child ranges)"
                      value={selectedStripItem?.categoryId ?? ""}
                      onChange={(val) => patchActive({ categoryId: val || null })}
                      options={[
                        ["", "None (custom links only)"],
                        ["ceramic-boards", "Virtual collection: Ceramic Boards"],
                        ...parentCategories.map((c) => [c.id, c.name] as [string, string])
                      ]}
                    />
                    <div className="flex items-end pb-1">
                      <Check
                        label="Visible on storefront header strip"
                        checked={selectedStripItem?.visible ?? true}
                        onChange={(visible) => patchActive({ visible })}
                      />
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* Dropdown Column 1: Child Categories & Custom Links */}
            <Section
              title="Dropdown Column 1 — Child categories & links"
              aside={
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={importRangesFromCategory}>
                    Import from category
                  </Button>
                </div>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    label="Column heading"
                    value={activeData.rangesHeading}
                    onChange={(e) => patchActive({ rangesHeading: e.target.value })}
                  />
                  <Pick
                    label="Source mode"
                    value={activeData.rangesMode}
                    onChange={(v) => patchActive({ rangesMode: v as HeaderNavRangesMode })}
                    options={[
                      ["auto", "Auto (linked category subcategories + custom extras)"],
                      ["custom", "Custom list only (full manual control)"]
                    ]}
                  />
                  {selectedKey !== "mega" && (
                    <div className="flex items-end pb-1">
                      <Check
                        label="Show child column"
                        checked={selectedStripItem?.showRanges ?? true}
                        onChange={(showRanges) => patchActive({ showRanges })}
                      />
                    </div>
                  )}
                </div>

                {activeData.rangesMode === "auto" && (
                  <p className="rounded-md border border-line bg-page px-3 py-2 text-caption text-muted">
                    Auto mode pulls active sub-categories from{" "}
                    <strong className="font-medium text-ink">
                      {selectedKey === "mega" ? "all top categories" : selectedStripItem?.categoryId ?? "none"}
                    </strong>
                    . Add an item below or click <em>Import from category</em> to customize, edit labels, or reorder them individually.
                  </p>
                )}

                {activeData.ranges.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {activeData.ranges.map((child, idx) => (
                      <li
                        key={`${child.id}-${idx}`}
                        className="grid items-center gap-2 rounded-md border border-line bg-page p-2.5 sm:grid-cols-[auto_1fr_1fr_1fr_auto]"
                      >
                        <AdminThumb image={child.image} products={q.data?.products ?? []} />
                        <Input
                          label={idx === 0 ? "Label" : ""}
                          aria-label="Child item label"
                          value={child.label}
                          onChange={(e) => patchChildItem(idx, { label: e.target.value })}
                        />
                        <Input
                          label={idx === 0 ? "Link URL" : ""}
                          aria-label="Child item URL"
                          value={child.href}
                          onChange={(e) => patchChildItem(idx, { href: e.target.value })}
                        />
                        <Input
                          label={idx === 0 ? "Image ID / URL" : ""}
                          aria-label="Child item image"
                          value={child.image ?? ""}
                          onChange={(e) => patchChildItem(idx, { image: e.target.value || null })}
                          placeholder="Optional"
                        />
                        <div className={classNames("flex items-center gap-1", idx === 0 && "sm:pt-5")}>
                          <Button
                            type="button"
                            size="sm"
                            variant="quiet"
                            aria-label="Move child item up"
                            disabled={idx === 0}
                            onClick={() => moveChildItem(idx, -1)}
                          >
                            <ArrowUp className="size-3.5" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="quiet"
                            aria-label="Move child item down"
                            disabled={idx === activeData.ranges.length - 1}
                            onClick={() => moveChildItem(idx, 1)}
                          >
                            <ArrowDown className="size-3.5" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="quiet"
                            aria-label="Remove child item"
                            onClick={() =>
                              patchActive({
                                rangesMode: "custom",
                                ranges: activeData.ranges.filter((_, j) => j !== idx)
                              })
                            }
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <ChildItemAdder
                  key={`adder-${selectedKey}`}
                  parentCategories={parentCategories}
                  childCategories={childCategories}
                  products={q.data?.products ?? []}
                  defaultParentCategoryId={
                    selectedKey === "mega" ? null : selectedStripItem?.categoryId ?? null
                  }
                  onAddChildItem={addChildToActive}
                  onCategoryCreated={(created) => setCreatedCategories((cur) => [...cur, created])}
                />
              </div>
            </Section>

            {/* Dropdown Column 2: Series or Custom Links */}
            <Section
              title="Dropdown Column 2 — Series or custom links"
              aside={
                <Button type="button" size="sm" variant="secondary" onClick={importSeriesToMiddle}>
                  Load series links
                </Button>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Pick
                    label="Column mode"
                    value={activeData.middleMode}
                    onChange={(v) => patchActive({ middleMode: v as HeaderNavMiddleMode })}
                    options={[
                      ["series", "Auto: By Series (Metallic, Eco, Deluxe…)"],
                      ["custom", "Custom links (add any items)"],
                      ["hidden", "Hide middle column"]
                    ]}
                  />
                  <Input
                    label="Column heading"
                    value={activeData.middleHeading}
                    onChange={(e) => patchActive({ middleHeading: e.target.value })}
                    disabled={activeData.middleMode === "hidden"}
                  />
                </div>

                {activeData.middleMode === "custom" && (
                  <div className="flex flex-col gap-3">
                    {activeData.middleLinks.map((lnk, idx) => (
                      <div
                        key={lnk.id}
                        className="grid items-center gap-2 rounded-md border border-line bg-page p-2.5 sm:grid-cols-[1fr_1fr_1fr_auto]"
                      >
                        <Input
                          label={idx === 0 ? "Title" : ""}
                          aria-label="Link title"
                          value={lnk.label}
                          onChange={(e) =>
                            patchActive({
                              middleLinks: activeData.middleLinks.map((x, j) =>
                                j === idx ? { ...x, label: e.target.value } : x
                              )
                            })
                          }
                        />
                        <Input
                          label={idx === 0 ? "Subtitle" : ""}
                          aria-label="Link subtitle"
                          value={lnk.subtitle ?? ""}
                          onChange={(e) =>
                            patchActive({
                              middleLinks: activeData.middleLinks.map((x, j) =>
                                j === idx ? { ...x, subtitle: e.target.value || null } : x
                              )
                            })
                          }
                        />
                        <Input
                          label={idx === 0 ? "URL" : ""}
                          aria-label="Link URL"
                          value={lnk.href}
                          onChange={(e) =>
                            patchActive({
                              middleLinks: activeData.middleLinks.map((x, j) =>
                                j === idx ? { ...x, href: e.target.value } : x
                              )
                            })
                          }
                        />
                        <div className={classNames("flex items-center gap-1", idx === 0 && "sm:pt-5")}>
                          <Button type="button" size="sm" variant="quiet" disabled={idx === 0} onClick={() => moveMiddleLink(idx, -1)}>
                            <ArrowUp className="size-3.5" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="quiet"
                            disabled={idx === activeData.middleLinks.length - 1}
                            onClick={() => moveMiddleLink(idx, 1)}
                          >
                            <ArrowDown className="size-3.5" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="quiet"
                            onClick={() =>
                              patchActive({
                                middleLinks: activeData.middleLinks.filter((_, j) => j !== idx)
                              })
                            }
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <form
                      onSubmit={addCustomMiddleLink}
                      className="grid gap-2 rounded-md border border-line bg-subtle/40 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <Input
                        label="Add custom link label"
                        value={midLabel}
                        onChange={(e) => setMidLabel(e.target.value)}
                        placeholder="e.g. Custom Cut Quote"
                        required
                      />
                      <Input
                        label="Subtitle (optional)"
                        value={midSubtitle}
                        onChange={(e) => setMidSubtitle(e.target.value)}
                        placeholder="Non-standard sizes"
                      />
                      <Input
                        label="Link URL"
                        value={midHref}
                        onChange={(e) => setMidHref(e.target.value)}
                        placeholder="/contact"
                        required
                      />
                      <div className="flex items-end">
                        <Button type="submit" size="sm" variant="secondary">
                          Add
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </Section>

            {/* Dropdown Column 3: Lookup / Featured Products + CTA */}
            <Section title="Dropdown Column 3 — Lookup featured products & button">
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    label="Products heading"
                    value={activeData.featuredHeading}
                    onChange={(e) => patchActive({ featuredHeading: e.target.value })}
                  />
                  <Input
                    label="Bottom button label"
                    value={activeData.ctaLabel}
                    onChange={(e) => patchActive({ ctaLabel: e.target.value })}
                    placeholder="Leave empty to hide button"
                  />
                  <Input
                    label="Bottom button URL"
                    value={activeData.ctaHref}
                    onChange={(e) => patchActive({ ctaHref: e.target.value })}
                  />
                </div>

                <Check
                  label="Show featured product cards in this dropdown"
                  checked={activeData.showFeatured}
                  onChange={(showFeatured) => patchActive({ showFeatured })}
                />

                {activeData.showFeatured && (
                  <ProductLookupPicker
                    key={`lookup-${selectedKey}`}
                    products={q.data?.products ?? []}
                    categories={allCategories}
                    selectedSlugs={activeData.featuredSlugs}
                    onChange={(featuredSlugs) => patchActive({ featuredSlugs })}
                  />
                )}
              </div>
            </Section>
          </div>
        ) : (
          <Section title="Select an item">
            <p className="text-body-sm text-muted">Pick an item on the left strip list or add a category to edit its dropdown.</p>
          </Section>
        )}
      </div>
    </>
  );
}
