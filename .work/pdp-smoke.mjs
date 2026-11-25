import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('c:/Users/palha/plusmark/apps/storefront/package.json');
const { chromium } = require('@playwright/test');
const root = 'c:/Users/palha/plusmark/apps/storefront/dist/client';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const live = JSON.stringify({ server_time: new Date().toISOString(), max_age_seconds: 60, dispatch: null, products: [
  { id: 'p1', available: true, handle: 'tee-1', popularity_band: 25, variants: [
    { id: 'p1-v1', stock_state: 'out_of_stock', price: { amount: 499 }, prior_price: 599, sellable_quantity: 0, allow_backorder: false },
    { id: 'p1-v2', stock_state: 'in_stock', price: { amount: 549 }, prior_price: null, sellable_quantity: 50, allow_backorder: false },
    { id: 'p1-v3', stock_state: 'low_stock', price: { amount: 499 }, prior_price: null, sellable_quantity: 3, allow_backorder: false }] }] });
const srv = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/_live/')) { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(live); }
  let p = join(root, u.pathname);
  if (!extname(p)) p = existsSync(p + '.html') ? p + '.html' : join(p, 'index.html');
  try { const b = await readFile(p); res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' }); res.end(b); } catch { res.writeHead(404); res.end('nf'); }
}).listen(4399);
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 390, height: 800 } });
const errs = [];
pg.on('pageerror', (e) => errs.push(String(e)));
pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await pg.goto('http://localhost:4399/product/tee-1');
await pg.waitForSelector('.pm-vbtn');
await pg.waitForTimeout(800);
console.log('oos buttons', await pg.locator('.pm-vbtn.is-oos').count());
console.log('popularity', await pg.locator('.pm-popularity').count());
await pg.click('.pm-buybox__add');
console.log('missing msg:', (await pg.locator('.pm-buybox__missing').innerText()).trim(), '| focused option:', await pg.evaluate(() => document.activeElement?.closest('[data-pdp-option]') ? document.activeElement.dataset.value : null));
await pg.click('[data-value="Red"]');
await pg.click('[data-value="M"]');
console.log('url', pg.url(), 'sku', (await pg.locator('.pm-buybox__sku').innerText()).trim(), 'stock', (await pg.locator('.pm-stock').innerText()).trim());
await pg.waitForTimeout(300);
console.log('M url', pg.url());
await pg.click('[data-value="S"]'); await pg.waitForTimeout(300);
console.log('after S url', pg.url(), 'add disabled', await pg.locator('.pm-buybox__add').isDisabled(), 'stock', (await pg.locator('.pm-stock').innerText()).trim());
await pg.click('[data-value="Blue"]'); await pg.waitForTimeout(300);
console.log('blue url', pg.url());
console.log('blue/S', await pg.locator('.pm-low-stock').count());
console.log('gallery pos', (await pg.locator('[data-gallery-pos]').innerText()).trim());
await pg.click('[data-gallery-next]'); await pg.waitForTimeout(600);
console.log('gallery pos after next', (await pg.locator('[data-gallery-pos]').innerText()).trim());
console.log('doc h', await pg.evaluate(() => document.documentElement.scrollHeight)); await pg.evaluate(() => window.scrollTo(0, 3000)); await pg.waitForTimeout(400);
console.log('sticky', await pg.locator('.pm-sticky-buy').count());
await pg.click('[data-gallery-open]', { force: true }).catch(() => {});
console.log('details open states', await pg.$$eval('[data-blocks] details', (d) => d.map((x) => x.open)));
await pg.goto('http://localhost:4399/product/tee-1?variant=p1-v2');
await pg.waitForSelector('.pm-vbtn'); await pg.waitForTimeout(500);
console.log('preselected', await pg.$$eval('.pm-vbtn[aria-pressed="true"]', (e) => e.map((x) => x.dataset.value)));
console.log('errors', errs);
await b.close(); srv.close();
