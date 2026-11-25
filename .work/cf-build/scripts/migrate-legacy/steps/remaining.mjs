// Task 23.5: reviews, saved boards, coupons, shipping methods, site content and payment events (Requirements 18.1, 18.2).
//
// Source (legacy public tables) -> target:
//   product_reviews -> ext.product_review. product_slug resolves to the product, user_id to the customer (ext.migration_map).
//                      The legacy table has no status and no verified flag: every legacy review was publicly visible, so it becomes
//                      'approved'; verified_purchase is recomputed with internal.review_is_verified (imported orders have no delivered
//                      fulfillment, so it normally stays false until deliveries exist). The rating summary follows by trigger.
//                      Nothing here queues notifications. A re-run updates rating/title/body only, so moderation done since stays.
//   saved_boards    -> one default ext.wishlist per customer (named 'Wishlist') with one ext.wishlist_item per saved product.
//                      product_id is a catalogue slug; unknown slugs are listed in `reasons`.
//   coupons         -> medusa.promotion (standard, code via internal.normalize_promotion_code, not automatic) with an order-level
//                      application method written by internal.promotion_write_method (percent -> percentage, across; flat -> fixed INR,
//                      across), a cart rule item_total >= minimum_order_inr (rupees, the unit the cart rules use), and one
//                      medusa.promotion_campaign per coupon carrying the dates (starts_at 00:00 IST, ends_at inclusive to the end of
//                      that day) plus, when usage_limit is set, a 'usage' campaign budget whose `used` is the legacy used_count.
//                      Coupons the supported shape cannot express (bad code, percentage over 100, ends before it starts, ...) are
//                      skipped with a reason.
//   shipping_methods-> flat medusa.shipping_option in the first service zone (created, with an India geo zone, when none exists),
//                      default shipping profile, manual provider, type 'standard'; price_inr becomes the INR price through
//                      internal.pricing_save_price. A method without a price ("on request") cannot be a flat option and is skipped
//                      with a reason. available = false -> enable_in_store = false. ETA and description stay in metadata.
//   site_content    -> Store_Settings: key 'content.<legacy key>' (segments lower-cased, other characters become '_'), type json,
//                      category 'content'. Keys that normalize to the same setting are reported.
//   payment_events  -> ext.webhook_event with status 'ignored' (dedupe history only: they are never re-applied to payments, the
//                      orders step already imported the payment columns). The payload is reduced to ids, amount and status.
//
// Idempotency: ext.migration_map (entities review, wishlist, wishlist_item, coupon, coupon_campaign, shipping_option, ...);
// payment events by the unique (provider, event_id). Every row runs in a savepoint; a failing row is rolled back alone and listed.
// Runs inside the caller's transaction (dry_run rolls back).
export const name = "remaining";

const text = (v) => (v == null ? "" : String(v).trim());
const IST = "Asia/Kolkata";

