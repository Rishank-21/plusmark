// Integration test for the catalog step (task 23.2). Starts a scratch Supabase Postgres container (same image and
// setup as tools/medusa-reference/run-pgtap.mjs), applies every migration, loads a small legacy fixture into the legacy
// public tables and runs the step. The container is random-named and always removed.
// Run: node --test scripts/migrate-legacy/catalog.test.mjs   (needs Docker)
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import * as catalog from "./steps/catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const migDir = join(root, "supabase", "migrations");
const { Client } = createRequire(join(root, "package.json"))("pg");
const IMAGE = "public.ecr.aws/supabase/postgres:15.8.1.069";
const name = `mig-catalog-${randomBytes(4).toString("hex")}`;
const docker = (argv) => spawnSync("docker", argv, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const psql = (extra) => docker(["exec", "-e", "PGPASSWORD=pw", name, "psql", "-U", "supabase_admin", "-h", "localhost", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q", ...extra]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let admin; // autocommit client for fixtures and assertions

before(async () => {
  let r = docker(["run", "-d", "--name", name, "-p", "127.0.0.1::5432", "-e", "POSTGRES_PASSWORD=pw", IMAGE]);
  assert.equal(r.status, 0, r.stderr);
  for (let i = 0; ; i++) {
    const t = psql(["-At", "-c", "select 1"]);
    if (t.status === 0 && t.stdout.trim() === "1") break;
    assert.ok(i < 60, "Postgres not ready");
    await sleep(2000);
  }
  await sleep(3000);
  r = docker(["cp", migDir, `${name}:/tmp/m`]);
  assert.equal(r.status, 0, r.stderr);
  r = psql(["-c", "alter table storage.buckets add column if not exists public boolean default false, add column if not exists file_size_limit bigint, add column if not exists allowed_mime_types text[]; alter table auth.users add column if not exists email_confirmed_at timestamptz, add column if not exists raw_user_meta_data jsonb"]);
  assert.equal(r.status, 0, r.stderr);
  for (const f of readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort()) {
    r = psql(["-f", `/tmp/m/${f}`]);
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
  const port = docker(["port", name, "5432/tcp"]).stdout.trim().split("\n")[0].split(":").pop();
  admin = new Client({ host: "127.0.0.1", port: Number(port), user: "supabase_admin", password: "pw", database: "postgres" });
  await admin.connect();
  await loadFixture();
});

after(async () => {
  await admin?.end().catch(() => {});
  spawnSync("docker", ["rm", "-f", "-v", name], { stdio: "ignore" });
});

async function loadFixture() {
  await admin.query(`insert into public.categories (id, name, description, subject, image, subcategories, sort_order) values
    ('boards', 'Boards', 'All boards', 'Board', 'plusmark/cat/boards',
     '[{"id":"whiteboards","name":"Whiteboards"},{"id":"nameless"}]'::jsonb, 0),
    ('pin-up', 'Pin-up', '', 'Board', null, '[]', 1)`);
  await admin.query(`insert into public.media (public_id, url, resource_type) values ('plusmark/p1/a', 'https://res.example.test/plusmark/p1/a.jpg', 'image')`);
  await admin.query(`insert into public.products (id, slug, name, category_id, subcategory_ids, surface, magnetic, description, blurb, media, specs,
                                                  price_mode, published, board_type, surface_kind) values
    ('00000000-0000-0000-0000-0000000000a1', 'magnetic-whiteboard', 'Magnetic Whiteboard', 'boards', '{whiteboards}', 'Melamine', true, 'Desc', 'Blurb',
     '[{"publicId":"plusmark/p1/a"},{"publicId":"plusmark/missing"}]'::jsonb, '[{"label":"Frame depth","value":"20 mm"}]'::jsonb,
     'fixed', true, 'magnetic', 'marker'),
    ('00000000-0000-0000-0000-0000000000a2', 'pin-board', 'Pin Board', 'pin-up', '{}', null, false, '', '', '[]', '[]', 'on_request', false, 'n/a', 'pin-up')`);
  await admin.query(`insert into public.product_variants (id, product_id, size_label, sku, price_mode, price_inr, stock, track_inventory, sort_order) values
    ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', '2x3 ft', 'PM-AAA-111', 'fixed', 1234.50, 7, true, 0),
    ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1', '3x4 ft', 'PM-AAA-222', 'fixed', 9999999999.99, null, false, 1),
    ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a1', '2x3 FT', 'PM-AAA-333', 'fixed', 10, 1, true, 2),
    ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000a2', 'A4', 'PM-BBB-444', 'on_request', null, null, true, 0)`);
}

// Runs the step the way scripts/migrate-legacy.mjs does: separate source and target clients in open transactions.
async function runStep(mode) {
  const mk = async () => { const c = new Client(admin.connectionParameters); await c.connect(); return c; };
  const source = await mk(), target = await mk();
  try {
    await target.query("begin");
    await source.query("begin transaction isolation level repeatable read read only");
    const out = await catalog.run({ mode, source, target, log: () => {} });
    await target.query(mode === "apply" ? "commit" : "rollback");
    await source.query("rollback");
    return out;
  } catch (e) {
    await target.query("rollback").catch(() => {});
    throw e;
  } finally {
    await source.end(); await target.end();
  }
}

const one = async (sql, params = []) => (await admin.query(sql, params)).rows[0];
const n = async (table) => Number((await one(`select count(*) c from ${table} where ${table.startsWith("medusa.") && !/link|category_product|variant_option|variant_price_set/.test(table) ? "deleted_at is null" : "true"}`)).c);

test("dry_run changes nothing", async () => {
  const out = await runStep("dry_run");
  assert.equal(out.counts.products_created, 2);
  assert.equal(await n("medusa.product"), 0);
  assert.equal((await one("select count(*) c from ext.migration_map")).c, "0");
});

let first;
test("apply maps categories, products, variants, prices, inventory, images, attributes", async () => {
  first = await runStep("apply");
  const c = first.counts;
  assert.equal(c.category_created, 2);
  assert.equal(c.subcategory_created, 1);
  assert.equal(c.subcategory_skipped, 1);
  assert.equal(c.products_created, 2);
  assert.equal(c.variants_created, 3);
  assert.equal(c.variant_skipped, 1);
  assert.equal(c.prices_created, 2);
  assert.equal(c.prices_on_request, 1);
  assert.equal(c.inventory_levels_created, 1);
  assert.equal(c.images_created, 1);
  assert.equal(c.image_skipped, 1);

  // tree and handles
  const sub = await one(`select s.mpath, s.parent_category_id, p.mpath pm, p.id pid, s.handle from medusa.product_category s
                          join medusa.product_category p on p.id = s.parent_category_id where s.name = 'Whiteboards'`);
  assert.equal(sub.mpath, `${sub.pm}${(await one("select id from medusa.product_category where name = 'Whiteboards'")).id}.`);
  assert.equal(sub.handle, "boards-whiteboards");
  const prod = await one("select * from medusa.product where handle = 'magnetic-whiteboard'");
  assert.equal(prod.status, "published");
  assert.equal(prod.thumbnail, "https://res.example.test/plusmark/p1/a.jpg");
  assert.equal((await one("select status from medusa.product where handle = 'pin-board'")).status, "draft");
  assert.equal((await one("select count(*) c from medusa.product_category_product where product_id = $1", [prod.id])).c, "2");

  // prices are exact and in INR
  const p1 = await one(`select pr.amount::text a, pr.raw_amount->>'value' r, pr.currency_code cur from medusa.product_variant v
      join medusa.product_variant_price_set l on l.variant_id = v.id join medusa.price pr on pr.price_set_id = l.price_set_id where v.sku = 'PM-AAA-111'`);
  assert.deepEqual(p1, { a: "1234.50", r: "1234.50", cur: "inr" });
  const big = await one(`select pr.amount::text a from medusa.product_variant v join medusa.product_variant_price_set l on l.variant_id = v.id
      join medusa.price pr on pr.price_set_id = l.price_set_id where v.sku = 'PM-AAA-222'`);
  assert.equal(big.a, "9999999999.99");

  // inventory
  const inv = await one(`select il.stocked_quantity::text q, v.manage_inventory m from medusa.product_variant v
      join medusa.product_variant_inventory_item l on l.variant_id = v.id join medusa.inventory_level il on il.inventory_item_id = l.inventory_item_id
      where v.sku = 'PM-AAA-111'`);
  assert.deepEqual(inv, { q: "7", m: true });
  assert.equal((await one("select manage_inventory m from medusa.product_variant where sku = 'PM-AAA-222'")).m, false);

  // options, images, attributes
  assert.equal((await one("select count(*) c from medusa.product_variant_option")).c, "3");
  assert.equal((await one("select url from medusa.image where product_id = $1", [prod.id])).url, "https://res.example.test/plusmark/p1/a.jpg");
  const attrs = await admin.query("select key, value from ext.product_attribute where product_id = $1 order by key", [prod.id]);
  assert.ok(attrs.rows.some((r) => r.key === "spec_frame_depth" && r.value === "20 mm"));
  assert.ok(attrs.rows.some((r) => r.key === "board_type" && r.value === "magnetic"));

  // read model rebuilt, nothing left dirty
  assert.equal((await one("select count(*) c from ext.catalog_dirty")).c, "0");
  assert.equal((await one("select count(*) c from ext.catalog_product_index where product_id = $1", [prod.id])).c, "1");
});

test("skipped rows are reported with reasons", () => {
  const r = first.reasons.join("\n");
  assert.match(r, /subcategory boards\/\S*: missing id or name|subcategory boards\[1\]: missing id or name/);
  assert.match(r, /variant 00000000-0000-0000-0000-0000000000b3: duplicate size label "2x3 FT"/);
  assert.match(r, /image .*plusmark\/missing: no URL/);
  assert.match(r, /note variant 00000000-0000-0000-0000-0000000000b4: track_inventory is on but stock is empty/);
});

test("re-run is idempotent and applies updates", async () => {
  const tables = ["medusa.product", "medusa.product_category", "medusa.product_variant", "medusa.price_set", "medusa.price",
    "medusa.inventory_item", "medusa.inventory_level", "medusa.image", "medusa.product_option", "medusa.product_option_value", "ext.migration_map", "ext.product_attribute"];
  const before = {};
  for (const t of tables) before[t] = await n(t);
  const again = await runStep("apply");
  for (const t of tables) assert.equal(await n(t), before[t], `${t} row count changed`);
  for (const k of Object.keys(again.counts)) assert.ok(!/_created$/.test(k) || again.counts[k] === 0, `${k} should be 0 on re-run`);
  assert.equal(again.counts.products_updated, 2);

  await admin.query("update public.product_variants set price_inr = 1500.25, stock = 3 where sku = 'PM-AAA-111'");
  await admin.query("update public.products set name = 'Magnetic Whiteboard Pro' where slug = 'magnetic-whiteboard'");
  const upd = await runStep("apply");
  assert.equal(upd.counts.prices_updated, 2);
  for (const t of tables) assert.equal(await n(t), before[t], `${t} row count changed after update`);
  const row = await one(`select pr.amount::text a, il.stocked_quantity::text q, p.title, p.handle from medusa.product_variant v
      join medusa.product p on p.id = v.product_id
      join medusa.product_variant_price_set l on l.variant_id = v.id join medusa.price pr on pr.price_set_id = l.price_set_id
      join medusa.product_variant_inventory_item i on i.variant_id = v.id join medusa.inventory_level il on il.inventory_item_id = i.inventory_item_id
      where v.sku = 'PM-AAA-111'`);
  assert.deepEqual(row, { a: "1500.25", q: "3", title: "Magnetic Whiteboard Pro", handle: "magnetic-whiteboard" });
});
