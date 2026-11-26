import raw from "@/data/catalog.json";
import faqRaw from "@/data/live-faq.json";
import orgRaw from "@/data/live-org.json";
import { DEMO_PRICING_ENABLED } from "@/lib/config";
import { CATALOG_COPY, type CatalogCopy } from "@/lib/catalog-copy";
import { buildSize, demoPackPriceInr, demoUnitPriceInr } from "@/lib/demo-pricing";
import { imageUrl } from "@/lib/media";
import { localCategoryImage, localProductImages } from "@/lib/local-assets";
import type {
  BoardType,
  Category,
  FaqItem,
  MediaAsset,
  Product,
  ProductSpec,
  Series,
  Subcategory,
  SurfaceKind,
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
  boardType?: BoardType;
  surfaceKind?: SurfaceKind;
  enquiryOnly?: boolean;
  needsData?: boolean;
  customisation?: string | null;
  specs?: ProductSpec[];
  sourceDescription?: string | null;
  published?: boolean;
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

function mediaFor(product: RawProduct, series: Series | null): MediaAsset[] {
  const type = CATEGORY_SUBJECT[product.categoryId] ?? "product";
  const alt = `${product.name} - ${series ? `${series.name} ` : ""}${type} by Plusmark`;
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
  } else if (product.sourceDescription) {
    paragraphs.push(product.sourceDescription);
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
  // Enquiry-only models are quoted by the order desk; no figure is published.
  const pricingAllowed = DEMO_PRICING_ENABLED && !product.enquiryOnly;

  for (const label of product.sizes) {
    const id = `${product.slug}--${sizeId(label)}`;
    const priceInr = pricingAllowed
      ? demoUnitPriceInr({ slug: product.slug, categoryId: product.categoryId, series, sizeLabel: label })
      : null;
    const size = buildSize(id.split("--")[1], label);

    variants.push({
      id,
      productId: product.slug,
      sku: skuFor(product, label),
      size,
      priceMode: priceInr !== null ? "fixed" : "on_request",
      priceInr,
      compareAtInr: null,
      // Plusmark works make-to-order, so no on-hand quantity is published.
      stock: null,
      trackInventory: false,
      available: true,
      leadTimeDays: null
    });

    for (const packQty of offers[label] ?? []) {
      const packPriceInr = pricingAllowed
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

/** Every catalogue record, including drafts — admin and seed scripts only. */
export const allProducts: Product[] = (raw.products as RawProduct[])
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
      boardType: p.boardType ?? "n/a",
      surfaceKind: p.surfaceKind ?? "other",
      usage: copy?.usage ?? categoryById.get(p.categoryId)?.description ?? "Classrooms, offices and workspaces",
      blurb: blurbFor(p, copy),
      description: descriptionFor(p, series, copy),
      features: copy?.built ?? featuresFor(p),
      customisation: p.customisation ?? null,
      media: mediaFor(p, series),
      videoId: p.videoId,
      variants,
      priceMode: variants.every((v) => v.priceMode === "on_request") ? "on_request" : "fixed",
      gstRatePercent: 12,
      hsnCode: null,
      minimumOrderQuantity: 1,
      bulkSuggestionQuantity: 10,
      specs: p.specs ?? [],
      enquiryOnly: Boolean(p.enquiryOnly),
      needsData: Boolean(p.needsData),
      published: p.published !== false,
      featured: FEATURED.has(p.slug),
      createdAt: "2026-01-01T09:30:00.000Z"
    } satisfies Product;
  })
  .sort((a, b) => (a.seriesId ? 0 : 1) - (b.seriesId ? 0 : 1) || a.name.localeCompare(b.name));

/** Storefront catalogue — drafts never reach the site, sitemap or search. */
export const products: Product[] = allProducts.filter((product) => product.published);

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

/* ------------------------------ live overlay ------------------------------ */
/*
 * The built-in catalogue above is the starting point. The backend (Supabase) is the authority for what is
 * published, what things cost and which products exist: prices and visibility edited in the admin, new
 * products, and new variants are applied on top of it. The server refreshes this about once a minute and
 * the browser applies the same snapshot, so every sync accessor above keeps working unchanged.
 */

/** A row as read from the database (products with media, options and variants embedded). */
export interface LiveRow {
  slug: string;
  name: string;
  category_id: string;
  series_id: string | null;
  subcategory_ids: string[] | null;
  surface: string | null;
  frame: string | null;
  corners: string | null;
  magnetic: boolean;
  double_sided: boolean;
  board_type: BoardType;
  surface_kind: SurfaceKind;
  usage: string | null;
  blurb: string | null;
  description: string | null;
  features: string[] | null;
  specs: ProductSpec[] | null;
  customisation: string | null;
  video_id: string | null;
  price_mode: "fixed" | "on_request";
  gst_rate: number | string;
  hsn_code: string | null;
  bulk_suggestion_quantity: number;
  enquiry_only: boolean;
  needs_data: boolean;
  featured: boolean;
  created_at: string;
  product_media: { public_id: string; alt: string | null; width: number | null; height: number | null; source: string; sort_order: number }[];
  product_variants: {
    sku: string;
    external_ref: string | null;
    title: string;
    options: Record<string, string>;
    price_mode: "fixed" | "on_request";
    price_inr: number | string | null;
    compare_at_inr: number | string | null;
    stock: number;
    track_inventory: boolean;
    allow_backorder: boolean;
    available: boolean;
    lead_time_days: number | null;
    pack_qty: number;
    sort_order: number;
    id: string;
  }[];
}

export interface LiveCatalog {
  publishedSlugs: string[];
  /** Variants of built-in products, keyed by the storefront variant id. */
  overrides: Record<string, { variants: Record<string, Pick<Variant, "priceInr" | "compareAtInr" | "available" | "stock" | "trackInventory" | "leadTimeDays">>; added: Variant[]; featured: boolean }>;
  /** Products that exist only in the database. */
  extra: Product[];
}

const BASE_SLUGS = new Set(allProducts.map((p) => p.slug));
const BASE_VARIANT_IDS = new Map(allProducts.map((p) => [p.slug, new Set(p.variants.map((v) => v.id))]));
const liveExtraSlugs = new Set<string>();
/** Variants that were added to built-in products by an earlier overlay, so a refresh can remove them first. */
const liveAddedVariants = new Map<string, Set<string>>();

const asNumber = (value: number | string | null): number | null => (value === null || value === undefined ? null : Number(value));

function variantFromRow(row: LiveRow["product_variants"][number], slug: string): Variant {
  const label = row.options?.Size ?? row.title;
  return {
    id: row.external_ref ?? row.sku,
    productId: slug,
    sku: row.sku,
    size: buildSize(sizeId(label), label),
    priceMode: row.price_mode === "fixed" && row.price_inr !== null ? "fixed" : "on_request",
    priceInr: row.price_mode === "fixed" ? asNumber(row.price_inr) : null,
    compareAtInr: asNumber(row.compare_at_inr),
    stock: row.track_inventory ? row.stock : null,
    trackInventory: row.track_inventory,
    available: row.available && (!row.track_inventory || row.stock > 0 || row.allow_backorder),
    leadTimeDays: row.lead_time_days,
    packQty: row.pack_qty > 1 ? row.pack_qty : undefined
  };
}

function productFromRow(row: LiveRow): Product {
  const variants = [...row.product_variants].sort((a, b) => a.sort_order - b.sort_order).map((v) => variantFromRow(v, row.slug));
  const subject = categoryById.get(row.category_id)?.subject ?? "product";
  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    seriesId: row.series_id,
    subcategoryIds: row.subcategory_ids ?? [],
    surface: row.surface,
    frame: row.frame,
    corners: row.corners,
    magnetic: row.magnetic,
    doubleSided: row.double_sided,
    boardType: row.board_type,
    surfaceKind: row.surface_kind,
    usage: row.usage ?? categoryById.get(row.category_id)?.description ?? "",
    blurb: row.blurb ?? row.name,
    description: row.description ?? row.blurb ?? row.name,
    features: row.features ?? [],
    specs: row.specs ?? [],
    customisation: row.customisation,
    media: [...row.product_media]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => ({
        publicId: m.public_id,
        alt: m.alt ?? `${row.name} - ${subject} by Plusmark`,
        width: m.width ?? 1400,
        height: m.height ?? 1400,
        source: (m.source as MediaAsset["source"]) ?? "product"
      })),
    videoId: row.video_id,
    variants,
    priceMode: variants.every((v) => v.priceMode === "on_request") ? "on_request" : "fixed",
    gstRatePercent: Number(row.gst_rate),
    hsnCode: row.hsn_code,
    minimumOrderQuantity: 1,
    bulkSuggestionQuantity: row.bulk_suggestion_quantity,
    enquiryOnly: row.enquiry_only,
    needsData: row.needs_data,
    published: true,
    featured: row.featured,
    createdAt: row.created_at
  };
}