export async function run(ctx) {
  const { source, target: t, log } = ctx;
  const counts = {};
  const reasons = [];
  const bump = (k, n = 1) => { counts[k] = (counts[k] ?? 0) + n; };
  const skip = (kind, id, why) => { bump(`${kind}_skipped`); reasons.push(`${kind} ${id}: ${why}`); };
  const q = async (sql, p = []) => (await t.query(sql, p)).rows;
  const newId = async (table) => (await q("select internal.generate_id_for($1) id", [table]))[0].id;

  let sp = 0;
  // Runs fn in a savepoint; a database error rolls back only this row and is reported as a skip. fn may return false after skip().
  async function row(kind, id, fn) {
    const s = `rem_row_${++sp}`;
    await t.query(`savepoint ${s}`);
    try {
      const r = await fn();
      await t.query(`release savepoint ${s}`);
      return r;
    } catch (e) {
      await t.query(`rollback to savepoint ${s}`);
      await t.query(`release savepoint ${s}`);
      skip(kind, id, `database error: ${String(e.message).split("\n")[0]}`);
      return null;
    }
  }

  const maps = {};
  async function loadMap(entity) {
    maps[entity] = new Map((await q("select legacy_id, new_id from ext.migration_map where entity = $1", [entity])).map((r) => [r.legacy_id, r.new_id]));
  }
  const mapped = (entity, legacyId) => maps[entity].get(String(legacyId));
  async function setMap(entity, legacyId, newId) {
    maps[entity].set(String(legacyId), newId);
    await t.query(
      `insert into ext.migration_map (entity, legacy_id, new_id) values ($1, $2, $3)
       on conflict (entity, legacy_id) do update set new_id = excluded.new_id`, [entity, String(legacyId), newId]);
  }
  const live = async (table, id) => !!id && (await q(`select 1 from medusa.${table} where id = $1 and deleted_at is null`, [id])).length > 0;
  const liveExt = async (table, id) => !!id && (await q(`select 1 from ext.${table} where id = $1`, [id])).length > 0;

  for (const e of ["customer", "product", "review", "wishlist", "wishlist_item", "coupon", "coupon_campaign", "shipping_option",
    "service_zone", "shipping_profile"]) await loadMap(e);

  // legacy product slug / id -> medusa product id
  const productBySlug = new Map();
  for (const p of (await source.query("select id, slug from public.products")).rows) {
    const pid = mapped("product", p.id);
    if (pid) { productBySlug.set(text(p.slug), pid); productBySlug.set(String(p.id), pid); }
  }
  async function resolveProduct(slug) {
    const s = text(slug);
    const viaLegacy = productBySlug.get(s);
    if (viaLegacy && (await live("product", viaLegacy))) return viaLegacy;
    return (await q("select id from medusa.product where handle = $1 and deleted_at is null limit 1", [s]))[0]?.id ?? null;
  }

  // ------------------------------------------------------------------ reviews
  for (const r of (await source.query("select * from public.product_reviews order by created_at, id")).rows) {
    bump("reviews_read");
    await row("review", r.id, async () => {
      const customerId = mapped("customer", r.user_id);
      if (!customerId || !(await live("customer", customerId))) return skip("review", r.id, `author ${r.user_id} was not migrated as a customer`);
      const productId = await resolveProduct(r.product_slug);
      if (!productId) return skip("review", r.id, `no product for slug "${r.product_slug}"`);
      const title = text(r.title) || null;
      const body = text(r.body);
      if (!body) return skip("review", r.id, "empty body");
      const rating = Number(r.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return skip("review", r.id, `rating ${r.rating} out of range`);

      let id = mapped("review", r.id);
      if (!(await liveExt("product_review", id))) id = null;
      if (!id) id = (await q("select id from ext.product_review where product_id = $1 and customer_id = $2", [productId, customerId]))[0]?.id ?? null;
      if (id) {
        await t.query("update ext.product_review set rating = $2, title = $3, body = $4 where id = $1", [id, rating, title, body]);
        bump("reviews_updated");
      } else {
        id = (await q(
          `insert into ext.product_review (product_id, customer_id, rating, title, body, verified_purchase, status, moderated_at, created_at, updated_at)
           values ($1, $2, $3, $4, $5, internal.review_is_verified($2, $1), 'approved', $6, $6, $7) returning id`,
          [productId, customerId, rating, title, body, r.created_at, r.updated_at ?? r.created_at]))[0].id;
        bump("reviews_created");
      }
      await setMap("review", r.id, id);
    });
  }

  // ------------------------------------------------------------------ saved boards -> wishlists
  const boards = (await source.query("select user_id, product_id, created_at from public.saved_boards order by user_id, created_at, product_id")).rows;
  bump("saved_boards_read", boards.length);
  const wishlistOf = new Map(); // legacy user id -> wishlist id
  for (const b of boards) {
    const key = `${b.user_id}:${b.product_id}`;
    await row("saved_board", key, async () => {
      const customerId = mapped("customer", b.user_id);
      if (!customerId || !(await live("customer", customerId))) return skip("saved_board", key, `user ${b.user_id} was not migrated as a customer`);
      const productId = await resolveProduct(b.product_id);
      if (!productId) return skip("saved_board", key, `no product for slug "${b.product_id}"`);

      let wl = wishlistOf.get(String(b.user_id)) ?? mapped("wishlist", b.user_id);
      if (!(await liveExt("wishlist", wl))) wl = null;
      if (!wl) wl = (await q("select id from ext.wishlist where customer_id = $1 order by created_at, id limit 1", [customerId]))[0]?.id ?? null;
      if (!wl) {
        wl = (await q("insert into ext.wishlist (customer_id, name, created_at) values ($1, 'Wishlist', $2) returning id", [customerId, b.created_at]))[0].id;
        bump("wishlists_created");
      }
      wishlistOf.set(String(b.user_id), wl);
      await setMap("wishlist", b.user_id, wl);

      const ins = await q(
        `insert into ext.wishlist_item (wishlist_id, product_id, created_at) values ($1, $2, $3)
         on conflict (wishlist_id, product_id, coalesce(variant_id, '')) do nothing returning id`, [wl, productId, b.created_at]);
      if (ins.length) { bump("wishlist_items_created"); await setMap("wishlist_item", key, ins[0].id); }
      else {
        bump("wishlist_items_unchanged");
        const ex = (await q("select id from ext.wishlist_item where wishlist_id = $1 and product_id = $2 and variant_id is null", [wl, productId]))[0]?.id;
        if (ex) await setMap("wishlist_item", key, ex);
      }
    });
  }

  // ------------------------------------------------------------------ coupons -> promotions
  for (const c of (await source.query("select * from public.coupons order by created_at, id")).rows) {
    bump("coupons_read");
    await row("coupon", c.id, async () => {
      const code = (await q("select internal.normalize_promotion_code($1) c", [text(c.code)]))[0].c;
      if (!code || !/^[A-Z0-9][A-Z0-9_.-]{0,99}$/.test(code)) return skip("coupon", c.id, `code "${c.code}" cannot be used as a promotion code`);
      const percent = c.kind === "percent";
      if (!percent && c.kind !== "flat") return skip("coupon", c.id, `unknown kind "${c.kind}"`);
      if (percent && Number(c.value) > 100) return skip("coupon", c.id, `percentage ${c.value} is over 100`);
      const dates = (await q(
        `select ($1::date::timestamp at time zone $3) s, (($2::date + 1)::timestamp at time zone $3) e`, [c.starts_at, c.ends_at, IST]))[0];
      if (dates.e <= dates.s) return skip("coupon", c.id, `ends_at ${c.ends_at} is before starts_at ${c.starts_at}`);

      // promotion
      let pid = mapped("coupon", c.id);
      if (!(await live("promotion", pid))) pid = null;
      if (!pid) pid = (await q("select id from medusa.promotion where deleted_at is null and upper(code) = $1 limit 1", [code]))[0]?.id ?? null;
      const status = c.active ? "active" : "inactive";
      const metadata = JSON.stringify({ legacy_id: String(c.id), description: text(c.description) || null, legacy_kind: c.kind });
      const created = !pid;
      if (!pid) {
        pid = await newId("promotion");
        await t.query("insert into medusa.promotion (id, code, type, status, is_automatic, used, metadata) values ($1, $2, 'standard', 'draft', false, $3, $4::jsonb)",
          [pid, code, c.used_count ?? 0, metadata]);
      }

      // campaign (dates) and budget (usage limit)
      let cid = mapped("coupon_campaign", c.id);
      if (!(await live("promotion_campaign", cid))) cid = null;
      const ident = `legacy-coupon-${code.toLowerCase()}`;
      if (!cid) cid = (await q("select id from medusa.promotion_campaign where campaign_identifier = $1 and deleted_at is null limit 1", [ident]))[0]?.id ?? null;
      if (!cid) {
        cid = await newId("promotion_campaign");
        await t.query("insert into medusa.promotion_campaign (id, name, campaign_identifier) values ($1, $2, $3)", [cid, `Legacy coupon ${code}`, ident]);
      }
      await t.query(
        "update medusa.promotion_campaign set description = $2, starts_at = $3, ends_at = $4, updated_at = now() where id = $1",
        [cid, text(c.description) || null, dates.s, dates.e]);
      await setMap("coupon_campaign", c.id, cid);
      const bud = (await q("select id from medusa.promotion_campaign_budget where campaign_id = $1 and deleted_at is null", [cid]))[0]?.id;
      if (c.usage_limit != null) {
        if (bud) {
          await t.query(
            `update medusa.promotion_campaign_budget set type = 'usage', "limit" = $2, raw_limit = internal.promotion_usage_raw($2::numeric),
                    used = $3, raw_used = internal.promotion_usage_raw($3::numeric), updated_at = now() where id = $1`, [bud, c.usage_limit, c.used_count ?? 0]);
        } else {
          await t.query(
            `insert into medusa.promotion_campaign_budget (id, type, campaign_id, "limit", raw_limit, used, raw_used)
             values ($1, 'usage', $2, $3, internal.promotion_usage_raw($3::numeric), $4, internal.promotion_usage_raw($4::numeric))`,
            [await newId("promotion_campaign_budget"), cid, c.usage_limit, c.used_count ?? 0]);
        }
        bump("coupon_budgets_written");
      } else if (bud) {
        await t.query("update medusa.promotion_campaign_budget set deleted_at = now(), updated_at = now() where id = $1", [bud]);
      }

      // application method and rules (full replacement, so a re-run follows the legacy row)
      await t.query(
        `select internal.promotion_write_method($1, 'standard', jsonb_build_object('type', $2::text, 'target_type', 'order', 'allocation', 'across',
                'value', $3::numeric, 'currency_code', $4::text))`, [pid, percent ? "percentage" : "fixed", c.value, percent ? null : "inr"]);
      const old = (await q("select promotion_rule_id from medusa.promotion_promotion_rule where promotion_id = $1", [pid])).map((r) => r.promotion_rule_id);
      await t.query("delete from medusa.promotion_promotion_rule where promotion_id = $1", [pid]);
      await t.query("select internal.promotion_drop_rules($1::text[])", [old]);
      if (Number(c.minimum_order_inr) > 0) {
        const ids = (await q(
          `select internal.promotion_create_rules(jsonb_build_array(jsonb_build_object('attribute', 'item_total', 'operator', 'gte',
                   'values', jsonb_build_array($1::numeric))), 'cart', 'rules') ids`, [c.minimum_order_inr]))[0].ids;
        await t.query("insert into medusa.promotion_promotion_rule (promotion_id, promotion_rule_id) select $1, x from unnest($2::text[]) x", [pid, ids]);
        bump("coupon_minimum_rules");
      }
      await t.query(
        `update medusa.promotion set status = $2, campaign_id = $3, used = $4, metadata = $5::jsonb, updated_at = now() where id = $1`,
        [pid, status, cid, c.used_count ?? 0, metadata]);
      await setMap("coupon", c.id, pid);
      bump(created ? "coupons_created" : "coupons_updated");
    });
  }

  // ------------------------------------------------------------------ shipping methods -> shipping options
  const methods = (await source.query("select * from public.shipping_methods order by sort_order, id")).rows;
  bump("shipping_methods_read", methods.length);
  let zoneId = null, profileId = null, typeId = null;
  async function shippingBase() {
    if (zoneId) return;
    zoneId = mapped("service_zone", "default");
    if (!(await live("service_zone", zoneId))) {
      zoneId = (await q("select id from medusa.service_zone where deleted_at is null order by created_at, id limit 1"))[0]?.id;
      if (!zoneId) {
        const setId = await newId("fulfillment_set");
        await t.query("insert into medusa.fulfillment_set (id, name, type) values ($1, 'Shipping', 'shipping')", [setId]);
        zoneId = await newId("service_zone");
        await t.query("insert into medusa.service_zone (id, name, fulfillment_set_id) values ($1, 'India', $2)", [zoneId, setId]);
        await t.query("insert into medusa.geo_zone (id, type, country_code, service_zone_id) values ($1, 'country', 'in', $2)", [await newId("geo_zone"), zoneId]);
        bump("service_zones_created");
      }
      await setMap("service_zone", "default", zoneId);
    }
    profileId = mapped("shipping_profile", "default");
    if (!(await live("shipping_profile", profileId))) {
      profileId = (await q("select id from medusa.shipping_profile where deleted_at is null order by (type = 'default') desc, created_at, id limit 1"))[0]?.id;
      if (!profileId) {
        profileId = await newId("shipping_profile");
        await t.query("insert into medusa.shipping_profile (id, name, type) values ($1, 'Default', 'default')", [profileId]);
        bump("shipping_profiles_created");
      }
      await setMap("shipping_profile", "default", profileId);
    }
    typeId = (await q("select id from medusa.shipping_option_type where code = 'standard' and deleted_at is null order by id limit 1"))[0]?.id;
    if (!typeId) {
      typeId = await newId("shipping_option_type");
      await t.query("insert into medusa.shipping_option_type (id, label, code) values ($1, 'Standard', 'standard')", [typeId]);
    }
    await t.query("insert into medusa.fulfillment_provider (id, is_enabled) values ('manual_manual', true) on conflict (id) do nothing");
  }
  for (const m of methods) {
    await row("shipping_method", m.id, async () => {
      if (!text(m.name)) return skip("shipping_method", m.id, "empty name");
      if (m.price_inr == null) return skip("shipping_method", m.id, "price on request: a flat Shipping_Option needs a price");
      await shippingBase();
      const metadata = JSON.stringify({ legacy_id: String(m.id), description: text(m.description) || null, eta_min_days: m.eta_min_days,
        eta_max_days: m.eta_max_days, sort_order: m.sort_order });
      let id = mapped("shipping_option", m.id);
      if (!(await live("shipping_option", id))) id = null;
      if (id) {
        await t.query("update medusa.shipping_option set name = $2, metadata = $3::jsonb, updated_at = now() where id = $1", [id, m.name, metadata]);
        bump("shipping_options_updated");
      } else {
        id = await newId("shipping_option");
        await t.query(
          `insert into medusa.shipping_option (id, name, price_type, service_zone_id, shipping_profile_id, provider_id, metadata, shipping_option_type_id)
           values ($1, $2, 'flat', $3, $4, 'manual_manual', $5::jsonb, $6)`, [id, m.name, zoneId, profileId, metadata, typeId]);
        bump("shipping_options_created");
      }
      // rules: enable_in_store follows `available`; is_return stays false
      for (const [attr, val] of [["enable_in_store", !!m.available], ["is_return", false]]) {
        const cur = (await q("select id, value from medusa.shipping_option_rule where shipping_option_id = $1 and attribute = $2 and deleted_at is null", [id, attr]))[0];
        if (cur && cur.value === String(val)) continue;
        if (cur) await t.query("update medusa.shipping_option_rule set deleted_at = now() where id = $1", [cur.id]);
        await t.query(
          "insert into medusa.shipping_option_rule (id, attribute, operator, value, shipping_option_id) values ($1, $2, 'eq', to_jsonb($3::text), $4)",
          [await newId("shipping_option_rule"), attr, String(val), id]);
      }
      // price (INR, major units like the catalog prices)
      let ps = (await q("select price_set_id from medusa.shipping_option_price_set where shipping_option_id = $1 and deleted_at is null order by price_set_id limit 1", [id]))[0]?.price_set_id;
      if (!ps) {
        ps = await newId("price_set");
        await t.query("insert into medusa.price_set (id) values ($1)", [ps]);
        await t.query("insert into medusa.shipping_option_price_set (id, shipping_option_id, price_set_id) values (internal.generate_id('sops'), $1, $2)", [id, ps]);
      }
      const price = (await q("select id from medusa.price where price_set_id = $1 and currency_code = 'inr' and deleted_at is null and price_list_id is null order by id limit 1", [ps]))[0]?.id ?? null;
      await t.query(
        `select internal.pricing_save_price($1, null, jsonb_build_object('id', $2::text, 'currency_code', 'inr', 'amount', $3::numeric, 'rules', '{}'::jsonb))`,
        [ps, price, m.price_inr]);
      await setMap("shipping_option", m.id, id);
    });
  }

  // ------------------------------------------------------------------ site content -> Store_Settings
  const seen = new Map();
  for (const c of (await source.query("select key, value from public.site_content order by key")).rows) {
    bump("site_content_read");
    await row("site_content", c.key, async () => {
      const segs = text(c.key).toLowerCase().split(".").map((s) => s.replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, ""));
      if (!segs.length || segs.some((s) => !s)) return skip("site_content", c.key, "key cannot be turned into a setting key");
      const key = `content.${segs.map((s) => (/^[a-z]/.test(s) ? s : `k${s}`)).join(".")}`;
      if (key.length > 200) return skip("site_content", c.key, "key too long");
      if (seen.has(key)) return skip("site_content", c.key, `same setting key "${key}" as legacy key "${seen.get(key)}"`);
      seen.set(key, c.key);
      const def = (await q("select type from ext.setting_definition where key = $1", [key]))[0];
      if (def && def.type !== "json") return skip("site_content", c.key, `setting ${key} already exists with type ${def.type}`);
      if (!def) {
        await t.query(
          `insert into ext.setting_definition (key, type, default_value, nullable, category, description)
           values ($1, 'json', null, true, 'content', $2)`, [key, `Site content migrated from legacy key "${c.key}".`]);
      }
      const cur = (await q("select value from ext.store_setting where key = $1", [key]))[0];
      const json = JSON.stringify(c.value);
      if (cur && JSON.stringify(cur.value) === json) { bump("site_content_unchanged"); return; }
      await t.query(
        `insert into ext.store_setting (key, value) values ($1, $2::jsonb)
         on conflict (key) do update set value = excluded.value, version = ext.store_setting.version + 1, updated_at = now()`, [key, json]);
      bump(cur ? "site_content_updated" : "site_content_created");
    });
  }

  // ------------------------------------------------------------------ payment events -> ext.webhook_event
  for (const e of (await source.query("select * from public.payment_events order by received_at, event_id")).rows) {
    bump("payment_events_read");
    await row("payment_event", e.event_id, async () => {
      const pay = e.payload?.payload?.payment?.entity ?? {};
      const ord = e.payload?.payload?.order?.entity ?? {};
      const summary = JSON.stringify(Object.fromEntries(Object.entries({
        legacy: true, raw_type: text(e.event_type).slice(0, 100), provider_ref: pay.order_id ?? ord.id ?? null,
        razorpay_payment_id: pay.id ?? null, amount: pay.amount ?? ord.amount ?? null, status: pay.status ?? ord.status ?? null,
      }).filter(([, v]) => v !== null && v !== undefined)));
      const ins = await q(
        `insert into ext.webhook_event (provider, event_id, status, summary, received_at, processed_at)
         values ($1, $2, 'ignored', $3::jsonb, $4, $4) on conflict (provider, event_id) do nothing returning id`,
        [text(e.provider) || "razorpay", e.event_id, summary, e.received_at]);
      bump(ins.length ? "payment_events_created" : "payment_events_unchanged");
    });
  }

  log(`remaining: ${JSON.stringify(counts)}`);
  return { counts, reasons };
}
