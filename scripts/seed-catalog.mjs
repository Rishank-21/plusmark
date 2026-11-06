/**
 * Seeds the admin catalogue from the static storefront feed.
 * Run: node scripts/seed-catalog.mjs [--force]
 * Uses SUPABASE_URL + SUPABASE_SECRET_KEY from .env.local (never the browser).
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const root = new URL("../", import.meta.url);
const env = {};
for (const line of fs.readFileSync(new URL(".env.local", root), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) env[match[1]] = match[2].trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Missing Supabase URL or secret key in .env.local");

const raw = JSON.parse(fs.readFileSync(new URL("src/data/catalog.json", root), "utf8"));
const force = process.argv.includes("--force");
const supabase = createClient(url, key, { auth: { persistSession: false } });

const SERIES_BASE = {
  "metallic-premium": { perSqFt: 260, frameHandlingInr: 900 },
  "eco-premium": { perSqFt: 200, frameHandlingInr: 700 },
  "deluxe-standard": { perSqFt: 165, frameHandlingInr: 600 },
  "eco-regular": { perSqFt: 130, frameHandlingInr: 450 }
};
const NON_BOARD_UNIT = {
  clipboards: 420, "board-stands": 3800, "school-benches": 6400, "board-study-essentials": 690,
  "specialty-boards": 2400, "display-boards": 2900, "schedule-boards": 3400, "notice-boards": 2600,
  "double-sided-boards": 4200
};
const round10 = (n) => Math.round(n / 10) * 10;
const slugFactor = (slug) => [...slug].reduce((s, c) => s + c.charCodeAt(0), 0) % 100 / 100;
const area = (label) => {
  const m = label.match(/^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*ft$/i);
  return m ? Number(m[1]) * Number(m[2]) : null;
};
function priceFor(product, sizeLabel) {
  const base = SERIES_BASE[product.seriesId];
  const a = area(sizeLabel);
  if (base && a) return round10(base.perSqFt * a + base.frameHandlingInr);
  return round10((NON_BOARD_UNIT[product.categoryId] ?? 2200) * (0.85 + slugFactor(product.slug) * 0.4));
}
const sizeId = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* The static feed reuses a SKU across similar products, so the admin seed
   appends a stable product number to keep every database SKU unique. */
function skuFor(product, sizeLabel, productIndex) {
  const seriesCode = product.seriesId ? product.seriesId.split("-").map((p) => p[0]).join("").toUpperCase() : "STD";
  const catCode = product.categoryId.slice(0, 3).toUpperCase();
  const sizeCode = sizeLabel.replace(/[^0-9a-z]/gi, "").toUpperCase().slice(0, 6).padEnd(6, "0");
  return `PM-${seriesCode}-${catCode}-${sizeCode}-${String(productIndex + 1).padStart(2, "0")}`;
}
const subjectOf = Object.fromEntries(raw.categories.map((c) => [c.id, c.subject]));

const categories = raw.categories.map((c, index) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  subject: c.subject,
  image: c.image,
  subcategories: c.subcategories,
  sort_order: index
}));

