import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { totp } from "../scripts/backend/_lib.mjs";

const req = createRequire(import.meta.url);
const { chromium } = req("../apps/admin/node_modules/playwright");

const b = await chromium.launch({ headless: true });
try {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);
  const errs = [];
  p.on("pageerror", (e) => errs.push("PAGEERR: " + e.message));
  p.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("cloudinary")) errs.push(`HTTP ${r.status()} ${r.url()}`);
  });

  const rHome = await p.goto("https://plusmark-storefront.palhariom698.workers.dev/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  console.log("Home HTTP:", rHome.status(), "title:", await p.title());

  await p.goto("https://plusmark-storefront.palhariom698.workers.dev/product/eco-regular-white-board", { waitUntil: "domcontentloaded" });
  await p.locator('fieldset:has-text("Choose a size") button:not([disabled])').first().waitFor({ state: "visible" });
  await p.waitForTimeout(800);
  await p.locator('fieldset:has-text("Choose a size") button:not([disabled])').first().click();
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: /Add to cart/i }).first().click();
  await p.waitForSelector('[role="dialog"]', { timeout: 8000 }).catch(() => { });
  await p.waitForTimeout(500);
  await p.goto("https://plusmark-storefront.palhariom698.workers.dev/checkout", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  console.log("Checkout URL & snippet:", p.url(), (await p.locator("#main").innerText()).replace(/\s+/g, " ").slice(0, 320));
  if (await p.locator("#checkout-phone").isVisible().catch(() => false)) {
    await p.locator("#checkout-state").fill("Gujarat");
    await p.waitForTimeout(1500);
    const chkAside = (await p.locator("#main aside").innerText()).replace(/\s+/g, " ");
    console.log("Checkout live quote:", chkAside.slice(0, 320));
  }
  console.log("Live Supabase requests detected:", await p.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.includes("tlosrpkmkomdxfbjivvu")).map((r) => r.name).slice(0, 5)));

  await p.goto("https://plusmark-storefront.palhariom698.workers.dev/admin", { waitUntil: "domcontentloaded" });
  await p.waitForURL(/\/admin\/login/, { timeout: 15000 });
  await p.locator('input[type="email"]').waitFor({ state: "visible" });
  await p.waitForTimeout(400);
  await p.locator('input[type="email"]').fill("admin@plusmark.test");
  await p.locator('input[type="password"]').fill("Plusmark#Admin1");
  await p.getByRole("button", { name: /Continue/i }).click();
  const codeIn = p.locator('input[inputmode="numeric"], input[placeholder*="code" i]').first();
  await codeIn.waitFor({ state: "visible", timeout: 12000 });
  const sec = readFileSync(".work/prod-admin-totp-secret.txt", "utf8").trim();
  const s = Math.floor(Date.now() / 1000) % 30;
  if (s > 26) await p.waitForTimeout((31 - s) * 1000);
  await codeIn.fill(totp(sec));
  await p.getByRole("button", { name: /Verify|Sign in|Continue/i }).last().click();
  await p.waitForURL((u) => u.pathname === "/admin" || u.pathname === "/admin/", { timeout: 15000 });
  await p.waitForTimeout(1500);
  console.log("Live Admin Dashboard:", (await p.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 380));
  console.log("Live errors:", errs);
} finally {
  await b.close();
}
