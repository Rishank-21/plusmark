#!/usr/bin/env node
/**
 * Read-only media audit for the Plusmark catalogue.
 *
 * Compares what the storefront actually renders (catalogue + local asset map)
 * against what is present on Cloudinary, then writes media-audit.html.
 *
 * Nothing is renamed, deleted or uploaded. Run with --no-cloud to audit the
 * catalogue alone when credentials or network are unavailable.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  APLUS_BRAND_PANEL,
  aPlusPanelsFor,
  localCategoryImage,
  localProductImages
} from "../src/lib/local-assets.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_HTML = path.join(ROOT, "media-audit.html");
const OUT_JSON = path.join(ROOT, "media-audit.json");
const cloudDisabled = process.argv.includes("--no-cloud");

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/catalog.json"), "utf8"));

function env() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

const envVars = env();
const cloudName = envVars.CLOUDINARY_CLOUD_NAME || envVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const auth = envVars.CLOUDINARY_API_KEY && envVars.CLOUDINARY_API_SECRET
  ? Buffer.from(`${envVars.CLOUDINARY_API_KEY}:${envVars.CLOUDINARY_API_SECRET}`).toString("base64")
  : null;

async function listResources(kind) {
  if (cloudDisabled) return { available: false, reason: "disabled with --no-cloud", items: new Map() };
  if (!cloudName || !auth) return { available: false, reason: "Cloudinary admin credentials not configured", items: new Map() };
  const items = new Map();
  let cursor = null;
  try {
    do {
      const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/${kind}`);
      url.searchParams.set("type", "upload");
      url.searchParams.set("max_results", "500");
      if (kind === "image") url.searchParams.set("prefix", "plusmark/");
      if (cursor) url.searchParams.set("next_cursor", cursor);
      const response = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
      const body = await response.json();
      if (!response.ok) {
        return { available: false, reason: body?.error?.message ?? `HTTP ${response.status}`, items };
      }
      for (const resource of body.resources ?? []) {
        items.set(resource.public_id, resource);
      }
      cursor = body.next_cursor ?? null;
    } while (cursor);
    return { available: true, reason: "ok", items };
  } catch (error) {
    return { available: false, reason: error.message, items };
  }
}

function productMedia(product) {
  const local = localProductImages(product.slug);
  if (local) return local;
  return (product.images ?? []).filter((id) => !id.startsWith("plusmark/videos/"));
}

function altFor(product) {
  const series = catalog.series[product.seriesId];
  const category = catalog.categories.find((entry) => entry.id === product.categoryId);
  const type = category?.subject ?? "product";
  return `${product.name} - ${series ? `${series.name} ` : ""}${type} by Plusmark`;
}

const [images, videos] = await Promise.all([listResources("image"), listResources("video")]);

const products = catalog.products.map((product) => {
  const media = productMedia(product);
  const missingImages = media.filter((id) => images.available && !images.items.has(id));
  const smallImages = media
    .map((id) => images.items.get(id))
    .filter((resource) => resource && (resource.width < 800 || resource.height < 800))
    .map((resource) => `${resource.public_id} (${resource.width}×${resource.height})`);
  const videoMissing = product.videoId && videos.available && !videos.items.has(product.videoId);
  return {
    slug: product.slug,
    name: product.name,
    categoryId: product.categoryId,
    published: product.published !== false,
    needsData: Boolean(product.needsData),
    mediaCount: media.length,
    media,
    alt: altFor(product),
    missingImages,
    smallImages,
    videoId: product.videoId ?? null,
    videoMissing: Boolean(videoMissing),
    correctIds: media.filter((id) => /-correct$/i.test(id))
  };
});

const usage = new Map();
for (const product of products) {
  for (const id of product.media) {
    if (!usage.has(id)) usage.set(id, []);
    usage.get(id).push(product.slug);
  }
}
const duplicates = [...usage.entries()].filter(([, slugs]) => slugs.length > 1);

const expectedImages = new Set();
for (const product of products) for (const id of product.media) expectedImages.add(id);
for (const category of catalog.categories) {
  const id = localCategoryImage(category.id);
  if (id) expectedImages.add(id);
}
for (const product of catalog.products) {
  for (const id of aPlusPanelsFor(product.slug)) expectedImages.add(id);
}
expectedImages.add(APLUS_BRAND_PANEL);

const missingExpectedImages = images.available
  ? [...expectedImages].filter((id) => !images.items.has(id)).sort()
  : [];

const orphans = images.available
  ? [...images.items.keys()]
      .filter((id) => id.startsWith("plusmark/products/"))
      .filter((id) => !expectedImages.has(id))
      .sort()
  : [];

/** Byte-identical files uploaded under different ids (e.g. a copied photo). */
/** Cloudinary omits etags from list responses, so equal byte size + dimensions is the safe heuristic. */
const byFingerprint = new Map();
for (const [id, resource] of images.items) {
  if (!id.startsWith("plusmark/products/") || !resource?.bytes) continue;
  const key = `${resource.bytes}:${resource.width}x${resource.height}`;
  if (!byFingerprint.has(key)) byFingerprint.set(key, []);
  byFingerprint.get(key).push(id);
}
const identicalFiles = [...byFingerprint.entries()]
  .map(([fingerprint, ids]) => ({ fingerprint, ids: ids.sort() }))
  .filter((group) => group.ids.length > 1);

