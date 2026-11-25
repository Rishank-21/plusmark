"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { ErrorState } from "@/components/ui/States";
import { AdminPageHeader, StatStrip } from "@/components/admin/Metrics";
import { FilterBar, FilterSelect, SearchControl } from "@/components/admin/FilterBar";
import { DataTable, TableLink, type AdminColumn } from "@/components/admin/DataTable";
import { StockStatus } from "@/components/admin/StockStatus";
import { errorMessage, useAdminQuery } from "@/components/admin/useAdminQuery";
import { listAdminProducts, updateVariant } from "@/lib/supabase/admin";
import { useToast } from "@/state/toast";
import type { Product, Variant } from "@/types";

const ALL = "all";
const LOW_STOCK_AT = 5;

type State = "untracked" | "ok" | "low" | "out";

interface Row {
  product: Product;
  variant: Variant;
  state: State;
}

function stateFor(variant: Variant): State {
  if (!variant.trackInventory || variant.stock === null) return "untracked";
  if (variant.stock <= 0) return "out";
  if (variant.stock <= LOW_STOCK_AT) return "low";
  return "ok";
}

export default function AdminInventoryPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [state, setState] = useState(ALL);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const data = useAdminQuery<Product[]>(() => listAdminProducts());
  const products = data.data ?? [];

  const allRows = useMemo<Row[]>(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({ product, variant, state: stateFor(variant) }))
      ),
    [products]
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (state !== ALL && row.state !== state) return false;
      if (!needle) return true;
      return `${row.product.name} ${row.variant.sku} ${row.variant.size.label}`.toLowerCase().includes(needle);
    });
  }, [allRows, query, state]);

  const tracked = allRows.filter((row) => row.variant.trackInventory);

  const save = async (row: Row) => {
    const raw = drafts[row.variant.id];
    if (raw === undefined) return;
    const stock = raw.trim() === "" ? null : Number.parseInt(raw, 10);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
      toast.push("Stock must be a whole number of 0 or more, or blank.", "error");
      return;
    }
    setSavingId(row.variant.id);
    try {
      await updateVariant(row.variant.id, { stock, trackInventory: stock !== null });
      data.setData((current) =>
        current
          ? current.map((product) => ({
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === row.variant.id ? { ...variant, stock, trackInventory: stock !== null } : variant
              )
            }))
          : current
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[row.variant.id];
        return next;
      });
      toast.push(`${row.variant.sku} stock updated.`);
    } catch (reason) {
      toast.push(errorMessage(reason, "The stock count could not be saved."), "error");
    } finally {
      setSavingId(null);
    }
  };

  const columns: AdminColumn<Row>[] = [
    {
      id: "product",
      header: "Product",
      minWidth: "20rem",
      sortValue: (row) => row.product.name,
      render: (row) => (
        <span className="flex flex-col leading-tight">
          <TableLink href={`/admin/products/${row.product.slug}/edit`}>{row.product.name}</TableLink>
          <span className="text-caption text-graphite">{row.variant.size.label}</span>
        </span>
      )
    },
    {
      id: "sku",
      header: "SKU",
      minWidth: "10rem",
      sortValue: (row) => row.variant.sku,
      render: (row) => <span className="tabular">{row.variant.sku}</span>
    },
    {
      id: "state",
      header: "Stock state",
      minWidth: "16rem",
      sortValue: (row) => row.state,
      render: (row) => <StockStatus state={row.state} count={row.variant.stock} threshold={LOW_STOCK_AT} />
    },
    {
      id: "stock",
      header: "On hand",
      minWidth: "9rem",
      render: (row) => {
        const draft = drafts[row.variant.id] ?? (row.variant.stock === null ? "" : String(row.variant.stock));
        return (
          <input
            type="number"
            min={0}
            step={1}
            aria-label={`Stock for ${row.variant.sku}`}
            value={draft}
            onChange={(event) => setDrafts((current) => ({ ...current, [row.variant.id]: event.target.value }))}
            placeholder="Not tracked"
            className="h-9 w-28 rounded-xs border border-hair-strong bg-surface px-2 text-body-sm tabular text-ink"
          />
        );
      }
    },
    {
      id: "save",
      header: "Save",
      render: (row) =>
        drafts[row.variant.id] !== undefined ? (
          <button
            type="button"
            onClick={() => void save(row)}
            disabled={savingId === row.variant.id}
            className="inline-flex h-9 items-center gap-1.5 rounded-xs bg-ink px-2.5 text-caption font-medium text-canvas transition-colors hover:bg-ink-soft disabled:opacity-50"
          >
            <Save className="size-3.5" aria-hidden />
            {savingId === row.variant.id ? "Saving…" : "Save"}
          </button>
        ) : (
          <span className="text-caption text-graphite-light">—</span>
        )
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Inventory"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Inventory" }]}
        lede="Stock for each size record. Boards are made to order by default; entering a count turns tracking on for that size."
      />

      <StatStrip
        items={[
          { label: "Size records", value: allRows.length.toLocaleString("en-IN") },
          { label: "Tracked", value: tracked.length.toLocaleString("en-IN") },
          { label: "Not tracked", value: (allRows.length - tracked.length).toLocaleString("en-IN"), note: "Made to order" },
          { label: "Low stock", value: allRows.filter((row) => row.state === "low").length.toString(), note: `At or below ${LOW_STOCK_AT}` },
          { label: "Out of stock", value: allRows.filter((row) => row.state === "out").length.toString() }
        ]}
      />

      {data.error ? (
        <ErrorState title="Inventory could not be loaded" body={data.error} onRetry={data.reload} />
      ) : (
        <>
          <FilterBar
            resultLabel={`${rows.length} of ${allRows.length} size records match`}
            onReset={
              query || state !== ALL
                ? () => {
                    setQuery("");
                    setState(ALL);
                  }
                : undefined
            }
          >
            <SearchControl
              label="Search inventory"
              value={query}
              onChange={setQuery}
              className="grow"
              width="w-full min-w-[16rem]"
              placeholder="Product, SKU or size"
            />
            <FilterSelect
              label="Stock state"
              value={state}
              onChange={setState}
              options={[
                { value: ALL, label: "All states" },
                { value: "untracked", label: "Not tracked" },
                { value: "ok", label: "In stock" },
                { value: "low", label: "Low stock" },
                { value: "out", label: "Out of stock" }
              ]}
            />
          </FilterBar>

          <DataTable
            caption="Inventory records with stock state and on-hand count"
            columns={columns}
            rows={rows}
            keyFor={(row) => row.variant.id}
            resetKey={`${query}|${state}`}
            pageSize={15}
            loading={data.loading}
            defaultSort={{ id: "product", dir: "asc" }}
            emptyTitle="No inventory record matches"
            emptyBody="With tracking off across the catalogue, the untracked filter holds every row."
          />
        </>
      )}
    </div>
  );
}
