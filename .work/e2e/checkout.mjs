import { chromium } from "playwright-core";
import pg from "../../node_modules/pg/lib/index.js";

const EMAIL = `e2e-${Date.now().toString(36)}@plusmark.test`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));

const cart = {
  lines: [{ id: "l1", productId: "eco-regular-white-board", variantId: "eco-regular-white-board--2-x-3-ft", quantity: 2, addedAt: new Date().toISOString() }],
  couponCode: null,
  shippingMethodId: "standard",
};
await page.addInitScript((c) => { if (!localStorage.getItem("plusmark.cart.v1")) localStorage.setItem("plusmark.cart.v1", JSON.stringify(c)); }, cart);

// 1. coupon through the real UI (public code, validated by the server)
await page.goto("http://localhost:3000/cart", { waitUntil: "networkidle", timeout: 120000 });
await page.getByLabel("Coupon code").fill("WELCOME10");
await page.getByRole("button", { name: /^Apply/ }).click();
await page.waitForTimeout(2500);
let text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
console.log("COUPON APPLIED:", /WELCOME10/.test(text) && /Discount of/.test(text), "|", (text.match(/Discount of [^.]*\./) ?? [""])[0]);
console.log("SUMMARY:", (text.match(/Order summary.{0,260}/) ?? [""])[0]);

// 2. checkout as a guest, cash on delivery
await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1500);
await page.fill("#checkout-phone", "9812345678");
await page.fill("#checkout-name", "E2E Buyer");
await page.fill("#checkout-email", EMAIL);
await page.fill("#checkout-pincode", "380009");
await page.waitForTimeout(3500);
if (!(await page.inputValue("#checkout-city"))) await page.fill("#checkout-city", "Ahmedabad");
const state = await page.inputValue("#checkout-state");
if (!state) await page.fill("#checkout-state", "Gujarat");
await page.fill("#checkout-line1", "12 Test Street, Navrangpura");
await page.waitForTimeout(1500);
console.log("STATE FIELD:", await page.inputValue("#checkout-state"));
const radios = await page.$$("input[name=payment-method]");
for (const r of radios) { const v = await r.getAttribute("value"); console.log("PAYMENT OPTION:", v); }
await page.locator("input[name=payment-method][value=cod]").check({ force: true }).catch(() => console.log("no cod radio"));
await page.waitForTimeout(1500);
text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
console.log("CHECKOUT SUMMARY:", (text.match(/Subtotal.{0,320}/) ?? [""])[0]);
await page.screenshot({ path: "checkout-filled.png", fullPage: true });
await page.getByRole("button", { name: /Place order/ }).last().click();
await page.waitForTimeout(8000);
text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
console.log("AFTER PLACE:", text.slice(0, 400));
await page.screenshot({ path: "placed.png", fullPage: true });

const db = new pg.Client({ connectionString: "postgresql://postgres:postgres@127.0.0.1:55322/postgres" });
await db.connect();
const { rows } = await db.query("select order_number,status,payment_method,subtotal_inr,discount_inr,shipping_inr,gst_inr,total_inr,coupon_code,phone from orders where email=$1", [EMAIL]);
console.log("DB ORDER:", JSON.stringify(rows));
const items = await db.query("select name,variant_label,sku,quantity,unit_price_inr from order_items where order_id=(select id from orders where email=$1)", [EMAIL]);
console.log("DB ITEMS:", JSON.stringify(items.rows));
await db.end();
await browser.close();
