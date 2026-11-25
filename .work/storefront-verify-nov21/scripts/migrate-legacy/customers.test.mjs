// Integration test for the customers step (task 23.3). Run: node --test scripts/migrate-legacy/customers.test.mjs (needs Docker)
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import * as customers from "./steps/customers.mjs";
import { startScratch } from "./testdb.mjs";

let db, admin, one;
const U = (n) => `00000000-0000-0000-0000-00000000000${n}`;

before(async () => {
  db = await startScratch("mig-customers");
  admin = db.admin; one = db.one;
  const mkUser = (n, email) => admin.query(
    "insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values ($1, $2, now(), '{}'::jsonb)", [U(n), email]);
  await mkUser(1, "Alice@Example.com");
  await mkUser(2, "bob@example.com");
  await mkUser(3, "carol@example.com");
  await mkUser(4, "admin@example.com");
  await mkUser(5, "erin@example.com");
  await mkUser(6, null);
  // 3: an earlier migrated customer exists, unlinked (the sign-up trigger customer is replaced by it)
  await admin.query("delete from ext.customer_auth_link where auth_user_id = $1", [U(3)]);
  await admin.query("delete from medusa.customer where email = 'carol@example.com'");
  await admin.query("insert into medusa.customer (id, email, has_account, first_name) values ('cus_preexisting_carol', 'Carol@Example.com', true, 'Old')");
  // 5: no customer yet (neither link nor row), the step must create one
  await admin.query("delete from ext.customer_auth_link where auth_user_id = $1", [U(5)]);
  await admin.query("delete from medusa.customer where email = 'erin@example.com'");
  const prof = (n, name, phone, role = "customer") => admin.query(
    `insert into public.profiles (id, full_name, phone, role, marketing_opt_in) values ($1, $2, $3, $4, true)
     on conflict (id) do update set full_name = excluded.full_name, phone = excluded.phone, role = excluded.role, marketing_opt_in = true`, [U(n), name, phone, role]);
  await prof(1, "Alice Rao", "9876543210");
  await prof(2, "Bob", null);
  await prof(3, "Carol Dsouza Jr", "9123456780");
  await prof(4, "Ad Min", null, "admin");
  await prof(5, "Erin Fox", "9000000001");
  await prof(6, "No Email", null);
  await admin.query("update public.profiles set email = null where id = $1", [U(6)]);
  const addr = (id, uid, label, def) => admin.query(
    `insert into public.addresses (id, user_id, label, full_name, phone, line1, line2, landmark, city, state, pincode, is_default)
     values ($1, $2, $3, 'Alice Rao', '9876543210', '1 Main Rd', 'Flat 2', 'Near park', 'Pune', 'Maharashtra', '411001', $4)`, [id, uid, label, def]);
  await addr("10000000-0000-0000-0000-000000000001", U(1), "Home", true);
  await addr("10000000-0000-0000-0000-000000000002", U(1), "Work", false);
  await addr("10000000-0000-0000-0000-000000000003", U(4), "Admin home", false);
});
after(async () => { await db?.stop(); });

const cnt = async (sql) => Number((await one(sql)).c);
let first, beforeCustomers;

test("dry_run changes nothing", async () => {
  beforeCustomers = await cnt("select count(*) c from medusa.customer where deleted_at is null");
  const out = await db.runStep(customers, "dry_run");
  assert.equal(out.counts.customers_created, 1);
  assert.equal(await cnt("select count(*) c from medusa.customer where deleted_at is null"), beforeCustomers);
  assert.equal(await cnt("select count(*) c from medusa.customer_address"), 0);
  assert.equal(await cnt("select count(*) c from ext.migration_map"), 0);
});

test("apply maps customers, links and addresses without duplicates", async () => {
  first = await db.runStep(customers, "apply");
  const c = first.counts;
  assert.equal(c.profiles_read, 6);
  assert.equal(c.admin_profiles_not_customers, 1);
  assert.equal(c.customers_created, 1);            // erin
  assert.equal(c.customers_matched_by_email, 1);   // carol
  assert.equal(c.customers_updated, 2);            // alice, bob (linked by the sign-up trigger)
  assert.equal(c.customer_skipped, 1);             // no email
  assert.equal(c.addresses_created, 2);
  assert.equal(c.address_skipped, 1);              // admin's address

  // alice: the trigger customer is reused, name/phone filled, lowercase email
  const alice = await one(`select c.* from ext.customer_auth_link l join medusa.customer c on c.id = l.customer_id where l.auth_user_id = $1`, [U(1)]);
  assert.equal(alice.email, "alice@example.com");
  assert.equal(alice.has_account, true);
  assert.equal([alice.first_name, alice.last_name, alice.phone].join("|"), "Alice|Rao|+919876543210");
  // carol: linked to the earlier customer, still one row
  assert.equal((await one("select customer_id from ext.customer_auth_link where auth_user_id = $1", [U(3)])).customer_id, "cus_preexisting_carol");
  assert.equal(await cnt("select count(*) c from medusa.customer where lower(email) = 'carol@example.com' and deleted_at is null"), 1);
  assert.equal((await one("select last_name from medusa.customer where id = 'cus_preexisting_carol'")).last_name, "Dsouza Jr");
  // erin: created and linked
  assert.equal(await cnt(`select count(*) c from ext.customer_auth_link l join medusa.customer c on c.id = l.customer_id where l.auth_user_id = '${U(5)}' and c.email = 'erin@example.com'`), 1);
  // one customer per email, one link per auth user
  assert.equal(await cnt("select count(*) c from (select lower(email) from medusa.customer where deleted_at is null and email is not null group by 1 having count(*) > 1) d"), 0);
  // addresses
  const a = await admin.query("select * from medusa.customer_address where customer_id = $1 order by address_name desc", [alice.id]);
  assert.equal(a.rowCount, 2);
  const home = a.rows.find((r) => r.address_name === "Home");
  assert.equal([home.address_1, home.address_2, home.city, home.province, home.postal_code, home.country_code, home.is_default_shipping].join("|"),
    "1 Main Rd|Flat 2|Pune|Maharashtra|411001|in|true");
  assert.equal(a.rows.find((r) => r.address_name === "Work").is_default_shipping, false);
  assert.equal(home.metadata.landmark, "Near park");
  // no secrets copied
  assert.equal(JSON.stringify(alice.metadata).includes("password"), false);
});

test("skip reasons are reported", () => {
  const r = first.reasons.join("\n");
  assert.match(r, /customer 00000000-0000-0000-0000-000000000006: no email/);
  assert.match(r, /address 10000000-0000-0000-0000-000000000003: its profile was not migrated as a customer/);
});

test("re-run is idempotent", async () => {
  const q = ["medusa.customer", "medusa.customer_address", "ext.customer_auth_link", "ext.migration_map"];
  const count = async () => Promise.all(q.map((t) => cnt(`select count(*) c from ${t}`)));
  const b = await count();
  const again = await db.runStep(customers, "apply");
  assert.deepEqual(await count(), b);
  assert.equal(again.counts.customers_created ?? 0, 0);
  assert.equal(again.counts.addresses_created ?? 0, 0);
  assert.equal(again.counts.links_created ?? 0, 0);
  assert.equal(again.counts.addresses_updated, 2);
});
