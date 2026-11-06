/**
 * Bulk catalogue import.
 *
 * Usage:
 *   node scripts/import-products.mjs [file.csv]            # validate only (dry run)
 *   node scripts/import-products.mjs file.csv --local      # write src/data/catalog.json only
 *   node scripts/import-products.mjs file.csv --write      # write catalog.json + Supabase
 *
 * The script matches rows by slug and never renames or removes an existing
 * product. A timestamped catalog backup is written before any local change.
 * Every field is optional except slug, name and category; blank CSV cells keep
 * the value already on record.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const fileArg = args.find((arg) => !arg.startsWith("--"));
const csvPath = path.resolve(rootPath, fileArg ?? "scripts/catalog-import-template.csv");
const WRITE_LOCAL = flags.has("--local") || flags.has("--write");
const WRITE_SUPABASE = flags.has("--write");
const DRY_RUN = !WRITE_LOCAL;

const BOARD_TYPES = new Set(["non-magnetic", "magnetic", "ceramic", "n/a"]);
const SURFACE_KINDS = new Set(["marker", "chalk", "pin-up", "other"]);
const TRUE_FALSE = new Set(["true", "false", ""]);

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((cell) => cell.trim()));
}

function toBoolean(value, field, errors, rowNumber) {
  const normalized = value.trim().toLowerCase();
  if (!TRUE_FALSE.has(normalized)) {
    errors.push(`Row ${rowNumber}: ${field} must be true or false.`);
    return null;
  }
  return normalized === "" ? null : normalized === "true";
}

function splitList(value) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSpecs(value, errors, rowNumber) {
  if (!value.trim()) return null;
  const specs = [];
  for (const pair of value.split(";")) {
    const separator = pair.indexOf("=");
    if (separator <= 0 || separator === pair.length - 1) {
      errors.push(`Row ${rowNumber}: specs must use “Label=Value;Label=Value”.`);
      return null;
    }
    specs.push({ label: pair.slice(0, separator).trim(), value: pair.slice(separator + 1).trim() });
  }
  return specs;
}

if (!fs.existsSync(csvPath)) fail(`CSV not found: ${csvPath}`);

const catalogPath = new URL("src/data/catalog.json", root);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const categoryIds = new Set(catalog.categories.map((category) => category.id));
const seriesIds = new Set(Object.keys(catalog.series));
const productBySlug = new Map(catalog.products.map((product) => [product.slug, product]));

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
if (rows.length < 2) fail("The CSV has a header but no data rows.");
const header = rows[0].map((cell) => cell.trim());
const requiredColumns = ["slug", "name", "category_id"];
for (const column of requiredColumns) {
  if (!header.includes(column)) fail(`The CSV is missing the required column “${column}”.`);
}

const errors = [];
const warnings = [];
const planned = [];
const seenSlugs = new Set();

rows.slice(1).forEach((cells, index) => {
  const rowNumber = index + 2;
  const raw = Object.fromEntries(header.map((column, position) => [column, (cells[position] ?? "").trim()]));
  const slug = raw.slug;
  if (!slug) {
    errors.push(`Row ${rowNumber}: slug is required.`);
    return;
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`Row ${rowNumber}: slug “${slug}” must be lowercase letters, numbers and hyphens.`);
    return;
  }
  if (seenSlugs.has(slug)) {
    errors.push(`Row ${rowNumber}: slug “${slug}” appears more than once in the CSV.`);
    return;
  }
  seenSlugs.add(slug);

  const existing = productBySlug.get(slug);
  if (!raw.name) errors.push(`Row ${rowNumber}: name is required.`);
  if (!raw.category_id) errors.push(`Row ${rowNumber}: category_id is required.`);
  else if (!categoryIds.has(raw.category_id)) errors.push(`Row ${rowNumber}: unknown category_id “${raw.category_id}”.`);
  if (raw.series_id && !seriesIds.has(raw.series_id)) errors.push(`Row ${rowNumber}: unknown series_id “${raw.series_id}”.`);
  if (raw.board_type && !BOARD_TYPES.has(raw.board_type)) errors.push(`Row ${rowNumber}: board_type must be one of ${[...BOARD_TYPES].join(", ")}.`);
  if (raw.surface_kind && !SURFACE_KINDS.has(raw.surface_kind)) errors.push(`Row ${rowNumber}: surface_kind must be one of ${[...SURFACE_KINDS].join(", ")}.`);

  const magnetic = toBoolean(raw.magnetic ?? "", "magnetic", errors, rowNumber);
  const doubleSided = toBoolean(raw.double_sided ?? "", "double_sided", errors, rowNumber);
  const enquiryOnly = toBoolean(raw.enquiry_only ?? "", "enquiry_only", errors, rowNumber);
  const needsData = toBoolean(raw.needs_data ?? "", "needs_data", errors, rowNumber);
  const published = toBoolean(raw.published ?? "", "published", errors, rowNumber);

  const subcategoryIds = raw.subcategory_ids ? splitList(raw.subcategory_ids) : null;
  if (subcategoryIds) {
    const category = catalog.categories.find((entry) => entry.id === (raw.category_id || existing?.categoryId));
    const known = new Set(category?.subcategories.map((sub) => sub.id) ?? []);
    for (const sub of subcategoryIds) {
      if (!known.has(sub)) warnings.push(`Row ${rowNumber}: subcategory “${sub}” is not published under this category.`);
    }
  }

  const sizes = raw.sizes ? splitList(raw.sizes) : null;
  const specs = parseSpecs(raw.specs ?? "", errors, rowNumber);
  const images = raw.image_public_ids ? splitList(raw.image_public_ids) : null;

  if (!existing && !raw.name) errors.push(`Row ${rowNumber}: a new product needs a name.`);
  if (existing && raw.category_id && raw.category_id !== existing.categoryId) {
    warnings.push(`Row ${rowNumber}: category changes from “${existing.categoryId}” to “${raw.category_id}”. URL keeps the slug.`);
  }
  const willPublish = published ?? existing?.published ?? false;
  const imageCount = images?.length ?? existing?.images.length ?? 0;
  if (willPublish && imageCount === 0) {
    errors.push(`Row ${rowNumber}: a published product needs at least one image_public_id.`);
  }
  if (willPublish && (needsData ?? existing?.needsData) === true) {
    warnings.push(`Row ${rowNumber}: published while still flagged needs_data.`);
  }

  planned.push({
    rowNumber,
    slug,
    existing,
    update: {
      name: raw.name || undefined,
      categoryId: raw.category_id || undefined,
      seriesId: raw.series_id || undefined,
      subcategoryIds: subcategoryIds ?? undefined,
      magnetic: magnetic ?? undefined,
      doubleSided: doubleSided ?? undefined,
      boardType: raw.board_type || undefined,
      surfaceKind: raw.surface_kind || undefined,
      enquiryOnly: enquiryOnly ?? undefined,
      needsData: needsData ?? undefined,
      published: published ?? undefined,
      customisation: raw.customisation || undefined,
      sizes: sizes ?? undefined,
      surface: raw.surface || undefined,
      frame: raw.frame || undefined,
      corners: raw.corners || undefined,
      specs: specs ?? undefined,
      images: images ?? undefined,
      sourceDescription: raw.source_description || undefined
    }
  });
});

console.log(`\nCatalog import — ${DRY_RUN ? "dry run" : "write"} — ${planned.length} rows from ${path.relative(rootPath, csvPath)}`);
for (const row of planned) {
  const action = row.existing ? "update" : "create";
  const flagsText = [
    row.update.published === true ? "publish" : row.update.published === false ? "draft" : "",
    row.update.enquiryOnly === true ? "enquiry" : "",
    row.update.needsData === true ? "needs-data" : ""
  ].filter(Boolean).join(" ");
  console.log(`  ${String(row.rowNumber).padStart(3)}  ${action.padEnd(6)}  ${row.slug}${flagsText ? `  [${flagsText}]` : ""}`);
}
if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`  ! ${warning}`);
}
if (errors.length) {
  console.log("\nErrors:");
  for (const error of errors) console.log(`  ✗ ${error}`);
  fail(`${errors.length} row${errors.length === 1 ? "" : "s"} failed validation. Nothing was written.`);
}

if (DRY_RUN) {
  console.log("\nDry run only. Re-run with --write to update catalog.json and Supabase, or --local for catalog.json only.");
  process.exit(0);
}

/* ------------------------------- local write ------------------------------ */
const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
const backupDir = path.join(rootPath, "backups");
fs.mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `catalog-${timestamp}.json`);
fs.copyFileSync(fileURLToPath(catalogPath), backupPath);
console.log(`\nBackup written: ${path.relative(rootPath, backupPath)}`);

