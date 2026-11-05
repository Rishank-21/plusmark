#!/usr/bin/env node
/**
 * One-time (idempotent) migration of local storefront media to Cloudinary.
 *
 *   node scripts/migrate-media-to-cloudinary.mjs             # plan only (default)
 *   node scripts/migrate-media-to-cloudinary.mjs --apply     # upload + record rows
 *   node scripts/migrate-media-to-cloudinary.mjs --apply --rewire
 *
 *   # Copy assets that already live on a legacy Cloudinary cloud to the one in .env
 *   node scripts/migrate-media-to-cloudinary.mjs --remote            # plan only
 *   node scripts/migrate-media-to-cloudinary.mjs --remote --apply
 *
 * Local files are never deleted. Every upload uses a deterministic public id and
 * skips ids already present in the media table, so re-running is safe.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, "public", "images");
const MAP_FILE = path.join(ROOT, "scripts", "media-migration-map.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);

/** Local folder → allowed Cloudinary folder. Unlisted folders land in banners. */
const FOLDER_MAP = {
  products: "products",
  aplus: "products",
  categories: "categories",
  hero: "banners",
  banners: "banners",
  brand: "banners",
  videos: "videos",
  reviews: "reviews"
};

function parseArgs(argv) {
  const flags = {
    apply: false,
    rewire: false,
    remote: false,
    sourceCloud: null,
    limit: Infinity,
    only: null,
    help: false
  };
  for (const arg of argv) {
    if (arg === "--apply") flags.apply = true;
    else if (arg === "--rewire") flags.rewire = true;
    else if (arg === "--remote") flags.remote = true;
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg.startsWith("--limit=")) flags.limit = Number.parseInt(arg.slice(8), 10) || Infinity;
    else if (arg.startsWith("--only=")) flags.only = arg.slice(7);
    else if (arg.startsWith("--source-cloud=")) flags.sourceCloud = arg.slice(15).trim() || null;
  }
  return flags;
}

async function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    try {
      const text = await readFile(path.join(ROOT, file), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (!match || line.trim().startsWith("#")) continue;
        const value = match[2].replace(/^["']|["']$/g, "");
        if (!env[match[1]]) env[match[1]] = value;
      }
    } catch {
      /* a missing env file is fine; the required keys are checked below */
    }
  }
  return env;
}

