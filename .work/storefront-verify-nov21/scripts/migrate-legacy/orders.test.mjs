// Integration test for the orders step (task 23.4). Run: node --test scripts/migrate-legacy/orders.test.mjs (needs Docker)
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as customers from "./steps/customers.mjs";
import * as orders from "./steps/orders.mjs";
import { startScratch } from "./testdb.mjs";

let db, admin, one;
const USER = "00000000-0000-0000-0000-000000000001";
const O = (n) => `20000000-0000-0000-0000-00000000000${n}`;
const sha = (l, b) => createHash("sha256").update(`legacy=${l};backend=${b}`).digest("hex");
const cnt = async (sql, p) => Number((await one(sql, p)).c);
const addr = { recipientName: "Alice Rao", line1: "1 Main Rd", landmark: "Near park", city: "Pune", state: "Maharashtra", pincode: "411001", phone: "9876543210" };

before(async () => {
  db = await startScratch("mig-orders");
  admin = db.admin; one = db.one;
  await admin.query(`insert into medusa.currency (code, symbol, symbol_native, name, decimal_digits, raw_rounding)
                     values ('inr', '₹', '₹', 'Indian Rupee', 2, '{"value":"0","precision":20}') on conflict (code) do nothing`);
  await admin.query("insert into medusa.region (id, name, currency_code) values ('reg_in', 'India', 'inr') on conflict (id) do nothing");
  await admin.query("insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values ($1, 'alice@example.com', now(), '{}'::jsonb)", [USER]);
  await admin.query("insert into public.profiles (id, full_name, role) values ($1, 'Alice Rao', 'customer') on conflict (id) do update set full_name = excluded.full_name", [USER]);
  await admin.query("insert into medusa.product (id, title, handle, status) values ('prod_1', 'Brass plate', 'brass-plate', 'published')");
  await admin.query("insert into medusa.product_variant (id, title, sku, product_id) values ('variant_1', 'A4', 'PM-BP-A4', 'prod_1')");
  await admin.query("insert into ext.migration_map (entity, legacy_id, new_id) values ('product', 'legacy-p1', 'prod_1')");
  await db.runStep(customers, "apply"); // maps the legacy profile to its customer (migration_map entity 'customer')

  const order = (n, ref, { user = null, email, status, pay, method, total, totals, coupon = null, paidAt = null }) => admin.query(
    `insert into public.orders (id, user_id, reference, contact_email, status, payment_status, payment_method, total, totals, shipping_address,
            billing_address, coupon_code, paid_at, razorpay_order_id, razorpay_payment_id, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $10::jsonb, $11, $12, $13, $14, $15)`,
    [O(n), user, ref, email, status, pay, method, total, JSON.stringify(totals), JSON.stringify(addr), coupon, paidAt,
      method === "razorpay" ? `order_rp${n}` : null, paidAt ? `pay_rp${n}` : null, `2026-0${n}-10T10:00:00Z`]);
  const item = (n, sku, price, qty) => admin.query(
    "insert into public.order_items (order_id, product_id, name, variant_label, sku, price, quantity) values ($1, 'legacy-p1', 'Brass plate', 'A4', $2, $3, $4)",
    [O(n), sku, price, qty]);

  // 1 guest, COD, unpaid: 2 x 1000 + 500, GST 450, freight 100
  await order(1, "PM-26-10431", { email: "Guest@Example.com", status: "confirmed", pay: "unpaid", method: "cod_placeholder", total: 3050,
    totals: { subtotalInr: 2500, discountInr: 0, gstInr: 450, shippingInr: 100, totalInr: 3050 } });
  await item(1, "PM-BP-A4", 1000, 2); await item(1, "NO-SUCH-SKU", 500, 1);
  // 2 registered, delivered, paid online, with a coupon: (1000 - 100) * 18% = 162
  await order(2, "PM-26-10432", { user: USER, email: "alice@example.com", status: "delivered", pay: "paid", method: "razorpay", total: 1112,
    totals: { subtotalInr: 1000, discountInr: 100, gstInr: 162, shippingInr: 50, totalInr: 1112 }, coupon: "WELCOME10", paidAt: "2026-02-11T09:00:00Z" });
  await item(2, "PM-BP-A4", 1000, 1);
  // 3 canceled, unpaid
  await order(3, "PM-26-10433", { user: USER, email: "alice@example.com", status: "cancelled", pay: "unpaid", method: "razorpay", total: 590,
    totals: { subtotalInr: 500, discountInr: 0, gstInr: 90, shippingInr: 0, totalInr: 590 } });
  await item(3, null, 500, 1);
  // 4 online payment pending (unpaid)
  await order(4, "PM-26-10434", { email: "buyer@example.com", status: "payment_pending", pay: "pending", method: "razorpay", total: 1280,
    totals: { subtotalInr: 1000, discountInr: 0, gstInr: 180, shippingInr: 100, totalInr: 1280 } });
  await item(4, null, 1000, 1);
  // 5 legacy total differs from what the Backend computes (flagged, still imported)
  await order(5, "PM-26-10435", { email: "buyer@example.com", status: "placed", pay: "unpaid", method: "cod_placeholder", total: 999,
    totals: { subtotalInr: 1000, discountInr: 0, gstInr: 180, shippingInr: 100, totalInr: 999 } });
  await item(5, null, 1000, 1);
  // 6 reference without digits: display_id is allocated, the shown number stays the reference
  await order(6, "LEGACY-ABC", { email: "buyer@example.com", status: "placed", pay: "unpaid", method: "cod_placeholder", total: 1180,
    totals: { subtotalInr: 1000, discountInr: 0, gstInr: 180, shippingInr: 0, totalInr: 1180 } });
  await item(6, null, 1000, 1);
});
after(async () => { await db?.stop(); });

