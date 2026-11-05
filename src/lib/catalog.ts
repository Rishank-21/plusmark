import raw from "@/data/catalog.json";
import faqRaw from "@/data/live-faq.json";
import orgRaw from "@/data/live-org.json";
import { DEMO_PRICING_ENABLED } from "@/lib/config";
import { CATALOG_COPY, type CatalogCopy } from "@/lib/catalog-copy";
import { buildSize, demoPackPriceInr, demoUnitPriceInr } from "@/lib/demo-pricing";
import { imageUrl } from "@/lib/media";
import { localCategoryImage, localProductImages } from "@/lib/local-assets";
import type {
  Category,
  FaqItem,
  MediaAsset,
  Product,
  Series,
  Subcategory,
  Variant
} from "@/types";

interface RawSeries {
  name: string;
  rank: number;
  surface: string;
  frame: string;
  corners: string;
  sizes: string[];
}

interface RawCategory {
  id: string;
  name: string;
  subject: string;
  description: string;
  image: string | null;
  subcategories: { id: string; name: string; image: string | null }[];
}

interface RawProduct {
  slug: string;
  name: string;
  categoryId: string;
  seriesId: string | null;
  subcategoryIds: string[];
  magnetic: boolean | null;
  doubleSided: boolean | null;
  sizes: string[];
  images: string[];
  imageSource: "product" | "video-poster" | "none";
  videoId: string | null;
  surface: string | null;
  frame: string | null;
  corners: string | null;
}

const SERIES_ORDER = ["metallic-premium", "eco-premium", "deluxe-standard", "eco-regular"] as const;

/**
 * Sizes Plusmark supplies as multi-board packs. Only sizes with supplied pack
 * photography are listed, and pack prices wait on Plusmark's rate card.
 */
const PACK_OFFERS: Record<string, Record<string, number[]>> = {
  "eco-regular-white-board": { "1 x 1 ft": [2, 4] }
};

export const brand = {
  ...raw.brand,
  legalName: (orgRaw as { name?: string }).name ?? raw.brand.legalName,
  foundingYear: "2015",
  address: (orgRaw as { address?: Record<string, string> }).address ?? null
};

export const seriesList: Series[] = SERIES_ORDER.map((id) => {
  const s = (raw.series as Record<string, RawSeries>)[id];
  return { id, name: s.name, rank: s.rank, surface: s.surface, frame: s.frame, corners: s.corners, sizes: s.sizes };
});

export const categories: Category[] = (raw.categories as RawCategory[]).map((c) => ({
  id: c.id,
  slug: c.id,
  name: c.name,
  description: c.description,
  subject: c.subject,
  image: localCategoryImage(c.id) ?? c.image,
  subcategories: c.subcategories.map<Subcategory>((s) => ({ id: s.id, name: s.name, image: s.image }))
}));

const seriesById = new Map(seriesList.map((s) => [s.id, s]));
const categoryById = new Map(categories.map((c) => [c.id, c]));

const CATEGORY_SUBJECT: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.id, c.subject])
);

/** Deterministic SKU so the same variant always resolves to the same code. */
function skuFor(product: RawProduct, sizeLabel: string): string {
  const seriesCode = product.seriesId
    ? product.seriesId.split("-").map((p) => p[0]).join("").toUpperCase()
    : "STD";
  const catCode = product.categoryId.slice(0, 3).toUpperCase();
  const sizeCode = sizeLabel
    .replace(/[^0-9a-z]/gi, "")
    .toUpperCase()
    .slice(0, 6)
    .padEnd(6, "0");
  return `PM-${seriesCode}-${catCode}-${sizeCode}`;
}

function sizeId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mediaFor(product: RawProduct): MediaAsset[] {
  const alt = `${product.name} — Plusmark ${CATEGORY_SUBJECT[product.categoryId] ?? "product"}`;
  const local = localProductImages(product.slug);
  if (local) {
    return local.map((publicId) => ({ publicId, alt, width: 1400, height: 1400, source: "product" }));
  }
  // The source feed lists video ids alongside photographs; a video id is not a
  // renderable image, so those products fall back to the pending panel until a
  // real photograph is uploaded.
  return product.images
    .filter((publicId) => !publicId.startsWith("plusmark/videos/"))
    .map((publicId) => ({
      publicId,
      alt,
      width: 2000,
      height: 1600,
      source: product.imageSource === "video-poster" ? "video-poster" : "product"
    }));
}

function blurbFor(product: RawProduct, copy?: CatalogCopy): string {
  const surface = copy?.surface ?? product.surface;
  const frame = copy?.frame ?? product.frame;
  const specs = [surface, frame].filter((value): value is string => Boolean(value));
  const lead = specs.length ? `${product.name}: ${specs.join(" · ")}.` : `${product.name}.`;
  return `${lead} Made to order in the sizes listed here; confirm the exact specification with Plusmark before dispatch.`;
}

