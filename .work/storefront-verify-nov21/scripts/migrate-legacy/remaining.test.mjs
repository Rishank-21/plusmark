// Integration test for the remaining step (task 23.5). Run: node --test scripts/migrate-legacy/remaining.test.mjs (needs Docker)
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import * as customers from "./steps/customers.mjs";
import * as remaining from "./steps/remaining.mjs";
import { startScratch } from "./testdb.mjs";
import { ENTITIES, buildReport, collectEntityData } from "./report.mjs";

let db, admin, one;
const U1 = "00000000-0000-0000-0000-000000000001";
const U2 = "00000000-0000-0000-0000-000000000002"; // never migrated as a customer (no profile)
const cnt = async (sql, p) => Number((await one(sql, p)).c);

before(async () => {
  db = await startScratch("mig-rem");
  admin = db.admin; one = db.one;
  await admin.query(`insert into medusa.currency (code, symbol, symbol_native, name, decimal_digits, raw_rounding)
                     values ('inr', '₹', '₹', 'Indian Rupee', 2, '{"value":"0","precision":20}') on conflict (code) do nothing`);
  await admin.query("insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values ($1, 'alice@example.com', now(), '{}'::jsonb)", [U1]);
  await admin.query("insert into public.profiles (id, full_name, role) values ($1, 'Alice Rao', 'customer') on conflict (id) do update set full_name = excluded.full_name", [U1]);
  await admin.query("insert into medusa.product (id, title, handle, status) values ('prod_1', 'Brass plate', 'brass-plate', 'published')");
  await admin.query("insert into ext.migration_map (entity, legacy_id, new_id) values ('product', 'legacy-p1', 'prod_1')");
  await db.runStep(customers, "apply");

  await admin.query("insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values ($1, 'bob@example.com', now(), '{}'::jsonb)", [U2]);
  await admin.query("delete from public.profiles where id = $1", [U2]);
  await admin.query(
    `insert into public.product_reviews (product_slug, user_id, author_name, rating, title, body, created_at) values
     ('brass-plate', $1, 'Alice', 5, 'Lovely plate', 'Very sturdy and well finished.', '2026-01-05T10:00:00Z'),
     ('brass-plate', $2, 'Bob', 4, 'Good value', 'Arrived on time, looks great.', '2026-01-06T10:00:00Z'),
     ('no-such-slug', $1, 'Alice', 3, 'Missing', 'This product is not in the target.', '2026-01-07T10:00:00Z')`, [U1, U2]);
  await admin.query("insert into public.saved_boards (user_id, product_id) values ($1, 'brass-plate'), ($1, 'ghost-slug'), ($2, 'brass-plate')", [U1, U2]);
  await admin.query(
    `insert into public.coupons (code, description, kind, value, minimum_order_inr, active, starts_at, ends_at, usage_limit, used_count) values
     ('WELCOME10', 'Ten percent', 'percent', 10, 500, true, '2026-01-01', '2026-03-31', 100, 7),
     ('FLAT200', '', 'flat', 200, 0, false, '2026-01-01', '2026-02-01', null, 0),
     ('BIGPCT', '', 'percent', 150, 0, true, '2026-01-01', '2026-02-01', null, 0),
     ('BACKWARDS', '', 'flat', 50, 0, true, '2026-03-01', '2026-01-01', null, 0)`);
  await admin.query(
    `insert into public.shipping_methods (id, name, description, price_inr, eta_min_days, eta_max_days, available, sort_order) values
     ('standard', 'Standard', 'Courier', 99.50, 3, 6, true, 1),
     ('pickup', 'Pickup', 'Collect', 0, 0, 0, false, 2),
     ('freight', 'Freight', 'Quoted', null, null, null, true, 3)`);
  await admin.query(
    `insert into public.site_content (key, value) values ('home.hero', '{"title":"Hi"}'::jsonb), ('HOME.Hero', '{"title":"dup"}'::jsonb), ('footer.note', '"Thanks"'::jsonb)`);
  await admin.query(
    `insert into public.payment_events (event_id, event_type, payload, received_at) values
     ('evt_1', 'payment.captured', '{"payload":{"payment":{"entity":{"id":"pay_1","order_id":"order_1","amount":1000,"status":"captured","email":"x@y.z"}}}}'::jsonb, '2026-02-01T10:00:00Z')`);
});
after(async () => { await db?.stop(); });

