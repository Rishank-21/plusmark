// Integration test for the admin_users step (task 23.3). Run: node --test scripts/migrate-legacy/admin-users.test.mjs (needs Docker)
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import * as adminUsers from "./steps/admin-users.mjs";
import { startScratch } from "./testdb.mjs";

let db, admin, one;
const U = (n) => `00000000-0000-0000-0000-00000000000${n}`;

before(async () => {
  db = await startScratch("mig-admins");
  admin = db.admin; one = db.one;
  for (const [n, email] of [[1, "ann@example.com"], [2, "ben@example.com"], [3, "cat@example.com"], [4, "dan@example.com"]]) {
    await admin.query("insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values ($1, $2, now(), '{}'::jsonb)", [U(n), email]);
  }
  const prof = (n, name, role) => admin.query(
    `insert into public.profiles (id, full_name, role) values ($1, $2, $3)
     on conflict (id) do update set full_name = excluded.full_name, role = excluded.role`, [U(n), name, role]);
  await prof(1, "Ann Admin", "admin");
  await prof(2, "Ben Admin", "admin");
  await prof(3, "Cat Customer", "customer");
  await prof(4, "Dan Admin", "admin");
  // Dan's email already belongs to an Admin_User linked to someone else -> skipped, not duplicated
  await admin.query("delete from auth.users where false");
  await admin.query("insert into medusa.\"user\" (id, email) values ('user_other', 'dan@example.com')");
  await admin.query("insert into auth.users (id, email) values ($1, 'other@example.com')", [U(9)]);
  await admin.query("insert into ext.admin_user_link (auth_user_id, user_id, status) values ($1, 'user_other', 'active')", [U(9)]);
  // Ben is already an Admin_User with the owner Role and is disabled: must stay untouched
  await admin.query("insert into medusa.\"user\" (id, email) values ('user_ben', 'ben@example.com')");
  await admin.query("insert into ext.admin_user_link (auth_user_id, user_id, status) values ($1, 'user_ben', 'disabled')", [U(2)]);
  await admin.query("insert into ext.admin_user_role (auth_user_id, role_id) select $1, id from ext.role where name = 'owner'", [U(2)]);
});
after(async () => { await db?.stop(); });

const cnt = async (sql) => Number((await one(sql)).c);
let first;

test("dry_run changes nothing", async () => {
  const links = await cnt("select count(*) c from ext.admin_user_link");
  const out = await db.runStep(adminUsers, "dry_run");
  assert.equal(out.counts.admins_created, 1);
  assert.equal(await cnt("select count(*) c from ext.admin_user_link"), links);
  assert.equal(await cnt("select count(*) c from ext.migration_map"), 0);
});

test("apply creates active manager-only Admin_Users and reports skips", async () => {
  first = await db.runStep(adminUsers, "apply");
  const c = first.counts;
  assert.equal(c.admin_profiles_read, 3);
  assert.equal(c.admins_created, 1);
  assert.equal(c.admins_existing, 1);
  assert.equal(c.admins_skipped, 1);
  assert.equal(c.manager_roles_granted, 1);

  const ann = await one(`select l.status, u.email, u.first_name, u.last_name, array_agg(r.name) roles from ext.admin_user_link l
      join medusa."user" u on u.id = l.user_id left join ext.admin_user_role ur on ur.auth_user_id = l.auth_user_id
      left join ext.role r on r.id = ur.role_id where l.auth_user_id = $1 group by 1, 2, 3, 4`, [U(1)]);
  assert.deepEqual(ann, { status: "active", email: "ann@example.com", first_name: "Ann", last_name: "Admin", roles: ["manager"] });
  // never owner, for anything the step created
  assert.equal(await cnt(`select count(*) c from ext.admin_user_role ur join ext.role r on r.id = ur.role_id
      where r.name = 'owner' and ur.auth_user_id = '${U(1)}'`), 0);
  // customer profile is not an admin
  assert.equal(await cnt(`select count(*) c from ext.admin_user_link where auth_user_id = '${U(3)}'`), 0);
  // Ben untouched
  const ben = await one(`select l.status, array_agg(r.name) roles from ext.admin_user_link l join ext.admin_user_role ur on ur.auth_user_id = l.auth_user_id
      join ext.role r on r.id = ur.role_id where l.auth_user_id = $1 group by 1`, [U(2)]);
  assert.deepEqual(ben, { status: "disabled", roles: ["owner"] });
  // Dan skipped, no duplicate user
  assert.match(first.reasons.join("\n"), /admin 00000000-0000-0000-0000-000000000004: database error: email dan@example.com already belongs to another Admin_User/);
  assert.equal(await cnt(`select count(*) c from medusa."user" where email = 'dan@example.com'`), 1);
});

test("re-run is idempotent", async () => {
  const q = ["medusa.\"user\"", "ext.admin_user_link", "ext.admin_user_role", "ext.migration_map"];
  const count = async () => Promise.all(q.map((t) => cnt(`select count(*) c from ${t}`)));
  const b = await count();
  const again = await db.runStep(adminUsers, "apply");
  assert.deepEqual(await count(), b);
  assert.equal(again.counts.admins_created ?? 0, 0);
  assert.equal(again.counts.manager_roles_granted ?? 0, 0);
});
