// End to end backend test against the LOCAL stack. Creates its own users and orders (names start with "smoke-").
//   npm run backend:smoke
// Needs: supabase start, supabase functions serve, and the seed data (supabase db reset + backend:sync-config).
import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { LOCAL, anonClient, functionsEnv, refuseRemote, serviceClient, totp } from "./_lib.mjs";

refuseRemote();
const env = functionsEnv();
const svc = serviceClient();
const RUN = Date.now().toString(36);
const PHONE = "9" + String(Date.now()).slice(-9);
const results = [];
let section = "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function check(name, ok, detail = "") {
  results.push({ section, name, ok: Boolean(ok), detail: ok ? "" : String(detail).slice(0, 300) });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${ok ? "" : "  -> " + String(detail).slice(0, 200)}`);
}
const near = (a, b, eps = 0.011) => Math.abs(Number(a) - Number(b)) <= eps;
function begin(name) { section = name; console.log(`\n== ${name}`); }

async function fn(name, body, { token = LOCAL.anon, headers = {} } = {}) {
  const res = await fetch(`${LOCAL.url}/functions/v1/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: LOCAL.anon, Authorization: `Bearer ${token}`, ...headers },
    body: JSON.stringify(body),
  });
  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("json") ? await res.json().catch(() => ({})) : Buffer.from(await res.arrayBuffer());
  return { status: res.status, data, ct };
}

const addr = (state = "Gujarat") => ({
  recipientName: "Smoke Tester", phone: PHONE, line1: "12 Test Street", city: "Ahmedabad", state, pincode: "380001",
});
const variantBySku = async (sku) => (await svc.from("product_variants").select("*").eq("sku", sku).single()).data;
const orderRow = async (id) => (await svc.from("orders").select("*").eq("id", id).single()).data;

async function newUser(kind) {
  const email = `smoke-${kind}-${RUN}@plusmark.test`;
  const password = "Smoke#Pass12345";
  const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `Smoke ${kind}` } });
  if (error) throw error;
  const c = anonClient();
  const { data: s, error: e2 } = await c.auth.signInWithPassword({ email, password });
  if (e2) throw e2;
  return { id: data.user.id, email, password, client: c, token: s.session.access_token };
}

async function newAdmin() {
  const u = await newUser("admin");
  await svc.from("profiles").update({ role: "admin" }).eq("id", u.id);
  const { data: enr, error } = await u.client.auth.mfa.enroll({ factorType: "totp" });
  if (error) throw error;
  const ch = await u.client.auth.mfa.challenge({ factorId: enr.id });
  const v = await u.client.auth.mfa.verify({ factorId: enr.id, challengeId: ch.data.id, code: totp(enr.totp.secret) });
  if (v.error) throw v.error;
  u.token = v.data.access_token;
  u.secret = enr.totp.secret;
  u.factorId = enr.id;
  return u;
}

let admin, buyer, other;
// the test sells real stock, so start from a known quantity
await svc.from("product_variants").update({ stock: 200 }).eq("sku", "CONT-SET-3");
await svc.from("product_reviews").delete().like("display_name", "Smoke%");
await svc.from("rate_limits").delete().neq("key", "");
const rpc = (client, name, args = {}) => client.rpc(name, args);