test("dry_run changes nothing", async () => {
  const out = await db.runStep(remaining, "dry_run");
  assert.equal(out.counts.reviews_created, 1);
  assert.equal(await cnt("select count(*) c from ext.product_review"), 0);
  assert.equal(await cnt("select count(*) c from medusa.promotion"), 0);
  assert.equal(await cnt("select count(*) c from ext.webhook_event"), 0);
});

let first;
test("apply maps everything and reports each skip", async () => {
  const notif = await cnt("select count(*) c from medusa.notification");
  first = await db.runStep(remaining, "apply");
  const c = first.counts;
  assert.equal(c.reviews_created, 1); assert.equal(c.review_skipped, 2);
  assert.equal(c.wishlists_created, 1); assert.equal(c.wishlist_items_created, 1); assert.equal(c.saved_board_skipped, 2);
  assert.equal(c.coupons_created, 2); assert.equal(c.coupon_skipped, 2);
  assert.equal(c.shipping_options_created, 2); assert.equal(c.shipping_method_skipped, 1);
  assert.equal(c.site_content_created, 2); assert.equal(c.site_content_skipped, 1);
  assert.equal(c.payment_events_created, 1);
  for (const w of ["no product for slug", "was not migrated", "over 100", "is before starts_at", "price on request", "same setting key"])
    assert.ok(first.reasons.some((r) => r.includes(w)), `reason mentioning "${w}"`);
  assert.equal(await cnt("select count(*) c from medusa.notification"), notif);

  const rev = await one("select status, rating, verified_purchase from ext.product_review");
  assert.deepEqual([rev.status, rev.rating, rev.verified_purchase], ["approved", 5, false]);
  const sum = await one("select review_count, average::float a from ext.product_rating_summary where product_id = 'prod_1'");
  assert.deepEqual([sum.review_count, sum.a], [1, 5]);

  const w = await one("select w.name, count(i.id)::int n from ext.wishlist w join ext.wishlist_item i on i.wishlist_id = w.id group by w.name");
  assert.deepEqual([w.name, w.n], ["Wishlist", 1]);

  const p = await one(
    `select p.status, p.is_automatic, am.type, am.target_type, am.allocation, am.value::float v, b.type bt, b."limit"::int lim, b.used::int used,
            cp.starts_at, cp.ends_at, (select count(*)::int from medusa.promotion_promotion_rule r where r.promotion_id = p.id) rules
       from medusa.promotion p join medusa.promotion_application_method am on am.promotion_id = p.id
       join medusa.promotion_campaign cp on cp.id = p.campaign_id left join medusa.promotion_campaign_budget b on b.campaign_id = cp.id
      where p.code = 'WELCOME10'`);
  assert.deepEqual([p.status, p.is_automatic, p.type, p.target_type, p.allocation, p.v, p.bt, p.lim, p.used, p.rules],
    ["active", false, "percentage", "order", "across", 10, "usage", 100, 7, 1]);
  assert.ok(p.ends_at > p.starts_at);
  const f = await one("select p.status, am.type, am.currency_code, am.value::float v from medusa.promotion p join medusa.promotion_application_method am on am.promotion_id = p.id where p.code = 'FLAT200'");
  assert.deepEqual([f.status, f.type, f.currency_code, f.v], ["inactive", "fixed", "inr", 200]);

  const so = await one(
    `select o.price_type, pr.amount::float amt, (select value from medusa.shipping_option_rule where shipping_option_id = o.id and attribute = 'enable_in_store') eis
       from medusa.shipping_option o join medusa.shipping_option_price_set s on s.shipping_option_id = o.id
       join medusa.price pr on pr.price_set_id = s.price_set_id where o.name = 'Standard'`);
  assert.deepEqual([so.price_type, so.amt, so.eis], ["flat", 99.5, "true"]);
  assert.equal((await one("select value from medusa.shipping_option_rule r join medusa.shipping_option o on o.id = r.shipping_option_id where o.name = 'Pickup' and r.attribute = 'enable_in_store'")).value, "false");

  assert.deepEqual((await one("select value from ext.store_setting where key = 'content.home.hero'")).value, { title: "Hi" });
  assert.equal((await one("select value from ext.store_setting where key = 'content.footer.note'")).value, "Thanks");
  const ev = await one("select status, summary from ext.webhook_event where event_id = 'evt_1'");
  assert.equal(ev.status, "ignored");
  assert.equal(ev.summary.razorpay_payment_id, "pay_1");
  assert.equal(JSON.stringify(ev.summary).includes("x@y.z"), false);
});

