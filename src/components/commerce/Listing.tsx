"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { QuickView } from "@/components/commerce/QuickView";
import { FilterDrawer, FilterPanel, type FilterTarget } from "@/components/commerce/FilterPanel";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { Breadcrumbs, Pagination } from "@/components/ui/Nav";
import { allSizes, categories, seriesList } from "@/lib/catalog";
import { EMPTY_FILTERS, PRICE_BANDS, SORT_OPTIONS } from "@/lib/filters";
import { filtersToQuery } from "@/lib/listing-query";
import type { Product, ProductFilterState, SortKey } from "@/types";

const SIZE_LABELS = new Map(allSizes().map((size) => [size.id, size.label]));
const SERIES_LABELS = new Map(seriesList.map((series) => [series.id, series.name]));
const BAND_LABELS = new Map<string, string>([
  ...PRICE_BANDS.map((band): [string, string] => [band.value, band.label]),
  ["on_request", "Price on request"]
]);

export function Listing(
  props: FilterTarget & {
    filters: ProductFilterState;
    sort: SortKey;
    page: number;
    perPage: number;
    results: Product[];
    total: number;
    heading: string;
    description?: string;
    trail: { label: string; href?: string }[];
  }
) {
  const { filters, sort, page, results, total, basePath, lockedCategoryId, lockedSubcategoryId } = props;
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);

  const push = useCallback(
    (nextFilters: ProductFilterState, nextSort: SortKey, nextPage: number) => {
      // On a category route the path already fixes the category, so it must not
      // also appear in the query string as a second source of truth.
      const cleaned: ProductFilterState = {
        ...nextFilters,
        categoryId: lockedCategoryId ? null : nextFilters.categoryId,
        subcategoryId: lockedSubcategoryId ? null : nextFilters.subcategoryId
      };
      router.push(`${pathname}${filtersToQuery(cleaned, nextSort, nextPage)}`, { scroll: false });
    },
    [router, pathname, lockedCategoryId, lockedSubcategoryId]
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const chips = filterChips(filters, sort, basePath, lockedCategoryId, lockedSubcategoryId);
  const pageCount = Math.max(1, Math.ceil(total / props.perPage));
  const clearAll = () => push(lockedCategoryId ? { ...EMPTY_FILTERS, categoryId: lockedCategoryId, subcategoryId: null } : EMPTY_FILTERS, sort, 1);

  return (
    <div className="pm-shell py-5 lg:py-10">
      <Breadcrumbs trail={props.trail} />

      <header className="pb-3 pt-2 sm:pb-5 sm:pt-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-[1.75rem] font-extrabold leading-[2.125rem] text-ink sm:text-h1 sm:leading-[1.08]">{props.heading}</h1>
          <p className="mt-1 text-caption text-muted">{total} products</p>
        </div>
      </header>

      <div className="sticky top-[var(--pm-header-h)] z-30 -mx-md flex items-center gap-2 border-b border-line bg-page/95 px-md py-2 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pb-5 sm:backdrop-blur-none lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-4 text-body-sm font-medium text-brand transition-colors hover:border-primary hover:text-primary-strong"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {chips.length > 0 && <span className="tabular rounded-full bg-primary px-1.5 text-caption leading-4 text-onprimary">{chips.length}</span>}
        </button>

        <label className="flex h-11 flex-1 items-center gap-2 rounded-md border border-line-strong bg-surface px-3">
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(event) => push(filters, event.target.value as SortKey, 1)}
            className="h-full w-full appearance-none bg-transparent text-body-sm text-ink focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} disabled={!option.available}>
                {option.label}
                {option.available ? "" : " — needs order data"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-6 pt-4 sm:gap-10 sm:pt-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <FilterPanel
              filters={filters}
              sort={sort}
              lockedCategoryId={lockedCategoryId}
              lockedSubcategoryId={lockedSubcategoryId}
              onChange={(next) => push(next, sort, 1)}
              onClear={clearAll}
            />
          </div>
        </aside>

        <div className="min-w-0">
          {chips.length > 0 && (
            <ul className="no-scrollbar -mx-md flex items-center gap-2 overflow-x-auto px-md pb-4 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-8">
              {chips.map((chip) => (
                <li key={chip.label} className="shrink-0">
                  <Link
                    href={chip.href}
                    className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/25 bg-primary-soft px-3 text-caption text-ink transition-colors hover:border-primary lg:h-8 lg:rounded-md lg:px-2.5"
                  >
                    {chip.label}
                    <X className="size-3" aria-hidden />
                    <span className="sr-only">filter</span>
                  </Link>
                </li>
              ))}
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-2 text-caption font-medium text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary lg:h-8"
                >
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {results.length === 0 ? (
            <EmptyState
              title="No products match these filters"
              body="Try widening the size or series selection. Every board is made to order, so a size that is not listed can still be quoted."
              action={{ label: "Clear filters", onClick: clearAll }}
            />
          ) : (
            <>
              <h2 className="sr-only">Products</h2>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3">
                {results.map((product, index) => (
                  <ProductCard key={product.slug} product={product} priority={index < 4} onQuickView={setQuick} />
                ))}
              </div>
              <Pagination page={page} pageCount={pageCount} onChange={(next) => push(filters, sort, next)} />
            </>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="max-w-reading text-caption leading-relaxed text-muted">
              Every board on this page is available as a single unit, in the sizes listed on the product page.
            </p>
            <ButtonLink href="/shop" variant="secondary" size="sm">
              Browse the full catalogue
            </ButtonLink>
          </div>

          <nav aria-label="Other categories" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {categories
              .filter((category) => category.id !== lockedCategoryId)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className="text-caption text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
                >
                  {category.name}
                </Link>
              ))}
          </nav>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        sort={sort}
        lockedCategoryId={lockedCategoryId}
        lockedSubcategoryId={lockedSubcategoryId}
        onChange={(next) => push(next, sort, 1)}
        onClear={clearAll}
      />

      <QuickView product={quick} open={quick !== null} onClose={() => setQuick(null)} />
    </div>
  );
}

function filterChips(
  filters: ProductFilterState,
  sort: SortKey,
  basePath: string,
  lockedCategoryId?: string | null,
  lockedSubcategoryId?: string | null
): { label: string; href: string }[] {
  const chips: { label: string; href: string }[] = [];
  // Same rule as push(): a category already in the path never repeats in the query.
  const href = (patch: Partial<ProductFilterState>) => {
    const next = { ...filters, ...patch };
    return `${basePath}${filtersToQuery(
      {
        ...next,
        categoryId: lockedCategoryId ? null : next.categoryId,
        subcategoryId: lockedSubcategoryId ? null : next.subcategoryId
      },
      sort,
      1
    )}`;
  };

  if (filters.query) chips.push({ label: `“${filters.query}”`, href: href({ query: "" }) });
  for (const id of filters.seriesIds) {
    chips.push({
      label: SERIES_LABELS.get(id) ?? id,
      href: href({ seriesIds: filters.seriesIds.filter((item) => item !== id) })
    });
  }
  for (const id of filters.sizeIds) {
    chips.push({
      label: SIZE_LABELS.get(id) ?? id,
      href: href({ sizeIds: filters.sizeIds.filter((item) => item !== id) })
    });
  }
  if (filters.boardType !== "any") {
    chips.push({
      label: filters.boardType === "non-magnetic" ? "Non-magnetic" : filters.boardType === "magnetic" ? "Magnetic" : "Ceramic",
      href: href({ boardType: "any" })
    });
  }
  if (filters.surfaceKind !== "any") {
    const labels: Record<string, string> = { marker: "Marker", chalk: "Chalk", "pin-up": "Pin-up", other: "Other" };
    chips.push({ label: labels[filters.surfaceKind] ?? filters.surfaceKind, href: href({ surfaceKind: "any" }) });
  }
  if (filters.magnetic !== "any") {
    chips.push({ label: filters.magnetic === "yes" ? "Magnetic" : "Non-magnetic", href: href({ magnetic: "any" }) });
  }
  if (filters.doubleSided !== "any") {
    chips.push({ label: filters.doubleSided === "yes" ? "Both side" : "Single side", href: href({ doubleSided: "any" }) });
  }
  if (filters.availability !== "any") {
    chips.push({
      label: filters.availability === "in_stock" ? "Ready to ship" : "Quoted on request",
      href: href({ availability: "any" })
    });
  }
  if (filters.priceBand) {
    chips.push({ label: BAND_LABELS.get(filters.priceBand) ?? filters.priceBand, href: href({ priceBand: null }) });
  }
  return chips;
}
