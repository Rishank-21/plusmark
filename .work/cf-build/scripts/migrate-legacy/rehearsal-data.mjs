// Data side of the migration rehearsal (task 23.8): a seeded synthetic legacy dataset generator, a deterministic PII
// anonymizer for rows read from a real legacy database, and the loader that writes either into the legacy tables of a
// scratch database. Pure functions except `loadDataset` and `readLegacy`. No real data lives in this repository.
import { createHash } from "node:crypto";

// Tables in load order (parents first). Each holds an array of plain row objects shaped like to_jsonb(row).
export const TABLES = [
  ["auth_users", "auth.users"], ["profiles", "public.profiles"], ["addresses", "public.addresses"], ["categories", "public.categories"],
  ["media", "public.media"], ["products", "public.products"], ["product_variants", "public.product_variants"],
  ["site_content", "public.site_content"], ["coupons", "public.coupons"], ["shipping_methods", "public.shipping_methods"],
  ["orders", "public.orders"], ["order_items", "public.order_items"], ["product_reviews", "public.product_reviews"],
  ["saved_boards", "public.saved_boards"], ["payment_events", "public.payment_events"],
];

const FIRST = ["Aarav", "Vivaan", "Aditya", "Diya", "Ananya", "Ishaan", "Kavya", "Meera", "Rohan", "Saanvi", "Tara", "Neel", "Isha", "Kabir", "Riya", "Arjun", "Pooja", "Dev", "Nisha", "Veda", "Om", "Zoya", "Yash", "Sana", "Karan"];
const LAST = ["Sharma", "Iyer", "Rao", "Nair", "Gupta", "Khan", "Patel", "Singh", "Das", "Reddy", "Menon", "Joshi", "Bose", "Kulkarni", "Mehta", "Pillai", "Verma", "Shetty", "Ghosh", "Chopra"];
const STREETS = ["Lake", "Temple", "Market", "Station", "Garden", "Park", "Mill", "Hill", "River", "School"];