test("re-run duplicates nothing and follows changed legacy rows", async () => {
  await admin.query("update public.coupons set value = 15 where code = 'WELCOME10'");
  await admin.query("update public.product_reviews set rating = 4 where user_id = $1 and product_slug = 'brass-plate'", [U1]);
  const before = await cnt("select (select count(*) from medusa.promotion) + (select count(*) from ext.product_review) + (select count(*) from ext.wishlist_item) + (select count(*) from medusa.shipping_option) + (select count(*) from ext.webhook_event) + (select count(*) from medusa.promotion_campaign) c");
  const out = await db.runStep(remaining, "apply");
  assert.equal(await cnt("select (select count(*) from medusa.promotion) + (select count(*) from ext.product_review) + (select count(*) from ext.wishlist_item) + (select count(*) from medusa.shipping_option) + (select count(*) from ext.webhook_event) + (select count(*) from medusa.promotion_campaign) c"), before);
  assert.equal(out.counts.coupons_updated, 2); assert.equal(out.counts.reviews_updated, 1);
  assert.equal(out.counts.payment_events_unchanged, 1); assert.equal(out.counts.wishlist_items_unchanged, 1);
  assert.equal((await one("select am.value::float v from medusa.promotion p join medusa.promotion_application_method am on am.promotion_id = p.id where p.code = 'WELCOME10'")).v, 15);
  assert.equal((await one("select average::float a from ext.product_rating_summary where product_id = 'prod_1'")).a, 4);
  assert.equal(await cnt("select count(*) c from medusa.price pr join medusa.shipping_option_price_set s on s.price_set_id = pr.price_set_id where pr.deleted_at is null"), 2);
});

test("report: reviews, saved boards, coupons and shipping methods reconcile; skips carry their reason", async () => {
  const names = ["review", "saved_board", "coupon", "shipping_method"];
  await admin.query("begin");
  const { entities } = await collectEntityData({ source: admin, target: admin, reasons: [] });
  const mine = entities.filter((e) => names.includes(e.name));
  assert.equal(mine.length, 4);
  for (const e of mine) assert.equal(e.source.count, e.migrated + e.skipped + e.failed, e.name);
  // with the step reasons supplied, every record the step skipped is explained and nothing is left unexplained
  const out = await db.runStep(remaining, "dry_run");
  await admin.query("begin");
  const withReasons = (await collectEntityData({ source: admin, target: admin, reasons: out.reasons })).entities.filter((e) => names.includes(e.name));
  assert.equal(withReasons.reduce((a, e) => a + e.failed, 0), 0, JSON.stringify(withReasons.map((e) => e.failed_records)));
  await admin.query("rollback");
  const r = buildReport({ mode: "dry_run", steps: [{ name: "remaining", status: "ok", counts: out.counts, reasons: out.reasons }], entities: withReasons });
  assert.deepEqual(r.mismatches, []);
  assert.ok(ENTITIES.length >= 12);
});

