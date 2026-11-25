// Signs in to the Admin_App as a demo user (password and TOTP from .work/demo-users.txt; never printed) and
// screenshots each route. Usage: node .work/e2e/admin-shots.mjs <email> <route> [route...]   Output: .work/e2e/shots/admin-*.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const require = createRequire('c:/Users/palha/plusmark/apps/storefront/package.json');
const { chromium } = require('playwright');
const root = 'c:/Users/palha/plusmark';
const [email, ...routes] = process.argv.slice(2);
const line = fs.readFileSync(`${root}/.work/demo-users.txt`, 'utf8').split(/\r?\n/).find((l) => l.startsWith(email + ' '));
const password = line?.match(/password=(\S+)/)?.[1];
if (!password) { console.log('no password for', email); process.exit(1); }
const totp = () => execFileSync('node', [`${root}/tools/demo-data/totp.mjs`, email]).toString();
fs.mkdirSync(`${root}/.work/e2e/shots`, { recursive: true });
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1360, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
await page.goto('http://localhost:3001/sign-in/', { waitUntil: 'load', timeout: 120000 });
await page.locator('input[type=password]').first().waitFor({ timeout: 120000 });
await page.locator('input[type=email], input[name=email]').first().fill(email);
await page.locator('input[type=password]').first().fill(password);
await page.waitForFunction(() => [...document.querySelectorAll('input[name=cf-turnstile-response]')].some((i) => i.value), null, { timeout: 30000 }).catch(() => {});
await page.locator('button[type=submit]').first().click();
await page.waitForURL(/totp/, { timeout: 60000 });
if (Number(totp().match(/valid for (\d+)/)?.[1] ?? 30) < 6) await page.waitForTimeout(7000);
await page.locator('input[autocomplete=one-time-code], input[inputmode=numeric], input[name=code]').first().fill(totp().slice(0, 6));
await page.locator('button[type=submit]').first().click();
await page.waitForURL((u) => !/sign-in|totp/.test(u.pathname), { timeout: 30000 });
for (const r of routes) {
  errors.length = 0;
  await page.goto(`http://localhost:3001${r}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(5000);
  const name = 'admin' + (r.replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '') || '-home');
  await page.screenshot({ path: `${root}/.work/e2e/shots/${name}.png` });
  console.log(name, errors.length ? 'errors: ' + errors.slice(0, 3).join(' | ') : 'ok');
}
await b.close();
