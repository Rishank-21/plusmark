// Pulls the live catalogue (prices, stock flags, backend variant ids) from the Store_API
// and writes src/data/live-catalog.json. The UI still builds statically; the numbers it
// renders come from the database at build time, with the demo rate card as fallback.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

function readEnv() {
  const env = { ...process.env };
  if (existsSync(".env.local")) {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  }
  return env;
}

const env = readEnv();
const base = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

if (!base || !key) {
  console.warn("live-catalog: Supabase env missing; keeping the existing catalogue.");
  process.exit(0);
}

async function page(after) {
  const q = new URLSearchParams({ p_limit: "250" });
  if (after) q.set("p_after", after);
  const res = await fetch(`${base}/rest/v1/rpc/store_catalog_export?${q}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json", "Accept-Profile": "api" }
  });
  if (!res.ok) throw new Error(`store_catalog_export ${res.status}`);
  return res.json();
}

try {
  const products = [];
  let after = null;
  let currency = "inr";
  let version = null;
  for (let i = 0; i < 40; i += 1) {
    const chunk = await page(after);
    if (!Array.isArray(chunk.products)) throw new Error("no products array");
    currency = chunk.currency_code ?? currency;
    version = chunk.catalog_version ?? version;
    products.push(...chunk.products);
    if (!chunk.next_cursor) break;
    if (chunk.next_cursor === after) throw new Error("cursor did not advance");
    if (i === 39) throw new Error("catalog exceeds page limit");
    after = chunk.next_cursor;
  }

  const out = {};
  for (const p of products) {
    const variants = (Array.isArray(p.variants) ? p.variants : []).map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku ?? null,
      amount: v.price?.calculated_amount ?? null,
      original: v.price?.original_amount ?? null,
      currency: String(v.price?.currency_code ?? currency).toUpperCase(),
      available: v.manage_inventory === false || v.allow_backorder === true || (v.inventory_quantity ?? 0) > 0,
      stock: typeof v.inventory_quantity === "number" ? v.inventory_quantity : null
    }));
    out[String(p.handle)] = {
      id: p.id, title: p.title, description: p.description ?? null,
      categories: (p.categories ?? []).map((category) => category.handle),
      images: (p.images ?? []).map((image) => image.url).filter(Boolean),
      thumbnail: p.thumbnail ?? null, variants
    };
  }

  const file = {
    fetched_at: new Date().toISOString(),
    catalog_version: version,
    currency: String(currency).toUpperCase(),
    count: products.length,
    products: out
  };
  writeFileSync("src/data/live-catalog.json", `${JSON.stringify(file, null, 1)}\n`);
  console.log(`live-catalog: ${products.length} products from the Store_API`);
} catch (e) {
  console.warn(`live-catalog: ${e instanceof Error ? e.message : e}; keeping the existing file.`);
}
