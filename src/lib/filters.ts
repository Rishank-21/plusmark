import { allSizes, categories, priceRangeFor, products, seriesList } from "@/lib/catalog";
import type { Product, ProductFilterState, SearchSuggestion, SortKey } from "@/types";

export const EMPTY_FILTERS: ProductFilterState = {
  categoryId: null,
  subcategoryId: null,
  seriesIds: [],
  magnetic: "any",
  doubleSided: "any",
  sizeIds: [],
  priceBand: null,
  availability: "any",
  inStockOnly: false,
  query: ""
};

export const SORT_OPTIONS: { value: SortKey; label: string; available: boolean }[] = [
  { value: "featured", label: "Featured", available: true },
  { value: "price_asc", label: "Price: low to high", available: true },
  { value: "price_desc", label: "Price: high to low", available: true },
  { value: "newest", label: "Newest additions", available: true },
  { value: "name_asc", label: "Name: A to Z", available: true },
  { value: "popular", label: "Popularity", available: false }
];

const BANDS: Record<string, [number, number] | null> = {
  under_2000: [0, 2000],
  "2000_5000": [2000, 5000],
  "5000_10000": [5000, 10000],
  over_10000: [10000, Number.POSITIVE_INFINITY],
  on_request: null
};

export const PRICE_BANDS = [
  { value: "under_2000", label: "Under ₹2,000" },
  { value: "2000_5000", label: "₹2,000 – ₹5,000" },
  { value: "5000_10000", label: "₹5,000 – ₹10,000" },
  { value: "over_10000", label: "Above ₹10,000" }
] as const;

export function filterProducts(state: ProductFilterState): Product[] {
  let list = products.filter((p) => p.published);

  if (state.categoryId) list = list.filter((p) => p.categoryId === state.categoryId);
  const sub = state.subcategoryId;
  if (sub) list = list.filter((p) => p.subcategoryIds.includes(sub));
  if (state.seriesIds.length) list = list.filter((p) => p.seriesId && state.seriesIds.includes(p.seriesId));
  if (state.magnetic !== "any") {
    const want = state.magnetic === "yes";
    list = list.filter((p) => p.magnetic === want);
  }
  if (state.doubleSided !== "any") {
    const want = state.doubleSided === "yes";
    list = list.filter((p) => p.doubleSided === want);
  }
  if (state.sizeIds.length) {
    list = list.filter((p) => p.variants.some((v) => state.sizeIds.includes(v.size.id)));
  }
  if (state.priceBand) {
    const band = BANDS[state.priceBand];
    if (band) {
      list = list.filter((p) => {
        const range = priceRangeFor(p);
        return range.min !== null && range.min >= band[0] && range.min < band[1];
      });
    } else {
      list = list.filter((p) => priceRangeFor(p).min === null);
    }
  }
  if (state.availability === "in_stock") list = list.filter((p) => p.variants.some((v) => v.available && v.stock !== null && v.stock > 0));
  if (state.availability === "on_request") list = list.filter((p) => p.priceMode === "on_request");
  if (state.inStockOnly) list = list.filter((p) => p.variants.some((v) => v.available));

  const q = state.query.trim().toLowerCase();
  if (q) list = list.filter((p) => matches(p, q));

  return sortProducts(list, "featured");
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => (priceRangeFor(a).min ?? Infinity) - (priceRangeFor(b).min ?? Infinity));
    case "price_desc":
      return copy.sort((a, b) => (priceRangeFor(b).max ?? -1) - (priceRangeFor(a).max ?? -1));
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name));
    case "name_asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "popular":
      return copy;
    case "featured":
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || rank(a) - rank(b));
  }
}

function rank(p: Product): number {
  const order = ["metallic-premium", "eco-premium", "deluxe-standard", "eco-regular"];
  const seriesRank = p.seriesId ? order.indexOf(p.seriesId) : order.length;
  return seriesRank * 1000 + p.name.length;
}

function matches(p: Product, q: string): boolean {
  const haystack = [
    p.name,
    p.surface,
    p.frame,
    p.corners,
    p.usage,
    categories.find((c) => c.id === p.categoryId)?.name,
    seriesList.find((s) => s.id === p.seriesId)?.name,
    ...p.variants.map((v) => v.sku),
    ...p.variants.map((v) => v.size.label)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export function searchCatalog(query: string, limit = 8): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: SearchSuggestion[] = [];

  for (const c of categories) {
    if (c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q)) {
      out.push({
        kind: "category",
        label: c.name,
        sublabel: `${productsIn(c.id)} products`,
        href: `/shop/${c.slug}`,
        imagePublicId: c.image
      });
    }
  }
  for (const s of seriesList) {
    if (s.name.toLowerCase().includes(q)) {
      out.push({ kind: "series", label: s.name, sublabel: `${s.surface}`, href: `/shop?series=${s.id}`, imagePublicId: null });
    }
  }
  for (const p of products) {
    if (out.length >= limit + out.filter((o) => o.kind !== "product").length) break;
    if (matches(p, q)) {
      out.push({
        kind: "product",
        label: p.name,
        sublabel: categoryName(p.categoryId),
        href: `/product/${p.slug}`,
        imagePublicId: p.media[0]?.publicId ?? null
      });
      if (out.filter((o) => o.kind === "product").length >= limit) break;
    }
  }
  return out;
}

function productsIn(id: string): number {
  return products.filter((p) => p.categoryId === id).length;
}

function categoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? "";
}

export function activeFilterCount(state: ProductFilterState): number {
  let n = 0;
  if (state.subcategoryId) n += 1;
  if (state.seriesIds.length) n += 1;
  if (state.magnetic !== "any") n += 1;
  if (state.doubleSided !== "any") n += 1;
  if (state.sizeIds.length) n += state.sizeIds.length;
  if (state.priceBand) n += 1;
  if (state.availability !== "any") n += 1;
  return n;
}

export const FILTER_SIZE_OPTIONS = allSizes().filter((s) => s.label.includes("ft"));

export function countByCategory(): Record<string, number> {
  return Object.fromEntries(categories.map((c) => [c.id, productsIn(c.id)]));
}
