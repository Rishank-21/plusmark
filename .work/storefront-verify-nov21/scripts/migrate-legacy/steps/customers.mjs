// Task 23.3: legacy profiles/addresses -> Medusa customers, customer addresses and Auth links (Requirements 18.1, 18.3).
//
// Source (legacy public tables): profiles (id = auth user id, full_name, phone, email, role) and addresses.
// Target: medusa.customer (has_account), medusa.customer_address, ext.customer_auth_link.
//
// Only role 'customer' profiles are customers; admin profiles are handled by the admin_users step.
// Auth link: the auth user id is carried over (same Supabase project), so the link is auth.users.id -> customer.
//   1. an existing link of the auth user is reused (the auth.users insert trigger already created it for new sign-ups);
//   2. otherwise an unlinked has_account customer with the same lowercased email is linked;
//   3. otherwise a customer is created and linked (ON CONFLICT DO NOTHING).
// If the auth user does not exist in the target, the customer is still created (has_account, no link): the sign-up trigger
// links it by email at the user's first sign-in. Passwords and other auth secrets are never read or copied.
//
// Idempotency: ext.migration_map (entity 'customer' / 'customer_address'). Each row runs in a savepoint; rows that cannot be
// mapped are rolled back alone and listed in `reasons`. Runs inside the caller's transaction (dry_run rolls back).
export const name = "customers";

const text = (v) => (v == null ? "" : String(v).trim());

