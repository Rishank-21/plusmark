# NEEDS_OWNER_DECISION

Every item below is a real conflict or missing fact found while syncing the catalogue. Nothing was guessed: the current storefront text/behaviour is listed as the **safe default already in place**, and the owner only has to pick the right value.

Priority: **P0** = blocks selling · **P1** = customer-visible trust issue · **P2** = housekeeping.

---

## P0 — data the shop cannot invent

### 1. Prices for published products

- **Finding:** the catalogue stores sizes only. Every displayed figure comes from `src/lib/demo-pricing.ts` (`demoUnitPriceInr`), and the UI labels it “Demo price — not a Plusmark quotation”.
- **Affected:** 47 published, non-enquiry products (all sizes); the other 21 published products are intentionally enquiry-only.
- **Safe default in place:** demo prices + demo badge; no price is presented as a Plusmark quotation.
- **Decision needed:** real price list per size (or “price on request” per product). Format for import: `product_slug,size_label,price_inr`.

### 2. HSN code and GST rate

- **Finding:** `hsnCode` is empty for all 68 products; cart/checkout totals use a fixed 12% GST rate.
- **Safe default in place:** “GST invoice” claims appear only where the reference supports them; HSN text is omitted when the code is absent.
- **Decision needed:** HSN per product and confirmation that 12% is correct for every range.

### 3. Missing photography

| Product | Issue | Safe default |
|---|---|---|
| `deluxe-standard-ceramic-chalk-board` | No distinct photo in either Cloudinary account; the B2B page reuses the Deluxe Standard Chalk Board photo. | Product exists in the catalogue but is unpublished (`needsData`) — absent from shop, sitemap and search. |
| `deluxe-standard-magnetic-chalk-board` | Its photo is byte-identical to `deluxe-standard-chalk-board` (412,584 B, hash group in `media-audit.json`). | Photo kept, product published, but the image is not visually distinct. |
| `eco-premium-both-side-board` (photos 2, 3, 7) | Byte-identical to the same-numbered Eco Premium White Board photos. | Kept as-is; needs real double-sided shots. |
| `metallic-premium-magnetic-chalk-board` | Its photo is byte-identical to `metallic-premium-chalk-board`. | Kept as-is; needs a magnetic-chalk photo. |

- **Decision needed:** upload distinct photos, or tell us to mark the product as needing photos and hide it.

### 4. Missing videos

`media-audit.json` lists 10 videos in the manifest, only 7 exist in Cloudinary. Absent:

- `plusmark/videos/board-installation`
- `plusmark/videos/retail-board-installation`
- `plusmark/videos/metallic-premium-both-side`

- **Safe default in place:** no player is rendered for a missing video; the “Both Side” video is also not attached to any published product (the only double-sided published product is `eco-premium-both-side-board`).
- **Decision needed:** upload the files, or confirm they should stay unlinked.

### 5. Warranty wording

- **Finding:** the reference FAQ says “Plusmark provides warranty on all products it manufactures… confirm the warranty terms for your order with our authorized distributor”, with no duration or coverage. `policy-data.ts` deliberately asserts no warranty period.
- **Safe default in place:** the invented “Warranty included” PDP chip was removed; FAQ keeps the reference wording; policies say terms are pending.
- **Decision needed:** duration, coverage, exclusions and who honours it — or approval to keep the “confirm with the order desk” wording.

---

## P1 — customer-visible conflicts

### 6. Google review count: 96 vs 95

- **Finding:** `src/lib/reviews.ts` shows `5.0 / 96 reviews`; the reference site’s Google link states **5.0 / 95 reviews**. The eight quoted reviews are verbatim Google reviews.
- **Safe default in place:** count stays at **96** (the value already published in the storefront) and the summary now links to the Google Business Profile so a buyer can verify the live number.
- **Decision needed:** confirm the live count (and rating) or authorise an update.

### 7. Deluxe Standard corners

- **Finding:** the reference spec text says “Aluminium frame with **Electroplated Chrome Corners**”; retail product data/photos show the **one-piece grey corner** used on the Deluxe range.
- **Safe default in place:** PDP shows the retail spec/photos (grey corner), not the reference sentence.
- **Decision needed:** which corner is shipping today?

### 8. Eco Regular minimum size

- **Finding:** the retail size list for Eco Regular starts at **1 × 1 ft**, while the brief also cites **1.5 × 2 ft** as a minimum. Both values were seen; they cannot both be the smallest manufactured size.
- **Safe default in place:** retail size list is unchanged (starts at 1 × 1 ft); no size was added or removed.
- **Decision needed:** confirm the smallest size that can actually be manufactured.

### 9. Catalogue count: 68 vs “~69”

- **Finding:** the brief says “~69 products”, the reference has exactly **69**, the storefront publishes **68**. The 69th is `deluxe-standard-ceramic-chalk-board`, which has no own photo.
- **Safe default in place:** 69 rows exist; 68 are published. The hidden one returns 404 on the storefront and is absent from the sitemap.
- **Decision needed:** supply a photo and approve publishing it (then 69/69 are live).

---

## P2 — media housekeeping

### 10. 65 orphan images in Cloudinary (`dtdooieec`)

- **Finding:** 65 files under `plusmark/` are not referenced by the catalogue, A+ panels or category tiles. Two of them are 70-byte 1×1 files (`gsavia4qvvmffac2shqc`, `n5r1fqrmhcdv6h2kneph`).
- **Safe default in place:** nothing deleted — the audit is read-only and the list is in `media-audit.html` / `media-audit.json`.
- **Decision needed:** approve bulk deletion (with a backup/export first) or keep them.

### 11. `-correct` suffix ids

- **Finding:** six products use `plusmark/products/<slug>-correct` as the canonical image; the unsuffixed original still exists. Renaming would touch 6 products, orders’ image snapshots and the CDN.
- **Safe default in place:** `-correct` stays canonical; originals remain valid aliases; no rename or overwrite performed.
- **Decision needed:** approve a Cloudinary rename + mapping update, or keep the aliases permanently.

### 12. Small legacy files

Two 70-byte 1×1 uploads are clearly placeholders from early testing. They are not referenced by any product.
**Decision needed:** approve deletion (same backup rule as §10).
