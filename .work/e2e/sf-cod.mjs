import { createRequire } from 'node:module';
import { psql } from './lib.mjs';
const require = createRequire('c:/Users/palha/plusmark/apps/storefront/package.json');
const { chromium } = require('playwright');
const mode = process.argv[2] ?? 'cod'; // cod | explore
const email = process.argv[3] ?? 'guest-cod@example.com';
const B = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => { if (['error'].includes(m.type()) && !/placehold|inline (style|script)/.test(m.text())) console.log('[console]', m.text().slice(0, 500)); });
page.on('response', (r) => { if (r.url().includes('/functions/v1/') || r.url().includes('/rest/v1/rpc/')) console.log('[resp]', r.request().method(), r.url().split('/').slice(-1)[0], r.status()); });
const shot = (n) => page.screenshot({ path: `c:/Users/palha/plusmark/.work/e2e/${n}.png`, fullPage: true });
const ls = async () => console.log('ls', await page.evaluate(() => JSON.stringify(Object.fromEntries([...Object.entries(localStorage), ...Object.entries(sessionStorage)].map(([k, v]) => [k, String(v).slice(0, 160)])))));

await page.goto(B + '/product/a4-clipboard', { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: 'Only necessary' }).click().catch(() => {});
await shot('pdp'); console.log(await page.locator('.pm-buybox').first().evaluate((e) => e.innerText.slice(0, 600)));
await page.waitForTimeout(2000);
await page.locator('button.pm-vbtn[data-value="Single"]').click();
await page.waitForTimeout(800);
await page.locator('[data-add-to-cart]:visible').first().click();
await page.waitForTimeout(3000);
await ls();
await page.goto(B + '/checkout', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await shot('checkout-1');
console.log(await page.locator('input:visible, select:visible, button:visible').evaluateAll((els) => els.map((e) => `${e.tagName}#${e.id}[${e.type ?? ''}] name=${e.name ?? ''} ${(e.value || e.textContent || '').trim().slice(0, 40)}`)));
await browser.close();