export async function run(ctx) {
  const { source, target: t, log } = ctx;
  const counts = {};
  const reasons = [];
  const bump = (k, n = 1) => { counts[k] = (counts[k] ?? 0) + n; };
  const skip = (kind, id, why) => { bump(`${kind}_skipped`); reasons.push(`${kind} ${id}: ${why}`); };

  let sp = 0;
  async function row(kind, id, fn) {
    const s = `cus_row_${++sp}`;
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
  async function setMap(entity, legacyId, newId) {
    maps[entity].set(String(legacyId), newId);
    await t.query(
      `insert into ext.migration_map (entity, legacy_id, new_id) values ($1, $2, $3)
       on conflict (entity, legacy_id) do update set new_id = excluded.new_id`, [entity, String(legacyId), newId]);
  }
  const live = async (id) => !!id && (await t.query("select 1 from medusa.customer where id = $1 and deleted_at is null", [id])).rowCount > 0;
  const newId = async (table) => (await t.query("select internal.generate_id_for($1) id", [table])).rows[0].id;

  await loadMap("customer");
  await loadMap("customer_address");

  const profiles = (await source.query("select id, full_name, phone, email, role, marketing_opt_in from public.profiles order by created_at, id")).rows;
  bump("profiles_read", profiles.length);
  const authUsers = new Map((await t.query("select id::text id, email from auth.users")).rows.map((r) => [r.id, r.email]));

  const customerOf = new Map(); // profile id -> medusa customer id
  for (const p of profiles) {
    if (p.role === "admin") { bump("admin_profiles_not_customers"); continue; }
    const authKnown = authUsers.has(p.id);
    const email = text(p.email || authUsers.get(p.id)).toLowerCase();
    if (!email) { skip("customer", p.id, "no email on the profile or the auth user"); continue; }
    const full = text(p.full_name);
    const sp1 = full.indexOf(" ");
    const first = (sp1 < 0 ? full : full.slice(0, sp1)) || null;
    const last = (sp1 < 0 ? "" : full.slice(sp1 + 1).trim()) || null;
    const phone = /^[6-9][0-9]{9}$/.test(text(p.phone)) ? `+91${text(p.phone)}` : null;
    const metadata = JSON.stringify({ legacy_id: p.id, marketing_opt_in: !!p.marketing_opt_in });

    const cid = await row("customer", p.id, async () => {
      let id = null;
      let how = null;
      if (authKnown) {
        id = (await t.query("select l.customer_id from ext.customer_auth_link l join medusa.customer c on c.id = l.customer_id and c.deleted_at is null where l.auth_user_id = $1", [p.id])).rows[0]?.customer_id ?? null;
        if (id) how = "link";
      }
      if (!id) {
        const m = maps.customer.get(p.id);
        if (await live(m)) { id = m; how = "map"; }
      }
      if (!id) {
        id = (await t.query(
          `select c.id from medusa.customer c
            where lower(c.email) = $1 and c.has_account and c.deleted_at is null
              and not exists (select 1 from ext.customer_auth_link l where l.customer_id = c.id)
            order by c.created_at, c.id limit 1`, [email])).rows[0]?.id ?? null;
        if (id) how = "email";
      }
      if (id) {
        await t.query(
          `update medusa.customer set first_name = coalesce($2, first_name), last_name = coalesce($3, last_name),
                  phone = coalesce($4, phone), metadata = coalesce(metadata, '{}'::jsonb) || $5::jsonb,
                  has_account = true, updated_at = now() where id = $1`,
          [id, first, last, phone, metadata]);
        bump(how === "email" ? "customers_matched_by_email" : "customers_updated");
      } else {
        id = await newId("customer");
        await t.query(
          `insert into medusa.customer (id, email, first_name, last_name, phone, has_account, metadata)
           values ($1, $2, $3, $4, $5, true, $6::jsonb)`, [id, email, first, last, phone, metadata]);
        bump("customers_created");
      }
      if (authKnown) {
        const r = await t.query(
          "insert into ext.customer_auth_link (auth_user_id, customer_id) values ($1, $2) on conflict do nothing", [p.id, id]);
        if (r.rowCount) bump("links_created");
        const linked = (await t.query("select customer_id from ext.customer_auth_link where auth_user_id = $1", [p.id])).rows[0]?.customer_id;
        if (linked !== id) throw new Error(`customer ${id} is already linked to another auth user`);
      } else {
        bump("customers_without_auth_user");
        reasons.push(`note customer ${p.id}: auth user not found in the target, customer created without an Auth link (linked by email at first sign-in)`);
      }
      await setMap("customer", p.id, id);
      return id;
    });
    if (cid) customerOf.set(p.id, cid);
  }

  // ------------------------------------------------------------------ addresses
  const addrs = (await source.query("select * from public.addresses order by created_at, id")).rows;
  bump("addresses_read", addrs.length);
  for (const a of addrs) {
    const cid = customerOf.get(a.user_id);
    if (!cid) { skip("address", a.id, "its profile was not migrated as a customer"); continue; }
    await row("address", a.id, async () => {
      const full = text(a.full_name);
      const i = full.indexOf(" ");
      const first = (i < 0 ? full : full.slice(0, i)) || null;
      const last = (i < 0 ? "" : full.slice(i + 1).trim()) || null;
      const phone = /^[6-9][0-9]{9}$/.test(text(a.phone)) ? `+91${text(a.phone)}` : null;
      const meta = JSON.stringify({ legacy_id: a.id, landmark: a.landmark ?? null });
      const args = [cid, text(a.label) || null, !!a.is_default, first, last, text(a.line1), text(a.line2) || null,
        text(a.city), text(a.state), text(a.pincode), phone, meta];
      let id = maps.customer_address.get(String(a.id));
      if (id && !(await t.query("select 1 from medusa.customer_address where id = $1 and deleted_at is null", [id])).rowCount) id = null;
      if (a.is_default) {
        await t.query("update medusa.customer_address set is_default_shipping = false where customer_id = $1 and is_default_shipping and id <> $2", [cid, id ?? ""]);
      }
      if (id) {
        await t.query(
          `update medusa.customer_address set customer_id = $2, address_name = $3, is_default_shipping = $4, first_name = $5, last_name = $6,
                  address_1 = $7, address_2 = $8, city = $9, province = $10, postal_code = $11, phone = $12, metadata = $13::jsonb,
                  country_code = 'in', updated_at = now() where id = $1`, [id, ...args]);
        bump("addresses_updated");
      } else {
        id = await newId("customer_address");
        await t.query(
          `insert into medusa.customer_address (id, customer_id, address_name, is_default_shipping, first_name, last_name, address_1,
                  address_2, city, province, postal_code, phone, metadata, country_code)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, 'in')`, [id, ...args]);
        bump("addresses_created");
      }
      await setMap("customer_address", a.id, id);
    });
  }

  log(`customers: ${JSON.stringify(counts)}`);
  return { counts, reasons };
}
