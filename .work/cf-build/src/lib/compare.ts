import {
  COMPARE_CURATION,
  GUIDES,
  SERIES_USAGE_LEVEL,
  SLUG_GUIDES,
  type Guide
} from "@/data/compare-curation";
import { categories, products, seriesList } from "@/lib/catalog";
import { CATALOG_COPY } from "@/lib/catalog-copy";
import type { MediaAsset, Product, ProductSpec, UsageLevel } from "@/types";

/**
 * Comparison facts are derived from the published catalogue, not restated by
 * hand: a product added to catalog.json appears here automatically. Curated
 * entries only cover wording that cannot be derived (see compare-curation.ts).
 */

export type WritingType = "marker" | "chalk" | "pin-up" | "none";

export interface CompareEntry {
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subCategory: string | null;
  series: string | null;
  seriesRank: number | null;
  surface: string | null;
  writingType: WritingType;
  isMagnetic: boolean;
  boardType: Product["boardType"];
  frame: string | null;
  corners: string | null;
  bestFor: string | null;
  usageLevel: UsageLevel | null;
  availableSizes: string[];
  customSizeAvailable: boolean;
  doubleSided: boolean;
  lockable: boolean | null;
  enquiryOnly: boolean;
  image: MediaAsset | null;
  url: string;
  guide: Guide | null;
  sourceUrls: string[];
  specs: ProductSpec[];
}

export interface CompareRow {
  key: string;
  label: string;
  values: (string | null)[];
  /** True when every column carries the current product's value. */
  same: boolean;
}

const seriesById = new Map(seriesList.map((series) => [series.id, series]));
const categoryById = new Map(categories.map((category) => [category.id, category]));

function writingTypeOf(product: Product): WritingType {
  if (product.surfaceKind === "marker") return "marker";
  if (product.surfaceKind === "chalk") return "chalk";
  if (product.surfaceKind === "pin-up") return "pin-up";
  return "none";
}

function sizesOf(product: Product): string[] {
  const labels = product.variants
    .filter((variant) => (variant.packQty ?? 1) === 1)
    .map((variant) => variant.size.label);
  return [...new Set(labels)];
}

function guideFor(product: Product): Guide | null {
  const bySlug = SLUG_GUIDES[product.slug];
  if (bySlug) return bySlug;

  switch (product.categoryId) {
    case "white-boards":
      if (product.boardType === "ceramic") return GUIDES.ceramic;
      if (product.boardType === "magnetic") return GUIDES.magneticWhite;
      return GUIDES.surface;
    case "chalk-boards":
      return product.boardType === "magnetic" ? GUIDES.magneticChalk : GUIDES.chalkVsWhite;
    case "double-sided-boards":
      return GUIDES.doubleSided;
    case "notice-boards":
      return GUIDES.notice;
    case "acrylic-door-cover-notice-boards":
      return GUIDES.adc;
    case "board-stands":
      return GUIDES.stands;
    case "clipboards":
      return GUIDES.clipboards;
    case "school-benches":
      return GUIDES.benches;
    case "display-boards":
      return GUIDES.display;
    case "schedule-boards":
      return GUIDES.schedule;
    default:
      return GUIDES.buying;
  }
}

function lockableOf(product: Product): boolean | null {
  const curated = COMPARE_CURATION[product.slug];
  if (curated?.lockable !== undefined) return curated.lockable;
  return product.specs.some((spec) => /^locking$/i.test(spec.label) && spec.value.trim()) ? true : null;
}

function buildEntry(product: Product): CompareEntry {
  const series = product.seriesId ? seriesById.get(product.seriesId) ?? null : null;
  const category = categoryById.get(product.categoryId);
  const curation = COMPARE_CURATION[product.slug];
  const guide = guideFor(product);
  const url = `/product/${product.slug}`;

  const subCategory =
    category?.subcategories.find((item) => product.subcategoryIds.includes(item.id))?.name ?? null;

  const sourceUrls = [url, guide?.href, "https://plusmarkboards.com/buying-guide"].filter(
    (value): value is string => Boolean(value)
  );

  return {
    slug: product.slug,
    name: product.name,
    categoryId: product.categoryId,
    categoryName: category?.name ?? "Plusmark",
    subCategory,
    series: series?.name ?? null,
    seriesRank: series?.rank ?? null,
    surface: product.surface,
    writingType: writingTypeOf(product),
    isMagnetic: product.magnetic,
    boardType: product.boardType,
    frame: product.frame,
    corners: product.corners,
    // The catalogue copy states who each product is for; the category blurb is
    // not a use case, so it is never promoted into a "best for" claim.
    bestFor: curation?.bestFor ?? CATALOG_COPY[product.slug]?.usage ?? null,
    usageLevel:
      curation?.usageLevel ?? (product.seriesId ? SERIES_USAGE_LEVEL[product.seriesId] ?? null : null),
    availableSizes: sizesOf(product),
    // Every PDP states that sizes outside the published range are made to order.
    customSizeAvailable: true,
    doubleSided: product.doubleSided,
    lockable: lockableOf(product),
    enquiryOnly: product.enquiryOnly,
    image: product.media[0] ?? null,
    url,
    guide,
    sourceUrls,
    specs: product.specs
  };
}

