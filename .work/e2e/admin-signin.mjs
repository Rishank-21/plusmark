// Admin browser sign-in as the owner: password from .work/owner-pw.txt, TOTP from .work/e2e/owner-totp.json. Never prints secrets.
// Usage: node .work/e2e/admin-signin.mjs [email] [password-file]   Screenshots: .work/e2e/admin-*.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const require = createRequire('c:/Users/palha/plusmark/apps/storefront/package.json');
const { chromium } = require('playwright');
const root = 'c:/Users/palha/plusmark';
const email = process.argv[2] ?? 'admin@plusmark.local';
const password = process.argv[3] ? process.argv[3] : fs.readFileSync(`${root}/.work/owner-pw.txt`, 'utf8').trim();
const code = () => execFileSync('node', [`${root}/tools/demo-data/totp.mjs`, email]).toString().slice(0, 6);
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1360, height: 900 } });
await page.goto('http://localhost:3001/sign-in', { waitUntil: 'load', timeout: 120000 });
await page.locator('input[type=password]').first().waitFor({ timeout: 120000 });
await page.waitForTimeout(1500);
await page.locator('input[type=email], input[name=email]').first().fill(email);
await page.locator('input[type=password]').first().fill(password);
// the Turnstile test widget (site key 1x00000000000000000000AA) fills a hidden token after a moment
await page.waitForFunction(() => [...document.querySelectorAll('input[name=cf-turnstile-response]')].some((i) => i.value), null, { timeout: 30000 }).catch(() => console.log('no Turnstile token seen; trying anyway'));
await page.locator('button[type=submit]').first().click();
await page.waitForURL(/totp/, { timeout: 60000 }).catch(async () => { await page.screenshot({ path: `${root}/.work/e2e/admin-signin-fail.png` }); console.log('no TOTP step; page text:', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 600)); process.exit(1); });
// wait for a fresh 30-second window so the code does not expire mid-submit
if (Number(execFileSync('node', [`${root}/tools/demo-data/totp.mjs`, email]).toString().match(/valid for (\d+)/)[1]) < 6) await page.waitForTimeout(7000);
await page.locator('input[autocomplete=one-time-code], input[inputmode=numeric], input[name=code]').first().fill(code());
await page.locator('button[type=submit]').first().click();
await page.waitForURL((u) => !/sign-in|totp/.test(u.pathname), { timeout: 30000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${root}/.work/e2e/admin-dashboard.png`, fullPage: false });
console.log('signed in, now at', new URL(page.url()).pathname, '| nav items:', await page.locator('nav a').count());
await b.close();
