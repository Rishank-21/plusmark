// Task 23.2: legacy catalog -> Medusa catalog (Requirements 18.1, 18.2).
//
// Source (legacy public tables): categories (with jsonb subcategories), products, product_variants, media.
// Target: medusa.product_category (tree + mpath), product (+ category links, default Sales_Channel), product_option "Size"
// with values, product_variant (+ option links), INR Price_Sets, inventory (item, level, link) at the default
// Stock_Location, medusa.image + product thumbnail, and ext.product_attribute.
//
// Amounts: legacy price_inr is numeric(12,2) in rupees. Medusa stores the currency's major unit, so the amount is
// copied unchanged as an exact numeric (never through a JS number). Raw_Amount_Field is built in SQL from the same text.
//
// Idempotency: every created row is recorded in ext.migration_map (entity, legacy_id) -> new id. A re-run finds the
// mapped row and updates it; handles of existing rows are kept. Each row runs in a savepoint: a row that cannot be
// mapped is rolled back alone and reported in `reasons` (never dropped silently).
// Runs inside the caller's transaction (dry_run rolls back). Ends by draining internal.catalog_rebuild_dirty.
export const name = "catalog";

const slug = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 190);
const snake = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^([0-9])/, "a_$1").slice(0, 63);
const text = (v) => (v == null ? "" : String(v).trim());