export const compareEntries: CompareEntry[] = products.map(buildEntry);
const entryBySlug = new Map(compareEntries.map((entry) => [entry.slug, entry]));

export function getCompareEntry(slug: string): CompareEntry | undefined {
  return entryBySlug.get(slug);
}

/** Category neighbours used only when a category has too few peers of its own. */
const ADJACENT_CATEGORIES: Record<string, string[]> = {
  "white-boards": ["chalk-boards", "double-sided-boards"],
  "chalk-boards": ["white-boards", "double-sided-boards"],
  "double-sided-boards": ["white-boards", "chalk-boards"],
  "notice-boards": ["acrylic-door-cover-notice-boards"],
  "acrylic-door-cover-notice-boards": ["notice-boards"],
  "display-boards": ["specialty-boards", "board-study-essentials"],
  "specialty-boards": ["display-boards", "board-study-essentials"],
  "board-study-essentials": ["display-boards", "specialty-boards"],
  "schedule-boards": ["display-boards"]
};

function seriesDistance(a: CompareEntry, b: CompareEntry, current: CompareEntry): number {
  const origin = current.seriesRank ?? 99;
  const da = a.seriesRank === null ? 99 : Math.abs(a.seriesRank - origin);
  const db = b.seriesRank === null ? 99 : Math.abs(b.seriesRank - origin);
  return da - db || (a.seriesRank ?? 99) - (b.seriesRank ?? 99) || a.name.localeCompare(b.name);
}

function sameSubcategory(a: CompareEntry, b: CompareEntry, current: CompareEntry): number {
  if (!current.subCategory) return 0;
  const aMatch = a.subCategory === current.subCategory ? 0 : 1;
  const bMatch = b.subCategory === current.subCategory ? 0 : 1;
  return aMatch - bMatch;
}

/**
 * Current product first excluded, then:
 * 1. same category and same writing surface in another series,
 * 2. same category with a different surface,
 * 3. the nearest adjacent category.
 */
export function getSimilarProducts(currentSlug: string, limit = 3): CompareEntry[] {
  const current = entryBySlug.get(currentSlug);
  if (!current) return [];

  const pool = compareEntries.filter((entry) => entry.slug !== current.slug);
  const picked: CompareEntry[] = [];
  const seen = new Set<string>();

  const take = (list: CompareEntry[]) => {
    for (const entry of list) {
      if (picked.length >= limit) return;
      if (seen.has(entry.slug)) continue;
      seen.add(entry.slug);
      picked.push(entry);
    }
  };

  const sameCategory = pool.filter((entry) => entry.categoryId === current.categoryId);
  const sameSurface = sameCategory.filter(
    (entry) => entry.writingType === current.writingType && entry.boardType === current.boardType
  );

  take(
    sameSurface
      .filter((entry) => entry.series !== current.series)
      .sort((a, b) => seriesDistance(a, b, current))
  );

  take(
    sameCategory.sort(
      (a, b) =>
        sameSubcategory(a, b, current) ||
        (a.series === current.series ? 0 : 1) - (b.series === current.series ? 0 : 1) ||
        seriesDistance(a, b, current)
    )
  );

  for (const categoryId of ADJACENT_CATEGORIES[current.categoryId] ?? []) {
    take(pool.filter((entry) => entry.categoryId === categoryId).sort((a, b) => seriesDistance(a, b, current)));
  }

  return picked;
}

/* ---------------------------------- rows --------------------------------- */

type CategoryFamily = "board" | "notice" | "adc" | "clipboard" | "stand" | "bench" | "display";

const CATEGORY_FAMILY: Record<string, CategoryFamily> = {
  "white-boards": "board",
  "chalk-boards": "board",
  "double-sided-boards": "board",
  "notice-boards": "notice",
  "acrylic-door-cover-notice-boards": "adc",
  clipboards: "clipboard",
  "board-stands": "stand",
  "school-benches": "bench",
  "specialty-boards": "display",
  "display-boards": "display",
  "board-study-essentials": "display",
  "schedule-boards": "display"
};

interface RowSpec {
  key: string;
  label: string;
  value: (entry: CompareEntry) => string | null;
  show?: (entries: CompareEntry[]) => boolean;
}

