# CHANGES — catalogue sync, trust and SEO pass

Date: 2026-11-06
Scope: retail storefront (`src/`), static catalogue, media helpers, SEO metadata, documentation.
Reference source: https://plusmarkboards.com (read-only).

No product slug was changed, so no 301 redirects are required (table in §6).
No order, payment, Supabase table or historical record was deleted or rewritten.

---

## 1. Phase 1 — catalogue analysis

- `CATALOG_DIFF.md` written: storage model, 68 published products, diff against the 69-product B2B reference, name/category/image mismatches, and the implementation plan.
- Backups taken before any change: `C:/tmp/plusmark-media/catalog-backup-2026-11-06/` (catalog.json, live-faq.json, live-org.json, supabase catalogue export).

## 2. Phase 2 — canonical categories and attributes

- Category set normalised to the 12 canonical categories (including `acrylic-door-cover-notice-boards`), with subcategories and product membership corrected.
- Admin catalogue screens (`/admin/categories`, `/admin/products`, `/admin/variants`) now read the same canonical shape.
- Product attributes keep only values taken from the reference; unknown values stay `needsData` rather than guessed.

## 3. Phase 3 — naming and copy

- Display names aligned with the B2B canonical names where the brief required it (e.g. “Laminate MDF Base Clipboard (Wood Finish)”, “School Bench PDS-SB 801”, “PDS-500”, “45 mm” instead of “45 MM”).
- Slugs unchanged. Order snapshots untouched.
- Customer-facing copy stripped of unverified B2B/institutional claims; enquiry-only ranges say they are quoted by the order desk.

## 4. Phase 4 — missing product, enquiry-only, drafts, CSV import

- `deluxe-standard-ceramic-chalk-board` added from the reference, marked `needsData` (no distinct photo exists) and hidden from the storefront, sitemap and search until data is supplied.
- Stand and school-bench ranges are enquiry-only: no published price, no add-to-cart, order-desk CTA instead.
- CSV bulk-import template and importer added for the admin catalogue; imports are idempotent and support `--dry-run`.
- Draft/unpublished products are filtered out of `getProduct`, listings, search, shop sitemap entries and homepage rails.

## 5. Phase 5 — media audit and delivery

- `scripts/audit-media.mjs` added (read-only). Writes `media-audit.html` + `media-audit.json`.
  Result: 69 products (68 published), 287 photos, 0 missing referenced images, 0 shared public IDs, 65 CDN orphans, 6 `-correct` aliases, 3 manifest videos absent from Cloudinary.
- `src/lib/local-assets.ts`: five Eco Regular products now use their full 7-photo galleries instead of a single hero.
- Delivery widths (`src/lib/media.ts`): card 320/480/640/800, gallery 640/960/1200, hero 640/960/1280/1600, zoom 800/1200/1600/2000; `f_auto,q_auto,c_limit`.
- `ProductImage` gained a `thumb` preset; gallery rail/video/lightbox thumbnails no longer upscale to 640 px.
- `-correct` ids remain canonical and the unsuffixed originals remain valid aliases. No Cloudinary rename/delete was performed — that needs owner approval.

## 6. Phase 6 — SEO, trust and UX fixes

### SEO (P0)

- New `src/lib/seo.ts`: `absoluteUrl`, `pageMetadata()` (title template, canonical, Open Graph, Twitter, optional noindex), `breadcrumbJsonLd`, `faqJsonLd`.
- Root layout: default OG image/twitter card, `metadataBase`, preview deployments `noindex`, removed the global `canonical: "/"` that was making every page canonical to the homepage.
- Per-page canonical + OG metadata for home, shop, category, subcategory, product, collections, collection detail, contact, FAQ, policies, policy detail, search, track-order, wishlist, cart.
- Product JSON-LD: `url`, conditional `sku`, image array, and `offers` only when a demo price exists and the product is not enquiry-only (`InStock` / `MadeToOrder`). Enquiry-only products emit no price.
- Breadcrumb JSON-LD on category, subcategory and product pages; FAQPage JSON-LD on `/faq`.
- `sitemap.ts`: includes the real `/shop/[category]/[subcategory]` routes, excludes `/wishlist` and `/track-order`; **final sitemap: 119 URLs** (6 static + 68 products + 12 categories + 12 subcategories + 17 collections + 4 policies).
- `robots.ts`: disallows admin, api, account, cart, checkout, order-confirmation, search, wishlist, track-order and all auth screens.
- Auth/account pages no longer append “ — Plusmark” manually (the root title template does it once).
- Subcategory pages previously used the parent category as `basePath`, so pagination and filter links dropped back to the category. Fixed to `/shop/[category]/[subcategory]`.
- Sidebar subcategory links were also built from that `basePath`, producing `/shop/cat/sub/sub` 404s; they now always resolve from the category slug. Verified by a full internal-link crawl (120 paths, 0 broken).

### Trust (P1)

- Removed the invented “10% off” badge and struck-through original price from `PriceRange`; card/quick-view no longer request it.
- `PriceRange` now shows an honest **“From”** prefix when several single-unit sizes are priced, plus “+ GST”, kept on one line so mobile cards do not wrap mid-price.
- Removed invented “Best seller” / “Popular choice” card tags; only the catalogue `featured` flag renders, as “Featured”.
- Removed the public footer “Admin sign in” link.
- Removed the invented “Warranty included” PDP highlight (reference FAQ says warranty terms must be confirmed per order); replaced with “Order a single board”.
- Reviews: added `GOOGLE_REVIEW_URL` and linked the rating summary/count on the homepage and PDP to the Google Business Profile. The 96-review figure is unchanged pending owner confirmation (see `NEEDS_OWNER_DECISION.md`).

