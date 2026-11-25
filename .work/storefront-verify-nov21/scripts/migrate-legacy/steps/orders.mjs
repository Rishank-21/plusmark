// Task 23.4: legacy orders / order_items / payment columns -> Medusa orders (Requirements 18.1, 18.4).
//
// Source (legacy public tables): orders (reference, contact_email, status, payment_status, payment_method, total, totals jsonb,
// shipping/billing address jsonb, coupon_code, razorpay_* ids, paid_at, courier/tracking, invoice_number) and order_items.
// Target: medusa.order (+ order_address, order_line_item/order_item snapshots, adjustments and GST tax lines, order_shipping(+method),
// order_summary shaped like internal.complete_cart_placement writes it), payment_collection/payment_session/payment/capture(/refund),
// order_payment_collection, ext.order_import and ext.migration_map (entity 'order').
//
// Import mode: app.import_mode = 'on' (transaction-local) is set for the whole step. It lets the order status guard and the display
// prefix trigger stand aside. Nothing here calls internal.enqueue_order_placed, stock claims, promotion usage or analytics, so an
// import never creates notifications, reservations, usage rows or events.
//
// Display numbers: custom_display_id = the legacy reference (kept as shown to people); display_id = the trailing digits of the
// reference when free, else the next free number above every used one. The display_id sequence is moved past the maximum at the end
// (apply only: setval is not transactional, so a dry_run must not touch it).
//
// Statuses: delivered -> completed; cancelled, refunded, payment_failed -> canceled; everything else -> pending. Fulfillment progress
// (dispatched, return_requested, ...) is not modelled as fulfillments; it is kept in metadata.legacy_status.
//
// Totals: legacy items are GST exclusive. The legacy discount is spread over the lines (adjustments), GST becomes one tax line per item
// at the effective rate gst / (subtotal - discount), and freight becomes the shipping method. internal.order_totals then computes the
// Backend total; ext.order_import.totals_checksum = sha256('legacy=<legacy total>;backend=<backend total>') and a difference is
// listed in `reasons` (the order is still imported). Paid orders get a capture of the legacy total so the summary shows what was paid.
//
// Idempotency: ext.order_import.legacy_id (unique) and ext.migration_map; an already imported order is left as it is. Each order runs in
// a savepoint; failures roll back that order only and are listed in `reasons`.
import { createHash } from "node:crypto";

export const name = "orders";

const text = (v) => (v == null ? "" : String(v).trim());
const cents = (v) => Math.round(Number(v) * 100);

// Splits `gst` paise over lines with net amounts `nets` (paise) by largest remainder and returns [{tax, rate}] per line, where rate
// (percent, 12 decimals) makes round(net x rate / 100) equal the line's share.
export function allocateTax(nets, gst) {
  const total = nets.reduce((a, n) => a + n, 0);
  if (!(gst > 0) || !(total > 0)) return nets.map(() => ({ tax: 0, rate: 0 }));
  const exact = nets.map((n) => (gst * n) / total);
  const tax = exact.map(Math.floor);
  let rest = gst - tax.reduce((a, n) => a + n, 0);
  exact.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (rest > 0 && nets[i] > 0) { tax[i]++; rest--; } });
  return nets.map((n, i) => ({ tax: tax[i], rate: n > 0 && tax[i] > 0 ? Number(((tax[i] / n) * 100).toFixed(12)) : 0 }));
}
const money = (c) => (c / 100).toFixed(2);
const raw = (v) => JSON.stringify({ value: String(v), precision: 20 });
const sha = (s) => createHash("sha256").update(s).digest("hex");

const STATUS = { delivered: "completed", cancelled: "canceled", refunded: "canceled", payment_failed: "canceled" };
const PROVIDER = { razorpay: "pp_razorpay_razorpay", cod_placeholder: "pp_cod_cod", quotation_invoice: "pp_system_default" };
const INT_MAX = 2147483647;

function splitName(full) {
  const f = text(full);
  const i = f.indexOf(" ");
  return [(i < 0 ? f : f.slice(0, i)) || null, (i < 0 ? "" : f.slice(i + 1).trim()) || null];
}