// ---- seeded random --------------------------------------------------------------------------------------------------
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = (arr) => arr[Math.floor(next() * arr.length)];
  const weighted = (pairs) => { let x = next() * pairs.reduce((s, [, w]) => s + w, 0); for (const [v, w] of pairs) { if ((x -= w) < 0) return v; } return pairs.at(-1)[0]; };
  const uuid = () => { const h = Array.from({ length: 32 }, () => int(0, 15).toString(16)).join(""); return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20)}`; };
  return { next, int, pick, weighted, uuid };
}

// ---- synthetic dataset ----------------------------------------------------------------------------------------------
// scale 1 = 300 products (about 900 variants), 3000 customers, 6000 orders. Every email is user<N>@example.invalid.
export function generateDataset({ seed = 20261114, scale = 1 } = {}) {
  const R = rng(seed);
  const n = (base) => Math.max(1, Math.round(base * scale));
  const iso = (ms) => new Date(ms).toISOString();
  const T0 = Date.parse("2024-01-01T00:00:00Z"), T1 = Date.parse("2026-10-31T00:00:00Z");
  const when = () => iso(R.int(T0, T1));
  const D = Object.fromEntries(TABLES.map(([k]) => [k, []]));
  const phones = new Set();
  const phone = () => { let p; do { p = `${R.int(6, 9)}${String(R.int(0, 999999999)).padStart(9, "0")}`; } while (phones.has(p)); phones.add(p); return p; };
  const name = () => `${R.pick(FIRST)} ${R.pick(LAST)}`;
  const addr = (full, ph) => ({ recipientName: full, line1: `${R.int(1, 400)} ${R.pick(STREETS)} Road`, landmark: R.next() < 0.3 ? `Near ${R.pick(STREETS)} Gate` : "", city: R.pick(["Pune", "Mumbai", "Chennai", "Kochi", "Delhi", "Bengaluru", "Kolkata"]), state: R.pick(["Maharashtra", "Tamil Nadu", "Kerala", "Delhi", "Karnataka", "West Bengal"]), pincode: String(R.int(100000, 899999)), phone: ph });

  // categories, media, products, variants
  const catCount = 12;
  const cats = [];
  for (let i = 0; i < catCount; i++) {
    const subs = Array.from({ length: R.int(2, 5) }, (_, j) => ({ id: `cat${i}-sub${j}`, name: `Subcategory ${i}.${j}` }));
    cats.push({ id: `cat${i}`, name: `Category ${i}`, description: `Synthetic category ${i}`, subject: "Board", image: `plusmark/cat/cat${i}`, subcategories: subs, sort_order: i, created_at: when(), updated_at: when() });
  }
  D.categories = cats;
  const variants = [];
  const nProducts = n(300);
  for (let i = 0; i < nProducts; i++) {
    const cat = R.pick(cats);
    const id = R.uuid(), slug = `product-${i}`;
    const fixed = R.next() < 0.85;
    const mediaIds = Array.from({ length: R.int(1, 3) }, (_, j) => `plusmark/p${i}/m${j}`);
    mediaIds.forEach((pid, j) => D.media.push({ id: R.uuid(), public_id: pid, url: `https://res.example.invalid/${pid}.jpg`, resource_type: "image", format: "jpg", width: 1200, height: 900, bytes: R.int(50000, 900000), duration: null, alt_text: `Product ${i} image ${j}`, created_at: when(), created_by: null }));
    D.products.push({
      id, slug, name: `Synthetic Board ${i}`, category_id: cat.id, series_id: null, subcategory_ids: [R.pick(cat.subcategories).id], surface: R.pick(["Melamine", "Ceramic", "Cork", "Chalk"]),
      frame: R.pick(["Aluminium", "Wood", null]), corners: null, magnetic: R.next() < 0.4, double_sided: R.next() < 0.1, usage: "Classroom", blurb: `Blurb ${i}`, description: `Description of product ${i}.`,
      features: ["Durable", "Easy to clean"], media: mediaIds.map((p) => ({ publicId: p })), video_id: null, price_mode: fixed ? "fixed" : "on_request", gst_rate_percent: 18, hsn_code: "9610",
      bulk_suggestion_quantity: 10, published: R.next() < 0.92, featured: R.next() < 0.1, created_at: when(), updated_at: when(),
      board_type: R.pick(["non-magnetic", "magnetic", "ceramic", "n/a"]), surface_kind: R.pick(["marker", "chalk", "pin-up", "other"]),
      enquiry_only: !fixed, needs_data: R.next() < 0.03, customisation: null, specs: [{ label: "Frame depth", value: `${R.int(15, 30)} mm` }],
    });
    const sizes = R.int(2, 4);
    for (let j = 0; j < sizes; j++) {
      const v = { id: R.uuid(), product_id: id, size_label: `${j + 2}x${j + 3} ft`, sku: `PM-${String(i).padStart(4, "0")}-${j + 1}`, price_mode: fixed ? "fixed" : "on_request",
        price_inr: fixed ? (R.int(500, 90000) + R.pick([0, 0.5, 0.99])).toFixed(2) : null, stock: R.next() < 0.6 ? R.int(0, 200) : null, track_inventory: R.next() < 0.6,
        available: R.next() < 0.95, lead_time_days: R.next() < 0.5 ? R.int(0, 21) : null, sort_order: j, created_at: when(), updated_at: when() };
      D.product_variants.push(v);
      if (fixed) variants.push({ ...v, product: D.products.at(-1) });
    }
  }

  // coupons (two invalid ones that the tool must skip with a reason)
  const coupons = [];
  for (let i = 0; i < 40; i++) {
    const percent = R.next() < 0.6;
    coupons.push({ id: R.uuid(), code: `CPN${String(i).padStart(3, "0")}`, description: `Synthetic coupon ${i}`, kind: percent ? "percent" : "flat", value: percent ? String(R.int(5, 25)) : String(R.int(50, 500)),
      minimum_order_inr: String(R.pick([0, 0, 500, 1000, 5000])), active: R.next() < 0.85, starts_at: "2024-01-01", ends_at: "2026-12-31", usage_limit: R.next() < 0.5 ? R.int(50, 500) : null, used_count: R.int(0, 40), created_at: when(), updated_at: when() });
  }
  coupons.push({ ...coupons[0], id: R.uuid(), code: "OVERPCT", kind: "percent", value: "150" });
  coupons.push({ ...coupons[0], id: R.uuid(), code: "BACKWARDS", kind: "flat", value: "50", starts_at: "2026-03-01", ends_at: "2026-01-01" });
  D.coupons = coupons;
  const usable = coupons.filter((c) => !["OVERPCT", "BACKWARDS"].includes(c.code));

  D.shipping_methods = [
    ["standard", "Standard", 99, 3, 6], ["express", "Express", 249, 1, 3], ["freight", "Freight", null, null, null], ["pickup", "Store pickup", 0, 0, 0], ["bulk", "Bulk courier", 499, 5, 9], ["islands", "Islands", 799, 7, 14],
  ].map(([id, nm, price, a, b], i) => ({ id, name: nm, description: `${nm} delivery`, price_inr: price == null ? null : String(price), eta_min_days: a, eta_max_days: b, available: id !== "islands", sort_order: i, updated_at: when() }));
  D.site_content = Array.from({ length: 30 }, (_, i) => ({ key: `section${i}.title`, value: i % 3 === 0 ? { title: `Heading ${i}`, body: `Body ${i}` } : `Text ${i}`, updated_by: null, updated_at: when() }));

  // customers
  const nUsers = n(3000), nAdmins = 3;
  const users = [];
  for (let i = 0; i < nUsers + nAdmins; i++) {
    const admin = i >= nUsers;
    const id = R.uuid(), email = `user${i + 1}@example.invalid`, full = name();
    D.auth_users.push({ id, email, email_confirmed_at: when(), raw_user_meta_data: {} });
    const ph = R.next() < 0.7 || admin ? phone() : null;
    D.profiles.push({ id, full_name: full, phone: ph, marketing_opt_in: R.next() < 0.3, created_at: when(), updated_at: when(), role: admin ? "admin" : "customer", email });
    users.push({ id, email, full, ph });
    if (!admin) {
      for (let k = 0, m = R.weighted([[0, 3], [1, 5], [2, 2]]); k < m; k++) {
        const a = addr(full, phone());
        D.addresses.push({ id: R.uuid(), user_id: id, label: k ? "Work" : "Home", full_name: a.recipientName, phone: a.phone, line1: a.line1, line2: R.next() < 0.3 ? `Flat ${R.int(1, 40)}` : null, landmark: a.landmark || null,
          city: a.city, state: a.state, pincode: a.pincode, is_default: k === 0, created_at: when(), updated_at: when() });
      }
    }
  }
  const customers = users.slice(0, nUsers);

  // orders (GST 18 percent of the discounted subtotal, matching what the Backend recomputes)
  const STAT = [["delivered", 45], ["confirmed", 8], ["processing", 5], ["dispatched", 7], ["placed", 4], ["payment_pending", 3], ["payment_failed", 3], ["cancelled", 8], ["return_requested", 3], ["refund_processing", 2], ["refunded", 4]];
  const PAID = new Set(["delivered", "confirmed", "processing", "dispatched", "return_requested", "refund_processing", "refunded"]);
  const guestEmails = Array.from({ length: n(900) }, (_, i) => `guest${i + 1}@example.invalid`);
  const nOrders = n(6000);
  for (let i = 0; i < nOrders; i++) {
    const guest = R.next() < 0.3;
    const u = guest ? null : R.pick(customers);
    const email = guest ? (R.next() < 0.1 ? R.pick(customers).email : R.pick(guestEmails)) : u.email;
    const status = R.weighted(STAT);
    const method = R.weighted([["razorpay", 75], ["cod_placeholder", 20], ["quotation_invoice", 5]]);
    const paid = PAID.has(status) && (method === "razorpay" || (method === "cod_placeholder" && status === "delivered"));
    const payment_status = status === "refunded" ? "refunded" : paid ? "paid" : status === "payment_failed" ? "failed" : status === "payment_pending" ? "pending" : "unpaid";
    const createdMs = R.int(T0, T1);
    const id = R.uuid();
    const lines = Array.from({ length: R.int(1, 4) }, () => { const v = R.pick(variants); return { v, qty: R.int(1, 6), price: Math.round(Number(v.price_inr) * 100) }; });
    const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const cp = R.next() < 0.2 ? R.pick(usable) : null;
    let disc = 0;
    if (cp) disc = Math.min(sub, cp.kind === "percent" ? Math.round((sub * Number(cp.value)) / 100) : Math.round(Number(cp.value) * 100));
    const gst = Math.round(((sub - disc) * 18) / 100), ship = R.pick([0, 9900, 14900, 24900]);
    const total = sub - disc + gst + ship;
    const c = (x) => x / 100;
    const a = addr(guest ? name() : u.full, phone());
    const rpOrder = method === "razorpay" && status !== "placed" ? `order_${String(i).padStart(6, "0")}rp` : null;
    const rpPay = rpOrder && (paid || status === "refunded") ? `pay_${String(i).padStart(6, "0")}rp` : null;
    const paidAt = rpPay || paid ? iso(createdMs + 3600e3) : null;
    D.orders.push({
      id, user_id: u?.id ?? null, reference: `PM-${new Date(createdMs).getUTCFullYear() % 100}-${10000 + i}`, contact_email: email, status, payment_status, payment_method: method, total: c(total).toFixed(2),
      totals: { subtotalInr: c(sub), discountInr: c(disc), gstInr: c(gst), shippingInr: c(ship), totalInr: c(total) }, shipping_address: a, billing_address: a, coupon_code: cp?.code ?? null,
      created_at: iso(createdMs), updated_at: iso(createdMs + 1000), courier_name: ["dispatched", "delivered"].includes(status) ? "Synthetic Courier" : null, tracking_number: ["dispatched", "delivered"].includes(status) ? `TRK${i}` : null,
      tracking_url: null, return_reason: ["return_requested", "refund_processing", "refunded"].includes(status) ? "Wrong size ordered" : null, invoice_number: paid ? `INV-${i}` : null,
      razorpay_order_id: rpOrder, razorpay_payment_id: rpPay, razorpay_signature: rpPay ? `sig${i}` : null, paid_at: paidAt,
    });
    for (const l of lines) D.order_items.push({ id: R.uuid(), order_id: id, product_id: l.v.product.id, name: l.v.product.name, variant_label: l.v.size_label, sku: l.v.sku, price: c(l.price).toFixed(2), quantity: l.qty });
    if (rpPay) {
      D.payment_events.push({ event_id: `evt_${String(i).padStart(6, "0")}a`, provider: "razorpay", event_type: "payment.captured", received_at: iso(createdMs + 60e3),
        payload: { event: "payment.captured", payload: { payment: { entity: { id: rpPay, order_id: rpOrder, amount: total, currency: "INR", status: "captured", email, contact: `+91${a.phone}`, notes: { reference: `PM-${i}` } } } } } });
    }
  }
  // reviews (one per customer and product; a few for slugs that no longer exist), saved boards
  const seen = new Set();
  for (let i = 0; i < n(1500); i++) {
    const u = R.pick(customers), slug = R.next() < 0.03 ? `ghost-${i}` : `product-${R.int(0, nProducts - 1)}`;
    if (seen.has(u.id + slug)) continue;
    seen.add(u.id + slug);
    D.product_reviews.push({ id: R.uuid(), product_slug: slug, user_id: u.id, author_name: u.full.split(" ")[0], rating: R.int(1, 5), title: `Review title ${i}`, body: `Synthetic review body number ${i}, long enough to pass.`, created_at: when(), updated_at: when() });
  }
  const sb = new Set();
  for (let i = 0; i < n(4000); i++) {
    const u = R.pick(customers), slug = R.next() < 0.02 ? `ghost-${i}` : `product-${R.int(0, nProducts - 1)}`;
    if (sb.has(u.id + slug)) continue;
    sb.add(u.id + slug);
    D.saved_boards.push({ user_id: u.id, product_id: slug, created_at: when() });
  }
  return D;
}

