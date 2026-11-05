"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { seriesList } from "@/lib/catalog";
import { formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { FilterBar, FilterSelect, SearchControl } from "@/components/admin/FilterBar";
import { DataTable, TableLink, type AdminColumn } from "@/components/admin/DataTable";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import { listAdminProducts, updateVariant } from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";
import type { Product, Variant } from "@/types";

const ALL = "all";

interface Row {
  product: Product;
  variant: Variant;
}

interface Draft {
  stock: string;
  trackInventory: boolean;
  available: boolean;
}

export default function AdminVariantsPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState(ALL);
  const [seriesId, setSeriesId] = useState(ALL);
  const [priceMode, setPriceMode] = useState(ALL);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const data = useAdminQuery<Product[]>(() => listAdminProducts());
  const products = data.data ?? [];

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => map.set(product.categoryId, product.categoryId.replace(/-/g, " ")));
    return [...map.entries()].map(([id, label]) => ({ value: id, label: label.replace(/\b\w/g, (c) => c.toUpperCase()) }));
  }, [products]);

  const allRows = useMemo<Row[]>(
    () => products.flatMap((product) => product.variants.map((variant) => ({ product, variant }))),
    [products]
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allRows.filter(({ product, variant }) => {
      if (categoryId !== ALL && product.categoryId !== categoryId) return false;
      if (seriesId !== ALL && (product.seriesId ?? "none") !== seriesId) return false;
      if (priceMode !== ALL && variant.priceMode !== priceMode) return false;
      if (!needle) return true;
      return `${product.name} ${product.slug} ${variant.sku} ${variant.size.label}`.toLowerCase().includes(needle);
    });
  }, [allRows, query, categoryId, seriesId, priceMode]);

  const draftFor = (variant: Variant): Draft =>
    drafts[variant.id] ?? {
      stock: variant.stock === null ? "" : String(variant.stock),
      trackInventory: variant.trackInventory,
      available: variant.available
    };

  const setDraft = (variant: Variant, patch: Partial<Draft>) => {
    setDrafts((current) => ({ ...current, [variant.id]: { ...draftFor(variant), ...patch } }));
  };

  const save = async (variant: Variant) => {
    const draft = drafts[variant.id];
    if (!draft) return;
    const stock = draft.stock.trim() === "" ? null : Number.parseInt(draft.stock, 10);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
      toast.push("Stock must be a whole number of 0 or more, or blank for made to order.", "error");
      return;
    }
    setSavingId(variant.id);
    try {
      await updateVariant(variant.id, {
        stock,
        trackInventory: draft.trackInventory,
        available: draft.available
      });
      data.setData((current) =>
        current
          ? current.map((product) => ({
              ...product,
              variants: product.variants.map((row) =>
                row.id === variant.id
                  ? { ...row, stock, trackInventory: draft.trackInventory, available: draft.available }
                  : row
              )
            }))
          : current
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[variant.id];
        return next;
      });
      toast.push(`${variant.sku} was saved.`);
    } catch (reason) {
      toast.push(errorMessage(reason, "That size row could not be saved."), "error");
    } finally {
      setSavingId(null);
    }
  };

  const columns: AdminColumn<Row>[] = [
    {
      id: "sku",
      header: "SKU",
      minWidth: "10rem",
      sortValue: ({ variant }) => variant.sku,
      render: ({ variant }) => <span className="tabular font-medium">{variant.sku}</span>
    },
    {
      id: "product",
      header: "Product",
      minWidth: "18rem",
      sortValue: ({ product }) => product.name,
      render: ({ product }) => (
        <span className="flex flex-col leading-tight">
          <TableLink href={`/admin/products/${product.slug}/edit`}>{product.name}</TableLink>
          <span className="text-caption text-graphite">{product.slug}</span>
        </span>
      )
    },
    { id: "size", header: "Size", sortValue: ({ variant }) => variant.size.label, render: ({ variant }) => variant.size.label },
    {
      id: "price",
      header: "Price",
      numeric: true,
      minWidth: "9rem",
      sortValue: ({ variant }) => variant.priceInr ?? Number.MAX_SAFE_INTEGER,
      render: ({ variant }) =>
        variant.priceMode === "on_request" || variant.priceInr === null ? (
          <Badge tone="neutral">On request</Badge>
        ) : (
          <span className="tabular">{formatInr(variant.priceInr)}</span>
        )
    },
    {
      id: "stock",
      header: "Stock",
      minWidth: "10rem",
      render: ({ variant }) => {
        const draft = draftFor(variant);
        return (
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1}
              aria-label={`Stock for ${variant.sku}`}
              value={draft.stock}
              placeholder="—"
              disabled={!draft.trackInventory}
              onChange={(event) => setDraft(variant, { stock: event.target.value })}
              className="h-9 w-20 rounded-xs border border-hair-strong bg-surface px-2 text-body-sm tabular text-ink disabled:bg-sand/50 disabled:text-graphite"
            />
            <label className="flex items-center gap-1 text-caption text-graphite">
              <input
                type="checkbox"
                checked={draft.trackInventory}
                onChange={(event) => setDraft(variant, { trackInventory: event.target.checked })}
                className="size-3.5 accent-navy"
              />
              Track
            </label>
          </span>
        );
      }
    },
    {
      id: "available",
      header: "Orderable",
      minWidth: "8rem",
      render: ({ variant }) => {
        const draft = draftFor(variant);
        return (
          <label className="flex items-center gap-2 text-caption">
            <input
              type="checkbox"
              checked={draft.available}
              onChange={(event) => setDraft(variant, { available: event.target.checked })}
              className="size-3.5 accent-navy"
            />
            {draft.available ? "Available" : "Hidden"}
          </label>
        );
      }
    },
    {
      id: "save",
      header: "Save",
      render: ({ variant }) =>
        drafts[variant.id] ? (
          <button
            type="button"
            onClick={() => void save(variant)}
            disabled={savingId === variant.id}
            className="inline-flex h-9 items-center gap-1.5 rounded-xs bg-ink px-2.5 text-caption font-medium text-canvas transition-colors hover:bg-ink-soft disabled:opacity-50"
          >
            <Save className="size-3.5" aria-hidden />
            {savingId === variant.id ? "Saving…" : "Save"}
          </button>
        ) : (
          <span className="text-caption text-graphite-light">—</span>
        )
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Variants"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Variants" }]}
        lede={`${allRows.length} size records across ${products.length} products. Stock and availability edits save immediately to Supabase.`}
      />

      {data.error ? (
        <ErrorState title="Variants could not be loaded" body={data.error} onRetry={data.reload} />
      ) : (
        <>
          <FilterBar
            resultLabel={`${rows.length} of ${allRows.length} variants match`}
            onReset={
              query || categoryId !== ALL || seriesId !== ALL || priceMode !== ALL
                ? () => {
                    setQuery("");
                    setCategoryId(ALL);
                    setSeriesId(ALL);
                    setPriceMode(ALL);
                  }
                : undefined
            }
          >
            <SearchControl
              label="Search"
              value={query}
              onChange={setQuery}
              className="grow"
              width="w-full min-w-[16rem]"
              placeholder="Product, SKU or size"
            />
            <FilterSelect
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={[{ value: ALL, label: "All categories" }, ...categories]}
            />
            <FilterSelect
              label="Series"
              value={seriesId}
              onChange={setSeriesId}
              options={[
                { value: ALL, label: "All series" },
                ...seriesList.map((series) => ({ value: series.id, label: series.name })),
                { value: "none", label: "Not in a series" }
              ]}
            />
            <FilterSelect
              label="Price mode"
              value={priceMode}
              onChange={setPriceMode}
              options={[
                { value: ALL, label: "Any mode" },
                { value: "fixed", label: "Price set" },
                { value: "on_request", label: "On request" }
              ]}
            />
          </FilterBar>

          <DataTable
            caption="Product variants with SKU, size, price mode, stock and availability"
            columns={columns}
            rows={rows}
            keyFor={({ variant }) => variant.id}
            resetKey={`${query}|${categoryId}|${seriesId}|${priceMode}`}
            pageSize={15}
            loading={data.loading}
            defaultSort={{ id: "product", dir: "asc" }}
            emptyTitle="No variant matches these filters"
            emptyBody="Reset a filter or clear the search to see the variant records again."
          />
        </>
      )}
    </div>
  );
}
