import type { MediaAsset, Product, Series } from "@/types";

export interface CollectionSeriesCard {
  slug: string;
  name: string;
  /** Real workload / buying role derived strictly from engineering build and size ladder. */
  fitRole: string;
  surfaceSummary: string;
  frameSummary: string;
  sizeSummary: string;
  typesSummary: string;
  productCount: number;
  minPriceInr: number | null;
  image: MediaAsset | null;
  imageProductName: string;
  imageCategoryId: string;
  anchorTier: boolean;
}

const SERIES_ORDER = ["metallic-premium", "eco-premium", "deluxe-standard", "eco-regular"] as const;

const SERIES_META: Record<
  string,
  {
    fitRole: string;
    surfaceShort: string;
    frameShort: string;
    anchorTier: boolean;
  }
> = {
  "metallic-premium": {
    fitRole: "Heavy-duty institutional",
    surfaceShort: "High-gloss HPL & ceramic steel",
    frameShort: "Heavy anodized · Dual-tone caps",
    anchorTier: true
  },
  "eco-premium": {
    fitRole: "Daily HPL writing grade",
    surfaceShort: "Marker & chalk grade HPL sheet",
    frameShort: "Ribbed anodized · ABS dual-tone",
    anchorTier: false
  },
  "deluxe-standard": {
    fitRole: "Offices, corridors & cabinets",
    surfaceShort: "Gloss melamine, velvet & ADC",
    frameShort: "Deluxe anodized · Chrome corners",
    anchorTier: false
  },
  "eco-regular": {
    fitRole: "Desks to halls · Widest sizes",
    surfaceShort: "Gloss melamine & magnetic steel",
    frameShort: "Lightweight ribbed · Std corners",
    anchorTier: false
  }
};

const TYPE_LABEL_MAP: { match: (p: Product) => boolean; label: string }[] = [
  { match: (p) => p.categoryId === "white-boards" && !p.slug.includes("ceramic"), label: "White" },
  { match: (p) => p.categoryId === "chalk-boards" && !p.slug.includes("ceramic"), label: "Chalk" },
  { match: (p) => p.slug.includes("ceramic"), label: "Ceramic" },
  { match: (p) => p.magnetic, label: "Magnetic" },
  { match: (p) => p.categoryId === "notice-boards", label: "Notice" },
  { match: (p) => p.categoryId === "acrylic-door-cover-notice-boards", label: "ADC lockable" },
  { match: (p) => p.doubleSided || p.categoryId === "double-sided-boards", label: "Double-sided" }
];

function compactSizes(sizes: string[]): string {
  if (sizes.length === 0) return "Made to order";
  if (sizes.length === 1) return sizes[0].replace(/\s*x\s*/gi, "×");
  const first = sizes[0].replace(/\s*x\s*/gi, "×").replace(/\s*ft$/i, "").trim();
  const last = sizes[sizes.length - 1].replace(/\s*x\s*/gi, "×").trim();
  return `${first} – ${last} (${sizes.length} sizes)`;
}

function pickSeriesHeroProduct(seriesProducts: Product[]): Product | null {
  const withMedia = seriesProducts.filter((p) => p.media.length > 0);
  if (withMedia.length === 0) return null;
  return (
    withMedia.find((p) => p.categoryId === "white-boards" && !p.magnetic && !p.slug.includes("ceramic")) ??
    withMedia.find((p) => p.categoryId === "white-boards") ??
    withMedia.find((p) => p.categoryId === "chalk-boards") ??
    withMedia[0]
  );
}

/**
 * Builds fact-grounded series comparison cards for the storefront Collection tier band,
 * structured so shoppers can compare writing surface, frame build, size range, and
 * entry price across all four Plusmark manufacturing series in one glance.
 */
export function buildCollectionSeriesCards(
  series: readonly Series[],
  productList: readonly Product[]
): CollectionSeriesCard[] {
  const byId = new Map(series.map((s) => [s.id, s]));

  return SERIES_ORDER.map((id) => {
    const info = byId.get(id);
    const meta = SERIES_META[id];
    const items = productList.filter((p) => p.published && p.seriesId === id);

    let minPriceInr: number | null = null;
    for (const item of items) {
      if (item.enquiryOnly) continue;
      for (const variant of item.variants) {
        if (!variant.available || (variant.packQty ?? 1) > 1 || variant.priceInr === null) continue;
        if (minPriceInr === null || variant.priceInr < minPriceInr) {
          minPriceInr = variant.priceInr;
        }
      }
    }

    const includedTypes = TYPE_LABEL_MAP.filter((rule) => items.some(rule.match)).map((rule) => rule.label);
    const heroProduct = pickSeriesHeroProduct(items);

    return {
      slug: id,
      name: info?.name ?? id,
      fitRole: meta.fitRole,
      surfaceSummary: meta.surfaceShort,
      frameSummary: meta.frameShort,
      sizeSummary: compactSizes(info?.sizes ?? []),
      typesSummary: includedTypes.join(" · ") || "Boards & displays",
      productCount: items.length,
      minPriceInr,
      image: heroProduct?.media[0] ?? null,
      imageProductName: heroProduct?.name ?? info?.name ?? id,
      imageCategoryId: heroProduct?.categoryId ?? "white-boards",
      anchorTier: meta.anchorTier
    };
  });
}