// ---- anonymizer -----------------------------------------------------------------------------------------------------
// Deterministic for a given salt: the same input value maps to the same fake value in every table, so joins by email,
// phone or Razorpay id keep working. Different salts give different mappings; the salt must stay secret.
export function makeAnonymizer(salt) {
  if (!salt || String(salt).length < 8) throw new Error("the salt must be at least 8 characters");
  const H = (kind, v) => createHash("sha256").update(`${salt}\0${kind}\0${v}`).digest("hex");
  const hexInt = (h, mod) => Number(BigInt(`0x${h.slice(0, 12)}`) % BigInt(mod));
  const phoneUsed = new Map(), phoneTaken = new Set();
  const fake = {
    email: (v) => (v == null || v === "" ? v : `user-${H("email", String(v).trim().toLowerCase()).slice(0, 12)}@example.invalid`),
    name: (v) => { if (v == null || String(v).trim() === "") return v; const h = H("name", String(v).trim().toLowerCase()); return `${FIRST[hexInt(h, FIRST.length)]} ${LAST[hexInt(h.slice(12), LAST.length)]}`; },
    phone: (v) => {
      if (v == null || String(v).trim() === "") return v;
      const raw = String(v), digits = raw.replace(/\D/g, "").slice(-10);
      if (phoneUsed.has(digits)) return raw.startsWith("+91") ? `+91${phoneUsed.get(digits)}` : phoneUsed.get(digits);
      let p, k = 0;
      do { const h = H("phone", `${digits}#${k++}`); p = `${6 + hexInt(h, 4)}${String(hexInt(h.slice(12), 1e9)).padStart(9, "0")}`; } while (phoneTaken.has(p));
      phoneTaken.add(p); phoneUsed.set(digits, p);
      return raw.startsWith("+91") ? `+91${p}` : p;
    },
    id: (v) => { if (v == null || v === "") return v; const s = String(v), i = s.indexOf("_"); return `${i > 0 ? s.slice(0, i) : "x"}_${H("id", s).slice(0, 14)}`; },
    text: (v) => (v == null || String(v).trim() === "" ? v : `Anonymized text ${H("text", v).slice(0, 10)}`),
    street: (v) => { if (v == null || String(v).trim() === "") return v; const h = H("street", v); return `${1 + hexInt(h, 400)} ${STREETS[hexInt(h.slice(12), STREETS.length)]} Road`; },
  };
  // Address-like JSON (orders): known keys are replaced, unknown string keys are kept (city, state, pincode are not personal on their own).
  const address = (a) => {
    if (a == null || typeof a !== "object") return a;
    const out = { ...a };
    for (const [k, v] of Object.entries(out)) {
      if (typeof v !== "string") continue;
      if (/^(recipientName|fullName|full_name|name)$/i.test(k)) out[k] = fake.name(v);
      else if (/^(line1|line2|landmark|address|street)$/i.test(k)) out[k] = fake.street(v);
      else if (/phone|mobile|contact/i.test(k)) out[k] = fake.phone(v);
      else if (/email/i.test(k)) out[k] = fake.email(v);
      else if (/note|instruction|comment/i.test(k)) out[k] = fake.text(v);
    }
    return out;
  };
  // Payment provider payloads: scrub by key name, then any remaining string that looks like an email or phone.
  const payload = (x, key = "") => {
    if (Array.isArray(x)) return x.map((e) => payload(e, key));
    if (x && typeof x === "object") {
      if (/^notes?$/i.test(key)) return {};
      return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, payload(v, k)]));
    }
    if (typeof x !== "string" && typeof x !== "number") return x;
    const s = String(x);
    if (/email/i.test(key)) return fake.email(s);
    if (/^(contact|phone|mobile)$/i.test(key)) return fake.phone(s);
    if (/name/i.test(key)) return fake.name(s);
    if (/^(vpa|bank|wallet|card_id|token_id|customer_id|description|address|upi.*|acquirer_data)$/i.test(key)) return typeof x === "string" ? fake.text(s) : x;
    if (typeof x === "string" && /^[a-z]+_[A-Za-z0-9]{6,}$/.test(s)) return fake.id(s);
    if (typeof x === "string" && /@/.test(s)) return fake.email(s);
    return x;
  };
  const rows = {
    auth_users: (r) => ({ id: r.id, email: fake.email(r.email), email_confirmed_at: r.email_confirmed_at, raw_user_meta_data: {} }),
    profiles: (r) => ({ ...r, full_name: fake.name(r.full_name), phone: fake.phone(r.phone), email: fake.email(r.email) }),
    addresses: (r) => ({ ...r, full_name: fake.name(r.full_name), phone: fake.phone(r.phone), line1: fake.street(r.line1), line2: fake.street(r.line2), landmark: fake.text(r.landmark) }),
    orders: (r) => ({ ...r, contact_email: fake.email(r.contact_email), shipping_address: address(r.shipping_address), billing_address: address(r.billing_address),
      razorpay_order_id: fake.id(r.razorpay_order_id), razorpay_payment_id: fake.id(r.razorpay_payment_id), razorpay_signature: r.razorpay_signature == null ? null : H("sig", r.razorpay_signature),
      tracking_number: r.tracking_number == null ? null : `TRK${H("trk", r.tracking_number).slice(0, 10).toUpperCase()}`, tracking_url: r.tracking_url == null ? null : `https://tracking.example.invalid/${H("trkurl", r.tracking_url).slice(0, 10)}`,
      return_reason: fake.text(r.return_reason) }),
    product_reviews: (r) => ({ ...r, author_name: fake.name(r.author_name), title: fake.text(r.title), body: fake.text(r.body) }),
    payment_events: (r) => ({ ...r, event_id: fake.id(r.event_id), payload: payload(r.payload) }),
  };
  const transform = (table, row) => (rows[table] ? rows[table](row) : row);
  return { fake, transform, address, payload };
}