export async function run(ctx) {
  const { source, target: t, mode, log } = ctx;
  const counts = {};
  const reasons = [];
  const bump = (k, n = 1) => { counts[k] = (counts[k] ?? 0) + n; };
  const skip = (id, why) => { bump("orders_skipped"); reasons.push(`order ${id}: ${why}`); };

  await t.query("select set_config('app.import_mode', 'on', true)");
  try {
    return await body();
  } finally {
    await t.query("select set_config('app.import_mode', 'off', true)").catch(() => {});
  }

  async function body() {
    const newId = async (table) => (await t.query("select internal.generate_id_for($1) id", [table])).rows[0].id;
    const q = async (sql, p = []) => (await t.query(sql, p)).rows;

    const customerMap = new Map((await q("select legacy_id, new_id from ext.migration_map where entity = 'customer'")).map((r) => [r.legacy_id, r.new_id]));
    const productMap = new Map((await q("select legacy_id, new_id from ext.migration_map where entity = 'product'")).map((r) => [r.legacy_id, r.new_id]));
    const imported = new Set((await q("select legacy_id from ext.order_import")).map((r) => r.legacy_id));
    const region = (await q("select id from medusa.region where lower(currency_code) = 'inr' and deleted_at is null order by created_at, id limit 1"))[0]?.id;
    const channel = (await q("select internal.setting_text('store.default_sales_channel_id') v"))[0].v || null;

    const orders = (await source.query("select * from public.orders order by created_at, id")).rows;
    bump("orders_read", orders.length);
    const itemsByOrder = new Map();
    for (const it of (await source.query("select * from public.order_items order by order_id, id")).rows) {
      if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
      itemsByOrder.get(it.order_id).push(it);
    }
    if (orders.length && !region) {
      for (const o of orders) skip(o.id, "no region with currency INR in the target");
      return { counts, reasons };
    }

    // ---- display numbers: planned before the loop so fallbacks never collide with a later legacy number
    const used = new Set((await q("select display_id from medusa.\"order\" where display_id is not null")).map((r) => Number(r.display_id)));
    const planned = new Map();
    for (const o of orders) {
      if (imported.has(String(o.id))) continue;
      const m = /(\d+)$/.exec(text(o.reference));
      const n = m ? Number(m[1]) : NaN;
      if (Number.isSafeInteger(n) && n > 0 && n <= INT_MAX && !used.has(n)) { planned.set(String(o.id), n); used.add(n); }
    }
    let nextFree = Math.max(0, ...used);
    for (const o of orders) {
      if (imported.has(String(o.id)) || planned.has(String(o.id))) continue;
      planned.set(String(o.id), ++nextFree);
      reasons.push(`note order ${o.id}: reference ${o.reference} has no usable number; display_id ${nextFree} assigned (shown number stays the reference)`);
    }

    let sp = 0;
    let maxDisplay = 0;
    const providers = new Set();
    for (const o of orders) {
      const legacyId = String(o.id);
      if (imported.has(legacyId)) { bump("orders_unchanged"); continue; }
      const s = `ord_row_${++sp}`;
      await t.query(`savepoint ${s}`);
      try {
        const r = await importOrder(o, itemsByOrder.get(o.id) ?? [], planned.get(legacyId));
        await t.query(`release savepoint ${s}`);
        maxDisplay = Math.max(maxDisplay, planned.get(legacyId));
        bump("orders_created");
        if (r.mismatch) { bump("totals_mismatches"); reasons.push(r.mismatch); }
      } catch (e) {
        await t.query(`rollback to savepoint ${s}`);
        await t.query(`release savepoint ${s}`);
        skip(o.id, `database error: ${String(e.message).split("\n")[0]}`);
      }
    }

    if (maxDisplay > 0 && mode === "apply") {
      await t.query(
        `select setval('medusa.order_display_id_seq', greatest($1::bigint, (select last_value from medusa.order_display_id_seq)), true)`, [maxDisplay]);
      bump("display_sequence_advanced");
    }

    // ---- rollups over the imported history
    if (counts.orders_created) {
      await t.query("savepoint ord_rollups");
      try {
        await t.query("select internal.rebuild_rollups()");
        await t.query("release savepoint ord_rollups");
        bump("rollups_rebuilt");
      } catch (e) {
        await t.query("rollback to savepoint ord_rollups");
        await t.query("release savepoint ord_rollups");
        reasons.push(`rollups: not rebuilt (${String(e.message).split("\n")[0]}); run internal.rebuild_rollups() after the import`);
      }
    }

    log(`orders: ${JSON.stringify(counts)}`);
    return { counts, reasons };

    // ------------------------------------------------------------------ one order
    async function importOrder(o, items, displayId) {
      if (!items.length) throw new Error("the order has no items");
      const email = text(o.contact_email).toLowerCase();
      if (!email) throw new Error("the order has no contact email");

      let customerId = o.user_id ? customerMap.get(String(o.user_id)) ?? null : null;
      if (customerId && !(await q("select 1 from medusa.customer where id = $1 and deleted_at is null", [customerId])).length) customerId = null;
      if (!customerId) {
        // guests (and orders whose account was not migrated) are linked by email to an existing customer, else left as guest orders
        customerId = (await q("select id from medusa.customer where lower(email) = $1 and deleted_at is null order by has_account desc, created_at, id limit 1", [email]))[0]?.id ?? null;
        if (!customerId) bump("guest_orders_without_customer");
      }

      const address = async (a) => {
        if (!a || typeof a !== "object" || !Object.keys(a).length) return null;
        const [first, last] = splitName(a.recipientName ?? a.full_name);
        const phone = String(a.phone ?? "").replace(/\D/g, "").slice(-10);
        const id = await newId("order_address");
        await t.query(
          `insert into medusa.order_address (id, customer_id, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata)
           values ($1, $2, $3, $4, $5, $6, $7, 'in', $8, $9, $10, $11::jsonb)`,
          [id, customerId, first, last, text(a.line1) || null, text(a.line2) || null, text(a.city) || null, text(a.state) || null,
            text(a.pincode) || null, /^[6-9][0-9]{9}$/.test(phone) ? `+91${phone}` : null, JSON.stringify({ landmark: a.landmark ?? null, legacy: true })]);
        return id;
      };
      const shipId = await address(o.shipping_address);
      const billId = await address(o.billing_address);

      const status = STATUS[o.status] ?? "pending";
      const canceled = status === "canceled";
      const orderId = await newId("order");
      const metadata = {
        legacy_id: String(o.id), legacy_reference: o.reference, legacy_status: o.status, legacy_payment_status: o.payment_status,
        payment_method: o.payment_method, coupon_code: o.coupon_code ?? null, invoice_number: o.invoice_number ?? null,
        courier_name: o.courier_name ?? null, tracking_number: o.tracking_number ?? null, tracking_url: o.tracking_url ?? null,
        return_reason: o.return_reason ?? null, razorpay_order_id: o.razorpay_order_id ?? null, razorpay_payment_id: o.razorpay_payment_id ?? null,
      };
      await t.query(
        `insert into medusa."order" (id, region_id, customer_id, version, sales_channel_id, status, email, currency_code, shipping_address_id,
                billing_address_id, display_id, custom_display_id, created_at, updated_at, canceled_at, metadata)
         values ($1, $2, $3, 1, $4, $5, $6, 'inr', $7, $8, $9, $10, $11, $12, $13, $14::jsonb)`,
        [orderId, region, customerId, channel, status, email, shipId, billId, displayId, text(o.reference) || null, o.created_at,
          o.updated_at ?? o.created_at, canceled ? o.updated_at ?? o.created_at : null, JSON.stringify(metadata)]);

      // ---- amounts, in paise
      const lt = o.totals ?? {};
      const lines = items.map((it) => ({ it, gross: cents(it.price) * Number(it.quantity) }));
      const subtotal = lines.reduce((a, l) => a + l.gross, 0);
      const discount = Math.min(Math.max(cents(lt.discountInr ?? 0), 0), subtotal);
      const gst = Math.max(cents(lt.gstInr ?? 0), 0);
      const taxable = subtotal - discount;
      let left = discount;
      lines.forEach((l, i) => {
        l.discount = i === lines.length - 1 ? left : Math.floor((discount * l.gross) / (subtotal || 1));
        left -= l.discount;
      });
      // GST: the legacy gst amount is split over the lines in whole paise, and each line gets the rate that gives exactly its share,
      // so the per-line rounding of the Backend totals adds up to the legacy gst (one shared rate drifts by a paisa on big orders).
      const taxShare = allocateTax(lines.map((l) => l.gross - l.discount), taxable > 0 ? gst : 0);
      lines.forEach((l, i) => { l.rate = taxShare[i].rate; });

      for (const l of lines) {
        const it = l.it;
        const variant = text(it.sku) ? (await q("select v.id, v.product_id from medusa.product_variant v where v.sku = $1 and v.deleted_at is null limit 1", [text(it.sku)]))[0] : null;
        const productId = productMap.get(String(it.product_id)) ?? variant?.product_id ?? null;
        const product = productId ? (await q("select handle, thumbnail from medusa.product where id = $1", [productId]))[0] : null;
        const liId = await newId("order_line_item");
        const price = Number(it.price).toFixed(2);
        await t.query(
          `insert into medusa.order_line_item (id, title, thumbnail, variant_id, product_id, product_title, product_handle, variant_sku, variant_title,
                  requires_shipping, is_discountable, is_tax_inclusive, unit_price, raw_unit_price, metadata)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true, false, $10, $11::jsonb, $12::jsonb)`,
          [liId, it.name, product?.thumbnail ?? null, variant?.id ?? null, productId, it.name, product?.handle ?? null, text(it.sku) || null,
            text(it.variant_label) || null, price, raw(price), JSON.stringify({ legacy_product_id: it.product_id, legacy_item_id: String(it.id) })]);
        await t.query(
          `insert into medusa.order_item (id, order_id, version, item_id, quantity, raw_quantity, fulfilled_quantity, shipped_quantity,
                  return_requested_quantity, return_received_quantity, return_dismissed_quantity, written_off_quantity, unit_price, raw_unit_price)
           values ($1, $2, 1, $3, $4, $5::jsonb, 0, 0, 0, 0, 0, 0, $6, $7::jsonb)`,
          [await newId("order_item"), orderId, liId, it.quantity, JSON.stringify({ value: String(it.quantity), precision: 20 }), price, raw(price)]);
        if (l.discount > 0) {
          await t.query(
            `insert into medusa.order_line_item_adjustment (id, description, code, amount, raw_amount, item_id, version)
             values ($1, 'Legacy discount', $2, $3, $4::jsonb, $5, 1)`,
            [await newId("order_line_item_adjustment"), o.coupon_code ?? null, money(l.discount), raw(money(l.discount)), liId]);
        }
        if (l.rate > 0) {
          await t.query(
            `insert into medusa.order_line_item_tax_line (id, description, code, rate, raw_rate, item_id)
             values ($1, 'GST', 'gst', $2, $3::jsonb, $4)`, [await newId("order_line_item_tax_line"), l.rate, raw(l.rate), liId]);
        }
      }

      if (lt.shippingInr != null) {
        const amt = Number(lt.shippingInr).toFixed(2);
        const smId = await newId("order_shipping_method");
        await t.query(
          `insert into medusa.order_shipping_method (id, name, amount, raw_amount, is_tax_inclusive, data, metadata)
           values ($1, 'Legacy shipping', $2, $3::jsonb, false, '{}'::jsonb, $4::jsonb)`,
          [smId, amt, raw(amt), JSON.stringify({ legacy: true })]);
        await t.query("insert into medusa.order_shipping (id, order_id, version, shipping_method_id) values ($1, $2, 1, $3)",
          [await newId("order_shipping"), orderId, smId]);
      }

      // ---- summary, written the way complete_cart_placement writes it
      const totals = (await q("select internal.order_totals($1) t", [orderId]))[0].t;
      await t.query(
        `insert into medusa.order_summary (id, order_id, version, totals)
         values (internal.generate_id('ordsum'), $1, 1, jsonb_build_object(
           'current_order_total', $2::jsonb, 'original_order_total', $3::jsonb, 'order_total', $2::jsonb, 'transaction_total', 0,
           'pending_difference', $2::jsonb, 'paid_total', 0, 'refunded_total', 0, 'credit_line_total', 0, 'accounting_total', $2::jsonb,
           'raw_current_order_total', jsonb_build_object('value', $4::text, 'precision', 20)))`,
        [orderId, JSON.stringify(totals.total), JSON.stringify(totals.original_total), String(totals.total)]);

      const backendTotal = Number(totals.total);
      const legacyTotal = o.total == null ? null : Number(o.total);
      const checksum = sha(`legacy=${legacyTotal == null ? "null" : legacyTotal.toFixed(2)};backend=${backendTotal.toFixed(2)}`);
      let mismatch = null;
      if (legacyTotal == null) {
        reasons.push(`note order ${o.id}: no legacy total (freight to be confirmed); Backend total ${backendTotal.toFixed(2)}`);
      } else if (cents(legacyTotal) !== cents(backendTotal)) {
        mismatch = `totals mismatch order ${o.id} (${o.reference}): legacy ${legacyTotal.toFixed(2)} vs Backend ${backendTotal.toFixed(2)}`;
      }

      // ---- payment
      const payAmount = legacyTotal ?? backendTotal;
      if (payAmount > 0) await importPayment(o, orderId, payAmount.toFixed(2), status);

      await t.query("insert into ext.order_import (order_id, legacy_id, display_number, totals_checksum) values ($1, $2, $3, $4)",
        [orderId, String(o.id), displayId, checksum]);
      await t.query(
        `insert into ext.migration_map (entity, legacy_id, new_id) values ('order', $1, $2)
         on conflict (entity, legacy_id) do update set new_id = excluded.new_id`, [String(o.id), orderId]);
      return { mismatch };
    }

    async function importPayment(o, orderId, amount, orderStatus) {
      const provider = PROVIDER[o.payment_method] ?? "pp_system_default";
      if (!providers.has(provider)) {
        await t.query("insert into medusa.payment_provider (id, is_enabled) values ($1, true) on conflict (id) do nothing", [provider]);
        providers.add(provider);
      }
      const ps = o.payment_status;
      const paid = ps === "paid" || ps === "refunded";
      const when = o.paid_at ?? o.updated_at ?? o.created_at;
      const data = JSON.stringify({ legacy: true, razorpay_order_id: o.razorpay_order_id ?? null, razorpay_payment_id: o.razorpay_payment_id ?? null });
      const pcStatus = paid ? "completed" : ps === "failed" || orderStatus === "canceled" ? "failed" : ps === "pending" ? "awaiting" : "not_paid";
      const sesStatus = paid ? "captured" : pcStatus === "failed" ? "error" : "pending";
      const pcId = await newId("payment_collection");
      const sesId = await newId("payment_session");
      const money2 = { value: amount, json: raw(amount) };
      await t.query(
        `insert into medusa.payment_collection (id, currency_code, amount, raw_amount, authorized_amount, raw_authorized_amount, captured_amount,
                raw_captured_amount, status, completed_at, created_at, metadata)
         values ($1, 'inr', $2, $3::jsonb, $4, $5::jsonb, $6, $7::jsonb, $8, $9, $10, '{"legacy":true}'::jsonb)`,
        [pcId, amount, money2.json, paid ? amount : null, paid ? money2.json : null, paid ? amount : null, paid ? money2.json : null, pcStatus,
          paid ? when : null, o.created_at]);
      await t.query(
        `insert into medusa.payment_session (id, currency_code, amount, raw_amount, provider_id, data, status, authorized_at, payment_collection_id, created_at)
         values ($1, 'inr', $2, $3::jsonb, $4, $5::jsonb, $6, $7, $8, $9)`,
        [sesId, amount, money2.json, provider, data, sesStatus, paid ? when : null, pcId, o.created_at]);
      if (paid) {
        const payId = await newId("payment");
        await t.query(
          `insert into medusa.payment (id, amount, raw_amount, currency_code, provider_id, data, payment_collection_id, payment_session_id, captured_at, created_at)
           values ($1, $2, $3::jsonb, 'inr', $4, $5::jsonb, $6, $7, $8, $9)`,
          [payId, amount, money2.json, provider, data, pcId, sesId, when, o.created_at]);
        await t.query(
          `insert into medusa.capture (id, amount, raw_amount, payment_id, created_at, metadata) values ($1, $2, $3::jsonb, $4, $5, '{"legacy":true}'::jsonb)`,
          [await newId("capture"), amount, money2.json, payId, when]);
        if (ps === "refunded") {
          await t.query(
            `insert into medusa.refund (id, amount, raw_amount, payment_id, status, note, created_at, metadata)
             values ($1, $2, $3::jsonb, $4, 'succeeded', 'Legacy refund', $5, '{"legacy":true}'::jsonb)`,
            [await newId("refund"), amount, money2.json, payId, o.updated_at ?? when]);
        }
      }
      // linking last: its trigger records the capture/refund transactions and updates the summary (once per reference)
      await t.query("insert into medusa.order_payment_collection (order_id, payment_collection_id, id) values ($1, $2, internal.generate_id('ordpaycol'))", [orderId, pcId]);
    }
  }
}
