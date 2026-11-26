// Loads the storefront's real catalogue (src/data/catalog.json, built through src/lib/catalog.ts)
// into the LOCAL database, keeping the exact attribute names, sizes and slugs.
//   node scripts/backend/import-catalog.mjs [--replace]
// --replace first removes products/categories created by an earlier import (never touches orders).
// Prices come from the storefront's demo rate card until you edit them in the admin.
import { build } from "esbuild";
import { mkdirSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import pg from "pg";
import { LOCAL, refuseRemote } from "./_lib.mjs";

refuseRemote();
const replace = process.argv.includes("--replace");
mkdirSync(".work", { recursive: true });
const out = resolve(".work/catalog.bundle.mjs");
await build({
  entryPoints: ["src/lib/catalog.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  alias: { "@": resolve("src") },
  loader: { ".json": "json" },
  logLevel: "error",
});
const cat = await import(pathToFileURL(out).href + "?t=" + Date.now());
rmSync(out, { force: true });

const c = new pg.Client({ connectionString: LOCAL.db });
await c.connect();
await c.query("begin");
try {
  if (replace) {
    await c.query("delete from public.product_relations");
    await c.query("delete from public.products where id not in (select product_id from public.order_items where product_id is not null)");
    await c.query("delete from public.categories where id not in (select category_id from public.products)");
  }

  for (const s of cat.seriesList) {
    await c.query(
      `insert into public.series (id, name, rank, surface, frame, corners, sizes) values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do update set name=excluded.name, rank=excluded.rank, surface=excluded.surface,
         frame=excluded.frame, corners=excluded.corners, sizes=excluded.sizes`,
      [s.id, s.name, s.rank, s.surface, s.frame, s.corners, s.sizes],
    );
  }

  let order = 0;
  for (const cg of cat.categories) {
    await c.query(
      `insert into public.categories (id, parent_id, name, description, subject, image, sort_order, default_gst_rate)
       values ($1,null,$2,$3,$4,$5,$6,12) on conflict (id) do update set name=excluded.name, description=excluded.description,
         subject=excluded.subject, image=excluded.image, sort_order=excluded.sort_order`,
      [cg.id, cg.name, cg.description, cg.subject, cg.image, order++],
    );
    let so = 0;
    for (const sub of cg.subcategories) {
      await c.query(
        `insert into public.categories (id, parent_id, name, image, sort_order) values ($1,$2,$3,$4,$5)
         on conflict (id) do update set parent_id=excluded.parent_id, name=excluded.name, image=excluded.image`,
        [sub.id, cg.id, sub.name, sub.image, so++],
      );
    }
  }

  const usedSkus = new Set();
  const uniqueSku = (base, n) => {
    let s = base;
    for (let i = n; usedSkus.has(s); i++) s = `${base}-${i}`;
    usedSkus.add(s);
    return s;
  };
  let nProducts = 0, nVariants = 0;
  let pOrder = 0;
  for (const p of cat.allProducts) {
    const priced = p.variants.some((v) => v.priceInr !== null);
    const { rows } = await c.query(
      `insert into public.products (slug, name, brand, category_id, series_id, subcategory_ids, surface, frame, corners, magnetic,
         double_sided, board_type, surface_kind, usage, blurb, description, features, specs, customisation, video_id,
         price_mode, gst_rate, hsn_code, minimum_order_quantity, bulk_suggestion_quantity, enquiry_only, needs_data,
         published, featured, sort_order)
       values ($1,$2,'Plusmark',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18,$19,$20,$21,$22,1,$23,$24,$25,$26,$27,$28)
       on conflict (slug) do update set name=excluded.name, category_id=excluded.category_id, series_id=excluded.series_id,
         subcategory_ids=excluded.subcategory_ids, surface=excluded.surface, frame=excluded.frame, corners=excluded.corners,
         magnetic=excluded.magnetic, double_sided=excluded.double_sided, board_type=excluded.board_type,
         surface_kind=excluded.surface_kind, usage=excluded.usage, blurb=excluded.blurb, description=excluded.description,
         features=excluded.features, specs=excluded.specs, customisation=excluded.customisation, video_id=excluded.video_id,
         price_mode=excluded.price_mode, gst_rate=excluded.gst_rate, enquiry_only=excluded.enquiry_only,
         needs_data=excluded.needs_data, published=excluded.published, featured=excluded.featured, sort_order=excluded.sort_order,
         deleted_at=null
       returning id`,
      [p.slug, p.name, p.categoryId, p.seriesId, p.subcategoryIds, p.surface, p.frame, p.corners, p.magnetic, p.doubleSided,
        p.boardType, p.surfaceKind, p.usage, p.blurb, p.description, p.features, JSON.stringify(p.specs), p.customisation,
        p.videoId, priced ? "fixed" : "on_request", p.gstRatePercent, p.hsnCode, p.bulkSuggestionQuantity, p.enquiryOnly,
        p.needsData, p.published, p.featured, pOrder++],
    );
    const pid = rows[0].id;
    nProducts++;

    await c.query("delete from public.product_media where product_id = $1", [pid]);
    let mo = 0;
    for (const m of p.media) {
      await c.query(
        `insert into public.product_media (product_id, public_id, alt, width, height, source, sort_order) values ($1,$2,$3,$4,$5,$6,$7)`,
        [pid, m.publicId, m.alt, m.width, m.height, m.source, mo++],
      );
    }

    // Size is the option axis; packs are a second axis only when the product has pack variants.
    const hasPacks = p.variants.some((v) => (v.packQty ?? 1) > 1);
    const sizes = [...new Map(p.variants.map((v) => [v.size.label, v.size])).values()];
    const { rows: optRows } = await c.query(
      `insert into public.product_options (product_id, name, kind, sort_order) values ($1,'Size','size',0)
       on conflict (product_id, name) do update set kind='size' returning id`, [pid]);
    let vo = 0;
    for (const s of sizes) {
      await c.query(
        `insert into public.product_option_values (option_id, value, width_cm, height_cm, sort_order) values ($1,$2,$3,$4,$5)
         on conflict (option_id, value) do update set width_cm=excluded.width_cm, height_cm=excluded.height_cm`,
        [optRows[0].id, s.label, s.widthCm, s.heightCm, vo++],
      );
    }
    if (hasPacks) {
      const { rows: o2 } = await c.query(
        `insert into public.product_options (product_id, name, kind, sort_order) values ($1,'Pack','custom',1)
         on conflict (product_id, name) do update set kind='custom' returning id`, [pid]);
      await c.query(`insert into public.product_option_values (option_id, value, sort_order) values ($1,'Single',0) on conflict do nothing`, [o2[0].id]);
      const packs = [...new Set(p.variants.map((v) => v.packQty ?? 1).filter((q) => q > 1))];
      let po = 1;
      for (const q of packs) {
        await c.query(`insert into public.product_option_values (option_id, value, sort_order) values ($1,$2,$3) on conflict do nothing`,
          [o2[0].id, `Pack of ${q}`, po++]);
      }
    }

    let so = 0;
    const hash = [...p.slug].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7).toString(36).toUpperCase().slice(0, 4);
    for (const v of p.variants) {
      const pack = v.packQty ?? 1;
      const options = hasPacks ? { Size: v.size.label, Pack: pack > 1 ? `Pack of ${pack}` : "Single" } : { Size: v.size.label };
      const title = hasPacks ? `${v.size.label} / ${options.Pack}` : v.size.label;
      await c.query(
        `insert into public.product_variants (product_id, sku, external_ref, title, options, price_mode, price_inr, compare_at_inr, stock,
           track_inventory, allow_backorder, available, lead_time_days, pack_qty, sort_order)
         values ($1,$2,$12,$3,$4::jsonb,$5,$6,$7,0,false,true,$8,$9,$10,$11)
         on conflict (external_ref) do update set title=excluded.title, options=excluded.options, price_mode=excluded.price_mode,
           price_inr=excluded.price_inr, available=excluded.available, pack_qty=excluded.pack_qty, sort_order=excluded.sort_order`,
        [pid, uniqueSku(`${v.sku}-${hash}`, so), title, JSON.stringify(options), v.priceInr === null ? "on_request" : "fixed", v.priceInr, v.compareAtInr,
          v.available, v.leadTimeDays, pack, so++, v.id],
      );
      nVariants++;
    }
  }
  await c.query("commit");
  console.log(`Imported ${cat.categories.length} categories, ${nProducts} products, ${nVariants} variants.`);
  console.log("Make-to-order products are imported with stock tracking off and backorder on, so they are always orderable.");
} catch (e) {
  await c.query("rollback");
  throw e;
} finally {
  await c.end();
}