let first, notificationsBefore, seqBefore;
const seq = async () => Number((await one("select last_value c from medusa.order_display_id_seq")).c);

test("dry_run changes nothing", async () => {
  notificationsBefore = await cnt("select count(*) c from medusa.notification");
  seqBefore = await seq();
  const out = await db.runStep(orders, "dry_run");
  assert.equal(out.counts.orders_created, 6);
  assert.equal(await cnt("select count(*) c from medusa.\"order\""), 0);
  assert.equal(await cnt("select count(*) c from ext.order_import"), 0);
  assert.equal(await cnt("select count(*) c from ext.migration_map where entity = 'order'"), 0);
  assert.equal(await seq(), seqBefore);
});

test("apply imports orders, items, addresses and keeps display numbers", async () => {
  first = await db.runStep(orders, "apply");
  assert.equal(first.counts.orders_read, 6);
  assert.equal(first.counts.orders_created, 6);
  assert.equal(first.counts.orders_skipped, undefined, first.reasons.join("\n"));
  assert.equal(first.counts.rollups_rebuilt, 1, first.reasons.join("\n"));
  assert.equal(await cnt("select count(*) c from medusa.\"order\" where deleted_at is null"), 6);
  assert.equal(await cnt("select count(*) c from ext.order_import"), 6);
  assert.equal(await cnt("select count(*) c from medusa.order_item"), 7);
  assert.equal(await cnt("select count(*) c from medusa.order_address"), 12);
  // display numbers
  const d = await admin.query(`select i.legacy_id, i.display_number, o.display_id, o.custom_display_id, internal.order_display_number(o.id) shown
                                 from ext.order_import i join medusa."order" o on o.id = i.order_id order by i.legacy_id`);
  assert.deepEqual(d.rows.map((r) => r.shown), ["PM-26-10431", "PM-26-10432", "PM-26-10433", "PM-26-10434", "PM-26-10435", "LEGACY-ABC"]);
  assert.deepEqual(d.rows.map((r) => r.display_id), [10431, 10432, 10433, 10434, 10435, 10436]);
  assert.deepEqual(d.rows.map((r) => r.display_number), [10431, 10432, 10433, 10434, 10435, 10436]);
  assert.ok((await seq()) >= 10436);
  assert.equal(Number((await one("select nextval('medusa.order_display_id_seq') n")).n) > 10436, true);
  // snapshot: sku match gives a variant, unknown sku keeps the snapshot only
  const li = await admin.query(`select li.variant_id, li.product_id, li.variant_sku, li.title from medusa.order_item oi join medusa.order_line_item li on li.id = oi.item_id
                                  join medusa."order" o on o.id = oi.order_id where o.custom_display_id = 'PM-26-10431' order by li.unit_price desc`);
  assert.equal(li.rows[0].variant_id, "variant_1");
  assert.equal(li.rows[0].product_id, "prod_1");
  assert.equal(li.rows[1].variant_id, null);
  assert.equal(li.rows[1].variant_sku, "NO-SUCH-SKU");
});

test("statuses, customers and guests", async () => {
  const st = await admin.query(`select custom_display_id, status, customer_id, email, canceled_at is not null canceled, created_at from medusa."order" order by custom_display_id`);
  const by = Object.fromEntries(st.rows.map((r) => [r.custom_display_id, r]));
  assert.equal(by["PM-26-10431"].status, "pending");
  assert.equal(by["PM-26-10432"].status, "completed");
  assert.equal(by["PM-26-10433"].status, "canceled");
  assert.equal(by["PM-26-10433"].canceled, true);
  assert.equal(by["PM-26-10434"].status, "pending");
  const cus = (await one("select customer_id from ext.customer_auth_link where auth_user_id = $1", [USER])).customer_id;
  assert.equal(by["PM-26-10432"].customer_id, cus);
  assert.equal(by["PM-26-10433"].customer_id, cus);
  assert.equal(by["PM-26-10431"].customer_id, null); // guest
  assert.equal(by["PM-26-10431"].email, "guest@example.com");
  assert.equal(by["PM-26-10432"].created_at.toISOString(), "2026-02-10T10:00:00.000Z");
});

