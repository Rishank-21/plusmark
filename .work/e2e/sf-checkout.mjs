// Guest storefront checkout through the real UI. Usage: node sf-checkout.mjs <cod|online> <email>
// cod: places a Cash_On_Delivery order. online: stops after payment-initiate (Razorpay Checkout opens) and prints the session.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('c:/Users/palha/plusmark/apps/storefront/package.json');
const { chromium } = require('playwright');
const mode = process.argv[2] ?? 'cod';
const email = process.argv[3] ?? 'guest-cod@example.com';
const B = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const out = { mode, email };
page.on('console', (m) => { if (m.type() === 'error' && !/placehold|inline style/.test(m.text())) console.log('[console]', m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/functions/v1/') || u.includes('/rest/v1/rpc/store_cart') || u.includes('/rest/v1/rpc/store_check')) {
    console.log('[resp]', r.request().method(), u.split('/').slice(-1)[0].split('?')[0], r.status());
    if (u.includes('/functions/v1/') && r.request().method() === 'POST') {
      try { const j = await r.json(); out[u.split('/').slice(-1)[0]] = j; console.log('   ', JSON.stringify(j).slice(0, 300)); } catch { /* */ }
    }
  }
});
const shot = (n) => page.screenshot({ path: `c:/Users/palha/plusmark/.work/e2e/${n}.png`, fullPage: true });

await page.goto(B + '/product/a4-clipboard', { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: 'Only necessary' }).click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(2000);
await page.locator('button.pm-vbtn[data-value="Single"]').click();
await page.waitForTimeout(800);
await page.locator('[data-add-to-cart]:visible').first().click();
await page.waitForTimeout(3000);
await page.goto(B + '/checkout', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#pm-co-email');
await page.waitForTimeout(1500);
await page.fill('#pm-co-email', email);
await page.fill('#pm-co-mobile', '9876543210');
await page.locator('[data-step="contact"] button[type="submit"]').click();
await page.waitForSelector('#pm-co-pin', { state: 'visible' });
await page.fill('#pm-co-pin', '110001');
await page.waitForTimeout(2500);
await page.fill('#pm-co-name', 'E2E Guest');
await page.fill('#pm-co-line', '1 Janpath Road');
if (!(await page.inputValue('#pm-co-city'))) await page.fill('#pm-co-city', 'New Delhi');
if (!(await page.inputValue('#pm-co-state'))) await page.fill('#pm-co-state', 'Delhi');
await shot(`${mode}-address`);
await page.locator('[data-step="address"] button[type="submit"]').click();
await page.waitForTimeout(3000);
await shot(`${mode}-delivery`);
const radios = page.locator('input[name="shipping-option"]');
console.log('shipping options', await radios.count());
if (await radios.count()) { if (!(await radios.first().isChecked())) await radios.first().check(); await page.waitForTimeout(1500); }
await page.locator('[data-checkout-continue="delivery"]').click();
await page.waitForTimeout(1500);
const methods = await page.locator('input[name="payment-method"]').evaluateAll((els) => els.map((e) => e.value));
console.log('payment methods', methods);
out.methods = methods;
const want = mode === 'cod' ? 'cod' : methods.find((m) => m !== 'cod');
await page.locator(`input[name="payment-method"][value="${want}"]`).check();
// Turnstile (always-pass test key) must produce a token before the pay button works.
await page.waitForTimeout(6000);
await shot(`${mode}-payment`);
console.log('pay button', await page.locator('[data-checkout-pay]').innerText(), 'disabled=', await page.locator('[data-checkout-pay]').isDisabled());
await page.locator('[data-checkout-pay]').click();
if (mode === 'cod') {
  await page.waitForURL(/order-confirmation/, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  out.finalUrl = page.url();
  out.confirmationText = (await page.locator('main').innerText().catch(() => '')).slice(0, 600);
  await shot('cod-confirmation');
} else {
  await page.waitForTimeout(8000);
  if (process.env.RZP_DRIVE) { const { drive } = await import('./rzp-drive.mjs'); await drive(page, shot, ctx); await page.waitForURL(/order-confirmation/, { timeout: 45000 }).catch(() => {}); await page.waitForTimeout(3000); out.confirmationText = (await page.locator('main').innerText().catch(() => '')).slice(0, 600); }
  out.finalUrl = page.url();
  out.razorpayFrame = page.frames().map((f) => f.url()).filter((u) => u.includes('razorpay')).slice(0, 3);
  await shot('online-razorpay');
}
out.cart = await page.evaluate(() => localStorage.getItem('sf.cart'));
fs.writeFileSync(`c:/Users/palha/plusmark/.work/e2e/out-${mode}.json`, JSON.stringify(out, null, 2));
console.log('final', out.finalUrl);
console.log(out.confirmationText ?? '');
await browser.close();
