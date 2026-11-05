import { EMPTY_FILTERS } from "@/lib/filters";
import type { PriceBand, ProductFilterState, SortKey } from "@/types";

/** Next.js hands page props as a loose record; the rest of the code works with URLSearchParams. */
export function toParams(raw: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  return params;
}

/**
 * The listing URL is the only source of truth for filters, so a filtered
 * catalogue view stays shareable and survives a reload without client state.
 */
export function parseFilters(params: URLSearchParams): ProductFilterState {
  const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const price = params.get("price");
  return {
    categoryId: params.get("category") ?? EMPTY_FILTERS.categoryId,
    subcategoryId: params.get("subcategory") ?? EMPTY_FILTERS.subcategoryId,
    seriesIds: list("series"),
    magnetic: oneOf(params.get("magnetic"), ["any", "yes", "no"], "any"),
    doubleSided: oneOf(params.get("doubleSided"), ["any", "yes", "no"], "any"),
    sizeIds: list("size"),
    priceBand: isPriceBand(price) ? price : null,
    availability: oneOf(params.get("availability"), ["any", "in_stock", "on_request"], "any"),
    inStockOnly: params.get("inStock") === "1",
    query: params.get("q") ?? ""
  };
}

export function parseSort(value: string | null): SortKey {
  return value === "price_asc" || value === "price_desc" || value === "newest" || value === "name_asc" || value === "popular" || value === "featured"
    ? value
    : "featured";
}

export function parsePage(value: string | null): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * A hand-edited or stale `?page=` must not silently render an empty grid, which
 * would read as "this catalogue is empty". Pull the request back onto the last
 * real page instead; the pagination control then shows where the reader landed.
 */
export function clampPage(page: number, total: number, perPage: number): number {
  const last = Math.max(1, Math.ceil(total / perPage));
  return Math.min(page, last);
}

export function filtersToQuery(
  filters: ProductFilterState,
  sort: SortKey,
  page: number,
  keep: Record<string, string | null> = {}
): string {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.subcategoryId) params.set("subcategory", filters.subcategoryId);
  if (filters.seriesIds.length) params.set("series", filters.seriesIds.join(","));
  if (filters.magnetic !== "any") params.set("magnetic", filters.magnetic);
  if (filters.doubleSided !== "any") params.set("doubleSided", filters.doubleSided);
  if (filters.sizeIds.length) params.set("size", filters.sizeIds.join(","));
  if (filters.priceBand) params.set("price", filters.priceBand);
  if (filters.availability !== "any") params.set("availability", filters.availability);
  if (filters.inStockOnly) params.set("inStock", "1");
  if (filters.query) params.set("q", filters.query);
  if (sort !== "featured") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  for (const [key, value] of Object.entries(keep)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  const candidate = (value ?? fallback) as T;
  return allowed.includes(candidate) ? candidate : fallback;
}

function isPriceBand(value: string | null): value is PriceBand {
  return value === "under_2000" || value === "2000_5000" || value === "5000_10000" || value === "over_10000" || value === "on_request";
}
