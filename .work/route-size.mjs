import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
const page = process.argv[2] ?? "products/edit";
const root = "apps/admin/out";
const html = fs.readFileSync(path.join(root, page, "index.html"), "utf8");
const urls = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
let tot = 0;
const rows = [];
for (const u of urls) {
  const p = path.join(root, decodeURIComponent(u.split("?")[0]));
  if (!fs.existsSync(p)) continue;
  const s = zlib.gzipSync(fs.readFileSync(p)).length;
  tot += s;
  rows.push([s, u]);
}
rows.sort((a, b) => b[0] - a[0]);
for (const [s, u] of rows.slice(0, 12)) console.log((s / 1024).toFixed(1), u);
console.log("total", (tot / 1024).toFixed(1));
