import { existsSync } from "node:fs";

// Static-first guard: the catalogue and content pages must be pre-rendered at build time.
const required = [
  "index.html",
  "shop.html",
  "search.html",
  "collections.html",
  "faq.html",
  "contact.html",
  "cart.html",
  "checkout.html",
  "shop/white-boards.html",
  "product/metallic-premium-white-board.html",
  "collections/metallic-premium.html"
];

const missing = required.filter((file) => !existsSync(`.next/server/app/${file}`));
if (missing.length) {
  console.error(`static-first: ${missing.length} page(s) were not pre-rendered:\n- ${missing.join("\n- ")}`);
  process.exit(1);
}
console.log(`static-first: ${required.length} catalogue/content pages are pre-rendered.`);
