"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { seriesList } from "@/lib/catalog";
import { classNames, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/States";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { DataTable, TableLink, type AdminColumn } from "@/components/admin/DataTable";
import { FilterBar, FilterSelect, SearchControl } from "@/components/admin/FilterBar";
import { productStockSummary } from "@/components/admin/adminData";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import { deleteAdminProduct, listAdminCategories, listAdminProducts, setProductPublished } from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";
import type { Category, Product } from "@/types";

const ALL = "all";

interface Filters {
  query: string;
  categoryId: string;
  seriesId: string;
  priceMode: string;
  published: string;
}

const INITIAL: Filters = { query: "", categoryId: ALL, seriesId: ALL, priceMode: ALL, published: ALL };

export default function AdminProductsPage() {
  const toast = useToast();
  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const query = useAdminQuery<{ products: Product[]; categories: Category[] }>(async () => {
    const [products, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);
    return { products, categories };
  });

  const products = query.data?.products ?? [];
  const categories = query.data?.categories ?? [];

  const seriesOptions = useMemo(() => {
    const ids = [...new Set(products.map((product) => product.seriesId).filter((id): id is string => Boolean(id)))];
    return ids.map((id) => ({ value: id, label: seriesList.find((series) => series.id === id)?.name ?? id.replace(/-/g, " ") }));
  }, [products]);

  const rows = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();
    return products.filter((product) => {
      if (filters.categoryId !== ALL && product.categoryId !== filters.categoryId) return false;
      if (filters.seriesId !== ALL && (product.seriesId ?? "none") !== filters.seriesId) return false;
      if (filters.priceMode !== ALL && product.priceMode !== filters.priceMode) return false;
      if (filters.published !== ALL && String(product.published) !== filters.published) return false;
      if (!needle) return true;
      const haystack = [product.name, product.slug, product.surface, ...product.variants.map((variant) => variant.sku)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return needle.split(/\s+/).every((token) => haystack.includes(token));
    });
  }, [products, filters]);

  const togglePublished = async (product: Product) => {
    setSavingSlug(product.slug);
    try {
      await setProductPublished(product.id, !product.published);
      query.setData((current) =>
        current
          ? {
              ...current,
              products: current.products.map((row) =>
                row.id === product.id ? { ...row, published: !product.published } : row
              )
            }
          : current
      );
      toast.push(`${product.name} is now ${product.published ? "a draft" : "published"}.`);
    } catch (reason) {
      toast.push(errorMessage(reason, "The publishing state could not be saved."), "error");
    } finally {
      setSavingSlug(null);
    }
  };

  const removeProduct = async (product: Product) => {
    try {
      await deleteAdminProduct(product.id);
      query.setData((current) => (current ? { ...current, products: current.products.filter((row) => row.id !== product.id) } : current));
      toast.push(`${product.name} was deleted.`);
    } catch (reason) {
      toast.push(errorMessage(reason, "The product could not be deleted."), "error");
    }
  };

  const columns: AdminColumn<Product>[] = [
    {
      id: "name",
      header: "Product",
      minWidth: "16rem",
      sortValue: (p) => p.name,
      render: (p) => (
        <span className="flex min-w-0 flex-col leading-tight">
          <TableLink href={`/admin/products/${p.slug}/edit`}>{p.name}</TableLink>
          <span className="truncate text-caption text-graphite">{p.slug}</span>
        </span>
      )
    },
    {
      id: "category",
      header: "Category",
      minWidth: "10rem",
      sortValue: (p) => categories.find((category) => category.id === p.categoryId)?.name ?? "",
      render: (p) => (
        <span className="flex flex-col leading-tight">
          <span>{categories.find((category) => category.id === p.categoryId)?.name ?? "—"}</span>
          <span className="text-caption text-graphite">
            {seriesList.find((series) => series.id === p.seriesId)?.name ?? "Not in a series"}
          </span>
        </span>
      )
    },
    {
      id: "variants",
      header: "Sizes",
      numeric: true,
      minWidth: "4.5rem",
      sortValue: (p) => p.variants.length,
      render: (p) => p.variants.length
    },
    {
      id: "price",
      header: "Price",
      numeric: true,
      minWidth: "10rem",
      sortValue: (p) => Math.min(...p.variants.map((variant) => variant.priceInr ?? Number.MAX_SAFE_INTEGER)),
      render: (p) => {
        const prices = p.variants.map((variant) => variant.priceInr).filter((price): price is number => price !== null);
        if (p.priceMode === "on_request" || prices.length === 0) return <Badge tone="neutral">On request</Badge>;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return <span className="tabular">{min === max ? formatInr(min) : `${formatInr(min)}–${formatInr(max)}`}</span>;
      }
    },
    {
      id: "stock",
      header: "Stock",
      minWidth: "9rem",
      render: (p) => {
        const summary = productStockSummary(p);
        return summary.tracked > 0 ? (
          <span className="tabular text-caption">
            {summary.tracked} of {summary.total} tracked
          </span>
        ) : (
          <span className="text-caption text-graphite">Made to order</span>
        );
      }
    },
    {
      id: "published",
      header: "Publishing",
      minWidth: "9.5rem",
      sortValue: (p) => String(p.published),
      render: (p) => (
        <button
          type="button"
          aria-pressed={p.published}
          aria-label={`${p.published ? "Unpublish" : "Publish"} ${p.name}`}
          disabled={savingSlug === p.slug}
          onClick={() => void togglePublished(p)}
          className={classNames(
            "inline-flex h-9 items-center gap-2 rounded-xs border px-2.5 text-caption font-medium transition-colors disabled:opacity-50",
            p.published
              ? "border-navy/40 bg-navy-wash text-navy-deep hover:border-navy-deep"
              : "border-hair-strong bg-sand/50 text-graphite hover:border-graphite-light"
          )}
        >
          {p.published ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
          {savingSlug === p.slug ? "Saving…" : p.published ? "Published" : "Draft"}
        </button>
      )
    },
    {
      id: "actions",
      header: "Actions",
      minWidth: "8rem",
      render: (p) => (
        <span className="flex items-center gap-1.5">
          <ButtonLink href={`/admin/products/${p.slug}/edit`} variant="secondary" size="sm">
            Open
          </ButtonLink>
          <button
            type="button"
            onClick={() => setPendingDelete(p)}
            aria-label={`Delete ${p.name}`}
            className="flex size-9 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-danger hover:text-danger"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </span>
      )
    }
  ];

  if (query.error) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader title="Products" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]} />
        <ErrorState title="Products could not be loaded" body={query.error} onRetry={query.reload} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Products"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
        lede={`${products.length} products in Supabase, each with one size record per published size.`}
        actions={
          <ButtonLink href="/admin/products/new" size="md">
            Add product
          </ButtonLink>
        }
      />

      <FilterBar
        resultLabel={`${rows.length} of ${products.length} products match`}
        onReset={
          Object.entries(filters).some(([, value]) => value !== ALL && value !== "")
            ? () => setFilters(INITIAL)
            : undefined
        }
      >
        <SearchControl
          label="Search"
          className="grow"
          width="w-full min-w-[14rem]"
          value={filters.query}
          onChange={(value) => setFilters((current) => ({ ...current, query: value }))}
          placeholder="Name, slug, surface or SKU"
        />
        <FilterSelect
          label="Category"
          value={filters.categoryId}
          onChange={(value) => setFilters((current) => ({ ...current, categoryId: value }))}
          options={[{ value: ALL, label: "All categories" }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
        />
        <FilterSelect
          label="Series"
          value={filters.seriesId}
          onChange={(value) => setFilters((current) => ({ ...current, seriesId: value }))}
          options={[{ value: ALL, label: "All series" }, ...seriesOptions, { value: "none", label: "Not in a series" }]}
        />
        <FilterSelect
          label="Price mode"
          value={filters.priceMode}
          onChange={(value) => setFilters((current) => ({ ...current, priceMode: value }))}
          options={[
            { value: ALL, label: "Any mode" },
            { value: "fixed", label: "Price set" },
            { value: "on_request", label: "Price on request" }
          ]}
        />
        <FilterSelect
          label="Publishing"
          value={filters.published}
          onChange={(value) => setFilters((current) => ({ ...current, published: value }))}
          options={[
            { value: ALL, label: "Any state" },
            { value: "true", label: "Published" },
            { value: "false", label: "Draft" }
          ]}
        />
      </FilterBar>

      <DataTable
        caption="Catalogue products with category, series, size count, price, stock summary and publishing state"
        columns={columns}
        rows={rows}
        keyFor={(product) => product.id}
        resetKey={`${filters.query}|${filters.categoryId}|${filters.seriesId}|${filters.priceMode}|${filters.published}`}
        pageSize={12}
        defaultSort={{ id: "name", dir: "asc" }}
        loading={query.loading}
        emptyTitle="No product matches these filters"
        emptyBody="Clear the search text or set a filter back to “All”."
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void removeProduct(pendingDelete);
        }}
        title="Delete this product?"
        body={
          pendingDelete
            ? `${pendingDelete.name} and its ${pendingDelete.variants.length} size rows will be removed from the catalogue. Existing order lines keep their recorded name and price.`
            : ""
        }
        confirmLabel="Delete product"
        destructive
      />
    </div>
  );
}
