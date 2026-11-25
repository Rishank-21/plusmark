import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const results = [];
const failures = [];

const consent = () => localStorage.setItem('sf.consent', JSON.stringify({
  id: 'smoke', purposes: { analytics: false, marketing_tags: false }, version: 'v1', at: Date.now(), synced: true,
}));

async function check(page, name, path, opts = {}) {
  const bad = [];
  const errors = [];
  const onResponse = (r) => { if (r.status() >= 400 && !r.url().includes('placehold.co')) bad.push(`${r.status()} ${r.url()}`); };
  const onError = (e) => errors.push(e.message);
  const onConsole = (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(m.text()); };
  page.on('response', onResponse);
  page.on('pageerror', onError);
  page.on('console', onConsole);
  let status = 0;
  try {
    const res = await page.goto(BASE + path, { waitUntil: opts.waitUntil ?? 'networkidle', timeout: 60000 });
    status = res ? res.status() : 0;
    await page.waitForTimeout(opts.wait ?? 800);
    if (opts.action) await opts.action(page);
    const ok = status < 400 && errors.length === 0;
    results.push({ name, path, status, ok, errors: [...new Set(errors)].slice(0, 4), bad: [...new Set(bad)].slice(0, 6) });
    if (!ok) failures.push(name);
  } catch (e) {
    results.push({ name, path, status, ok: false, errors: [String(e).slice(0, 200)], bad });
    failures.push(name);
  } finally {
    page.off('response', onResponse);
    page.off('pageerror', onError);
    page.off('console', onConsole);
  }
}

const browser = await chromium.launch();

// Desktop journey
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(consent);
  const page = await ctx.newPage();

  await check(page, 'home', '/');
  await check(page, 'category white boards', '/shop/white-boards');
  await check(page, 'product detail', '/product/metallic-premium-white-board');
  await check(page, 'search results', '/search?q=whiteboard');
  await check(page, 'cart empty', '/cart');
  await check(page, 'checkout empty', '/checkout');
  await check(page, 'login', '/login', { waitUntil: 'domcontentloaded', wait: 3000 });
  await check(page, 'wishlist', '/wishlist');
  await check(page, 'contact', '/contact');
  await check(page, 'faq', '/faq');
  await check(page, 'track order', '/track-order');

  // Add to cart from PDP, then verify the cart page shows the line.
  const pdp = await ctx.newPage();
  await pdp.goto(BASE + '/product/metallic-premium-white-board', { waitUntil: 'networkidle' });
  const size = pdp.getByRole('button', { name: /3 x 4 ft/i }).first();
  if (await size.count()) await size.click({ timeout: 10000 }).catch(() => {});
  await pdp.waitForTimeout(400);
  const add = pdp.getByRole('button', { name: /^add to cart$/i }).first();
  let addOk = false;
  if (await add.count()) {
    await add.click({ timeout: 10000 }).catch(() => {});
    await pdp.waitForTimeout(1500);
    addOk = true;
  }
  await pdp.goto(BASE + '/cart', { waitUntil: 'networkidle' });
  await pdp.waitForTimeout(2500);
  const cartText = await pdp.locator('body').innerText();
  const hasLine = /Metallic Premium White Board/i.test(cartText) || /1 item|2 items|1 board/i.test(cartText);
  results.push({ name: 'add to cart -> cart line', path: '/product/... -> /cart', status: 200, ok: addOk && hasLine, errors: [], bad: [] });
  if (!(addOk && hasLine)) failures.push('add to cart -> cart line');
  await pdp.close();
  await ctx.close();
}

// Mobile layout + bottom nav + no horizontal scroll
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(consent);
  const page = await ctx.newPage();
  await check(page, 'mobile home', '/');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const navText = await page.locator('nav[aria-label="Quick navigation"]').innerText().catch(() => '');
  const ok = over <= 1 && /cart/i.test(navText) && /account/i.test(navText);
  results.push({ name: 'mobile layout', path: '/', status: 200, ok, errors: over > 1 ? [`horizontal overflow ${over}px`] : [], bad: [] });
  if (!ok) failures.push('mobile layout');
  await ctx.close();
}

await browser.close();

console.log(JSON.stringify({ failures, results }, null, 2));
process.exit(failures.length ? 1 : 0);
