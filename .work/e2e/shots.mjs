// Takes screenshots of storefront and admin pages for a visual check.
// Usage: node .work/e2e/shots.mjs <name>=<url> ... (from apps/storefront so playwright resolves)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('./shots/', import.meta.url));
mkdirSync(out, { recursive: true });
const args = process.argv.slice(2);
const browser = await chromium.launch();
for (const a of args) {
  const [name, url, w = '1280'] = a.split('|');
  const page = await browser.newPage({ viewport: { width: Number(w), height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  } catch (e) { errors.push('goto: ' + e.message.slice(0, 120)); }
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}${name}.png`, fullPage: false });
  console.log(name, page.url(), errors.length ? 'errors: ' + errors.slice(0, 4).join(' | ') : 'ok');
  await page.close();
}
await browser.close();
