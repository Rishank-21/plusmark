import { chromium } from "playwright-core";
import { createRequire } from "node:module";
const require = createRequire("C:/Users/palha/plusmark/package.json");
const { createClient } = require("@supabase/supabase-js");
import { createHmac } from "node:crypto";
const pg = require("pg");

const URL = "http://127.0.0.1:55321";
const SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

function b32(s) { const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; let bits = ""; for (const c of s.toUpperCase()) { const v = a.indexOf(c); if (v >= 0) bits += v.toString(2).padStart(5, "0"); } const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out); }
function totp(secret) { const c = Math.floor(Date.now() / 30000); const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(c)); const h = createHmac("sha1", b32(secret)).update(b).digest(); const o = h[h.length - 1] & 15; return String((((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1e6).padStart(6, "0"); }

const svc = createClient(URL, SERVICE, { auth: { persistSession: false } });
const email = `e2e-admin-${Date.now().toString(36)}@plusmark.test`;
const password = "E2e#Admin12345";
const { data: u } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
await svc.from("profiles").update({ role: "admin" }).eq("id", u.user.id);
const c = createClient(URL, ANON, { auth: { persistSession: false } });
await c.auth.signInWithPassword({ email, password });
const enr = await c.auth.mfa.enroll({ factorType: "totp" });
const ch = await c.auth.mfa.challenge({ factorId: enr.data.id });
await c.auth.mfa.verify({ factorId: enr.data.id, challengeId: ch.data.id, code: totp(enr.data.totp.secret) });
const secret = enr.data.totp.secret;

const results = [];
const ok = (name, pass, detail = "") => { results.push(pass); console.log(`${pass ? "  ok " : " FAIL"} ${name}${pass ? "" : " -> " + detail}`); };

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
const text = async () => (await page.locator("main").first().innerText().catch(() => "")).replace(/\s+/g, " ");
const go = async (path, wait = 1800) => { await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle", timeout: 150000 }); await page.waitForTimeout(wait); };

// --- guard: not signed in
await go("/admin/orders");
ok("signed-out visitor is sent to admin login", page.url().includes("/admin/login"), page.url());

// --- password step then authenticator code
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password").fill(password);
await page.getByRole("button", { name: "Continue" }).click();
await page.waitForTimeout(2500);
ok("asks for the 6 digit code after the password", /6 digit code/.test(await page.locator("body").innerText()));
await go("/admin/orders", 1200);
ok("password alone does not open admin (middleware wants the code)", page.url().includes("/admin/login"), page.url());
await page.getByLabel("6 digit code").fill("000000");
await page.getByRole("button", { name: /Verify/ }).click();
await page.waitForTimeout(2000);
ok("wrong code is refused", /not accepted/.test(await page.locator("body").innerText()));
await page.getByLabel("6 digit code").fill(totp(secret));
await page.getByRole("button", { name: /Verify/ }).click();
await page.waitForTimeout(4000);
ok("right code opens the admin", page.url().includes("/admin") && !page.url().includes("login"), page.url());

// --- dashboard
await go("/admin");
let t = await text();
ok("dashboard shows today's figures", /orders today/i.test(t) && /needs attention/i.test(t), t.slice(0, 200));

// --- orders list and detail
await go("/admin/orders");
t = await text();
ok("orders list shows orders", /PM-\d{4}-\d+/.test(t), t.slice(0, 200));
await page.getByLabel("Search").fill("E2E Buyer");
await page.waitForTimeout(1800);
t = await text();
ok("order search by customer name works", /E2E Buyer/.test(t) && /orders/.test(t), t.slice(0, 250));
await page.waitForFunction(() => document.querySelectorAll("tbody tr").length >= 1 && [...document.querySelectorAll("tbody tr")].every((r) => /E2E Buyer/.test(r.innerText)), null, { timeout: 30000 }).catch(() => {});
await page.locator("tbody tr a[href^='/admin/orders/']").first().click();
await page.waitForURL(/\/admin\/orders\/[0-9a-f-]{36}/, { timeout: 60000 });
await page.waitForTimeout(3500);
t = await text();
ok("order detail opens with items, totals and history", /Items/.test(t) && /Shipping and tracking/.test(t) && /History/.test(t), t.slice(0, 200));
const orderUrl = page.url();

// ship it with tracking, through the UI
await page.getByRole("button", { name: /Update$/ }).first().isVisible().catch(() => false);
if (await page.getByLabel("Move to").isVisible().catch(() => false)) {
  await page.getByLabel("Move to").selectOption("processing");
  await page.getByRole("button", { name: "Update" }).click();
  await page.waitForTimeout(2500);
}
await page.getByLabel("Tracking number").fill("DL999888777");
await page.getByRole("button", { name: /Save and mark dispatched/ }).click();
await page.waitForTimeout(3500);
t = await text();
ok("shipment saved: order dispatched with courier link", /dispatched/i.test(t) && /DL999888777/.test(t), t.slice(0, 300));
const db = new pg.Client({ connectionString: "postgresql://postgres:postgres@127.0.0.1:55322/postgres" });
await db.connect();
const sh = await db.query("select tracking_url,status from shipments order by created_at desc limit 1");
ok("tracking link built from the courier", /DL999888777/.test(sh.rows[0]?.tracking_url ?? ""), JSON.stringify(sh.rows));

// --- products
await go("/admin/products");
t = await text();
ok("products list loads", /Eco Regular White Board/.test(t) || /Metallic Premium/.test(t), t.slice(0, 200));
await go("/admin/products/eco-regular-white-board/edit", 3500);
t = await text();
ok("product editor loads attributes, options and variants", /Surface/.test(t) && /Size/.test(t) && /Variants/.test(t), t.slice(0, 200));
const variantRows = await page.locator("tbody tr").count();
ok("variants listed for the product", variantRows >= 11, String(variantRows));
await page.getByLabel("Short line").fill("Edited by the admin E2E");
await page.getByRole("button", { name: "Save product" }).click();
await page.waitForTimeout(3500);
const prod = await db.query("select blurb from products where slug='eco-regular-white-board'");
ok("editing and saving a product writes to the database", prod.rows[0]?.blurb === "Edited by the admin E2E", JSON.stringify(prod.rows));

// compare pick through the UI
const sel = page.locator("select").filter({ hasText: "Add a product" }).first();
await sel.selectOption({ label: "Deluxe Standard White Board" }).catch(() => {});
await page.getByRole("button", { name: "Save product" }).click();
await page.waitForTimeout(3500);
const rel = await db.query("select count(*)::int n from product_relations pr join products p on p.id=pr.product_id where p.slug='eco-regular-white-board' and kind='compare'");
ok("compare pick saved from the admin screen", rel.rows[0].n >= 1, JSON.stringify(rel.rows));

// new product with options
await go("/admin/products/new", 2500);
await page.getByLabel("Product name").fill("E2E Steel Tiffin");
await page.locator("label").filter({ hasText: /^Category/ }).first().locator("select").selectOption("kitchen");
await page.getByRole("button", { name: "+ Size" }).click();
await page.getByRole("button", { name: "+ Colour" }).click();
await page.locator("input[name=v]").nth(0).fill("Small, Large");
await page.locator("input[name=v]").nth(0).press("Enter");
await page.locator("input[name=v]").nth(1).fill("Red, Blue");
await page.locator("input[name=v]").nth(1).press("Enter");
await page.getByLabel("Base price for new variants (₹, before GST)").fill("250");
await page.getByRole("button", { name: "Build all combinations" }).click();
await page.waitForTimeout(800);
const built = await page.locator("tbody tr").count();
ok("build all combinations makes size x colour variants", built === 4, String(built));
await page.getByLabel("Published (visible in the shop)").check();
await page.getByRole("button", { name: "Save product" }).click();
await page.waitForTimeout(4500);
const np = await db.query("select p.published, (select count(*) from product_variants v where v.product_id=p.id)::int n from products p where slug='e2e-steel-tiffin'");
ok("new product created with 4 variants and published", np.rows[0]?.n === 4 && np.rows[0]?.published === true, JSON.stringify(np.rows));

// --- other screens load without errors
for (const [path, expect] of [["/admin/inventory", /Inventory/], ["/admin/coupons", /coupon/i], ["/admin/reviews", /Reviews/], ["/admin/returns", /Returns/], ["/admin/payments", /Payments/], ["/admin/customers", /Customers/], ["/admin/categories", /Categories/], ["/admin/settings", /Store and tax/]]) {
  await go(path, 2500);
  t = await text();
  ok(`${path} loads`, expect.test(t) && !/could not|permission/i.test(t.slice(0, 400)), t.slice(0, 200));
}

// reports
await go("/admin/reports", 1500);
await page.getByRole("button", { name: "Run report" }).click();
await page.waitForTimeout(2500);
t = await text();
ok("sales report runs", /orders/.test(t) && /gross inr|total inr/i.test(t), t.slice(0, 250));
await page.getByLabel("Report").selectOption("gst");
await page.getByRole("button", { name: "Run report" }).click();
await page.waitForTimeout(2500);
t = await text();
ok("GST report runs", /cgst inr/i.test(t), t.slice(0, 250));

// coupon creation through the UI
await go("/admin/coupons", 2000);
await page.getByRole("button", { name: "New coupon" }).click();
await page.getByRole("textbox", { name: "Code", exact: true }).fill("E2E25");
await page.getByRole("spinbutton", { name: "Percent", exact: true }).fill("25");
await page.getByRole("button", { name: "Save coupon" }).click();
await page.waitForTimeout(2500);
const cp = await db.query("select kind,value from coupons where code='E2E25'");
ok("coupon created from the admin", cp.rows[0]?.kind === "percent" && Number(cp.rows[0]?.value) === 25, JSON.stringify(cp.rows));

ok("no page errors in the browser", errors.length === 0, errors.join(" | "));
await db.end();
await browser.close();
const bad = results.filter((r) => !r).length;
console.log(`\n${results.length - bad}/${results.length} browser checks passed`);
process.exit(bad ? 1 : 0);