const products = raw.products.map((p) => {
  const series = p.seriesId ? raw.series[p.seriesId] : null;
  const surface = p.surface ?? series?.surface ?? "";
  const frame = p.frame ?? series?.frame ?? "";
  const corners = p.corners ?? series?.corners ?? "";
  const facts = [surface, frame, corners].filter(Boolean);
  const subject = (subjectOf[p.categoryId] ?? "board").toLowerCase();
  return {
    slug: p.slug,
    name: p.name,
    category_id: p.categoryId,
    series_id: p.seriesId,
    subcategory_ids: p.subcategoryIds ?? [],
    surface: surface || null,
    frame: frame || null,
    corners: corners || null,
    magnetic: Boolean(p.magnetic),
    double_sided: Boolean(p.doubleSided),
    usage: `General ${subject} use.`,
    blurb: `${p.name}${facts.length ? `: ${facts[0]}` : ""}. Made to order in the sizes listed here.`,
    description:
      p.sourceDescription ??
      [
        `${p.name} is made by Plusmark in Ahmedabad and dispatched across India.`,
        facts.length ? `Specification on record: ${facts.join(" · ")}.` : "",
        p.sizes.length ? `Standard sizes: ${p.sizes.join(", ")}. Larger or non-standard sizes are made to order.` : ""
      ].filter(Boolean).join("\n\n"),
    features: facts,
    board_type: p.boardType ?? "n/a",
    surface_kind: p.surfaceKind ?? "other",
    enquiry_only: Boolean(p.enquiryOnly),
    needs_data: Boolean(p.needsData),
    customisation: p.customisation ?? null,
    specs: p.specs ?? [],
    media: p.images.filter((id) => !id.startsWith("plusmark/videos/")).map((publicId) => ({
      publicId,
      alt: `${p.name} - Plusmark product`,
      width: 1400,
      height: 1400,
      source: p.imageSource === "video-poster" ? "video-poster" : "product"
    })),
    video_id: p.videoId,
    price_mode: p.enquiryOnly ? "on_request" : "fixed",
    gst_rate_percent: 12,
    hsn_code: null,
    bulk_suggestion_quantity: 10,
    published: p.published !== false,
    featured: false
  };
});

const shipping = [
  { id: "standard", name: "Standard surface dispatch", description: "Partner courier, pan-India", price_inr: null, eta_min_days: null, eta_max_days: null, available: true, sort_order: 0 },
  { id: "pickup", name: "Pickup from Ahmedabad", description: "Collect from Narolgam works", price_inr: 0, eta_min_days: null, eta_max_days: null, available: true, sort_order: 1 }
];

const content = [
  { key: "announcement", value: { text: "Discover quality writing & display boards by Plusmark", linkHref: "/shop", linkLabel: null, active: true } },
  {
    key: "hero",
    value: {
      eyebrow: "Plusmark · Ahmedabad",
      headline: "Writing & Display Systems, Thoughtfully Made.",
      supporting: "Explore quality writing boards, notice boards and display solutions for classrooms, offices and institutions across India.",
      primaryCta: { label: "Explore Collection", href: "/shop" },
      secondaryCta: { label: "Shop Bestsellers", href: "/shop?series=metallic-premium" },
      imagePublicId: "plusmark/industries/schools",
      imageAlt: "Teacher teaching mathematics on a Plusmark navy board in a school classroom with students"
    }
  }
];

const { count } = await supabase.from("products").select("id", { count: "exact", head: true });
const seeded = (count ?? 0) > 0;
if (seeded && !force) {
  console.log(`products already has ${count} rows — skipping catalogue (use --force to overwrite).`);
} else {
  const { error: catError } = await supabase.from("categories").upsert(categories, { onConflict: "id" });
  if (catError) throw catError;
  console.log("categories:", categories.length);

  const { error: prodError } = await supabase.from("products").upsert(products, { onConflict: "slug" });
  if (prodError) throw prodError;
  console.log("products:", products.length);

  const { data: stored, error: readError } = await supabase.from("products").select("id, slug");
  if (readError) throw readError;
  const idBySlug = new Map(stored.map((row) => [row.slug, row.id]));
  const variants = [];
  for (const [productIndex, p] of raw.products.entries()) {
    const productId = idBySlug.get(p.slug);
    p.sizes.forEach((label, index) => {
      variants.push({
        product_id: productId,
        size_label: label,
        sku: skuFor(p, label, productIndex),
        price_mode: p.enquiryOnly ? "on_request" : "fixed",
        price_inr: p.enquiryOnly ? null : priceFor(p, label),
        stock: null,
        track_inventory: false,
        available: true,
        lead_time_days: null,
        sort_order: index
      });
    });
  }
  const { error: varError } = await supabase.from("product_variants").upsert(variants, { onConflict: "sku" });
  if (varError) throw varError;
  console.log("variants:", variants.length);
}

const { error: shipError } = await supabase.from("shipping_methods").upsert(shipping, { onConflict: "id" });
if (shipError) throw shipError;
const { error: contentError } = await supabase.from("site_content").upsert(content, { onConflict: "key" });
if (contentError) throw contentError;
console.log("shipping + content seeded");