/** Turns the rows into a small snapshot: only what differs from the built-in catalogue. */
export function buildLiveCatalog(rows: LiveRow[]): LiveCatalog {
  const overrides: LiveCatalog["overrides"] = {};
  const extra: Product[] = [];
  for (const row of rows) {
    if (!BASE_SLUGS.has(row.slug)) {
      extra.push(productFromRow(row));
      continue;
    }
    const known = BASE_VARIANT_IDS.get(row.slug) ?? new Set<string>();
    const entry: LiveCatalog["overrides"][string] = { variants: {}, added: [], featured: row.featured };
    for (const v of row.product_variants) {
      const mapped = variantFromRow(v, row.slug);
      if (known.has(mapped.id)) {
        entry.variants[mapped.id] = {
          priceInr: mapped.priceInr,
          compareAtInr: mapped.compareAtInr,
          available: mapped.available,
          stock: mapped.stock,
          trackInventory: mapped.trackInventory,
          leadTimeDays: mapped.leadTimeDays
        };
      } else {
        entry.added.push(mapped);
      }
    }
    overrides[row.slug] = entry;
  }
  return { publishedSlugs: rows.map((r) => r.slug), overrides, extra };
}

/** Applies a snapshot to the in-memory catalogue. Safe to call repeatedly; the newest snapshot wins. */
export function applyLiveCatalog(live: LiveCatalog | null): void {
  if (!live || live.publishedSlugs.length === 0) return;
  const published = new Set(live.publishedSlugs);

  // take back anything an earlier snapshot added
  for (const slug of liveExtraSlugs) {
    const index = allProducts.findIndex((p) => p.slug === slug);
    if (index >= 0) allProducts.splice(index, 1);
  }
  liveExtraSlugs.clear();
  for (const [slug, ids] of liveAddedVariants) {
    const product = allProducts.find((p) => p.slug === slug);
    if (product) product.variants = product.variants.filter((v) => !ids.has(v.id));
  }
  liveAddedVariants.clear();

  for (const product of allProducts) {
    if (!BASE_SLUGS.has(product.slug)) continue;
    const entry = live.overrides[product.slug];
    product.published = published.has(product.slug);
    if (!entry) continue;
    product.featured = entry.featured;
    for (const variant of product.variants) {
      const o = entry.variants[variant.id];
      if (!o) {
        variant.available = false;
        continue;
      }
      variant.priceInr = o.priceInr;
      variant.priceMode = o.priceInr === null ? "on_request" : "fixed";
      variant.compareAtInr = o.compareAtInr;
      variant.available = o.available;
      variant.stock = o.stock;
      variant.trackInventory = o.trackInventory;
      variant.leadTimeDays = o.leadTimeDays;
    }
    if (entry.added.length) {
      product.variants.push(...entry.added);
      liveAddedVariants.set(product.slug, new Set(entry.added.map((v) => v.id)));
    }
    product.priceMode = product.variants.every((v) => v.priceMode === "on_request") ? "on_request" : "fixed";
  }

  for (const product of live.extra) {
    allProducts.push(product);
    liveExtraSlugs.add(product.slug);
  }
  products.splice(0, products.length, ...allProducts.filter((p) => p.published));
}