for (const row of planned) {
  if (row.existing) {
    for (const [key, value] of Object.entries(row.update)) {
      if (value !== undefined) row.existing[key] = value;
    }
  } else {
    const product = {
      slug: row.slug,
      name: row.update.name,
      categoryId: row.update.categoryId,
      seriesId: row.update.seriesId ?? null,
      subcategoryIds: row.update.subcategoryIds ?? [],
      magnetic: row.update.magnetic ?? false,
      doubleSided: row.update.doubleSided ?? false,
      sizes: row.update.sizes ?? [],
      images: row.update.images ?? [],
      imageSource: "product",
      videoId: null,
      surface: row.update.surface ?? "",
      frame: row.update.frame ?? "",
      corners: row.update.corners ?? "",
      boardType: row.update.boardType ?? "n/a",
      surfaceKind: row.update.surfaceKind ?? "other",
      enquiryOnly: row.update.enquiryOnly ?? false,
      needsData: row.update.needsData ?? true,
      customisation: row.update.customisation ?? null,
      specs: row.update.specs ?? [],
      sourceDescription: row.update.sourceDescription ?? undefined,
      published: row.update.published ?? false
    };
    catalog.products.push(product);
  }
}
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`catalog.json updated (${planned.length} rows).`);

if (!WRITE_SUPABASE) {
  console.log("Supabase skipped. Run with --write to mirror the rows into the admin tables.");
  process.exit(0);
}