// Throws if a row still carries a value that the anonymizer should have replaced (real e-mail address or phone number).
export function assertNoLeak(originalEmails, originalPhones, rows) {
  const text = JSON.stringify(rows);
  for (const m of text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []) {
    if (originalEmails.has(m.toLowerCase())) throw new Error("anonymizer leak: an original e-mail address survived");
  }
  for (const m of text.match(/(?<![0-9])[6-9][0-9]{9}(?![0-9])/g) ?? []) {
    if (originalPhones.has(m)) throw new Error("anonymizer leak: an original phone number survived");
  }
}

// Reads a real legacy database (read-only transaction) and returns an anonymized dataset.
export async function anonymizeFrom(client, salt) {
  const { transform } = makeAnonymizer(salt);
  const D = {};
  const emails = new Set(), phones = new Set();
  await client.query("begin transaction isolation level repeatable read read only");
  try {
    for (const [key, table] of TABLES) {
      const sql = key === "auth_users"
        ? "select jsonb_build_object('id', id, 'email', email, 'email_confirmed_at', email_confirmed_at) r from auth.users"
        : `select to_jsonb(t) r from ${table} t`;
      const rows = (await client.query(sql)).rows.map((x) => x.r);
      for (const r of rows) {
        for (const f of ["email", "contact_email"]) if (typeof r[f] === "string") emails.add(r[f].trim().toLowerCase());
        if (typeof r.phone === "string") phones.add(r.phone.replace(/\D/g, "").slice(-10));
      }
      D[key] = rows.map((r) => transform(key, r));
    }
  } finally {
    await client.query("rollback").catch(() => {});
  }
  phones.delete("");
  for (const [key] of TABLES) assertNoLeak(emails, phones, D[key]);
  return D;
}

// Writes the dataset into the legacy tables of a scratch database. Triggers are off for the load (session_replication_role)
// so created_at, updated_at and the profile-on-signup trigger keep the dataset values.
export async function loadDataset(client, D) {
  await client.query("set session_replication_role = replica");
  const q = (c) => `"${c.replace(/"/g, '""')}"`;
  const counts = {};
  for (const [key, table] of TABLES) {
    const rows = D[key] ?? [];
    counts[key] = rows.length;
    if (!rows.length) continue;
    const cols = Object.keys(rows[0]).map(q).join(", ");
    for (let i = 0; i < rows.length; i += 500) {
      await client.query(`insert into ${table} (${cols}) select ${cols} from jsonb_populate_recordset(null::${table}, $1::jsonb)`, [JSON.stringify(rows.slice(i, i + 500))]);
    }
  }
  await client.query("set session_replication_role = origin");
  return counts;
}