test("Backend totals equal the legacy totals; checksums recorded; mismatch flagged", async () => {
  const rows = (await admin.query(`select i.legacy_id, i.totals_checksum, o.id, (internal.order_totals(o.id) ->> 'total')::numeric backend
                                     from ext.order_import i join medusa."order" o on o.id = i.order_id order by i.legacy_id`)).rows;
  const legacy = { 1: 3050, 2: 1112, 3: 590, 4: 1280, 5: 999, 6: 1180 };
  for (let n = 1; n <= 6; n++) {
    const r = rows.find((x) => x.legacy_id === O(n));
    const b = Number(r.backend);
    assert.equal(r.totals_checksum, sha(legacy[n].toFixed(2), b.toFixed(2)));
    if (n !== 5) assert.equal(b, legacy[n], `order ${n}`);
    else assert.equal(b, 1280);
  }
  assert.equal(first.counts.totals_mismatches, 1);
  assert.match(first.reasons.join("\n"), /totals mismatch order 20000000-0000-0000-0000-000000000005 \(PM-26-10435\): legacy 999\.00 vs Backend 1280\.00/);
  // the summary carries the Backend order total
  const s2 = await one(`select s.totals from medusa.order_summary s join medusa."order" o on o.id = s.order_id where o.custom_display_id = 'PM-26-10432'`);
  assert.equal(Number(s2.totals.current_order_total), 1112);
});

test("paid and unpaid orders have consistent payments, transactions and summaries", async () => {
  const sumOf = async (ref) => (await one(`select s.totals from medusa.order_summary s join medusa."order" o on o.id = s.order_id where o.custom_display_id = $1`, [ref])).totals;
  const paid = await sumOf("PM-26-10432");
  assert.equal(Number(paid.paid_total), 1112);
  assert.equal(Number(paid.transaction_total), 1112);
  assert.equal(Number(paid.pending_difference), 0);
  assert.equal(Number(paid.refunded_total), 0);
  const tx = await admin.query(`select t.amount, t.reference from medusa.order_transaction t join medusa."order" o on o.id = t.order_id where o.custom_display_id = 'PM-26-10432'`);
  assert.deepEqual(tx.rows.map((r) => [Number(r.amount), r.reference]), [[1112, "capture"]]);
  const pc = await one(`select pc.status, pc.captured_amount, p.captured_at is not null cap, (select count(*) from medusa.capture c where c.payment_id = p.id)::int caps
                          from medusa.order_payment_collection opc join medusa."order" o on o.id = opc.order_id
                          join medusa.payment_collection pc on pc.id = opc.payment_collection_id join medusa.payment p on p.payment_collection_id = pc.id
                         where o.custom_display_id = 'PM-26-10432'`);
  assert.deepEqual([pc.status, Number(pc.captured_amount), pc.cap, pc.caps], ["completed", 1112, true, 1]);
  for (const [ref, total] of [["PM-26-10431", 3050], ["PM-26-10434", 1280]]) {
    const s = await sumOf(ref);
    assert.equal(Number(s.paid_total), 0);
    assert.equal(Number(s.pending_difference), total);
  }
  assert.equal(await cnt(`select count(*) c from medusa.order_transaction`), 1);
  assert.equal(await cnt(`select count(*) c from medusa.payment`), 1);
  const awaiting = await one(`select pc.status from medusa.order_payment_collection opc join medusa."order" o on o.id = opc.order_id
                                join medusa.payment_collection pc on pc.id = opc.payment_collection_id where o.custom_display_id = 'PM-26-10434'`);
  assert.equal(awaiting.status, "awaiting");
});

test("import creates no notifications, reservations, promotion usage or events", async () => {
  assert.equal(await cnt("select count(*) c from medusa.notification"), notificationsBefore);
  assert.equal(await cnt("select count(*) c from medusa.reservation_item"), 0);
  assert.equal(await cnt("select count(*) c from ext.order_event"), 0);
  assert.equal(await cnt("select count(*) c from medusa.order_promotion"), 0);
  assert.equal(await cnt("select count(*) c from ext.order_import where order_id not in (select id from medusa.\"order\")"), 0);
});

test("re-run is idempotent", async () => {
  const tables = ["medusa.\"order\"", "medusa.order_item", "medusa.order_address", "medusa.order_transaction", "medusa.payment_collection",
    "medusa.order_summary", "ext.order_import", "ext.migration_map"];
  const count = async () => { const r = []; for (const x of tables) r.push(await cnt(`select count(*) c from ${x}`)); return r; };
  const before = await count();
  const again = await db.runStep(orders, "apply");
  assert.deepEqual(await count(), before);
  assert.equal(again.counts.orders_created, undefined);
  assert.equal(again.counts.orders_unchanged, 6);
  assert.equal(await cnt("select count(*) c from medusa.notification"), notificationsBefore);
});
