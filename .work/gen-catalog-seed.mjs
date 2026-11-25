import fs from "node:fs";

const cat = JSON.parse(fs.readFileSync("src/data/catalog.json", "utf8"));
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
const area = (label) => {
  const m = /^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*ft$/i.exec(label);
  return m ? parseFloat(m[1]) * parseFloat(m[2]) : null;
};
const slugFactor = (s) => {
  let n = 0;
  for (let i = 0; i < s.length; i += 1) n += s.charCodeAt(i);
  return (n % 100) / 100;
};
const round10 = (v) => Math.round(v / 10) * 10;
const price = (p, size) => {
  const a = area(size);
  const base = SERIES_BASE[p.seriesId];
  if (base && a) return round10(base.perSqFt * a + base.frameHandlingInr);
  const fallback = NON_BOARD_UNIT[p.categoryId] ?? 2200;
  return round10(fallback * (0.85 + slugFactor(p.slug) * 0.4));
};
const slugSku = (s) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
const cloud = (id) => `https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,w_1600,c_limit/${id}`;

const categories = [];
cat.categories.forEach((c, i) => {
  categories.push({ handle: c.id, name: c.name, description: c.description, image: c.image ? cloud(c.image) : null, rank: i * 10, parent: null });
  (c.subcategories || []).forEach((s, j) => categories.push({
    handle: s.id, name: s.name, description: c.description, image: s.image ? cloud(s.image) : null, rank: i * 10 + j + 1, parent: c.id
  }));
});

const collections = Object.entries(cat.series).map(([id, s]) => ({
  handle: id, title: s.name, rank: s.rank,
  metadata: { surface: s.surface, frame: s.frame, corners: s.corners }
}));

const products = cat.products.map((p) => {
  const images = (p.images || []).map((id, i) => ({ url: cloud(id), rank: i }));
  if (!images.length) images.push({ url: cloud("plusmark/products/metallic-premium-white-board"), rank: 0 });
  const sizes = (p.sizes || []).map((s, i) => ({
    title: s, sku: `${slugSku(p.slug)}-${slugSku(s)}`, amount: price(p, s), rank: i
  }));
  return {
    handle: p.slug, title: p.name, subtitle: p.surface || null,
    description: p.sourceDescription || p.name, material: p.frame || null, series: p.seriesId,
    categories: [p.categoryId, ...(p.subcategoryIds || [])],
    tags: [p.seriesId, p.boardType, p.surfaceKind, p.magnetic ? "magnetic" : "non-magnetic"].filter(Boolean),
    metadata: {
      series_id: p.seriesId, category_id: p.categoryId, subcategory_ids: p.subcategoryIds || [],
      board_type: p.boardType || null, surface_kind: p.surfaceKind || null, specs: p.specs || []
    },
    images, thumbnail: images[0].url, sizes
  };
});

const json = JSON.stringify({ categories, collections, products });
if (json.includes("$catalog$")) throw new Error("dollar quote collision");

