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
    <div className="pm-shell py-8 lg:py-10">
      <Breadcrumbs trail={props.trail} />

      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-hair pb-5 pt-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-sans font-normal text-h1 text-navy">{props.heading}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-hair-strong bg-surface px-4 text-body-sm font-medium text-brand transition-colors hover:border-brand hover:text-brand lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            {chips.length > 0 && <span className="tabular rounded-full bg-blue px-1.5 text-caption leading-4 text-white">{chips.length}</span>}
          </button>

          <label className="flex items-center gap-2">
            <span className="text-caption font-medium text-graphite">Sort</span>
            <select
              value={sort}
              onChange={(event) => push(filters, event.target.value as SortKey, 1)}
              className="h-11 appearance-none rounded-md border border-hair-strong bg-surface px-3 pr-8 text-body-sm text-navy transition-colors hover:border-blue focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
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
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <FilterPanel
              filters={filters}
              sort={sort}
              basePath={basePath}
              lockedCategoryId={lockedCategoryId}
              lockedSubcategoryId={lockedSubcategoryId}
              onChange={(next) => push(next, sort, 1)}
              onClear={clearAll}
            />
          </div>
        </aside>

        <div className="min-w-0">
          {chips.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2 pb-8">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <Link
                    href={chip.href}
                    className="inline-flex h-10 items-center gap-1.5 rounded-md border border-brand/25 bg-brand-wash px-2.5 text-caption text-navy transition-colors hover:border-brand lg:h-8"
                  >
                    {chip.label}
                    <X className="size-3" aria-hidden />
                    <span className="sr-only">filter</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-10 items-center rounded-xs px-2 text-caption font-medium text-blue underline decoration-blue/35 underline-offset-4 hover:decoration-blue lg:h-8"
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
                {results.map((product, index) => (
                  <ProductCard key={product.slug} product={product} priority={index < 4} onQuickView={setQuick} />
                ))}
              </div>
              <Pagination page={page} pageCount={pageCount} onChange={(next) => push(filters, sort, next)} />
            </>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-6">
            <p className="max-w-reading text-caption leading-relaxed text-graphite">
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
                  className="text-caption text-graphite underline decoration-hair-strong underline-offset-4 hover:text-ink"
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
        basePath={basePath}
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