function descriptionFor(product: RawProduct, series: Series | null, copy?: CatalogCopy): string {
  const subject = CATEGORY_SUBJECT[product.categoryId] ?? "board";
  const paragraphs: string[] = [];

  if (copy) {
    paragraphs.push(...copy.about);
    const dimensionalSizes = product.sizes.filter((size) => /\d/.test(size));
    if (dimensionalSizes.length) {
      paragraphs.push(
        `Standard sizes on this page are ${dimensionalSizes.join(", ")}. Larger or non-standard sizes are made to order — send the size you need and the team will quote it.`
      );
    }
  } else {
    paragraphs.push(
      `${product.name} is part of the Plusmark ${subject.toLowerCase()} range${
        series ? ` in the ${series.name} series` : ""
      }. Plusmark manufactures it in Ahmedabad and dispatches across India.`
    );

    if (series) {
      paragraphs.push(
        `Writing face: ${series.surface}. Frame: ${series.frame}. Corners: ${series.corners}. These are the three points where Plusmark's series differ, and they are what each series is priced on.`
      );
    }

    if (product.sizes.length) {
      paragraphs.push(
        `Standard sizes on this page are ${product.sizes.join(", ")}. Larger or non-standard sizes are made to order — send the size you need and the team will quote it.`
      );
    }
  }

  paragraphs.push(
    `Prices depend on series, size and quantity, so Plusmark confirms the figure for your exact requirement instead of publishing a list price. There is no minimum order — a single board can go straight in the cart.`
  );

  return paragraphs.join("\n\n");
  }

function featuresFor(product: RawProduct): string[] {
  const features: string[] = [];
  if (product.surface) features.push(`Surface — ${product.surface}`);
  if (product.frame) features.push(`Frame — ${product.frame}`);
  if (product.corners) features.push(`Corners — ${product.corners}`);
  features.push(product.magnetic ? "Magnetic face — holds charts, timetables and papers" : "Non-magnetic face");
  if (product.doubleSided) features.push("Two writing faces on one frame");
  if (product.sizes.length) features.push(`Sizes made — ${product.sizes.join(", ")}`);
  features.push("Custom sizes made to order");
  features.push("Pan-India dispatch from Ahmedabad");
  return features;
}

function buildVariants(product: RawProduct): Variant[] {
  const series = product.seriesId ? seriesById.get(product.seriesId) ?? null : null;
  const offers = PACK_OFFERS[product.slug] ?? {};
  const variants: Variant[] = [];

  for (const label of product.sizes) {
    const id = `${product.slug}--${sizeId(label)}`;
    const priceInr = DEMO_PRICING_ENABLED
      ? demoUnitPriceInr({ slug: product.slug, categoryId: product.categoryId, series, sizeLabel: label })
      : null;
    const size = buildSize(id.split("--")[1], label);

    variants.push({
      id,
      productId: product.slug,
      sku: skuFor(product, label),
      size,
      priceMode: DEMO_PRICING_ENABLED && priceInr !== null ? "fixed" : "on_request",
      priceInr,
      compareAtInr: null,
      // Plusmark works make-to-order, so no on-hand quantity is published.
      stock: null,
      trackInventory: false,
      available: true,
      leadTimeDays: null
    });

    for (const packQty of offers[label] ?? []) {
      const packPriceInr = DEMO_PRICING_ENABLED
        ? demoPackPriceInr({ slug: product.slug, sizeLabel: label, packQty })
        : null;
      variants.push({
        id: `${id}--pack-${packQty}`,
        productId: product.slug,
        sku: `${skuFor(product, label)}-P${packQty}`,
        size,
        priceMode: packPriceInr !== null ? "fixed" : "on_request",
        priceInr: packPriceInr,
        compareAtInr: null,
        stock: null,
        trackInventory: false,
        available: true,
        leadTimeDays: null,
        packQty
      });
    }
  }

  return variants;
}

const FAQ_SECTIONS: { match: RegExp; section: string }[] = [
  { match: /series|HPL|glare|magnetic|ceramic|surfaces|products does/i, section: "Products & Materials" },
  { match: /size|custom|sketch/i, section: "Sizes & Customisation" },
  { match: /supply|GEM|dealer|warranty|quotation|located/i, section: "Supply & Ordering" }
];

// The storefront is retail-only now, so Plusmark's published GEM, dealer and
// quotation answers are not surfaced here. live-faq.json keeps them intact.
const B2B_FAQ_QUESTIONS = /GEM Portal|dealers and distributors|price quotation/i;