const sql = `-- Curated Plusmark catalogue -> new backend. Guarded by product handles; safe to re-run.
do $$
declare
  e jsonb; e2 jsonb; v jsonb; v_pid text; v_vid text; ch text;
begin
  perform pg_catalog.set_config('app.seed_run', 'on', true);
  create temporary table _map(kind text, handle text, id text, primary key(kind, handle)) on commit drop;
  select id into ch from medusa.sales_channel where deleted_at is null order by created_at, id limit 1;
  if ch is null then raise exception 'catalog seed: no sales channel'; end if;

  for e in select * from pg_catalog.jsonb_array_elements($catalog$${json}$catalog$ #> '{categories}') loop
    if exists (select 1 from medusa.product_category where handle = e->>'handle' and deleted_at is null) then
      insert into _map values ('cat', e->>'handle', (select id from medusa.product_category where handle = e->>'handle' and deleted_at is null limit 1)) on conflict do nothing;
      continue;
    end if;
    v := api.admin_upsert_category(pg_catalog.jsonb_build_object(
      'name', e->>'name', 'handle', e->>'handle', 'description', coalesce(e->>'description',''),
      'is_active', true, 'is_internal', false, 'rank', coalesce((e->>'rank')::int, 0),
      'parent_category_id', case when e->>'parent' is null then null else (select id from _map where kind='cat' and handle=e->>'parent') end,
      'metadata', pg_catalog.jsonb_build_object('image_url', e->>'image')));
    if v ? 'error' then raise exception 'category %: %', e->>'handle', v; end if;
    insert into _map values ('cat', e->>'handle', v->>'id') on conflict (kind, handle) do update set id = excluded.id;
  end loop;

  for e in select * from pg_catalog.jsonb_array_elements($catalog$${json}$catalog$ #> '{collections}') loop
    if exists (select 1 from medusa.product_collection where handle = e->>'handle' and deleted_at is null) then
      insert into _map values ('collection', e->>'handle', (select id from medusa.product_collection where handle = e->>'handle' and deleted_at is null limit 1)) on conflict do nothing;
      continue;
    end if;
    v := api.admin_upsert_collection(pg_catalog.jsonb_build_object('title', e->>'title', 'handle', e->>'handle', 'metadata', e->'metadata'));
    if v ? 'error' then raise exception 'collection %: %', e->>'handle', v; end if;
    insert into _map values ('collection', e->>'handle', v->>'id') on conflict (kind, handle) do update set id = excluded.id;
  end loop;

  for e in select * from pg_catalog.jsonb_array_elements($catalog$${json}$catalog$ #> '{products}') loop
    if exists (select 1 from medusa.product where handle = e->>'handle' and deleted_at is null) then continue; end if;
    v := api.admin_upsert_product(pg_catalog.jsonb_build_object(
      'title', e->>'title', 'handle', e->>'handle', 'subtitle', e->>'subtitle', 'description', e->>'description',
      'material', e->>'material', 'origin_country', 'in',
      'collection_id', (select id from _map where kind='collection' and handle=e->>'series'),
      'discountable', true, 'is_giftcard', false, 'metadata', e->'metadata',
      'options', pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('title','Size','values',
        (select pg_catalog.jsonb_agg(s->>'title') from pg_catalog.jsonb_array_elements(e->'sizes') s))),
      'tags', e->'tags',
      'category_ids', (select coalesce(pg_catalog.jsonb_agg(id), '[]'::jsonb) from _map where kind='cat'
        and handle = any (array(select pg_catalog.jsonb_array_elements_text(e->'categories')))),
      'sales_channel_ids', pg_catalog.jsonb_build_array(ch),
      'images', e->'images', 'thumbnail', e->>'thumbnail'));
    if v ? 'error' then raise exception 'product %: %', e->>'handle', v; end if;
    v_pid := v->>'id';
    perform api.admin_set_product_status(v_pid, 'published');
    for e2 in select * from pg_catalog.jsonb_array_elements(e->'sizes') loop
      v := api.admin_upsert_variant(pg_catalog.jsonb_build_object('product_id', v_pid, 'title', e2->>'title',
        'sku', e2->>'sku', 'manage_inventory', false, 'allow_backorder', true,
        'options', pg_catalog.jsonb_build_object('Size', e2->>'title')));
      if v ? 'error' then raise exception 'variant % / %: %', e->>'handle', e2->>'title', v; end if;
      v_vid := v->>'id';
      v := api.admin_upsert_prices(v_vid, pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
        'currency_code', 'inr', 'amount', (e2->>'amount')::numeric, 'min_quantity', 1)));
      if v ? 'error' then raise exception 'price % / %: %', e->>'handle', e2->>'title', v; end if;
    end loop;
  end loop;

  perform internal.catalog_rebuild_dirty(100000);
  raise notice 'catalog seed: % products, % variants, % categories, % collections',
    (select count(*) from medusa.product where deleted_at is null),
    (select count(*) from medusa.product_variant where deleted_at is null),
    (select count(*) from medusa.product_category where deleted_at is null),
    (select count(*) from medusa.product_collection where deleted_at is null);
end $$;
`;
fs.writeFileSync("supabase/migrations/20261120130000_catalog_seed.sql", sql);
console.log(JSON.stringify({
  bytes: sql.length,
  products: products.length,
  variants: products.reduce((n, p) => n + p.sizes.length, 0),
  categories: categories.length,
  collections: collections.length
}));