### Accessibility / UX (P2)

- Hero: only the incoming desktop slide renders an `<h1>` (outgoing slide is a `<p>`); the mobile and desktop hero sections are responsive alternates, so exactly one `<h1>` is visible at every breakpoint.
- Product cards: overlay link is removed from the tab order (`tabIndex={-1}`, `aria-hidden`), so each card is announced once via its title link.
- Product card add button is “Add to cart” at all widths; accessible name is `Add to cart: <product>, <size>`; long desktop labels no longer truncate.
- Listing pages gained a screen-reader `<h2>Products</h2>` before the grid (fixes heading order on mobile where the filter headings are hidden).
- PDP “At a glance” `<dl>` markup fixed (`dt`/`dd` are now direct children of their wrapper) and the scrollable service rail is keyboard-focusable with a visible focus ring.
- Gallery “+N” button, PDP rating link and “Details” link now have accessible names matching their visible text; the shipping link is permanently underlined and renamed “Shipping details”.
- Low-contrast `graphite-light` small text raised to `graphite` in filter hints, PDP fine print, contact form “(optional)” labels.
- The desktop and mobile header search forms now carry distinct `aria-label`s (two unnamed `search` landmarks were duplicated in the DOM); the hidden mobile hero is no longer a second named region.
- The mobile PDP purchase bar is `inert` while off-screen, so its buttons are no longer focusable inside an `aria-hidden` container.
- Logo `sizes` added so the header/footer PNG is not over-fetched.
- `next/image` logo in header keeps `priority`; all other catalogue media stays lazy.

## 7. Verification actually run

| Check | Command / tool | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | pass, no output |
| ESLint | `npx next lint` | no errors; warnings only, all pre-existing in admin screens (`react-hooks/exhaustive-deps`, one unused `Order` type) |
| Production build | `npx next build` | pass; 68 product pages, 12 category pages, 12 subcategory pages, sitemap + robots generated |
| Accessibility | axe-core 4 (WCAG 2.0/2.1 A+AA + best-practice) on `/`, `/shop`, `/shop/white-boards`, PDP, `/faq`, `/contact`, `/collections` at 1440 and 375 | **0 violations** after fixes |
| Screenshots | Puppeteer, 1440×900 / 768×1024 / 375×812 | `C:/Users/Rishank/.qoder/qa-puppeteer/p6-*.jpg` |
| Hero headings | Puppeteer computed-style check | 1 visible `<h1>` at 1440 and at 375 |
| Metadata | `curl` on `/`, `/faq`, `/shop/white-boards`, `/shop/white-boards/white-boards-magnetic`, PDP | canonical, OG, Product/Breadcrumb/FAQ JSON-LD present; no “10% off”, “Best seller”, “Warranty included” strings |
| Sitemap | `curl /sitemap.xml` | 119 `<loc>` entries, subcategory routes present |
| Robots | `curl /robots.txt` | private routes disallowed, sitemap declared |
| Internal links | Puppeteer crawler over every internal `href` from the main pages | 120 paths checked, 0 broken (404/500) |
| Draft visibility | `curl` on `/sitemap.xml`, `/search`, draft PDP | `deluxe-standard-ceramic-chalk-board` absent from sitemap and search; PDP returns 404 |

Not run: Lighthouse (not installed in the QA harness; axe covers the a11y portion).

## 8. Redirects

No slug changed in this pass.

| Old path | New path | Status |
|---|---|---|
| — | — | None required |

## 9. Assumptions

- `SITE_URL` comes from `NEXT_PUBLIC_SITE_URL`; local `.env.local` still points at `http://localhost:3003`, production defaults to `https://plusmark.vercel.app`.
- Demo prices are generated by `src/lib/demo-pricing.ts` and labelled “Demo price” in the UI. They must be replaced by owner-approved figures before real selling.
- No Cloudinary file was renamed, overwritten or deleted; `-correct` ids are used as canonical ids and originals stay as aliases.
- The B2B site is reference-only; its photography is never copied to a product that lacks its own photo.
- Products marked `needsData` stay unpublished from search/sitemap until the owner supplies data.

## 10. Manual steps left for the owner

1. Supply real prices (or confirm “price on request”) for the 47 published non-enquiry products; see `NEEDS_DATA.csv`.
2. Supply HSN codes and confirm the 12% GST rate used in cart totals.
3. Supply a distinct photo set for `deluxe-standard-ceramic-chalk-board` (currently hid­den from the storefront) and a real photo for `deluxe-standard-magnetic-chalk-board`.
4. Upload the three missing videos or confirm they should stay unlinked.
5. Approve Cloudinary cleanup (65 orphans) and any `-correct` → plain-id rename.
6. Confirm the Google review count (96 in code vs 95 on the reference site) and warranty wording.
7. Set production env vars (`NEXT_PUBLIC_SITE_URL`, Supabase, Cloudinary, Razorpay) in Vercel, then redeploy.