function config(env) {
  const cloud = (env.CLOUDINARY_CLOUD_NAME || env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();
  return {
    cloud,
    apiKey: (env.CLOUDINARY_API_KEY || "").trim(),
    apiSecret: (env.CLOUDINARY_API_SECRET || "").trim(),
    base: (env.CLOUDINARY_BASE_FOLDER || "plusmark").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "plusmark",
    supabaseUrl: (env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, ""),
    supabaseKey: (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  };
}

function sign(params, secret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase()) || VIDEO_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files.sort();
}

function planFor(file, base) {
  const relative = path.relative(IMAGE_DIR, file).split(path.sep);
  // The local tree repeats the Cloudinary base folder (public/images/plusmark/…).
  if (relative[0] === base) relative.shift();
  const [top, ...rest] = relative;
  const folder = FOLDER_MAP[top] ?? "banners";
  const stem = rest.join("/").replace(/\.[^.]+$/, "");
  return {
    file,
    localPath: `/images/${path.relative(IMAGE_DIR, file).split(path.sep).join("/")}`,
    publicId: `${base}/${folder}/${stem}`,
    folder,
    resourceType: VIDEO_EXT.has(path.extname(file).toLowerCase()) ? "video" : "image"
  };
}

async function cloudinaryUpload(file, item, cfg) {
  const timestamp = Math.floor(Date.now() / 1000);
  // The deterministic public id already carries the folder path, so `folder` is
  // not sent separately (sending both would double the prefix).
  const signed = { overwrite: "false", public_id: item.publicId, timestamp };
  const form = new FormData();
  form.append("file", new Blob([await readFile(file)]), path.basename(file));
  form.append("api_key", cfg.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", signed.public_id);
  form.append("overwrite", signed.overwrite);
  form.append("signature", sign(signed, cfg.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/auto/upload`, {
    method: "POST",
    body: form
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message ?? `HTTP ${response.status}`;
    if (/already exists/i.test(message)) return { skipped: true, publicId: item.publicId };
    throw new Error(message);
  }
  return { skipped: false, ...payload };
}

async function rest(cfg, table, init) {
  const response = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}`, {
    ...init,
    headers: {
      apikey: cfg.supabaseKey,
      Authorization: `Bearer ${cfg.supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
      ...(init?.headers ?? {})
    }
  });
  if (!response.ok) throw new Error(`${table}: HTTP ${response.status} ${await response.text()}`);
  // PostgREST replies 201 with an empty body unless return=representation is
  // requested, so parse only when there is something to parse.
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function existingIds(cfg) {
  const rows = await rest(cfg, "media?select=public_id&limit=10000", { method: "GET" });
  return new Set((rows ?? []).map((row) => row.public_id));
}

async function recordRow(cfg, item, uploaded) {
  await rest(cfg, "media?on_conflict=public_id", {
    method: "POST",
    body: JSON.stringify({
      public_id: uploaded.public_id ?? item.publicId,
      url: uploaded.secure_url ?? null,
      resource_type: uploaded.resource_type ?? item.resourceType,
      format: uploaded.format ?? null,
      width: uploaded.width ?? null,
      height: uploaded.height ?? null,
      bytes: uploaded.bytes ?? null,
      duration: typeof uploaded.duration === "number" ? uploaded.duration : null,
      alt_text: ""
    })
  });
}

/* ---------------------- copy from a legacy cloud ------------------------ */

const DEFAULT_SOURCE_CLOUD = "drt0rpkn2";

function isRemoteId(value) {
  return typeof value === "string" && value.length > 0 && !value.startsWith("/") && !value.startsWith("http");
}

function typeOf(publicId, hint) {
  if (hint) return hint;
  return /(^|\/)videos\//.test(publicId) ? "video" : "image";
}

function walkPublicIds(value, add) {
  if (Array.isArray(value)) {
    for (const entry of value) walkPublicIds(entry, add);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (/public_?id$/i.test(key) && typeof entry === "string") add(entry);
    else walkPublicIds(entry, add);
  }
}

/** Every Cloudinary id the storefront or database still points at. */
async function collectRemoteIds(cfg) {
  const assets = new Map();
  const add = (value, hint) => {
    if (!isRemoteId(value)) return;
    const type = typeOf(value, hint);
    if (assets.get(value) !== "video") assets.set(value, type);
  };

  try {
    const catalog = JSON.parse(await readFile(path.join(ROOT, "src", "data", "catalog.json"), "utf8"));
    for (const product of catalog.products ?? []) {
      for (const id of product.images ?? []) add(id, "image");
      add(product.videoId, "video");
    }
    console.log(`catalog.json: ${catalog.products?.length ?? 0} product(s) read`);
  } catch {
    console.warn("catalog.json could not be read; using database references only.");
  }

  try {
    const products = await rest(cfg, "products?select=slug,media,video_id", { method: "GET" });
    for (const product of products ?? []) {
      const media = Array.isArray(product.media) ? product.media : [];
      for (const asset of media) add(asset?.publicId, "image");
      add(product.video_id, "video");
    }
    console.log(`products table: ${products?.length ?? 0} row(s) read`);
  } catch (error) {
    console.warn(`products could not be read (${error.message}).`);
  }

  try {
    const categories = await rest(cfg, "categories?select=name,image,subcategories", { method: "GET" });
    for (const category of categories ?? []) {
      add(category.image, "image");
      for (const sub of Array.isArray(category.subcategories) ? category.subcategories : []) add(sub?.image, "image");
    }
    console.log(`categories table: ${categories?.length ?? 0} row(s) read`);
  } catch (error) {
    console.warn(`categories could not be read (${error.message}).`);
  }

  try {
    const content = await rest(cfg, "site_content?select=key,value", { method: "GET" });
    for (const row of content ?? []) walkPublicIds(row.value, (id) => add(id));
    console.log(`site_content table: ${content?.length ?? 0} row(s) read`);
  } catch (error) {
    console.warn(`site_content could not be read (${error.message}).`);
  }

  return assets;
}

async function targetHas(cfg, item) {
  try {
    const response = await fetch(
      `https://res.cloudinary.com/${cfg.cloud}/${item.resourceType}/upload/${item.publicId}`,
      { method: "HEAD", cache: "no-store" }
    );
    return response.status === 200;
  } catch {
    return false;
  }
}

/** Metadata for assets that are already on the target cloud (Admin API). */
async function fetchResourceMeta(cfg, type, ids) {
  const resources = [];
  for (let index = 0; index < ids.length; index += 50) {
    const chunk = ids.slice(index, index + 50);
    const query = chunk.map((id) => `public_ids[]=${encodeURIComponent(id)}`).join("&");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/resources/${type}/upload?${query}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64")}`
      }
    });
    if (!response.ok) throw new Error(`Admin API ${type}: HTTP ${response.status} ${await response.text()}`);
    const payload = await response.json().catch(() => null);
    resources.push(...(payload?.resources ?? []));
  }
  return resources;
}

/** Cloudinary fetches the legacy delivery URL itself; no bytes pass through Node. */
async function uploadFromRemote(item, cfg, sourceCloud) {  const timestamp = Math.floor(Date.now() / 1000);
  const signed = { overwrite: "false", public_id: item.publicId, timestamp };
  const form = new FormData();
  form.append("file", `https://res.cloudinary.com/${sourceCloud}/${item.resourceType}/upload/${item.publicId}`);
  form.append("api_key", cfg.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", signed.public_id);
  form.append("overwrite", signed.overwrite);
  form.append("signature", sign(signed, cfg.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/${item.resourceType}/upload`, {
    method: "POST",
    body: form
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message ?? `HTTP ${response.status}`;
    if (/already exists/i.test(message)) return { skipped: true, public_id: item.publicId, resource_type: item.resourceType };
    throw new Error(message);
  }
  return { skipped: false, ...payload };
}

async function mainRemote(flags, cfg) {
  const sourceCloud = (flags.sourceCloud || process.env.LEGACY_CLOUDINARY_CLOUD_NAME || DEFAULT_SOURCE_CLOUD).trim();
  if (sourceCloud === cfg.cloud) {
    console.error(`Source and target cloud are both ${cfg.cloud}; nothing to copy.`);
    process.exitCode = 1;
    return;
  }

  const assets = await collectRemoteIds(cfg);
  let entries = [...assets.entries()].map(([publicId, resourceType]) => ({ publicId, resourceType }));
  if (flags.only) entries = entries.filter((item) => item.publicId.includes(flags.only));
  entries = entries.slice(0, flags.limit);

  console.log(`${flags.apply ? "APPLY" : "DRY RUN"} · ${entries.length} asset(s) referenced; ${sourceCloud} -> ${cfg.cloud}`);

  let present = 0;
  for (const [index, item] of entries.entries()) {
    item.exists = await targetHas(cfg, item);
    if (item.exists) present += 1;
    console.log(`  [${index + 1}/${entries.length}] ${item.exists ? "present" : "missing"} ${item.resourceType.padEnd(5)} ${item.publicId}`);
  }

  const missing = entries.filter((item) => !item.exists);
  console.log(`${present} already on ${cfg.cloud}, ${missing.length} to copy.`);
  if (!flags.apply) {
    console.log("Nothing was uploaded. Re-run with --remote --apply to copy.");
    return;
  }
  if (missing.length === 0) console.log(`Target cloud is complete; only registry rows may need backfilling.`);

  let known;
  try {
    known = await existingIds(cfg);
  } catch (error) {
    console.warn(`Could not read the media table (${error.message}). Rows will be attempted anyway.`);
    known = new Set();
  }

  let uploaded = 0;
  let failed = 0;
  for (const [index, item] of missing.entries()) {
    const label = `[${index + 1}/${missing.length}]`;
    try {
      const result = await uploadFromRemote(item, cfg, sourceCloud);
      if (!result.skipped && !known.has(item.publicId)) {
        try {
          await recordRow(cfg, item, result);
          known.add(item.publicId);
        } catch (error) {
          console.warn(`${label} warn    ${item.publicId}: uploaded but not recorded (${error.message})`);
        }
      }
      uploaded += 1;
      console.log(`${label} ok      ${item.publicId}`);
    } catch (error) {
      failed += 1;
      console.error(`${label} FAILED  ${item.publicId}: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`copied ${uploaded}, failed ${failed}. Nothing was deleted; public ids are unchanged.`);

  const unrecorded = entries.filter((item) => item.exists && !known.has(item.publicId));
  if (unrecorded.length) {
    console.log(`Recording ${unrecorded.length} asset(s) already present on ${cfg.cloud}...`);
    let recorded = 0;
    let recordFailed = 0;
    for (const type of ["image", "video"]) {
      const ids = unrecorded.filter((item) => item.resourceType === type).map((item) => item.publicId);
      if (ids.length === 0) continue;
      try {
        const resources = await fetchResourceMeta(cfg, type, ids);
        const found = new Set();
        for (const resource of resources) {
          found.add(resource.public_id);
          try {
            await recordRow(cfg, { publicId: resource.public_id, resourceType: type }, resource);
            recorded += 1;
          } catch (error) {
            recordFailed += 1;
            console.warn(`warn    ${resource.public_id}: could not record row (${error.message})`);
          }
        }
        for (const id of ids.filter((id) => !found.has(id))) {
          recordFailed += 1;
          console.warn(`warn    ${id}: not returned by the Admin API`);
        }
      } catch (error) {
        recordFailed += ids.length;
        console.warn(`warn    ${type} metadata unavailable (${error.message})`);
      }
    }
    console.log(`recorded ${recorded} row(s), ${recordFailed} could not be recorded.`);
  }

  if (failed > 0) process.exitCode = 1;
}

/* --------------------------- optional rewire ---------------------------- */

async function rewire(cfg, map) {
  const lookup = (value) => (typeof value === "string" && value.startsWith("/images/") ? map[value] : null);
  let changed = 0;

  const products = await rest(cfg, "products?select=id,slug,media,video_id", { method: "GET" });
  for (const product of products ?? []) {
    const media = Array.isArray(product.media) ? product.media : [];
    let touched = false;
    const nextMedia = media.map((asset) => {
      const replacement = lookup(asset?.publicId);
      if (!replacement) return asset;
      touched = true;
      return { ...asset, publicId: replacement };
    });
    const nextVideo = lookup(product.video_id) ?? product.video_id;
    if (nextVideo !== product.video_id) touched = true;
    if (!touched) continue;
    await rest(cfg, `products?id=eq.${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({ media: nextMedia, video_id: nextVideo })
    });
    changed += 1;
    console.log(`rewired product ${product.slug}`);
  }

  const categories = await rest(cfg, "categories?select=id,name,image,subcategories", { method: "GET" });
  for (const category of categories ?? []) {
    const nextImage = lookup(category.image) ?? category.image;
    const subs = Array.isArray(category.subcategories) ? category.subcategories : [];
    let subsTouched = false;
    const nextSubs = subs.map((sub) => {
      const replacement = lookup(sub?.image);
      if (!replacement) return sub;
      subsTouched = true;
      return { ...sub, image: replacement };
    });
    if (nextImage === category.image && !subsTouched) continue;
    await rest(cfg, `categories?id=eq.${category.id}`, {
      method: "PATCH",
      body: JSON.stringify({ image: nextImage, subcategories: nextSubs })
    });
    changed += 1;
    console.log(`rewired category ${category.name}`);
  }

  const content = await rest(cfg, "site_content?select=key,value", { method: "GET" });
  for (const row of content ?? []) {
    const value = row.value;
    const heroId = value?.hero?.imagePublicId ?? value?.imagePublicId;
    const replacement = lookup(heroId);
    if (!replacement) continue;
    const nextValue = value?.hero ? { ...value, hero: { ...value.hero, imagePublicId: replacement } } : { ...value, imagePublicId: replacement };
    await rest(cfg, `site_content?key=eq.${encodeURIComponent(row.key)}`, {
      method: "PATCH",
      body: JSON.stringify({ value: nextValue })
    });
    changed += 1;
    console.log(`rewired site_content ${row.key}`);
  }

  console.log(`rewire complete: ${changed} record(s) updated (old local files kept)`);
}

/* --------------------------------- main --------------------------------- */

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.help) {
    console.log(
      "Usage: node scripts/migrate-media-to-cloudinary.mjs [--apply] [--rewire] [--limit=N] [--only=products]\n" +
        "       node scripts/migrate-media-to-cloudinary.mjs --remote [--apply] [--source-cloud=name] [--only=slug]"
    );
    return;
  }
  const cfg = config(await loadEnv());
  const missing = ["cloud", "apiKey", "apiSecret", "supabaseUrl", "supabaseKey"].filter((key) => !cfg[key]);
  if (missing.length) {
    console.error(`Missing configuration: ${missing.join(", ")}. Set them in .env.local.`);
    process.exitCode = 1;
    return;
  }

  if (flags.remote) {
    await mainRemote(flags, cfg);
    return;
  }

  let files = await walk(IMAGE_DIR);
  if (flags.only) files = files.filter((file) => file.includes(flags.only));
  const plan = files.map((file) => planFor(file, cfg.base)).slice(0, flags.limit);

  console.log(`${flags.apply ? "APPLY" : "DRY RUN"} · ${plan.length} file(s) under ${path.relative(ROOT, IMAGE_DIR)}`);
  if (!flags.apply) {
    for (const item of plan) console.log(`  ${item.resourceType.padEnd(5)} ${item.localPath} -> ${item.publicId}`);
    console.log("Nothing was uploaded. Re-run with --apply to migrate.");
    return;
  }

  let known;
  try {
    known = await existingIds(cfg);
  } catch (error) {
    console.warn(`Could not read the media table (${error.message}). Rows will be attempted anyway.`);
    known = new Set();
  }
  const map = {};
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  const CONCURRENCY = 16;
  const runItem = async (item, index) => {
    const label = `[${index + 1}/${plan.length}]`;
    try {
      const result = await cloudinaryUpload(item.file, item, cfg);
      const finalId = result.public_id ?? item.publicId;
      if (!result.skipped && !known.has(finalId)) {
        try {
          await recordRow(cfg, item, result);
          known.add(finalId);
        } catch (error) {
          console.warn(`${label} warn    ${item.localPath}: uploaded but not recorded (${error.message})`);
        }
      }
      map[item.localPath] = finalId;
      if (result.skipped) skipped += 1;
      else uploaded += 1;
      console.log(`${label} ok      ${item.localPath} -> ${finalId}${result.skipped ? " (already uploaded)" : ""}`);
    } catch (error) {
      failed += 1;
      console.error(`${label} FAILED  ${item.localPath}: ${error instanceof Error ? error.message : error}`);
    }
  };

  for (let start = 0; start < plan.length; start += CONCURRENCY) {
    const batch = plan.slice(start, start + CONCURRENCY);
    await Promise.all(batch.map((item, offset) => runItem(item, start + offset)));
  }

  await writeFile(MAP_FILE, `${JSON.stringify(map, null, 2)}\n`);
  console.log(`uploaded ${uploaded}, skipped ${skipped}, failed ${failed}. Map: ${path.relative(ROOT, MAP_FILE)}`);
  console.log("Old local files were not deleted. Verify storefront images before removing anything.");

  if (flags.rewire) {
    if (failed > 0) {
      console.error(`Rewire aborted: ${failed} upload(s) failed. Fix them and re-run.`);
      process.exitCode = 1;
      return;
    }
    await rewire(cfg, map);
  } else {
    console.log("References were not changed. Re-run with --rewire once the uploads are verified.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
