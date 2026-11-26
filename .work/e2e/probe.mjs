import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 200)); });

const cart = {
  lines: [{ id: "l1", productId: "eco-regular-white-board", variantId: "eco-regular-white-board--2-x-3-ft", quantity: 2, addedAt: new Date().toISOString() }],
  couponCode: null,
  shippingMethodId: "standard",
};
await page.addInitScript((c) => { if (!localStorage.getItem("plusmark.cart.v1")) localStorage.setItem("plusmark.cart.v1", JSON.stringify(c)); }, cart);

await page.goto("http://localhost:3000/cart", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
console.log("CART TEXT:", (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 900));

await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2000);
const labels = await page.$$eval("input,select,textarea", (els) => els.map((e) => `${e.tagName}#${e.id}[${e.getAttribute("name") ?? ""}] ${e.getAttribute("type") ?? ""}`));
console.log("FIELDS:", labels.join("\n"));
await page.screenshot({ path: "checkout.png", fullPage: true });
await browser.close();
