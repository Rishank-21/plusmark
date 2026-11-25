import fs from 'node:fs';
const file = 'src/lib/local-assets.ts';
let s = fs.readFileSync(file, 'utf8');
const start = s.indexOf('const PRODUCT_IMAGE_MAP');
const end = s.indexOf('const CATEGORY_IMAGE_MAP');
if (start < 0 || end < 0) throw new Error('map not found');
let block = s.slice(start, end);
const entries = [...block.matchAll(/"([^"]+)": \[([^\]]*)\]/gs)];
const CLOUD = 'https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,w_120/plusmark/products/';
const check = async (id) => {
  try { const r = await fetch(CLOUD + id, { method: 'HEAD' }); return r.status === 200; } catch { return false; }
};
const pool = async (items, n, fn) => {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
};
const all = entries.flatMap(([, , arr]) => [...arr.matchAll(/"([^"]+)"/g)].map(x => x[1]));
const uniq = [...new Set(all)];
const flags = await pool(uniq, 12, check);
const ok = new Set(uniq.filter((_, i) => flags[i]));
let missing = 0, kept = 0;
for (const [full, key, arr] of entries) {
  const ids = [...arr.matchAll(/"([^"]+)"/g)].map(x => x[1]);
  const alive = ids.filter(id => ok.has(id));
  missing += ids.length - alive.length; kept += alive.length;
  const replacement = `"${key}": [${alive.map(id => `"${id}"`).join(', ')}]`;
  block = block.replace(full, replacement);
}
s = s.slice(0, start) + block + s.slice(end);
fs.writeFileSync(file, s);
console.log(JSON.stringify({ entries: entries.length, unique: uniq.length, kept, missing }));