/* ----------------------------- supabase write ----------------------------- */
const env = {};
const envPath = new URL(".env.local", root);
if (!fs.existsSync(envPath)) fail("Missing .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) env[match[1]] = match[2].trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;
if (!url || !key) fail("Missing Supabase URL or secret key in .env.local.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data: stored, error: readError } = await supabase.from("products").select("id, slug, variants:product_variants(sku)");
if (readError) fail(`Could not read the admin catalogue: ${readError.message}`);
const storedBySlug = new Map((stored ?? []).map((row) => [row.slug, row]));

for (const row of planned) {
  const product = productBySlug.get(row.slug) ?? catalog.products.find((entry) => entry.slug === row.slug);
  if (!product) {
    console.warn(`  ! ${row.slug}: written locally but not found for the Supabase mirror.`);
    continue;
  }
  const payload = {
    slug: product.slug,
    name: product.name,
    category_id: product.categoryId,
    series_id: product.seriesId,
    subcategory_ids: product.subcategoryIds,
    surface: product.surface || null,
    frame: product.frame || null,
    corners: product.corners || null,
    magnetic: Boolean(product.magnetic),
    double_sided: Boolean(product.doubleSided),
    board_type: product.boardType ?? "n/a",
    surface_kind: product.surfaceKind ?? "other",
    enquiry_only: Boolean(product.enquiryOnly),
    needs_data: Boolean(product.needsData),
    customisation: product.customisation ?? null,
    specs: product.specs ?? [],
    media: (product.images ?? []).map((publicId) => ({
      publicId,
      alt: `${product.name} - Plusmark product`,
      width: 1400,
      height: 1400,
      source: "product"
    })),
    video_id: product.videoId ?? null,
    published: product.published !== false
  };
  const { error } = await supabase.from("products").upsert(payload, { onConflict: "slug" });
  if (error) fail(`Supabase write failed for ${row.slug}: ${error.message}`);

  const storedRow = storedBySlug.get(row.slug);
  if (!storedRow) {
    const { data: inserted, error: idError } = await supabase.from("products").select("id").eq("slug", row.slug).single();
    if (idError) fail(`Could not read the new product id for ${row.slug}: ${idError.message}`);
    storedBySlug.set(row.slug, { id: inserted.id, slug: row.slug, variants: [] });
  }
  const record = storedBySlug.get(row.slug);
  if ((record.variants ?? []).length === 0 && (product.sizes ?? []).length > 0) {
    const variants = product.sizes.map((size, index) => ({
      product_id: record.id,
      size_label: size,
      sku: `PM-${row.slug.slice(0, 8).toUpperCase()}-${size.replace(/[^0-9a-z]/gi, "").toUpperCase().slice(0, 6).padEnd(6, "0")}-${index + 1}`,
      price_mode: "on_request",
      price_inr: null,
      stock: null,
      track_inventory: false,
      available: true,
      lead_time_days: null,
      sort_order: index
    }));
    const { error: variantError } = await supabase.from("product_variants").upsert(variants, { onConflict: "sku", ignoreDuplicates: true });
    if (variantError) fail(`Variant write failed for ${row.slug}: ${variantError.message}`);
  }
}
console.log("Supabase mirror updated.");