export const faqItems: FaqItem[] = (faqRaw as { name: string; acceptedAnswer: { text: string } }[])
  .filter((item) => !B2B_FAQ_QUESTIONS.test(item.name))
  .map((item, index) => ({
    id: `faq-${index + 1}`,
    section: FAQ_SECTIONS.find((s) => s.match.test(item.name))?.section ?? "General",
    question: item.name,
    answer: item.acceptedAnswer.text,
    source: "verified"
  }));

// Curation flag used only for default "Featured" sort order. Plusmark publishes no
// sales statistics, so this is manual selection, not a bestseller ranking.
const FEATURED = new Set([
  "metallic-premium-white-board",
  "metallic-premium-chalk-board",
  "metallic-premium-magnetic-board",
  "metallic-premium-notice-board",
  "eco-premium-white-board",
  "eco-premium-chalk-board",
  "deluxe-standard-white-board",
  "eco-regular-white-board",
  "laminate-mdf-base-clipboard",
  "four-leg-stand",
  "dry-wipe-schedule-board",
  "cork-notice-board"
]);

export const products: Product[] = (raw.products as RawProduct[])
  .map((p) => {
    const series = p.seriesId ? seriesById.get(p.seriesId) ?? null : null;
    const copy = CATALOG_COPY[p.slug];
    const variants = buildVariants(p);
    return {
      id: p.slug,
      slug: p.slug,
      name: p.name,
      categoryId: p.categoryId,
      seriesId: p.seriesId,
      subcategoryIds: p.subcategoryIds,
      surface: copy?.surface ?? p.surface,
      frame: copy?.frame ?? p.frame,
      corners: copy?.corners !== undefined ? copy.corners : p.corners,
      magnetic: Boolean(p.magnetic),
      doubleSided: Boolean(p.doubleSided),
      usage: copy?.usage ?? categoryById.get(p.categoryId)?.description ?? "Classrooms, offices and workspaces",
      blurb: blurbFor(p, copy),
      description: descriptionFor(p, series, copy),
      features: copy?.built ?? featuresFor(p),
      media: mediaFor(p),
      videoId: p.videoId,
      variants,
      priceMode: variants.every((v) => v.priceMode === "on_request") ? "on_request" : "fixed",
      gstRatePercent: 12,
      hsnCode: null,
      minimumOrderQuantity: 1,
      bulkSuggestionQuantity: 10,
      published: true,
      featured: FEATURED.has(p.slug),
      createdAt: "2026-01-01T09:30:00.000Z"
    } satisfies Product;
  })
  .sort((a, b) => (a.seriesId ? 0 : 1) - (b.seriesId ? 0 : 1) || a.name.localeCompare(b.name));

export const industries = (raw.media as { industries: string[] }).industries.map((publicId) => ({
  publicId,
  name: publicId.split("/").pop() ?? publicId,
  slug: publicId.split("/").pop() ?? publicId
}));

export const clients = (raw.media as { clients: string[] }).clients.map((publicId) => ({
  publicId,
  name: (publicId.split("/").pop() ?? publicId).replace(/-/g, " ")
}));

export const institutions: string[] = raw.institutions as unknown as string[];
export const assurances: string[] = raw.assurances as unknown as string[];

/* ------------------------------- accessors ------------------------------- */

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategory(idOrSlug: string): Category | undefined {
  return categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}

export function getSeries(id: string | null): Series | undefined {
  return id ? seriesById.get(id) : undefined;
}

export function productsInCategory(id: string): Product[] {
  return products.filter((p) => p.categoryId === id);
}

export function productsInSubcategory(id: string): Product[] {
  return products.filter((p) => p.subcategoryIds.includes(id));
}

export function relatedProducts(product: Product, count = 4): Product[] {
  const sameCategory = products.filter((p) => p.categoryId === product.categoryId && p.slug !== product.slug);
  const sameSeries = products.filter((p) => p.seriesId === product.seriesId && p.categoryId !== product.categoryId);
  const seen = new Set([product.slug]);
  return [...sameCategory, ...sameSeries]
    .filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)))
    .slice(0, count);
}

export function variantOf(product: Product, variantId: string): Variant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function allSizes(): { id: string; label: string }[] {
  const map = new Map<string, string>();
  for (const p of products) for (const v of p.variants) map.set(v.size.id, v.size.label);
  return [...map.entries()].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
}

/** Single-board variants, excluding multi-board packs. */
export function baseVariants(product: Product): Variant[] {
  return product.variants.filter((variant) => (variant.packQty ?? 1) === 1);
}

export function priceRangeFor(product: Product): { min: number | null; max: number | null } {
  const values = baseVariants(product)
    .map((v) => v.priceInr)
    .filter((v): v is number => v !== null);
  if (!values.length) return { min: null, max: null };
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function heroImageFor(publicId: string): string {
  return imageUrl(publicId, { fit: "fill", width: 1600, height: 1000 });
}