const WRITING_LABEL: Record<WritingType, string | null> = {
  marker: "Marker",
  chalk: "Chalk",
  "pin-up": "Pin-up",
  none: null
};

const USAGE_LABEL: Record<UsageLevel, string> = {
  light: "Light",
  regular: "Regular",
  "daily-intensive": "Daily intensive"
};

const seriesRow: RowSpec = { key: "series", label: "Series", value: (entry) => entry.series };
const surfaceRow: RowSpec = { key: "surface", label: "Surface", value: (entry) => entry.surface };
const writingRow: RowSpec = {
  key: "writing",
  label: "Writing type",
  value: (entry) => WRITING_LABEL[entry.writingType]
};
const magneticRow: RowSpec = {
  key: "magnetic",
  label: "Magnetic",
  value: (entry) => (entry.isMagnetic ? "Yes" : "No")
};
const frameRow: RowSpec = { key: "frame", label: "Frame", value: (entry) => entry.frame };
const cornersRow: RowSpec = { key: "corners", label: "Corners", value: (entry) => entry.corners };
const bestForRow: RowSpec = { key: "best-for", label: "Best for", value: (entry) => entry.bestFor };
const usageRow: RowSpec = {
  key: "usage-level",
  label: "Usage level",
  value: (entry) => (entry.usageLevel ? USAGE_LABEL[entry.usageLevel] : null)
};
const sizesRow: RowSpec = {
  key: "sizes",
  label: "Available sizes",
  value: (entry) => (entry.availableSizes.length ? entry.availableSizes.join(", ") : null)
};
const customRow: RowSpec = {
  key: "custom-size",
  label: "Custom size",
  value: (entry) => (entry.customSizeAvailable ? "Made to order" : null)
};
const doubleSidedRow: RowSpec = {
  key: "double-sided",
  label: "Double sided",
  value: (entry) => (entry.doubleSided ? "Yes" : "No"),
  show: (entries) => entries.some((entry) => entry.doubleSided)
};
const orderingRow: RowSpec = {
  key: "ordering",
  label: "Ordering",
  value: (entry) => (entry.enquiryOnly ? "Quoted on request" : "Order online")
};

/** Spec rows taken verbatim from the catalogue, kept only when 2+ columns state them. */
function catalogueSpecRows(entries: CompareEntry[]): RowSpec[] {
  const labels: string[] = [];
  for (const entry of entries) {
    for (const spec of entry.specs) {
      if (!labels.includes(spec.label)) labels.push(spec.label);
    }
  }

  return labels
    .filter(
      (label) => entries.filter((entry) => entry.specs.some((spec) => spec.label === label && spec.value.trim())).length >= 2
    )
    .map((label) => ({
      key: `spec-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label,
      value: (entry: CompareEntry) => entry.specs.find((spec) => spec.label === label)?.value ?? null
    }));
}

function plannedRows(entries: CompareEntry[]): RowSpec[] {
  const family = CATEGORY_FAMILY[entries[0]?.categoryId ?? ""] ?? "display";

  switch (family) {
    case "board":
      return [
        seriesRow,
        surfaceRow,
        writingRow,
        magneticRow,
        frameRow,
        cornersRow,
        bestForRow,
        usageRow,
        sizesRow,
        customRow,
        doubleSidedRow
      ];
    case "notice":
      return [seriesRow, surfaceRow, frameRow, cornersRow, bestForRow, usageRow, sizesRow, customRow];
    case "adc":
      return [...catalogueSpecRows(entries), seriesRow, sizesRow, customRow, bestForRow];
    case "clipboard":
      return [...catalogueSpecRows(entries), sizesRow, bestForRow];
    case "stand":
      return [orderingRow, sizesRow, customRow, bestForRow];
    case "bench":
      return [...catalogueSpecRows(entries), orderingRow, sizesRow, bestForRow];
    default:
      return [...catalogueSpecRows(entries), orderingRow, sizesRow, customRow, bestForRow];
  }
}

/**
 * Builds the rows for a table whose first column is the current product.
 * A row disappears when no column has data for it, so categories with thin
 * records never show a grid of dashes.
 */
export function buildCompareRows(entries: CompareEntry[]): CompareRow[] {
  if (entries.length < 2) return [];

  return plannedRows(entries)
    .filter((row) => !row.show || row.show(entries))
    .map((row) => {
      const values = entries.map((entry) => {
        const value = row.value(entry);
        return value && value.trim() ? value : null;
      });
      return {
        key: row.key,
        label: row.label,
        values,
        same: values.every((value) => value === values[0])
      };
    })
    .filter((row) => row.values.some((value) => value !== null));
}