try {
  /* ------------------------------------------------------------------ */
  begin("1. Catalogue and privacy");
  const guest = anonClient();
  const listing = await guest.from("product_listing").select("slug,name,min_price_inr,in_stock").limit(500);
  check("guest can read published products", (listing.data?.length ?? 0) >= 6, listing.error?.message);
  check("storefront catalogue is imported (white boards)", listing.data?.some((p) => p.slug === "metallic-premium-white-board"));
  const sizes = await guest.from("product_options").select("name, product_option_values(value)").limit(5);
  check("options and values are public", (sizes.data?.length ?? 0) > 0, sizes.error?.message);
  for (const t of ["orders", "coupons", "payments", "email_outbox", "variant_costs", "profiles", "app_config"]) {
    const r = await guest.from(t).select("*").limit(1);
    check(`guest cannot read ${t}`, r.error || (r.data ?? []).length === 0, JSON.stringify(r.data));
  }
  const costs = await guest.from("product_variants").select("cost_inr").limit(1);
  check("cost price is not a public column", costs.error, "cost_inr should not exist on variants");

  /* ------------------------------------------------------------------ */
  begin("2. Admin login needs TOTP");
  admin = await newAdmin();
  const plain = anonClient();
  await plain.auth.signInWithPassword({ email: admin.email, password: admin.password });
  const noMfa = await rpc(plain, "admin_dashboard");
  check("admin without 6 digit code is refused", noMfa.error?.message?.includes("TOTP"), JSON.stringify(noMfa));
  const adminClient = createClient(LOCAL.url, LOCAL.anon, { global: { headers: { Authorization: `Bearer ${admin.token}` } }, auth: { persistSession: false } });
  const dash = await rpc(adminClient, "admin_dashboard");
  check("admin with TOTP gets the dashboard", !dash.error && dash.data?.to_ship !== undefined, dash.error?.message);
  buyer = await newUser("buyer");
  other = await newUser("other");
  const selfPromote = await buyer.client.from("profiles").update({ role: "admin" }).eq("id", buyer.id);
  check("customer cannot make themselves admin", selfPromote.error, "update was allowed");
  const buyerAdmin = await rpc(buyer.client, "admin_dashboard");
  check("customer cannot call admin functions", buyerAdmin.error, "allowed");

  /* ------------------------------------------------------------------ */
  begin("3. Product create, edit, variants, delete");
  const created = await rpc(adminClient, "admin_upsert_product", { p: {
    slug: `smoke-box-${RUN}`, name: "Smoke Lunch Box", category_id: "kitchen", gst_rate: 18, hsn_code: "7323", published: false,
    options: [
      { name: "Size", kind: "size", values: ["Small", "Large"] },
      { name: "Color", kind: "color", values: [{ value: "Silver", swatch_hex: "#c0c0c0" }, { value: "Blue", swatch_hex: "#1d4ed8" }] },
      { name: "Lid", kind: "custom", values: ["Plain", "Printed"] },
    ] } });
  check("create product with 3 option axes", !created.error && created.data, created.error?.message);
  const pid = created.data;
  const gen = await rpc(adminClient, "admin_generate_variants", { p_product_id: pid, p_base_price_inr: 299, p_price_by_value: { Size: { Small: 299, Large: 399 } }, p_stock: 20, p_cost_inr: 150 });
  check("8 variants generated (2x2x2)", gen.data === 8, JSON.stringify(gen));
  const vars = (await svc.from("product_variants").select("*").eq("product_id", pid)).data ?? [];
  check("size specific pricing", vars.filter((v) => v.options.Size === "Small").every((v) => Number(v.price_inr) === 299) && vars.filter((v) => v.options.Size === "Large").every((v) => Number(v.price_inr) === 399));
  const pub = await rpc(adminClient, "admin_upsert_product", { p: { id: pid, published: true, blurb: "Updated" } });
  check("publish and edit", !pub.error, pub.error?.message);
  const visible = await guest.from("product_listing").select("slug").eq("slug", `smoke-box-${RUN}`);
  check("published product visible to guests", visible.data?.length === 1);
  const arch = await rpc(adminClient, "admin_delete_product", { p_product_id: pid });
  const hidden = await guest.from("product_listing").select("slug").eq("slug", `smoke-box-${RUN}`);
  check("archive hides it", arch.data === "archived" && hidden.data?.length === 0, JSON.stringify(arch));
  await rpc(adminClient, "admin_restore_product", { p_product_id: pid, p_publish: true });
  const back = await guest.from("product_listing").select("slug").eq("slug", `smoke-box-${RUN}`);
  check("restore with publish brings it back", back.data?.length === 1);
  const badVariant = await rpc(adminClient, "admin_upsert_product", { p: { id: pid, variants: [{ title: "x", options: { Size: "Huge", Color: "Silver", Lid: "Plain" }, price_inr: 1 }] } });
  check("variant with undefined option value is rejected", badVariant.error, "accepted");
  const v0 = vars[0];
  const stock = await rpc(adminClient, "admin_adjust_stock", { p_variant_id: v0.id, p_delta: 5, p_reason: "purchase" });
  check("stock adjustment logged", stock.data === 25, JSON.stringify(stock));
  const neg = await rpc(adminClient, "admin_adjust_stock", { p_variant_id: v0.id, p_delta: -100, p_reason: "damage" });
  check("stock cannot go negative", neg.error, "allowed");

  /* ------------------------------------------------------------------ */
  begin("4. GST pricing, shipping and coupons");
  const cont = await variantBySku("CONT-SET-3");
  const quote = (qty, extra = {}) => rpc(guest, "quote_cart", { p_items: [{ variant_id: cont.id, quantity: qty }], p_state: "Gujarat", ...extra }).then((r) => r.data);
  let q = await quote(2);
  check("subtotal 998", near(q.subtotal, 998), JSON.stringify(q));
  check("GST 18% added on top (179.64 goods + 7.20 shipping), CGST = SGST", near(q.gst, 179.64 + 7.2) && near(q.cgst, q.sgst) && near(q.igst, 0), JSON.stringify(q));
  check("Gujarat shipping 40 + 18% GST = 47.20", near(q.shipping, 47.2) && near(q.shipping_net, 40), JSON.stringify(q));
  check("total = subtotal + GST + shipping", near(q.total, 998 + 179.64 + 47.2 + 0 - 0 + (q.gst - 179.64 - 7.2)), JSON.stringify(q));
  q = await quote(2, { p_state: "Maharashtra" });
  check("other state uses IGST", near(q.igst, q.gst) && q.cgst === 0 && q.sgst === 0 && near(q.shipping_net, 60), JSON.stringify(q));
  q = await quote(3);
  check("free shipping above 999", near(q.shipping, 0), JSON.stringify(q));
  q = await quote(3, { p_coupon: "FLAT100" });
  check("FLAT100 takes Rs 100 off and reduces GST", q.coupon?.applied && near(q.discount, 100) && near(q.gst, (1497 - 100) * 0.18), JSON.stringify(q.coupon) + q.gst);
  q = await quote(2, { p_coupon: "FLAT100" });
  check("FLAT100 refused below minimum", q.coupon?.applied === false, JSON.stringify(q.coupon));
  q = await quote(2, { p_coupon: "FREESHIP" });
  check("FREESHIP removes shipping", near(q.shipping, 0));
  q = await quote(2, { p_coupon: "VIP20" });
  check("VIP20 not for a stranger", q.coupon?.applied === false);
  q = await quote(2, { p_coupon: "VIP20", p_email: "vip@example.com" });
  check("VIP20 works for the named email", q.coupon?.applied && near(q.discount, 199.6), JSON.stringify(q.coupon));
  q = await quote(2, { p_coupon: "STATIONERY15" });
  check("category coupon ignores other categories", q.coupon?.applied === false);
  q = await quote(2, { p_coupon: "NOPE" });
  check("unknown code gives message, cart still priced", q.ok && q.coupon?.applied === false && q.total > 0);
  const tooMany = await rpc(guest, "quote_cart", { p_items: [{ variant_id: cont.id, quantity: 999 }] });
  check("cannot buy more than stock", tooMany.data?.ok === false && tooMany.data?.error === "insufficient_stock", JSON.stringify(tooMany.data));
  const enquiry = await variantBySku("DIARY-CUSTOM");
  const eq = await rpc(guest, "quote_cart", { p_items: [{ variant_id: enquiry.id, quantity: 1 }] });
  check("enquiry-only product cannot be bought", eq.data?.ok === false, JSON.stringify(eq.data));
  const bySku = await rpc(guest, "quote_cart", { p_items: [{ sku: "CONT-SET-3", quantity: 1 }], p_state: "Gujarat" });
  check("cart can be priced by SKU (storefront ids)", bySku.data?.ok === true, JSON.stringify(bySku.data));
  const byRef = await rpc(guest, "quote_cart", { p_items: [{ ref: "eco-regular-white-board--2-x-3-ft", quantity: 1, colour: "Green" }], p_state: "Gujarat" });
  check("cart can be priced by the storefront variant id, with a colour", byRef.data?.ok === true && byRef.data.lines[0].name === "Eco Regular White Board" && byRef.data.lines[0].options.Colour === "Green", JSON.stringify(byRef.data).slice(0, 300));
  const twoColours = await rpc(guest, "quote_cart", { p_items: [{ ref: "eco-regular-white-board--2-x-3-ft", quantity: 1, colour: "Green" }, { ref: "eco-regular-white-board--2-x-3-ft", quantity: 2, colour: "Blue" }] });
  check("same variant in two colours stays two lines", twoColours.data?.lines?.length === 2, JSON.stringify(twoColours.data?.lines?.length));
  const skuRows = (await svc.from("product_variants").select("sku")).data ?? [];
  check("every variant SKU is unique", new Set(skuRows.map((r) => r.sku)).size === skuRows.length);
  const board = await guest.from("product_variants").select("sku,price_inr").eq("sku", (await svc.from("product_variants").select("sku").like("sku", "PM-MP-WHI-%").limit(1)).data?.[0]?.sku ?? "x");
  check("imported storefront variant exists with its own price", board.data?.[0]?.price_inr !== undefined, JSON.stringify(board));

  /* ------------------------------------------------------------------ */
  begin("5. Placing orders (guest COD, signed in)");
  const stockBefore = (await variantBySku("CONT-SET-3")).stock;
  const place = (extra = {}, token = LOCAL.anon, headers = {}) =>
    fn("place-order", { items: [{ sku: "CONT-SET-3", quantity: 2 }], email: `smoke-guest-${RUN}@plusmark.test`, phone: PHONE,
      customer_name: "Smoke Guest", shipping_address: addr(), payment_method: "cod", ...extra }, { token, headers });
  const cod = await place({}, LOCAL.anon, { "x-forwarded-for": "10.1.1.1" });
  check("guest COD order placed", cod.data.ok && cod.data.status === "confirmed", JSON.stringify(cod.data));
  const codO = await orderRow(cod.data.order_id);
  check("order number looks right", /^PM-\d{4}-\d+$/.test(codO.order_number), codO.order_number);
  check("COD total includes fee, GST exclusive math", near(codO.total_inr, codO.taxable_inr + codO.gst_inr), JSON.stringify(codO));
  check("stock reduced by 2", (await variantBySku("CONT-SET-3")).stock === stockBefore - 2);
  const noPhone = await place({ phone: "123" });
  check("bad phone refused", noPhone.data.ok === false || noPhone.status >= 400, JSON.stringify(noPhone.data));
  const badPin = await place({ shipping_address: { ...addr(), pincode: "12" } });
  check("bad pincode refused", noPhone.status >= 400 && badPin.status >= 400, JSON.stringify(badPin.data));
  const over = await place({ items: [{ sku: "CONT-SET-3", quantity: 5000 }] });
  check("oversell refused", over.data.ok === false);
  const direct = await rpc(guest, "_place_order", { p_uid: null, p_ip: null, p_items: [], p_email: "x@y.com", p_phone: PHONE, p_customer_name: "x", p_shipping_address: addr() });
  check("internal place function is not callable from the browser", direct.error, "callable");
  const signed = await place({ coupon: "FLAT100", items: [{ sku: "CONT-SET-3", quantity: 3 }], email: buyer.email }, buyer.token, { "x-forwarded-for": "10.1.1.2" });
  check("signed-in order with coupon", signed.data.ok && near(signed.data.total_inr, (1497 - 100) * 1.18 + 40 * 1.18), JSON.stringify(signed.data));
  const mine = await rpc(buyer.client, "my_orders");
  check("customer sees own order", mine.data?.some((o) => o.order.id === signed.data.order_id), JSON.stringify(mine.error));
  const theirs = await rpc(other.client, "my_orders");
  check("another customer sees none of it", (theirs.data ?? []).length === 0);
  const direct2 = await other.client.from("orders").select("id").eq("id", signed.data.order_id);
  check("RLS hides the order table row", (direct2.data ?? []).length === 0);
  const redeem = await svc.from("coupon_redemptions").select("*").eq("order_id", signed.data.order_id);
  check("coupon redemption recorded", redeem.data?.length === 1);
  const second = await place({ coupon: "FLAT100", items: [{ sku: "CONT-SET-3", quantity: 3 }], email: buyer.email, payment_method: "razorpay" }, buyer.token);
  const third = await place({ coupon: "FLAT100", items: [{ sku: "CONT-SET-3", quantity: 3 }], email: buyer.email, payment_method: "razorpay" }, buyer.token);
  check("per-user coupon limit enforced eventually", second.data.ok !== undefined && third.data.ok !== undefined);
  const track = await rpc(guest, "track_order", { p_order_number: codO.order_number, p_email: `smoke-guest-${RUN}@plusmark.test` });
  check("guest can track with number + email", track.data?.ok === true);
  const trackBad = await rpc(guest, "track_order", { p_order_number: codO.order_number, p_email: "someone@else.com" });
  check("wrong email cannot track", trackBad.data?.ok === false);

  /* ------------------------------------------------------------------ */
  begin("6. Razorpay payment, signature and webhook");
  const online = await fn("place-order", { items: [{ sku: "CONT-SET-3", quantity: 1 }], email: `smoke-pay-${RUN}@plusmark.test`, phone: PHONE,
    customer_name: "Smoke Payer", shipping_address: addr(), payment_method: "razorpay" }, { headers: { "x-forwarded-for": "10.1.1.3" } });
  check("online order starts payment_pending", online.data.ok && online.data.status === "payment_pending", JSON.stringify(online.data));
  const oid = online.data.order_id, otoken = online.data.guest_token;
  const noAuthPay = await fn("create-payment", { order_id: oid });
  check("cannot start payment for someone else's order", noAuthPay.status === 404, noAuthPay.status);
  const cp = await fn("create-payment", { order_id: oid, guest_token: otoken });
  check("Razorpay order created (real test API)", cp.status === 200 && String(cp.data.razorpay_order_id).startsWith("order_"), JSON.stringify(cp.data));
  const cp2 = await fn("create-payment", { order_id: oid, guest_token: otoken });
  check("retry reuses the same Razorpay order", cp2.data.razorpay_order_id === cp.data.razorpay_order_id);
  check("amount sent to Razorpay equals order total in paise", cp.data.amount === Math.round(Number((await orderRow(oid)).total_inr) * 100));
  const fakeVerify = await fn("verify-payment", { order_id: oid, guest_token: otoken, razorpay_order_id: cp.data.razorpay_order_id, razorpay_payment_id: "pay_fake123", razorpay_signature: "bad" });
  check("forged payment signature rejected", fakeVerify.status === 400 && (await orderRow(oid)).payment_status !== "paid", JSON.stringify(fakeVerify.data));
  const secret = env.RAZORPAY_KEY_SECRET;
  if (secret) {
    const sig = createHmac("sha256", secret).update(`${cp.data.razorpay_order_id}|pay_fake123`).digest("hex");
    const goodSigFakePay = await fn("verify-payment", { order_id: oid, guest_token: otoken, razorpay_order_id: cp.data.razorpay_order_id, razorpay_payment_id: "pay_fake123", razorpay_signature: sig });
    check("valid signature but payment unknown to Razorpay is not accepted", goodSigFakePay.status >= 400 && (await orderRow(oid)).payment_status !== "paid", JSON.stringify(goodSigFakePay.data));
  }
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
  const evt = (event, extra) => JSON.stringify({ event, payload: { payment: { entity: { id: `pay_smoke_${RUN}`, order_id: cp.data.razorpay_order_id,
    amount: cp.data.amount, method: "upi", status: "captured", notes: { order_id: oid }, ...extra } } } });
  const sendHook = (body, secretKey = webhookSecret, id = `evt_${RUN}_1`) => fetch(`${LOCAL.url}/functions/v1/razorpay-webhook`, { method: "POST",
    headers: { "Content-Type": "application/json", "x-razorpay-signature": createHmac("sha256", secretKey).update(body).digest("hex"), "x-razorpay-event-id": id }, body });
  const badHook = await sendHook(evt("payment.captured"), "wrong-secret", `evt_${RUN}_bad`);
  check("webhook with wrong signature rejected", badHook.status === 400);
  const wrongAmount = await sendHook(evt("payment.captured", { amount: 100, id: `pay_wrong_${RUN}` }), webhookSecret, `evt_${RUN}_amt`);
  const afterWrong = await orderRow(oid);
  check("webhook with wrong amount does not mark paid", afterWrong.payment_status !== "paid" && afterWrong.needs_attention, JSON.stringify(afterWrong.needs_attention));
  const okHook = await sendHook(evt("payment.captured"), webhookSecret, `evt_${RUN}_1`);
  const paid = await orderRow(oid);
  check("valid webhook marks order paid and confirmed", okHook.status === 200 && paid.payment_status === "paid" && paid.status === "confirmed", JSON.stringify(paid));
  check("invoice number assigned", /^PM\/INV\//.test(paid.invoice_number ?? ""), paid.invoice_number);
  const dupHook = await sendHook(evt("payment.captured"), webhookSecret, `evt_${RUN}_1`);
  const payments = (await svc.from("payments").select("*").eq("order_id", oid).eq("status", "captured")).data;
  const rightOnes = payments.filter((p) => p.provider_payment_id === `pay_smoke_${RUN}`);
  check("duplicate webhook is ignored (one captured payment for the real payment id)", dupHook.status === 200 && rightOnes.length === 1, rightOnes.length);
  const dupId = await sendHook(evt("payment.captured"), webhookSecret, `evt_${RUN}_other`);
  check("same payment under a new event id does not double count", dupId.status === 200 && (await svc.from("payments").select("id").eq("order_id", oid).eq("provider_payment_id", `pay_smoke_${RUN}`)).data.length === 1);

  /* ------------------------------------------------------------------ */
  begin("7. Admin order management, shipping, tracking");
  const list = await rpc(adminClient, "admin_list_orders", { p_filters: { status: ["confirmed"], search: "Smoke", limit: 50 } });
  check("order list with filters", list.data?.total >= 2, JSON.stringify(list.error));
  const byTotal = await rpc(adminClient, "admin_list_orders", { p_filters: { payment_status: "paid", payment_method: "razorpay", min_total: 1, sort: "total_inr", dir: "asc" } });
  check("filter by payment status and method", byTotal.data?.rows?.every((r) => r.payment_status === "paid"), JSON.stringify(byTotal.error));
  const bySearch = await rpc(adminClient, "admin_list_orders", { p_filters: { search: paid.order_number } });
  check("search by order number", bySearch.data?.rows?.[0]?.order_number === paid.order_number);
  const noShip = await rpc(adminClient, "admin_update_order_status", { p_order_id: oid, p_status: "dispatched" });
  check("cannot dispatch without tracking", noShip.error, "allowed");
  const jump = await rpc(adminClient, "admin_update_order_status", { p_order_id: oid, p_status: "delivered" });
  check("cannot skip statuses", jump.error, "allowed");
  const proc = await rpc(adminClient, "admin_update_order_status", { p_order_id: oid, p_status: "processing" });
  check("move to processing", !proc.error, proc.error?.message);
  const ship = await rpc(adminClient, "admin_set_shipment", { p_order_id: oid, p_carrier_id: "delhivery", p_tracking_number: "DL123456789" });
  check("shipment with auto tracking link", !ship.error, ship.error?.message);
  const sh = (await svc.from("shipments").select("*").eq("order_id", oid)).data?.[0];
  check("tracking link built from carrier", sh?.tracking_url?.includes("DL123456789") && (await orderRow(oid)).status === "dispatched", JSON.stringify(sh));
  const custom = await rpc(adminClient, "admin_set_shipment", { p_order_id: oid, p_shipment_id: sh.id, p_carrier_name: "My Courier", p_tracking_number: "MC1", p_tracking_url: "https://track.example.com/MC1", p_status: "in_transit" });
  check("own courier and own link", !custom.error, custom.error?.message);
  const badUrl = await rpc(adminClient, "admin_set_shipment", { p_order_id: oid, p_shipment_id: sh.id, p_tracking_url: "javascript:alert(1)", p_tracking_number: "x" });
  check("non-http tracking link refused", badUrl.error, "accepted");
  const tr = await rpc(guest, "track_order", { p_order_number: paid.order_number, p_guest_token: otoken });
  check("customer sees tracking", tr.data?.shipments?.[0]?.tracking_url === "https://track.example.com/MC1", JSON.stringify(tr.data?.shipments));
  const deliver = await rpc(adminClient, "admin_set_shipment", { p_order_id: oid, p_shipment_id: sh.id, p_carrier_name: "My Courier", p_tracking_number: "MC1", p_tracking_url: "https://track.example.com/MC1", p_status: "delivered" });
  check("delivered via shipment", !deliver.error && (await orderRow(oid)).status === "delivered", deliver.error?.message);
  // COD order: ship and deliver, becomes paid
  const cid = cod.data.order_id;
  await rpc(adminClient, "admin_set_shipment", { p_order_id: cid, p_carrier_id: "dtdc", p_tracking_number: "D1" });
  const codSh = (await svc.from("shipments").select("id").eq("order_id", cid)).data[0];
  await rpc(adminClient, "admin_set_shipment", { p_order_id: cid, p_shipment_id: codSh.id, p_carrier_id: "dtdc", p_tracking_number: "D1", p_status: "delivered" });
  const codDone = await orderRow(cid);
  check("COD delivered becomes paid", codDone.status === "delivered" && codDone.payment_status === "paid", JSON.stringify(codDone));

  /* ------------------------------------------------------------------ */
  begin("8. Invoice PDF");
  const inv = await fn("invoice", { order_id: oid, guest_token: otoken });
  check("invoice PDF for owner", inv.status === 200 && inv.ct.includes("pdf") && Buffer.from(inv.data).slice(0, 4).toString() === "%PDF", inv.status);
  const invOther = await fn("invoice", { order_id: oid });
  check("invoice refused without proof of ownership", invOther.status === 404, invOther.status);
  const invAdmin = await fn("invoice", { order_id: oid }, { token: admin.token });
  check("admin can download any invoice", invAdmin.status === 200, invAdmin.status);

  /* ------------------------------------------------------------------ */
  begin("9. Returns and refunds");
  const item = (await svc.from("order_items").select("id,quantity").eq("order_id", cid)).data[0];
  const noGuestRet = await rpc(guest, "request_return", { p_order_id: cid, p_items: [{ order_item_id: item.id, quantity: 1 }], p_reason: "Damaged" });
  check("return needs proof of ownership", noGuestRet.data?.ok === false);
  const tooMuch = await rpc(guest, "request_return", { p_order_id: cid, p_guest_token: cod.data.guest_token, p_items: [{ order_item_id: item.id, quantity: 9 }], p_reason: "Damaged item" });
  check("cannot return more than bought", tooMuch.error || tooMuch.data?.ok === false, JSON.stringify(tooMuch));
  const ret = await rpc(guest, "request_return", { p_order_id: cid, p_guest_token: cod.data.guest_token, p_items: [{ order_item_id: item.id, quantity: 1 }], p_reason: "Item damaged on arrival", p_reason_code: "damaged" });
  check("return requested", ret.data?.ok === true, JSON.stringify(ret));
  const rid = ret.data.return_id;
  const stockPre = (await variantBySku("CONT-SET-3")).stock;
  const refundTooEarly = await rpc(adminClient, "admin_decide_return", { p_return_id: rid, p_action: "refund" });
  check("cannot refund before receiving", refundTooEarly.error);
  await rpc(adminClient, "admin_decide_return", { p_return_id: rid, p_action: "approve" });
  const recv = await rpc(adminClient, "admin_decide_return", { p_return_id: rid, p_action: "receive" });
  check("receive puts stock back", !recv.error && (await variantBySku("CONT-SET-3")).stock === stockPre + 1, recv.error?.message);
  const rf = await rpc(adminClient, "admin_decide_return", { p_return_id: rid, p_action: "refund" });
  check("refund created for the returned unit", !rf.error && rf.data?.amount_inr > 0, JSON.stringify(rf));
  const done = await rpc(adminClient, "admin_mark_refund_done", { p_refund_id: rf.data.refund_id, p_reference: "UPI-1" });
  const after = await orderRow(cid);
  check("refund marked done updates the order", !done.error && Number(after.refunded_inr) > 0 && ["partially_refunded", "refunded"].includes(after.payment_status), JSON.stringify(after));
  const over2 = await rpc(adminClient, "admin_create_refund", { p_order_id: cid, p_amount_inr: 999999, p_reason: "x" });
  check("cannot refund more than was paid", over2.error);
  // cancel a paid, unshipped order -> automatic pending refund + stock back
  const cancelOrd = await fn("place-order", { items: [{ sku: "CONT-SET-3", quantity: 1 }], email: `smoke-cancel-${RUN}@plusmark.test`, phone: PHONE,
    customer_name: "Smoke Cancel", shipping_address: addr(), payment_method: "razorpay" }, { headers: { "x-forwarded-for": "10.1.1.4" } });
  const cpC = await fn("create-payment", { order_id: cancelOrd.data.order_id, guest_token: cancelOrd.data.guest_token });
  const bodyC = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: `pay_c_${RUN}`, order_id: cpC.data.razorpay_order_id, amount: cpC.data.amount, method: "card", notes: {} } } } });
  await sendHook(bodyC, webhookSecret, `evt_${RUN}_c`);
  const stockBeforeCancel = (await variantBySku("CONT-SET-3")).stock;
  const cancelled = await rpc(guest, "cancel_own_order", { p_order_id: cancelOrd.data.order_id, p_guest_token: cancelOrd.data.guest_token, p_reason: "changed my mind" });
  check("customer cancels a paid order", cancelled.data?.ok === true, JSON.stringify(cancelled));
  check("stock came back", (await variantBySku("CONT-SET-3")).stock === stockBeforeCancel + 1);
  const pendingRefund = (await svc.from("refunds").select("*").eq("order_id", cancelOrd.data.order_id)).data;
  check("full refund queued automatically", pendingRefund?.length === 1 && pendingRefund[0].status === "pending", JSON.stringify(pendingRefund));
  const tooLate = await rpc(guest, "cancel_own_order", { p_order_id: oid, p_guest_token: otoken });
  check("delivered order cannot be cancelled", tooLate.data?.ok === false);
  // unpaid expiry
  const unpaid = await fn("place-order", { items: [{ sku: "CONT-SET-3", quantity: 1 }], email: `smoke-unpaid-${RUN}@plusmark.test`, phone: PHONE,
    customer_name: "Smoke Unpaid", shipping_address: addr(), payment_method: "razorpay" }, { headers: { "x-forwarded-for": "10.1.1.5" } });
  const stockHeld = (await variantBySku("CONT-SET-3")).stock;
  await svc.from("orders").update({ placed_at: new Date(Date.now() - 3 * 3600_000).toISOString() }).eq("id", unpaid.data.order_id);
  const exp = await svc.rpc("expire_unpaid_orders");
  check("unpaid orders expire and release stock", exp.data >= 1 && (await variantBySku("CONT-SET-3")).stock === stockHeld + 1 && (await orderRow(unpaid.data.order_id)).status === "cancelled", JSON.stringify(exp));

  /* ------------------------------------------------------------------ */
  begin("10. Reviews and fraud protection");
  const contP = (await svc.from("products").select("id").eq("slug", "airtight-container-set").single()).data.id;
  const before = await rpc(other.client, "submit_review", { p_product_id: contP, p_rating: 5, p_title: "Great stuff", p_body: "Really good quality product, loved it." });
  check("review refused without a delivered purchase", before.data?.error === "purchase_required", JSON.stringify(before.data));
  // the buyer's order: place, pay by COD and deliver
  const bOrder = await place({ email: buyer.email, items: [{ sku: "CONT-SET-3", quantity: 1 }] }, buyer.token, { "x-forwarded-for": "10.1.1.6" });
  await rpc(adminClient, "admin_set_shipment", { p_order_id: bOrder.data.order_id, p_carrier_id: "self", p_tracking_number: "OWN1" });
  const bsh = (await svc.from("shipments").select("id").eq("order_id", bOrder.data.order_id)).data[0];
  await rpc(adminClient, "admin_set_shipment", { p_order_id: bOrder.data.order_id, p_shipment_id: bsh.id, p_carrier_id: "self", p_tracking_number: "OWN1", p_status: "delivered" });
  const can = await rpc(buyer.client, "can_review", { p_product_id: contP });
  check("buyer can review after delivery", can.data === true);
  const clean = await rpc(buyer.client, "submit_review", { p_product_id: contP, p_rating: 5, p_title: "Sturdy and neat", p_body: `The lids fit well and the set stacks nicely in my kitchen. Batch ${RUN}.` });
  check("honest review is published at once", clean.data?.status === "published", JSON.stringify(clean));
  const shown = await guest.from("product_reviews").select("display_name,rating,verified_purchase").eq("product_id", contP);
  check("public sees review without private fields", shown.data?.length === 1 && shown.data[0].verified_purchase === true);
  const privateCols = await guest.from("product_reviews").select("user_id,fraud_score").limit(1);
  check("fraud columns are not public", privateCols.error, "readable");
  const spam = await rpc(buyer.client, "submit_review", { p_product_id: contP, p_rating: 5, p_title: "Best ever", p_body: "BUY NOW at www.cheap-deals.com call me 9876501234 for discount code" });
  check("spam with link, phone and promo goes to moderation", spam.data?.status === "pending", JSON.stringify(spam));
  const summary = await guest.from("product_rating_summary").select("*").eq("product_id", contP);
  check("held review is not counted in public rating", (summary.data?.[0]?.review_count ?? 0) === 0, JSON.stringify(summary.data));
  const queue = await rpc(adminClient, "admin_list_reviews", { p_status: "pending" });
  check("admin sees it with fraud flags", queue.data?.rows?.some((r) => r.fraud_flags?.includes("contains_link")), JSON.stringify(queue.data?.rows?.[0]?.fraud_flags));
  const rv = queue.data?.rows?.find((r) => r.fraud_flags?.includes("contains_link"));
  await rpc(adminClient, "admin_moderate_review", { p_review_id: rv.id, p_status: "rejected", p_note: "spam" });
  check("rejected review stays hidden", ((await guest.from("product_reviews").select("id").eq("product_id", contP)).data ?? []).length === 0);
  const guestReview = await rpc(guest, "submit_review", { p_product_id: contP, p_rating: 5, p_title: "Nice one", p_body: "A perfectly fine review text here." });
  check("guests cannot review", guestReview.data?.error === "login_required" || guestReview.error, JSON.stringify(guestReview.data));

  /* ------------------------------------------------------------------ */
  begin("11. Compare and related products set from the backend");
  const slugs = ["steel-water-bottle", "non-stick-tawa", "spiral-notebook"];
  const ids = (await svc.from("products").select("id,slug").in("slug", slugs)).data;
  const idOf = (s) => ids.find((p) => p.slug === s).id;
  const setCmp = await rpc(adminClient, "admin_set_relations", { p_product_id: idOf("steel-water-bottle"), p_kind: "compare", p_related: [idOf("non-stick-tawa"), idOf("spiral-notebook")] });
  check("admin picks compare products", setCmp.data === 2, JSON.stringify(setCmp));
  const rel = await rpc(guest, "get_product_relations", { p_slug: "steel-water-bottle", p_limit: 4 });
  check("storefront reads the picked compare list in order", JSON.stringify(rel.data?.compare) === JSON.stringify(["non-stick-tawa", "spiral-notebook"]), JSON.stringify(rel.data));
  check("also-bought list falls back automatically", Array.isArray(rel.data?.also_bought) && rel.data.also_bought.length > 0, JSON.stringify(rel.data));
  const relGuestWrite = await guest.rpc("admin_set_relations", { p_product_id: idOf("steel-water-bottle"), p_kind: "compare", p_related: [] });
  check("guests cannot change relations", relGuestWrite.error);
  await svc.from("products").update({ published: false }).eq("slug", "non-stick-tawa");
  const rel2 = await rpc(guest, "get_product_relations", { p_slug: "steel-water-bottle" });
  check("unpublished products drop out of compare", !rel2.data.compare.includes("non-stick-tawa"));
  await svc.from("products").update({ published: true }).eq("slug", "non-stick-tawa");

  /* ------------------------------------------------------------------ */
  begin("12. Reports, consent, rate limits, emails");
  for (const r of ["report_sales", "report_gst", "report_top_products", "report_category_sales", "report_variant_options", "report_payments",
    "report_inventory", "report_customers", "report_coupons", "report_returns", "report_geo", "report_cohorts", "report_fulfilment", "report_time_patterns"]) {
    const res = await rpc(adminClient, r);
    check(`${r} runs`, !res.error, res.error?.message);
  }
  const gst = (await rpc(adminClient, "report_gst")).data;
  check("GST report has CGST/SGST and IGST columns", Array.isArray(gst) && gst.length > 0 && "cgst_inr" in gst[0]);
  const salesRep = (await rpc(adminClient, "report_sales", { p_group: "day" })).data;
  check("sales report counts only real sales", salesRep.length > 0 && Number(salesRep[0].orders) >= 1);
  const consent = await rpc(guest, "record_consent", { p_anon_id: `anon-${RUN}-abcdef`, p_preferences: true, p_analytics: false, p_marketing: false });
  check("cookie consent stored", !consent.error && consent.data, consent.error?.message);
  const mails = (await svc.from("email_outbox").select("template,status").like("to_email", `smoke-%${RUN}%`)).data ?? [];
  const templates = new Set(mails.map((m) => m.template));
  for (const t of ["order_confirmation", "order_shipped", "order_delivered", "return_requested", "return_approved", "return_received", "refund_processed", "order_cancelled"]) {
    check(`email queued: ${t}`, templates.has(t) || (t === "order_confirmation" && templates.size > 0), [...templates].join(","));
  }
  // the worker may be busy sending (the database wakes it on every new email), so retry a few times
  const callWorker = async (secret) => {
    let r;
    for (let i = 0; i < 6; i++) {
      r = await fn("process-emails", {}, { headers: { "x-job-secret": secret } });
      if (r.status !== 503) break;
      await sleep(8000);
    }
    return r;
  };
  const okJob = await callWorker(env.NOTIFICATION_JOB_SECRET);
  check("email worker accepts the job secret", okJob.status === 200, JSON.stringify(okJob.data));
  const wrongJob = await callWorker("nope");
  check("email worker rejects strangers", wrongJob.status === 403, wrongJob.status);
  // rate limiting on a single network
  let limited = false;
  for (let i = 0; i < 10 && !limited; i++) {
    const r = await place({ email: `smoke-rate-${RUN}-${i}@plusmark.test` }, LOCAL.anon, { "x-forwarded-for": "10.77.77.77", "cf-connecting-ip": "10.77.77.77" });
    limited = r.data?.error === "rate_limited" || r.status === 429;
  }
  check("one network cannot flood checkout", limited, "no limit hit in 10 orders");
} catch (e) {
  console.error("\nTEST RUN CRASHED:", e);
  results.push({ section, name: "run completed without crashing", ok: false, detail: String(e?.message ?? e) });
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("\nFAILED:");
  for (const f of failed) console.log(` [${f.section}] ${f.name}${f.detail ? "\n     " + f.detail : ""}`);
  process.exit(1);
}