export async function run(ctx) {
  const { source, target: t, log } = ctx;
  const counts = {};
  const reasons = [];
  const bump = (k, n = 1) => { counts[k] = (counts[k] ?? 0) + n; };
  const skip = (kind, id, why) => { bump(`${kind}_skipped`); reasons.push(`${kind} ${id}: ${why}`); };

  let sp = 0;
  // Runs fn in a savepoint; a database error rolls back only this row and is reported as a skip.
  async function row(kind, id, fn) {
    const s = `cat_row_${++sp}`;
    await t.query(`savepoint ${s}`);
    try {
      const r = await fn();
      await t.query(`release savepoint ${s}`);
      return r;
    } catch (e) {
      await t.query(`rollback to savepoint ${s}`);
      await t.query(`release savepoint ${s}`);
      skip(kind, id, `database error: ${String(e.message).split("\n")[0]}`);
      return undefined;
    }
  }

  const maps = {};
  async function loadMap(entity) {
    const r = await t.query("select legacy_id, new_id from ext.migration_map where entity = $1", [entity]);
    maps[entity] = new Map(r.rows.map((x) => [x.legacy_id, x.new_id]));
  }
  const mapped = (entity, legacyId) => maps[entity].get(String(legacyId));
  async function setMap(entity, legacyId, newId) {
    maps[entity].set(String(legacyId), newId);
    await t.query(
      `insert into ext.migration_map (entity, legacy_id, new_id) values ($1, $2, $3)
       on conflict (entity, legacy_id) do update set new_id = excluded.new_id`, [entity, String(legacyId), newId]);
  }
  const live = async (table, id) => !!id && (await t.query(`select 1 from medusa.${table} where id = $1 and deleted_at is null`, [id])).rowCount > 0;
  const newId = async (table) => (await t.query("select internal.generate_id_for($1) id", [table])).rows[0].id;
  const rawId = async (prefix) => (await t.query("select internal.generate_id($1) id", [prefix])).rows[0].id;

  async function freeHandle(table, base, ownId, label) {
    let h = base, i = 1;
    while ((await t.query(`select 1 from medusa.${table} where handle = $1 and deleted_at is null and id <> $2`, [h, ownId ?? ""])).rowCount) {
      h = `${base}-${++i}`;
    }
    if (h !== base) reasons.push(`note ${label}: handle "${base}" was taken, used "${h}"`);
    return h;
  }

  for (const e of ["category", "subcategory", "product", "product_option", "product_option_value", "variant", "price_set",
    "inventory_item", "image", "stock_location"]) await loadMap(e);

  // ------------------------------------------------------------------ categories
  const cats = (await source.query("select id, name, description, subject, image, subcategories, sort_order from public.categories order by sort_order, id")).rows;
  bump("categories_read", cats.length);
  const catId = new Map();      // legacy category id -> medusa id
  const subId = new Map();      // `${cat}/${sub}` -> medusa id

  async function upsertCategory({ entity, legacyId, name: nm, description, rank, parent, parentMpath, handleBase, metadata, kind }) {
    let id = mapped(entity, legacyId);
    if (!(await live("product_category", id))) id = null;
    if (id) {
      await t.query(
        `update medusa.product_category set name = $2, description = $3, rank = $4, parent_category_id = $5, mpath = $6,
                metadata = $7::jsonb, is_active = true, updated_at = now() where id = $1`,
        [id, nm, description, rank, parent, `${parentMpath}${id}.`, JSON.stringify(metadata)]);
      bump(`${kind}_updated`);
    } else {
      id = await newId("product_category");
      const handle = await freeHandle("product_category", handleBase, id, `${kind} ${legacyId}`);
      await t.query(
        `insert into medusa.product_category (id, name, description, handle, mpath, is_active, rank, parent_category_id, metadata)
         values ($1, $2, $3, $4, $5, true, $6, $7, $8::jsonb)`,
        [id, nm, description, handle, `${parentMpath}${id}.`, rank, parent, JSON.stringify(metadata)]);
      bump(`${kind}_created`);
    }
    await setMap(entity, legacyId, id);
    return id;
  }

  for (const c of cats) {
    const nm = text(c.name);
    const base = slug(c.id) || slug(nm);
    if (!text(c.id) || !nm || !base) { skip("category", c.id, "missing id or name"); continue; }
    const id = await row("category", c.id, () => upsertCategory({
      entity: "category", legacyId: c.id, name: nm, description: text(c.description), rank: c.sort_order ?? 0, parent: null,
      parentMpath: "", handleBase: base, metadata: { legacy_id: c.id, subject: c.subject ?? "", image: c.image ?? null }, kind: "category" }));
    if (!id) continue;
    catId.set(c.id, id);
    const subs = Array.isArray(c.subcategories) ? c.subcategories : [];
    for (const [i, s] of subs.entries()) {
      const sid = text(s?.id ?? s?.slug);
      const snm = text(s?.name ?? s?.label ?? s?.title);
      const sbase = slug(`${c.id}-${sid || snm}`);
      const key = `${c.id}/${sid || slug(snm)}`;
      if (!(sid || snm) || !snm || !sbase) { skip("subcategory", `${c.id}[${i}]`, "missing id or name"); continue; }
      const sub = await row("subcategory", key, () => upsertCategory({
        entity: "subcategory", legacyId: key, name: snm, description: text(s.description), rank: i, parent: id,
        parentMpath: `${id}.`, handleBase: sbase, metadata: { legacy_id: key, legacy_category_id: c.id }, kind: "subcategory" }));
      if (sub) subId.set(key, sub);
    }
  }

  // ------------------------------------------------------------------ media registry and defaults
  const mediaUrl = new Map();
  if ((await source.query("select to_regclass('public.media') r")).rows[0].r) {
    for (const m of (await source.query("select public_id, url from public.media")).rows) mediaUrl.set(m.public_id, m.url);
  }
  const defaultChannel = (await t.query("select internal.setting_text('store.default_sales_channel_id') v")).rows[0].v || null;
  let locationId = null;
  async function stockLocation() {
    if (locationId) return locationId;
    let id = mapped("stock_location", "default");
    if (!(await live("stock_location", id))) {
      id = (await t.query("select id from medusa.stock_location where deleted_at is null order by created_at, id limit 1")).rows[0]?.id;
      if (!id) {
        id = await newId("stock_location");
        await t.query("insert into medusa.stock_location (id, name) values ($1, 'Plusmark warehouse')", [id]);
        bump("stock_locations_created");
      }
      await setMap("stock_location", "default", id);
    }
    if (defaultChannel && (await live("sales_channel", defaultChannel))) {
      await t.query(
        `insert into medusa.sales_channel_stock_location (id, sales_channel_id, stock_location_id)
         select $3, $1, $2 where not exists (select 1 from medusa.sales_channel_stock_location
                                              where sales_channel_id = $1 and stock_location_id = $2 and deleted_at is null)`,
        [defaultChannel, id, await rawId("scloc")]);
    }
    return (locationId = id);
  }

  // ------------------------------------------------------------------ products
  const prods = (await source.query("select * from public.products order by created_at, id")).rows;
  const vars = (await source.query("select v.*, v.price_inr::text as price_text from public.product_variants v order by v.product_id, v.sort_order, v.created_at, v.id")).rows;
  bump("products_read", prods.length);
  bump("variants_read", vars.length);
  const varsByProduct = new Map();
  for (const v of vars) (varsByProduct.get(v.product_id) ?? varsByProduct.set(v.product_id, []).get(v.product_id)).push(v);
  const knownProducts = new Set(prods.map((p) => p.id));
  for (const v of vars) if (!knownProducts.has(v.product_id)) skip("variant", v.id, "legacy product not found");

  for (const p of prods) {
    const base = slug(p.slug) || slug(p.name);
    if (!base || !text(p.name)) { skip("product", p.id, "missing slug or name"); continue; }
    const pid = await row("product", p.id, async () => {
      const images = [];
      for (const m of Array.isArray(p.media) ? p.media : []) {
        const publicId = text(m?.publicId ?? m?.public_id);
        const url = text(m?.url) || mediaUrl.get(publicId);
        if (!url) { skip("image", `${p.id}/${publicId || "?"}`, "no URL for the media entry (not in public.media)"); continue; }
        images.push({ key: `${p.id}/${publicId || url}`, url, alt: m?.alt ?? null, w: m?.width ?? null, h: m?.height ?? null });
      }
      const metadata = {
        legacy_id: p.id, series_id: p.series_id, surface: p.surface, frame: p.frame, corners: p.corners, magnetic: p.magnetic,
        double_sided: p.double_sided, usage: p.usage, blurb: p.blurb, features: p.features, video_id: p.video_id,
        price_mode: p.price_mode, gst_rate_percent: p.gst_rate_percent, hsn_code: p.hsn_code,
        bulk_suggestion_quantity: p.bulk_suggestion_quantity, featured: p.featured, board_type: p.board_type,
        surface_kind: p.surface_kind, enquiry_only: p.enquiry_only, needs_data: p.needs_data, customisation: p.customisation,
      };
      let id = mapped("product", p.id);
      if (!(await live("product", id))) id = null;
      const status = p.published ? "published" : "draft";
      const thumb = images[0]?.url ?? null;
      if (id) {
        await t.query(
          `update medusa.product set title = $2, subtitle = $3, description = $4, status = $5, thumbnail = $6, metadata = $7::jsonb,
                  updated_at = now() where id = $1`,
          [id, p.name, text(p.blurb) || null, text(p.description) || null, status, thumb, JSON.stringify(metadata)]);
        bump("products_updated");
      } else {
        id = await newId("product");
        const handle = await freeHandle("product", base, id, `product ${p.id}`);
        await t.query(
          `insert into medusa.product (id, title, handle, subtitle, description, status, thumbnail, metadata)
           values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
          [id, p.name, handle, text(p.blurb) || null, text(p.description) || null, status, thumb, JSON.stringify(metadata)]);
        bump("products_created");
      }
      await setMap("product", p.id, id);

      // categories: the category and each known subcategory
      const wanted = [];
      if (catId.has(p.category_id)) wanted.push(catId.get(p.category_id));
      else reasons.push(`note product ${p.id}: category ${p.category_id} was not mapped, product left without that category`);
      for (const sc of p.subcategory_ids ?? []) {
        const sid = subId.get(`${p.category_id}/${sc}`);
        if (sid) wanted.push(sid); else reasons.push(`note product ${p.id}: subcategory ${sc} was not mapped`);
      }
      await t.query("delete from medusa.product_category_product where product_id = $1 and product_category_id <> all($2::text[])", [id, wanted]);
      await t.query(
        `insert into medusa.product_category_product (product_id, product_category_id)
         select $1, c from unnest($2::text[]) c
          where not exists (select 1 from medusa.product_category_product where product_id = $1 and product_category_id = c)`, [id, wanted]);

      if (defaultChannel && (await live("sales_channel", defaultChannel))) {
        await t.query(
          `insert into medusa.product_sales_channel (id, product_id, sales_channel_id)
           select $3, $1, $2 where not exists (select 1 from medusa.product_sales_channel
                                                where product_id = $1 and sales_channel_id = $2 and deleted_at is null)`,
          [id, defaultChannel, await rawId("prodsc")]);
      }

      // images
      const keep = [];
      for (const [rank, im] of images.entries()) {
        let iid = mapped("image", im.key);
        if (!(await live("image", iid))) iid = null;
        if (iid) {
          await t.query("update medusa.image set url = $2, rank = $3, product_id = $4, metadata = $5::jsonb, updated_at = now() where id = $1",
            [iid, im.url, rank, id, JSON.stringify({ alt: im.alt, width: im.w, height: im.h })]);
        } else {
          iid = await rawId("img");
          await t.query("insert into medusa.image (id, url, rank, product_id, metadata) values ($1, $2, $3, $4, $5::jsonb)",
            [iid, im.url, rank, id, JSON.stringify({ alt: im.alt, width: im.w, height: im.h })]);
          bump("images_created");
        }
        await setMap("image", im.key, iid);
        keep.push(iid);
      }
      await t.query("update medusa.image set deleted_at = now() where product_id = $1 and deleted_at is null and id <> all($2::text[])", [id, keep]);
      bump("images_mapped", keep.length);

      await mapAttributes(id, p);
      return id;
    });
    if (!pid) continue;
    await mapVariants(pid, p, varsByProduct.get(p.id) ?? []);
  }

  // ------------------------------------------------------------------ attributes
  async function mapAttributes(productId, p) {
    const attrs = new Map();
    const put = (k, v, filterable = false) => {
      const key = snake(k), value = text(typeof v === "object" && v !== null ? JSON.stringify(v) : v);
      if (!key || !value) return;
      if (value.length > 1000) { skip("attribute", `${p.id}/${key}`, "value longer than 1000 characters"); return; }
      if (!attrs.has(key)) attrs.set(key, { value, filterable });
    };
    put("surface", p.surface, true); put("frame", p.frame, true); put("corners", p.corners, true);
    put("board_type", p.board_type, true); put("surface_kind", p.surface_kind, true);
    put("magnetic", p.magnetic, true); put("double_sided", p.double_sided, true);
    put("customisation", p.customisation);
    for (const s of Array.isArray(p.specs) ? p.specs : []) {
      const label = s?.label ?? s?.name ?? s?.key, value = s?.value ?? s?.text;
      if (label == null || value == null) { skip("attribute", `${p.id}`, "spec entry without label and value"); continue; }
      put(`spec_${label}`, value);
    }
    let rank = 0;
    for (const [key, a] of attrs) {
      await t.query(
        `insert into ext.product_attribute (product_id, key, value, rank, filterable) values ($1, $2, $3, $4, $5)
         on conflict (product_id, key) do update set value = excluded.value, rank = excluded.rank, filterable = excluded.filterable`,
        [productId, key, a.value, rank++, a.filterable]);
    }
    bump("attributes_mapped", attrs.size);
  }

  // ------------------------------------------------------------------ options, variants, prices, inventory
  async function mapVariants(productId, p, list) {
    if (!list.length) return;
    // one "Size" option per product; values are the distinct size labels
    let oid = mapped("product_option", p.id);
    if (!(await live("product_option", oid))) oid = null;
    if (!oid) {
      oid = await newId("product_option");
      await t.query("insert into medusa.product_option (id, title, is_exclusive) values ($1, 'Size', true)", [oid]);
      await t.query("insert into medusa.product_product_option (id, product_id, product_option_id) values ($1, $2, $3)",
        [await newId("product_product_option"), productId, oid]);
      await setMap("product_option", p.id, oid);
    }
    const seen = new Set();
    for (const [rank, v] of list.entries()) {
      const size = text(v.size_label);
      if (!size) { skip("variant", v.id, "empty size label"); continue; }
      if (seen.has(size.toLowerCase())) { skip("variant", v.id, `duplicate size label "${size}" in product ${p.id}`); continue; }
      seen.add(size.toLowerCase());
      await row("variant", v.id, async () => {
        const manage = v.track_inventory === true;
        // option value
        const vkey = `${p.id}/${size}`;
        let ovid = mapped("product_option_value", vkey);
        if (!(await live("product_option_value", ovid))) ovid = null;
        if (!ovid) {
          ovid = (await t.query("select id from medusa.product_option_value where option_id = $1 and value = $2 and deleted_at is null", [oid, size])).rows[0]?.id;
        }
        if (!ovid) {
          ovid = await newId("product_option_value");
          await t.query("insert into medusa.product_option_value (id, value, option_id, rank) values ($1, $2, $3, $4)", [ovid, size, oid, rank]);
        } else {
          await t.query("update medusa.product_option_value set rank = $2, updated_at = now() where id = $1", [ovid, rank]);
        }
        await setMap("product_option_value", vkey, ovid);

        // variant
        const meta = JSON.stringify({ legacy_id: v.id, price_mode: v.price_mode, available: v.available, lead_time_days: v.lead_time_days, size_label: size });
        let vid = mapped("variant", v.id);
        if (!(await live("product_variant", vid))) vid = null;
        if ((await t.query("select 1 from medusa.product_variant where sku = $1 and deleted_at is null and id <> $2", [v.sku, vid ?? ""])).rowCount) {
          throw new Error(`SKU ${v.sku} is already used by another variant`);
        }
        if (vid) {
          await t.query(
            `update medusa.product_variant set title = $2, sku = $3, variant_rank = $4, manage_inventory = $5, allow_backorder = false,
                    metadata = $6::jsonb, product_id = $7, updated_at = now() where id = $1`,
            [vid, size, v.sku, v.sort_order ?? rank, manage, meta, productId]);
          bump("variants_updated");
        } else {
          vid = await newId("product_variant");
          await t.query(
            `insert into medusa.product_variant (id, title, sku, variant_rank, manage_inventory, allow_backorder, metadata, product_id)
             values ($1, $2, $3, $4, $5, false, $6::jsonb, $7)`,
            [vid, size, v.sku, v.sort_order ?? rank, manage, meta, productId]);
          bump("variants_created");
        }
        await setMap("variant", v.id, vid);
        await t.query("delete from medusa.product_variant_option where variant_id = $1", [vid]);
        await t.query("insert into medusa.product_variant_option (variant_id, option_value_id) values ($1, $2)", [vid, ovid]);

        await mapPrice(vid, v);
        await mapInventory(vid, v, manage, size);
      });
    }
  }

  async function mapPrice(vid, v) {
    let ps = mapped("price_set", v.id);
    if (!(await live("price_set", ps))) ps = null;
    const priced = v.price_mode === "fixed" && v.price_text != null;
    if (v.price_mode === "fixed" && v.price_text == null) {
      reasons.push(`note variant ${v.id}: price_mode is fixed but price_inr is empty, no price created`);
      bump("prices_missing");
    }
    if (priced && Number(v.price_text) < 0) throw new Error(`negative price ${v.price_text}`);
    if (!ps) {
      if (!priced) { bump("prices_on_request"); return; }
      ps = await newId("price_set");
      await t.query("insert into medusa.price_set (id) values ($1)", [ps]);
      await t.query("insert into medusa.product_variant_price_set (id, variant_id, price_set_id) values ($1, $2, $3)", [await rawId("pvps"), vid, ps]);
      await setMap("price_set", v.id, ps);
    }
    const existing = (await t.query(
      `select id from medusa.price where price_set_id = $1 and currency_code = 'inr' and price_list_id is null and deleted_at is null
          and min_quantity is null and max_quantity is null and coalesce(rules_count, 0) = 0 order by id limit 1`, [ps])).rows[0]?.id;
    if (!priced) {
      if (existing) { await t.query("update medusa.price set deleted_at = now() where id = $1", [existing]); bump("prices_removed"); }
      else bump("prices_on_request");
      return;
    }
    if (existing) {
      await t.query(
        `update medusa.price set amount = $2::numeric, raw_amount = jsonb_build_object('value', ($2::numeric)::text, 'precision', 20),
                updated_at = now() where id = $1`, [existing, v.price_text]);
      bump("prices_updated");
    } else {
      await t.query(
        `insert into medusa.price (id, price_set_id, currency_code, raw_amount, amount, rules_count)
         values ($1, $2, 'inr', jsonb_build_object('value', ($3::numeric)::text, 'precision', 20), $3::numeric, 0)`,
        [await newId("price"), ps, v.price_text]);
      bump("prices_created");
    }
  }

  async function mapInventory(vid, v, manage, size) {
    if (!manage) { bump("inventory_not_tracked"); return; }
    if (v.stock == null) {
      reasons.push(`note variant ${v.id}: track_inventory is on but stock is empty, no inventory level created`);
      bump("inventory_missing_stock");
      return;
    }
    const loc = await stockLocation();
    let iid = mapped("inventory_item", v.id);
    if (!(await live("inventory_item", iid))) iid = null;
    if (!iid) {
      iid = await newId("inventory_item");
      await t.query("insert into medusa.inventory_item (id, sku, title, requires_shipping) values ($1, $2, $3, true)", [iid, v.sku, size]);
      await t.query(
        `insert into medusa.product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity) values ($1, $2, $3, 1)`,
        [await rawId("pvitem"), vid, iid]);
      await setMap("inventory_item", v.id, iid);
    }
    await t.query("select set_config('app.inventory_reason', 'legacy_migration', true)");
    const lvl = (await t.query("select id from medusa.inventory_level where inventory_item_id = $1 and location_id = $2 and deleted_at is null", [iid, loc])).rows[0]?.id;
    if (lvl) {
      await t.query(
        `update medusa.inventory_level set stocked_quantity = $2::numeric,
                raw_stocked_quantity = jsonb_build_object('value', ($2::numeric)::text, 'precision', 20), updated_at = now() where id = $1`,
        [lvl, String(v.stock)]);
      bump("inventory_levels_updated");
    } else {
      await t.query(
        `insert into medusa.inventory_level (id, inventory_item_id, location_id, stocked_quantity, raw_stocked_quantity,
                reserved_quantity, raw_reserved_quantity, incoming_quantity, raw_incoming_quantity)
         values ($1, $2, $3, $4::numeric, jsonb_build_object('value', ($4::numeric)::text, 'precision', 20),
                 0, '{"value":"0","precision":20}', 0, '{"value":"0","precision":20}')`,
        [await newId("inventory_level"), iid, loc, String(v.stock)]);
      bump("inventory_levels_created");
    }
    await t.query("select set_config('app.inventory_reason', '', true)");
  }

  // ------------------------------------------------------------------ catalog rebuild
  let rebuilt = 0;
  for (let i = 0; i < 1000; i++) {
    const n = (await t.query("select internal.catalog_rebuild_dirty(500) n")).rows[0].n;
    rebuilt += n;
    if (!n) break;
  }
  counts.catalog_rows_rebuilt = rebuilt;
  log(`catalog: ${JSON.stringify(counts)}`);
  return { counts, reasons };
}
