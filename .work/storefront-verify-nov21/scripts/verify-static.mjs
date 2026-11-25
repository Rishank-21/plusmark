import { existsSync } from "node:fs";

// Static-first guard: the catalogue and content pages must be pre-rendered at build time.
const required = [
  "index.html",
  "shop/index.html",
  "search/index.html",
  "collections/index.html",
  "faq/index.html",
  "contact/index.html",
  "cart/index.html",
  "checkout/index.html",
  "shop/white-boards/index.html",
  "product/metallic-premium-white-board/index.html",
  "collections/metallic-premium/index.html"
];

const missing = required.filter((file) => !existsSync(`out/${file}`));
if (missing.length) {
  console.error(`static-first: ${missing.length} page(s) were not pre-rendered:\n- ${missing.join("\n- ")}`);
  process.exit(1);
}
console.log(`static-first: ${required.length} catalogue/content pages are pre-rendered.`);
