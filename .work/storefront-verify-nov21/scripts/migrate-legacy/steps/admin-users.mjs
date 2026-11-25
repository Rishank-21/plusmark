// Task 23.3: legacy admin profiles -> Admin_Users with the manager Role (Requirements 18.1, 18.3).
//
// Source: public.profiles where role = 'admin'. Target: medusa."user", ext.admin_user_link, ext.admin_user_role.
// Every migrated admin gets the predefined `manager` Role only; the owner Role is never granted (the owner is created by
// the bootstrap flow). The link status is 'active'; access still needs an aal2 session, so MFA enrolment happens at the
// first sign-in (the permission check refuses aal1). The auth user must already exist in the target (same Auth project);
// otherwise the admin is skipped with a reason, because the link references auth.users. No password or secret is copied.
//
// Idempotent through ext.migration_map (entity 'admin_user'): an existing link keeps its status and Roles (an admin that was
// disabled stays disabled, other Roles are not removed) and only gets the manager Role if it has no Role at all.
export const name = "admin_users";

const text = (v) => (v == null ? "" : String(v).trim());

export async function run(ctx) {
  const { source, target: t, log } = ctx;
  const counts = {};
  const reasons = [];
  const bump = (k, n = 1) => { counts[k] = (counts[k] ?? 0) + n; };
  const skip = (id, why) => { bump("admins_skipped"); reasons.push(`admin ${id}: ${why}`); };

  const manager = (await t.query("select id from ext.role where name = 'manager' and is_system")).rows[0]?.id;
  if (!manager) throw new Error("predefined manager Role not found in ext.role");

  const profiles = (await source.query("select id, full_name, email from public.profiles where role = 'admin' order by created_at, id")).rows;
  bump("admin_profiles_read", profiles.length);
  const authUsers = new Map((await t.query("select id::text id, email from auth.users")).rows.map((r) => [r.id, r.email]));

  let sp = 0;
  for (const p of profiles) {
    if (!authUsers.has(p.id)) { skip(p.id, "auth user not found in the target"); continue; }
    const email = text(p.email || authUsers.get(p.id)).toLowerCase();
    if (!email) { skip(p.id, "no email on the profile or the auth user"); continue; }
    const full = text(p.full_name);
    const i = full.indexOf(" ");
    const first = (i < 0 ? full : full.slice(0, i)) || null;
    const last = (i < 0 ? "" : full.slice(i + 1).trim()) || null;

    const s = `adm_row_${++sp}`;
    await t.query(`savepoint ${s}`);
    try {
      const link = (await t.query("select user_id from ext.admin_user_link where auth_user_id = $1", [p.id])).rows[0];
      let userId = link?.user_id;
      if (!userId) {
        const u = (await t.query(
          `select u.id from medusa."user" u where lower(u.email) = $1 and u.deleted_at is null
              and not exists (select 1 from ext.admin_user_link l where l.user_id = u.id) limit 1`, [email])).rows[0];
        if (u) {
          userId = u.id;
          await t.query(`update medusa."user" set first_name = coalesce($2, first_name), last_name = coalesce($3, last_name), updated_at = now() where id = $1`, [userId, first, last]);
        } else {
          if ((await t.query(`select 1 from medusa."user" where lower(email) = $1 and deleted_at is null`, [email])).rowCount) {
            throw new Error(`email ${email} already belongs to another Admin_User`);
          }
          userId = (await t.query("select internal.generate_id_for('user') id")).rows[0].id;
          await t.query(`insert into medusa."user" (id, email, first_name, last_name, metadata) values ($1, $2, $3, $4, $5::jsonb)`,
            [userId, email, first, last, JSON.stringify({ legacy_id: p.id })]);
        }
        await t.query("insert into ext.admin_user_link (auth_user_id, user_id, status) values ($1, $2, 'active')", [p.id, userId]);
        bump("admins_created");
      } else {
        bump("admins_existing");
      }
      const has = (await t.query("select count(*)::int c from ext.admin_user_role where auth_user_id = $1", [p.id])).rows[0].c;
      if (!has) {
        await t.query("insert into ext.admin_user_role (auth_user_id, role_id) values ($1, $2) on conflict do nothing", [p.id, manager]);
        bump("manager_roles_granted");
      }
      await t.query(
        `insert into ext.migration_map (entity, legacy_id, new_id) values ('admin_user', $1, $2)
         on conflict (entity, legacy_id) do update set new_id = excluded.new_id`, [p.id, userId]);
      await t.query(`release savepoint ${s}`);
    } catch (e) {
      await t.query(`rollback to savepoint ${s}`);
      await t.query(`release savepoint ${s}`);
      skip(p.id, `database error: ${String(e.message).split("\n")[0]}`);
    }
  }
  log(`admin_users: ${JSON.stringify(counts)}`);
  return { counts, reasons };
}