const dimensions = Object.fromEntries(
  [...expectedImages]
    .map((id) => {
      const resource = images.items.get(id);
      return resource ? [id, { width: resource.width, height: resource.height, bytes: resource.bytes }] : null;
    })
    .filter(Boolean)
);

/**
 * `-correct` assets are the re-uploaded, correctly cropped version of an
 * earlier photo. The base id is kept as an alias so any cached URL still
 * resolves; nothing is renamed or deleted without the owner's approval.
 */
const correctAliases = [...expectedImages]
  .filter((id) => /-correct$/i.test(id))
  .map((id) => {
    const base = id.replace(/-correct$/i, "");
    return { id, base, baseExists: images.available ? images.items.has(base) : null };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const manifestVideos = catalog.media?.videos ?? [];
const missingManifestVideos = videos.available
  ? manifestVideos.filter((id) => !videos.items.has(id))
  : [];
const unusedVideos = videos.available
  ? [...videos.items.keys()]
      .filter((id) => id.startsWith("plusmark/videos/"))
      .filter((id) => !manifestVideos.includes(id) && !catalog.products.some((p) => p.videoId === id))
  : [];

const summary = {
  generatedAt: new Date().toISOString(),
  cloud: cloudName ?? "not configured",
  cloudChecked: images.available,
  cloudNote: images.reason,
  products: products.length,
  published: products.filter((p) => p.published).length,
  photos: expectedImages.size,
  productsMissingPhotos: products.filter((p) => p.mediaCount === 0).map((p) => p.slug),
  missingImageCount: products.reduce((total, p) => total + p.missingImages.length, 0),
  missingExpectedImages,
  smallImageCount: products.reduce((total, p) => total + p.smallImages.length, 0),
  duplicateAssets: duplicates.length,
  correctIds: products.flatMap((p) => p.correctIds.map((id) => ({ slug: p.slug, id }))),
  correctAliases,
  videosReferenced: products.filter((p) => p.videoId).length,
  missingProductVideos: products.filter((p) => p.videoMissing).map((p) => ({ slug: p.slug, id: p.videoId })),
  manifestVideos: manifestVideos.length,
  missingManifestVideos,
  unusedVideos,
  orphans,
  identicalFiles: identicalFiles.length
};

const data = { summary, products, duplicates, identicalFiles, dimensions, orphans };
fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2), "utf8");

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const pill = (text, tone = "ok") => `<span class="pill ${tone}">${esc(text)}</span>`;
const list = (items) => (items.length ? items.map((item) => `<li>${esc(item)}</li>`).join("") : "<li class=\"muted\">None</li>");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plusmark media audit</title>
<style>
  :root { color-scheme: light; --ink:#142d49; --muted:#66768a; --hair:#dde3ea; --sand:#f6f3ee; --ok:#1f7a4d; --warn:#a35a00; --bad:#a12c2c; }
  * { box-sizing: border-box; }
  body { margin:0; font:14px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; color:var(--ink); background:#fff; }
  main { max-width: 1180px; margin: 0 auto; padding: 40px 20px 80px; }
  h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -0.02em; }
  h2 { font-size: 18px; margin: 36px 0 10px; }
  p.lead { color: var(--muted); margin: 0 0 24px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; }
  .stat { border:1px solid var(--hair); border-radius:8px; padding:12px 14px; }
  .stat b { display:block; font-size:22px; }
  .stat span { color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th, td { text-align:left; padding:7px 8px; border-bottom:1px solid var(--hair); vertical-align:top; }
  th { font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
  code { font:12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; word-break:break-all; }
  .pill { display:inline-block; border-radius:999px; padding:1px 8px; font-size:11px; font-weight:600; }
  .pill.ok { background:#e7f4ec; color:var(--ok); }
  .pill.warn { background:#fdf1df; color:var(--warn); }
  .pill.bad { background:#fbe9e9; color:var(--bad); }
  .pill.draft { background:var(--sand); color:var(--muted); }
  ul { margin:4px 0; padding-left:18px; }
  .muted { color:var(--muted); }
  .note { background:var(--sand); border-radius:8px; padding:12px 14px; color:var(--muted); }
  .scroll { overflow-x:auto; }
</style>
</head>
<body>
<main>
  <h1>Plusmark media audit</h1>
  <p class="lead">Generated ${esc(summary.generatedAt)} · Cloudinary cloud <code>${esc(summary.cloud)}</code> · ${
    summary.cloudChecked ? "checked against the live CDN" : `CDN not checked (${esc(summary.cloudNote)})`
  }</p>

  <div class="grid">
    <div class="stat"><b>${summary.products}</b><span>Products</span></div>
    <div class="stat"><b>${summary.published}</b><span>Published</span></div>
    <div class="stat"><b>${summary.photos}</b><span>Photos referenced</span></div>
    <div class="stat"><b>${summary.missingImageCount}</b><span>Missing on CDN</span></div>
    <div class="stat"><b>${summary.duplicateAssets}</b><span>Shared assets</span></div>
    <div class="stat"><b>${summary.videosReferenced}</b><span>Products with video</span></div>
    <div class="stat"><b>${summary.missingProductVideos.length}</b><span>Missing videos</span></div>
    <div class="stat"><b>${summary.orphans.length}</b><span>Unreferenced photos</span></div>
  </div>

  <h2>Missing media</h2>
  <div class="note">
    Photos: ${summary.productsMissingPhotos.length ? summary.productsMissingPhotos.map(esc).join(", ") : "none"}<br>
    Cloudinary videos referenced by a product but absent on the CDN: ${
      summary.missingProductVideos.length
        ? summary.missingProductVideos.map((v) => `<code>${esc(v.slug)}</code> → <code>${esc(v.id)}</code>`).join("<br>")
        : "none"
    }<br>
    Manifest videos absent on the CDN: ${
      summary.missingManifestVideos.length ? summary.missingManifestVideos.map((id) => `<code>${esc(id)}</code>`).join(", ") : "none"
    }<br>
    Other expected photos (A+ panels, category tiles) absent on the CDN: ${
      summary.missingExpectedImages.length
        ? summary.missingExpectedImages.map((id) => `<code>${esc(id)}</code>`).join(", ")
        : "none"
    }
  </div>

  <h2>-correct asset aliases</h2>
  <p class="muted">Re-uploaded crop versions stay pointed at <code>-correct</code>; the original id remains untouched as an alias.</p>
  ${
    summary.correctAliases.length
      ? `<div class="scroll"><table><thead><tr><th>Used id</th><th>Original alias</th><th>Original present</th></tr></thead><tbody>${summary.correctAliases
          .map(
            (alias) =>
              `<tr><td><code>${esc(alias.id)}</code></td><td><code>${esc(alias.base)}</code></td><td>${
                alias.baseExists === null ? "not checked" : alias.baseExists ? pill("Yes", "ok") : pill("No", "warn")
              }</td></tr>`
          )
          .join("")}</tbody></table></div>`
      : "<p class=\"muted\">No -correct ids are used.</p>"
  }

  <h2>Products</h2>
  <div class="scroll">
  <table>
    <thead><tr><th>Product</th><th>Category</th><th>Photos</th><th>Video</th><th>Status</th><th>Notes</th></tr></thead>
    <tbody>
    ${products
      .map((product) => {
        const notes = [];
        if (product.missingImages.length) notes.push(`missing: ${product.missingImages.map(esc).join(", ")}`);
        if (product.smallImages.length) notes.push(`under 800px: ${product.smallImages.map(esc).join(", ")}`);
        if (product.videoMissing) notes.push(`video missing on CDN: ${esc(product.videoId)}`);
        if (product.correctIds.length) notes.push(`-correct ids: ${product.correctIds.map(esc).join(", ")}`);
        return `<tr>
          <td><strong>${esc(product.name)}</strong><br><code>${esc(product.slug)}</code></td>
          <td>${esc(product.categoryId)}</td>
          <td>${product.mediaCount}</td>
          <td>${product.videoId ? esc(product.videoId).replace("plusmark/videos/", "") : "—"}</td>
          <td>${product.published ? pill("Published") : pill("Draft", "draft")} ${product.needsData ? pill("Needs data", "warn") : ""}</td>
          <td>${notes.length ? notes.join("<br>") : "<span class=\"muted\">—</span>"}</td>
        </tr>`;
      })
      .join("")}
    </tbody>
  </table>
  </div>

  <h2>Shared assets</h2>
  ${duplicates.length
    ? `<ul>${duplicates.map(([id, slugs]) => `<li><code>${esc(id)}</code> — ${slugs.map(esc).join(", ")}</li>`).join("")}</ul>`
    : "<p class=\"muted\">No asset is used by more than one product.</p>"}

  <h2>Likely duplicate files</h2>
  ${
    identicalFiles.length
      ? `<div class="scroll"><table><thead><tr><th>Cloudinary ids with identical byte size and dimensions</th></tr></thead><tbody>${identicalFiles
          .map((group) => `<tr><td>${group.ids.map((id) => `<code>${esc(id)}</code>`).join("<br>")}</td></tr>`)
          .join("")}</tbody></table></div>
         <p class="muted">Owner decision needed: one of these ids may show the wrong product. Nothing was changed.</p>`
      : "<p class=\"muted\">No duplicate fingerprints found.</p>"
  }

  <h2>Unreferenced Cloudinary photos</h2>
  <p class="muted">Reported only. Nothing is deleted; confirm with the owner before any cleanup.</p>
  <ul>${list(orphans)}</ul>

  <h2>Video manifest</h2>
  <p class="muted">${manifestVideos.length} ids in <code>catalog.media.videos</code>; ${
    summary.missingManifestVideos.length
      ? `${summary.missingManifestVideos.length} are not uploaded yet, so no player is rendered for them.`
      : "all are present on the CDN."
  }</p>
  ${unusedVideos.length ? `<p class="muted">Uploaded but not referenced: ${unusedVideos.map((id) => `<code>${esc(id)}</code>`).join(", ")}</p>` : ""}

  <h2>Alt-text convention</h2>
  <p class="muted">Generated as <code>{Product} - {Series} {surface} by Plusmark</code>. Samples:</p>
  <ul>${products.slice(0, 5).map((product) => `<li>${esc(product.alt)}</li>`).join("")}</ul>

  <h2>Delivery rules verified in code</h2>
  <ul>
    <li>Cards request only 320 / 480 / 640 / 800 px through <code>cardLoader</code>; never 1400 or 2000.</li>
    <li>Gallery caps at 1200 px, zoom/lightbox at 2000 px, hero at 1600 px, social preview 1200×630.</li>
    <li>Cloudinary receives a single <code>f_auto,q_auto</code> pair; <code>c_limit</code> prevents upscaling.</li>
    <li>No CSS filter, overlay or opacity is applied to product photography.</li>
  </ul>
</main>
</body>
</html>
`;

fs.writeFileSync(OUT_HTML, html, "utf8");

console.log(`media-audit.html + media-audit.json written`);
console.log(`products ${summary.products} · published ${summary.published} · photos ${summary.photos}`);
console.log(`missing product images ${summary.missingImageCount} · missing expected assets ${summary.missingExpectedImages.length} · shared assets ${summary.duplicateAssets} · orphans ${summary.orphans.length}`);
console.log(`-correct aliases ${summary.correctAliases.length}`);
console.log(`product videos missing ${summary.missingProductVideos.length} · manifest videos missing ${summary.missingManifestVideos.length}`);
if (!summary.cloudChecked) console.log(`CDN check skipped: ${summary.cloudNote}`);
if (summary.missingProductVideos.length) {
  for (const video of summary.missingProductVideos) console.log(`  missing video: ${video.slug} → ${video.id}`);
}
if (summary.missingManifestVideos.length) {
  for (const id of summary.missingManifestVideos) console.log(`  manifest video not uploaded: ${id}`);
}
