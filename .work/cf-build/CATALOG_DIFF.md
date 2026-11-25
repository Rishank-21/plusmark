# CATALOG_DIFF — retail vs B2B reference

Generated: 2026-11-06. Sources: retail `src/data/catalog.json` + Supabase `public.products` (both 68 products); reference https://plusmarkboards.com (69 products, fetched read-only).

> Backup before changes: `C:/tmp/plusmark-media/catalog-backup-2026-11-06/` (catalog.json, live-faq.json, live-org.json, supabase-catalogue.json with 11 categories / 68 products / 239 variants).

## 1. How the retail catalogue is stored

- **Storefront source of truth:** static `src/data/catalog.json`, read by `src/lib/catalog.ts` (products, variants, media, categories, series). No product/category query hits Supabase at request time.
- **Admin source:** Supabase `public.categories`, `public.products`, `public.product_variants` (migration `20261105140000_plusmark_admin.sql`). Seeded from the JSON by `scripts/seed-catalog.mjs`; currently identical counts (11 / 68 / 239).
- **Schema:** product = slug (unique, `^[a-z0-9]+(-[a-z0-9]+)*$`), name, category_id (FK), series_id, subcategory_ids[], surface/frame/corners, magnetic, double_sided, usage/blurb/description/features, media JSONB, video_id, price_mode, gst_rate_percent, hsn_code, bulk_suggestion_quantity, published, featured. Variant = size_label, sku (unique), price_mode, price_inr, stock, track_inventory, available, lead_time_days.
- **Categories:** 11 rows, id doubles as slug. Subcategories live inside `categories.subcategories` JSONB (and `subcategory_ids` on products).
- **Slugs:** product = B2B slug; category = category id; subcategory = id (e.g. `notice-boards-adc`).
- **Images:** Cloudinary public IDs under `plusmark/products/<slug>[-N]`; `src/lib/local-assets.ts` maps product → IDs, otherwise `catalog.json.images` is used. Videos under `plusmark/videos/*`. All catalogue media lives on the retail cloud **dtdooieec**.

## 2. Retail catalogue (68 products)

`status` is the catalogue's published flag (all 68 are published today). Image column shows the first effective public ID; `+N` = extra photos in the gallery.

| # | Name | Slug | Category | Series | Image public_id | Status |
|---|---|---|---|---|---|---|
| 1 | Metallic Premium White Board | `metallic-premium-white-board` | White Boards | Metallic Premium | `plusmark/products/metallic-premium-white-board` +6 | published |
| 2 | Metallic Premium Chalk Board | `metallic-premium-chalk-board` | Chalk Boards | Metallic Premium | `plusmark/products/metallic-premium-chalk-board` +6 | published |
| 3 | Metallic Premium Magnetic Board | `metallic-premium-magnetic-board` | White Boards | Metallic Premium | `plusmark/products/metallic-premium-magnetic-board` +6 | published |
| 4 | Metallic Premium Magnetic Chalk Board | `metallic-premium-magnetic-chalk-board` | Chalk Boards | Metallic Premium | `plusmark/products/metallic-premium-magnetic-chalk-board` +6 | published |
| 5 | Metallic Premium Ceramic Board | `metallic-premium-ceramic-board` | White Boards | Metallic Premium | `plusmark/products/metallic-premium-ceramic-board` +6 | published |
| 6 | Metallic Premium Ceramic Chalk Board | `metallic-premium-ceramic-chalk-board` | Chalk Boards | Metallic Premium | `plusmark/products/metallic-premium-chalk-board` | published |
| 7 | Metallic Premium Notice Board | `metallic-premium-notice-board` | Notice Boards | Metallic Premium | `plusmark/products/metallic-premium-notice-board` +6 | published |
| 8 | Eco Premium White Board | `eco-premium-white-board` | White Boards | Eco Premium | `plusmark/products/eco-premium-white-board` +6 | published |
| 9 | Eco Premium Chalk Board | `eco-premium-chalk-board` | Chalk Boards | Eco Premium | `plusmark/products/eco-premium-chalk-board` +6 | published |
| 10 | Eco Premium Notice Board | `eco-premium-notice-board` | Notice Boards | Eco Premium | `plusmark/products/eco-premium-notice-board` +6 | published |
| 11 | Eco Premium Double-Sided Board | `eco-premium-both-side-board` | Double-Sided Boards | Eco Premium | `plusmark/products/eco-premium-both-side-board` +6 | published |
| 12 | Eco Regular White Board | `eco-regular-white-board` | White Boards | Eco Regular | `plusmark/products/eco-regular-white-board-correct` | published |
| 13 | Eco Regular Chalk Board | `eco-regular-chalk-board` | Chalk Boards | Eco Regular | `plusmark/products/eco-regular-chalk-board-correct` | published |
| 14 | Eco Regular Magnetic Board | `eco-regular-magnetic-board` | White Boards | Eco Regular | `plusmark/products/eco-regular-magnetic-board-correct` | published |
| 15 | Eco Regular Magnetic Chalk Board | `eco-regular-magnetic-chalk-board` | Chalk Boards | Eco Regular | `plusmark/products/eco-regular-magnetic-chalk-board-correct` | published |
| 16 | Eco Regular Notice Board | `eco-regular-notice-board` | Notice Boards | Eco Regular | `plusmark/products/eco-regular-notice-board-correct` | published |
| 17 | Deluxe Standard White Board | `deluxe-standard-white-board` | White Boards | Deluxe Standard | `plusmark/products/deluxe-standard-white-board` | published |
| 18 | Deluxe Standard Chalk Board | `deluxe-standard-chalk-board` | Chalk Boards | Deluxe Standard | `plusmark/products/deluxe-standard-chalk-board-correct` | published |
| 19 | Deluxe Standard Magnetic Board | `deluxe-standard-magnetic-board` | White Boards | Deluxe Standard | `plusmark/products/deluxe-standard-magnetic-board` | published |
| 20 | Deluxe Standard Magnetic Chalk Board | `deluxe-standard-magnetic-chalk-board` | Chalk Boards | Deluxe Standard | `plusmark/products/deluxe-standard-magnetic-chalk-board` | published |
| 21 | Deluxe Standard Ceramic Board | `deluxe-standard-ceramic-board` | White Boards | Deluxe Standard | `plusmark/products/deluxe-standard-ceramic-board` | published |
| 22 | Deluxe Standard Notice Board | `deluxe-standard-notice-board` | Notice Boards | Deluxe Standard | `plusmark/products/deluxe-standard-notice-board` | published |
| 23 | Deluxe 45 MM ADC Notice Board (Double Door) | `deluxe-45mm-adc-notice-board-double-door` | Notice Boards | Deluxe Standard | `plusmark/products/deluxe-45mm-adc-notice-board-double-door` | published |
| 24 | Eco ADC Notice Board (Single Door) | `eco-adc-notice-board-single-door` | Notice Boards | Eco Regular | `plusmark/products/eco-adc-notice-board-single-door` | published |
| 25 | Laminate MDF Base Clipboard | `laminate-mdf-base-clipboard` | Clipboards | — | `plusmark/products/laminate-mdf-base-clipboard` +2 | published |
| 26 | Graphic MDF Base Clipboard | `graphic-mdf-base-clipboard` | Clipboards | — | `plusmark/products/graphic-mdf-base-clipboard` | published |
| 27 | Pre-Lam MDF Base Clipboard | `pre-lam-mdf-base-clipboard` | Clipboards | — | `plusmark/products/pre-lam-mdf-base-clipboard` +2 | published |
| 28 | Crystal Clear Base Clipboard | `crystal-clear-base-clipboard` | Clipboards | — | `plusmark/products/crystal-clear-base-clipboard` | published |
| 29 | Crystal Colour Base Clipboard | `crystal-colour-base-clipboard` | Clipboards | — | `plusmark/products/crystal-colour-base-clipboard` | published |
| 30 | Heavy Duty Clear Acrylic Clipboard | `heavy-duty-clear-acrylic-clipboard` | Clipboards | — | `plusmark/products/heavy-duty-clear-acrylic-clipboard` | published |
| 31 | Cork Notice Board | `cork-notice-board` | Notice Boards | — | `plusmark/products/cork-notice-board` | published |
| 32 | Fabric Notice Board | `fabric-notice-board` | Notice Boards | — | `plusmark/products/fabric-notice-board` | published |
| 33 | Acrylic Folder Display Board | `acrylic-folder-display-board` | Display Boards | — | `plusmark/products/acrylic-folder-display-board` +2 | published |
| 34 | Dry Wipe Schedule Board | `dry-wipe-schedule-board` | Schedule Boards | — | `plusmark/products/dry-wipe-schedule-board` | published |
| 35 | Four Line & Square Line Practice Board | `four-line-square-line-practice-board` | Specialty Display Boards | — | `plusmark/products/four-line-square-line-practice-board` | published |
| 36 | Grooved Coloured Display Board | `grooved-boards` | Specialty Display Boards | — | `plusmark/products/grooved-boards` | published |
| 37 | Perforated Display Board | `perforated-board` | Specialty Display Boards | — | `plusmark/products/perforated-board` | published |
| 38 | Key Hanger Board | `key-hanger-board` | Specialty Display Boards | — | `plusmark/products/key-hanger-board` | published |
| 39 | Letters and Figures Set | `letters-and-figures-set` | Board & Study Essentials | — | `plusmark/products/letters-and-figures-set` | published |
| 40 | Combination Board | `combination-board` | Notice Boards | — | `plusmark/products/combination-board` | published |
| 41 | Deluxe 45 mm ADC Notice Board (Single Door) | `deluxe-45mm-adc-notice-board-single-door` | Notice Boards | Deluxe Standard | `plusmark/products/deluxe-45mm-adc-notice-board-single-door` | published |
| 42 | Four Leg Board Stand | `four-leg-stand` | Board Stands & Storage | — | `plusmark/products/four-leg-stand` | published |
| 43 | Three Leg Board Stand | `three-leg-stand` | Board Stands & Storage | — | `plusmark/products/three-leg-stand` | published |
| 44 | Zig Zag Board Stand | `zig-zag-stand` | Board Stands & Storage | — | `plusmark/products/zig-zag-stand` | published |
| 45 | Revolving Board Stand | `revolving-stand` | Board Stands & Storage | — | `plusmark/products/revolving-stand` | published |
| 46 | Telescopic Board Stand | `telescopic-stand` | Board Stands & Storage | — | `plusmark/products/telescopic-stand` | published |
| 47 | File Rack | `file-rack` | Board Stands & Storage | — | `plusmark/products/file-rack` | published |
| 48 | Magazine Stand | `magazine-stand` | Board Stands & Storage | — | `plusmark/products/magazine-stand` | published |
| 49 | Newspaper Stand | `newspaper-stand` | Board Stands & Storage | — | `plusmark/products/newspaper-stand` | published |
| 50 | Letter Box | `letter-box` | Board Stands & Storage | — | `plusmark/products/letter-box` | published |
| 51 | First Aid Box | `first-aid-box` | Board & Study Essentials | — | `plusmark/products/first-aid-box` | published |
| 52 | Student Study Table | `student-study-table` | School Benches | — | `plusmark/products/student-study-table` +12 | published |
| 53 | PDS 500 Classroom Bench | `pds-500` | School Benches | — | `plusmark/products/pds-500` | published |
| 54 | PDS SB-801 School Bench | `pds-sb-801` | School Benches | — | `plusmark/products/pds-sb-801` | published |
| 55 | PDS SB-802 School Bench | `pds-sb-802` | School Benches | — | `plusmark/products/pds-sb-802` | published |
| 56 | PDS SB-803 School Bench | `pds-sb-803` | School Benches | — | `plusmark/products/pds-sb-803` | published |
| 57 | PDS SB-804 School Bench | `pds-sb-804` | School Benches | — | `plusmark/products/pds-sb-804` | published |
| 58 | PDS SB-805 School Bench | `pds-sb-805` | School Benches | — | `plusmark/products/pds-sb-805` | published |
| 59 | PDS SB-806 School Bench | `pds-sb-806` | School Benches | — | `plusmark/products/pds-sb-806` | published |
| 60 | PDS SB-807 School Bench | `pds-sb-807` | School Benches | — | `plusmark/products/pds-sb-807` | published |
| 61 | PDS SB-808 School Bench | `pds-sb-808` | School Benches | — | `plusmark/products/pds-sb-808` | published |
| 62 | PDS SB-809 School Bench | `pds-sb-809` | School Benches | — | `plusmark/products/pds-sb-809` | published |
| 63 | PDS SB-810 School Bench | `pds-sb-810` | School Benches | — | `plusmark/products/pds-sb-810` | published |
| 64 | PDS SB-811 School Bench | `pds-sb-811` | School Benches | — | `plusmark/products/pds-sb-811` | published |
| 65 | PDS SB-812 School Bench | `pds-sb-812` | School Benches | — | `plusmark/products/pds-sb-812` | published |
| 66 | PDS SB-813 School Bench | `pds-sb-813` | School Benches | — | `plusmark/products/pds-sb-813` | published |
| 67 | PDS SB-814 School Bench | `pds-sb-814` | School Benches | — | `plusmark/products/pds-sb-814` | published |
| 68 | PDS SB-815 School Bench | `pds-sb-815` | School Benches | — | `plusmark/products/pds-sb-815` | published |

## 3. Diff vs B2B reference

- Reference products: **69**. Retail: **68**. Delta: **1**.
- B2B “~69” count in the brief is confirmed exactly: 9 white + 9 chalk + 1 double-sided + 7 notice + 3 ADC + 1 specialty + 3 study + 3 display + 11 stands + 6 clipboards + 15 benches + 1 schedule = 69.

### 3a. MISSING (on B2B, not retail)

| B2B product | Slug | B2B category | B2B sizes | B2B spec (verbatim) | Photo |
|---|---|---|---|---|---|
| Deluxe Standard Ceramic Chalk Board | `deluxe-standard-ceramic-chalk-board` | Chalk Boards | 3 × 4 ft 4 × 4 ft 5 × 4 ft 6 × 4 ft 8 × 4 ft | Type: Ceramic Steel Magnetic Chalk Board; Surface: Ceramic steel green chalk surface; accepts magnets; Product Life: Designed for very long product life under regular institutional use; Design: Aluminium frame with Electroplated Chrome Corners | **none of its own** — B2B page reuses `plusmark/products/deluxe-standard-chalk-board` (og:image). Retail cloud has no distinct photo. |

### 3b. EXTRA (on retail, not B2B)

None. All 68 retail slugs exist on the B2B site.

### 3c. Name mismatches (display name only — slugs stay)

| Slug | Retail name | B2B canonical name | Decision |
|---|---|---|---|
| `eco-premium-both-side-board` | Eco Premium Double-Sided Board | Eco Premium Both Side Board | Keep retail display name “Eco Premium Double-Sided Board” (spec: customer-friendly “Double-Sided”). |
| `laminate-mdf-base-clipboard` | Laminate MDF Base Clipboard | Laminate MDF Base Clipboard (Wood Finish) | Adopt B2B “(Wood Finish)” suffix. |
| `pre-lam-mdf-base-clipboard` | Pre-Lam MDF Base Clipboard | Pre-Lam MDF Base Clipboard (Wood Finish) | Adopt B2B “(Wood Finish)” suffix. |
| `grooved-boards` | Grooved Coloured Display Board | Grooved Boards | Adopt B2B “Grooved Boards”. |
| `perforated-board` | Perforated Display Board | Perforated Board | Adopt B2B “Perforated Board”. |
| `four-leg-stand` | Four Leg Board Stand | Four Leg Stand | Adopt B2B “Four Leg Stand”. |
| `three-leg-stand` | Three Leg Board Stand | Three Leg Stand | Adopt B2B “Three Leg Stand”. |
| `zig-zag-stand` | Zig Zag Board Stand | Zig Zag Stand | Adopt B2B “Zig Zag Stand”. |
| `revolving-stand` | Revolving Board Stand | Revolving Stand | Adopt B2B “Revolving Stand”. |
| `telescopic-stand` | Telescopic Board Stand | Telescopic Stand | Adopt B2B “Telescopic Stand”. |
| `student-study-table` | Student Study Table | Homework Table | Adopt B2B “Homework Table” (slug remains `student-study-table`). |
| `pds-500` | PDS 500 Classroom Bench | PDS-500 | Adopt B2B “PDS-500”; move to Board Stands & Storage. |
| `pds-sb-801` | PDS SB-801 School Bench | School Bench PDS-SB 801 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-802` | PDS SB-802 School Bench | School Bench PDS-SB 802 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-803` | PDS SB-803 School Bench | School Bench PDS-SB 803 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-804` | PDS SB-804 School Bench | School Bench PDS-SB 804 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-805` | PDS SB-805 School Bench | School Bench PDS-SB 805 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-806` | PDS SB-806 School Bench | School Bench PDS-SB 806 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-807` | PDS SB-807 School Bench | School Bench PDS-SB 807 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-808` | PDS SB-808 School Bench | School Bench PDS-SB 808 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-809` | PDS SB-809 School Bench | School Bench PDS-SB 809 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-810` | PDS SB-810 School Bench | School Bench PDS-SB 810 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-811` | PDS SB-811 School Bench | School Bench PDS-SB 811 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-812` | PDS SB-812 School Bench | School Bench PDS-SB 812 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-813` | PDS SB-813 School Bench | School Bench PDS-SB 813 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-814` | PDS SB-814 School Bench | School Bench PDS-SB 814 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |
| `pds-sb-815` | PDS SB-815 School Bench | School Bench PDS-SB 815 | Adopt B2B order “School Bench PDS-SB 801…” (no duplicate “School Bench”). |

Additional formatting fix not caught by the normalizer: `deluxe-45mm-adc-notice-board-double-door` is displayed as “Deluxe **45 MM** ADC…” in retail (B2B also uses MM). Spec requires lowercase units → “45 mm”. Same for both ADC door variants.

### 3d. Category mismatches

| Slug | Retail category | B2B category | Retail subcategory | B2B subcategory |
|---|---|---|---|---|
| `deluxe-45mm-adc-notice-board-double-door` | Notice Boards | acrylic-door-cover-notice-boards | notice-boards-adc | — |
| `eco-adc-notice-board-single-door` | Notice Boards | acrylic-door-cover-notice-boards | notice-boards-adc | — |
| `acrylic-folder-display-board` | Display Boards | Specialty Display Boards | — | — |
| `four-line-square-line-practice-board` | Specialty Display Boards | Board & Study Essentials | — | — |
| `grooved-boards` | Specialty Display Boards | Display Boards | — | — |
| `perforated-board` | Specialty Display Boards | Display Boards | — | — |
| `key-hanger-board` | Specialty Display Boards | Board & Study Essentials | — | — |
| `letters-and-figures-set` | Board & Study Essentials | Display Boards | — | — |
| `deluxe-45mm-adc-notice-board-single-door` | Notice Boards | acrylic-door-cover-notice-boards | notice-boards-adc | — |
| `first-aid-box` | Board & Study Essentials | Board Stands & Storage | — | — |
| `student-study-table` | School Benches | Board & Study Essentials | — | — |
| `pds-500` | School Benches | Board Stands & Storage | — | — |

Structural gaps:
- Retail has **11 categories**; canonical list has **12**. `acrylic-door-cover-notice-boards` is missing as a top-level category (the 3 ADC products sit in Notice Boards with subcategory `notice-boards-adc`).
- `specialty-boards` is currently a mixed bucket (practice, grooved, perforated, key hanger) — only `acrylic-folder-display-board` belongs there.
- Category images follow the products out: `specialty-boards` uses `grooved-boards`, `display-boards` uses `acrylic-folder-display-board`, `board-study-essentials` uses `letters-and-figures-set`. These need reassignment.
- White/Chalk Non-Magnetic subcategory coverage is incomplete: `metallic-premium-white-board`, `metallic-premium-chalk-board` have no subcategory; `metallic-premium-notice-board` and `deluxe-standard-notice-board` lack the Pin-Up subcategory.

### 3e. Image problems

1. **Shared public ID:** `metallic-premium-ceramic-chalk-board` is mapped to `plusmark/products/metallic-premium-chalk-board` (the same ID as Metallic Premium Chalk Board). **However** the retail Cloudinary account already holds a dedicated 7-photo set `plusmark/products/metallic-premium-ceramic-chalk-board[-2..-7]` (distinct green chalk-board shots). The duplicate is a mapping bug, not missing photography — fix the map instead of drafting the product.
2. **Missing product photo:** the new Deluxe Standard Ceramic Chalk Board has no distinct photo in either account; B2B reuses the Deluxe Standard Chalk Board photo. Add product as **draft/needs_data**, do not reuse.
3. **Identical files under two IDs:** `plusmark/products/deluxe-standard-chalk-board` (412,584 B) and `plusmark/products/deluxe-standard-magnetic-chalk-board` (412,584 B) are byte-identical at w_800 (md5 `73509a0c…`). `deluxe-standard-chalk-board-correct` (335,173 B) is a different file and is the one retail actually shows. Needs a real magnetic-chalk photo → media audit + owner decision.
4. **`-correct` suffix files (6):** eco-regular white/chalk/magnetic/magnetic-chalk/notice, deluxe-standard chalk. Rename to the plain `<slug>` public ID via Cloudinary rename + DB/map update (section 5 of the plan).
5. **Fallback (no local map) products (13):** deluxe-standard magnetic, magnetic-chalk, ceramic; graphic-mdf clipboard; heavy-duty acrylic clipboard; fabric notice; key hanger; letters-and-figures; deluxe ADC single door; zig-zag; revolving; pds-500. They work via `catalog.json.images`, but `mediaFor()` hard-codes 2000×1600; several of those files are 1400×1400. Needs a real dimension map (audit step).
6. **Alt text:** every product image uses `"{Name} — Plusmark {subject}"` (em dash + category subject). Spec rule is `"{Product name} - {Series} {type} by Plusmark"`.
7. **No missing Cloudinary files:** all 68 products' effective IDs exist (0 404s). No image below 800 px.
8. **Lifestyle images:** `plusmark/industries/*` exist in the account but are not attached to PDPs today; leave detached per spec.

### 3f. Cloudinary audit (`dtdooieec`)

- Images under `plusmark/`: **364**. Product photos under `plusmark/products/*`: **247**. Videos: **7**.
- Referenced product photos: 68 products → **145 distinct public IDs**.
- Orphan product images (not referenced by any product/category/A+ panel): **101**. These are mostly extra angles (e.g. `eco-regular-white-board-2..7`, `eco-white-board/1..5`, `metallic-ceramic-chalk-board/1..4`) plus one 1×1 test upload `plusmark/products/gsavia4qvvmffac2shqc`. **Nothing deleted.**
- Videos present (7): eco-premium both-side, chalk, notice, white; metallic-premium chalk, notice, white. All catalog `videoId` references resolve.
- No video exists for “Metallic Premium Both Side Board”; no such product exists → NEEDS_OWNER_DECISION.

#### Orphan list (approval required before deleting)

| public_id | dims | bytes |
|---|---|---|
| `plusmark/products/acrylic-door-cover-notice-board` | 1400×1400 | 37572 |
| `plusmark/products/deluxe-standard-chalk-board` | 2000×1600 | 412584 |
| `plusmark/products/eco-both-side-board/1` | 1600×656 | 82672 |
| `plusmark/products/eco-both-side-board/2` | 1600×656 | 65348 |
| `plusmark/products/eco-both-side-board/3` | 1600×656 | 88020 |
| `plusmark/products/eco-both-side-board/4` | 1600×656 | 107156 |
| `plusmark/products/eco-chalk-board/1` | 1600×656 | 48192 |
| `plusmark/products/eco-chalk-board/2` | 1600×656 | 84782 |
| `plusmark/products/eco-chalk-board/3` | 1600×656 | 87326 |
| `plusmark/products/eco-chalk-board/4` | 1600×656 | 155360 |
| `plusmark/products/eco-magnetic-chalk-board/1` | 1600×656 | 65812 |
| `plusmark/products/eco-magnetic-chalk-board/2` | 1600×656 | 79038 |
| `plusmark/products/eco-magnetic-chalk-board/3` | 1600×656 | 134142 |
| `plusmark/products/eco-magnetic-chalk-board/4` | 1600×656 | 90394 |
| `plusmark/products/eco-magnetic-white-board/1` | 1600×656 | 58284 |
| `plusmark/products/eco-magnetic-white-board/2` | 1600×656 | 102408 |
| `plusmark/products/eco-magnetic-white-board/3` | 1600×656 | 103176 |
| `plusmark/products/eco-magnetic-white-board/4` | 1600×656 | 83390 |
| `plusmark/products/eco-notice-board/1` | 1600×656 | 67952 |
| `plusmark/products/eco-notice-board/2` | 1600×656 | 86200 |
| `plusmark/products/eco-notice-board/3` | 1600×656 | 141426 |
| `plusmark/products/eco-notice-board/4` | 1600×656 | 87648 |
| `plusmark/products/eco-regular-chalk-board` | 2000×1600 | 26824 |
| `plusmark/products/eco-regular-chalk-board-2` | 1400×1400 | 34726 |
| `plusmark/products/eco-regular-chalk-board-3` | 1400×1400 | 49800 |
| `plusmark/products/eco-regular-chalk-board-4` | 1400×1400 | 41654 |
| `plusmark/products/eco-regular-chalk-board-5` | 1400×1400 | 20854 |
| `plusmark/products/eco-regular-chalk-board-6` | 1400×1400 | 12310 |
| `plusmark/products/eco-regular-chalk-board-7` | 1400×1400 | 84248 |
| `plusmark/products/eco-regular-magnetic-board` | 2000×1600 | 33676 |
| `plusmark/products/eco-regular-magnetic-board-2` | 1400×1400 | 30990 |
| `plusmark/products/eco-regular-magnetic-board-3` | 1400×1400 | 42320 |
| `plusmark/products/eco-regular-magnetic-board-4` | 1400×1400 | 129662 |
| `plusmark/products/eco-regular-magnetic-board-5` | 1400×1400 | 24540 |
| `plusmark/products/eco-regular-magnetic-board-6` | 1400×1400 | 10038 |
| `plusmark/products/eco-regular-magnetic-board-7` | 1400×1400 | 145138 |
| `plusmark/products/eco-regular-magnetic-chalk-board` | 2000×1600 | 36126 |
| `plusmark/products/eco-regular-magnetic-chalk-board-2` | 1400×1400 | 32140 |
| `plusmark/products/eco-regular-magnetic-chalk-board-3` | 1400×1400 | 44866 |
| `plusmark/products/eco-regular-magnetic-chalk-board-4` | 1400×1400 | 127876 |
| `plusmark/products/eco-regular-magnetic-chalk-board-5` | 1400×1400 | 24568 |
| `plusmark/products/eco-regular-magnetic-chalk-board-6` | 1400×1400 | 9804 |
| `plusmark/products/eco-regular-magnetic-chalk-board-7` | 1400×1400 | 144594 |
| `plusmark/products/eco-regular-notice-board` | 2000×1600 | 301846 |
| `plusmark/products/eco-regular-notice-board-2` | 1400×1400 | 29840 |
| `plusmark/products/eco-regular-notice-board-3` | 1400×1400 | 43516 |
| `plusmark/products/eco-regular-notice-board-4` | 1400×1400 | 72704 |
| `plusmark/products/eco-regular-notice-board-5` | 1400×1400 | 21036 |
| `plusmark/products/eco-regular-notice-board-6` | 1400×1400 | 15056 |
| `plusmark/products/eco-regular-notice-board-7` | 1400×1400 | 114494 |
| `plusmark/products/eco-regular-white-board` | 2000×1600 | 19476 |
| `plusmark/products/eco-regular-white-board-2` | 1400×1400 | 32476 |
| `plusmark/products/eco-regular-white-board-3` | 1400×1400 | 45740 |
| `plusmark/products/eco-regular-white-board-4` | 1400×1400 | 51746 |
| `plusmark/products/eco-regular-white-board-5` | 1400×1400 | 19732 |
| `plusmark/products/eco-regular-white-board-6` | 1400×1400 | 11414 |
| `plusmark/products/eco-regular-white-board-7` | 1400×1400 | 121298 |
| `plusmark/products/eco-regular-white-board-pack-2` | 1400×1400 | 32158 |
| `plusmark/products/eco-regular-white-board-pack-4` | 1400×1400 | 45046 |
| `plusmark/products/eco-white-board/1` | 1600×656 | 38220 |
| `plusmark/products/eco-white-board/2` | 1600×656 | 69972 |
| `plusmark/products/eco-white-board/3` | 1600×656 | 68022 |
| `plusmark/products/eco-white-board/4` | 1600×656 | 91002 |
| `plusmark/products/eco-white-board/5` | 1600×656 | 27088 |
| `plusmark/products/gsavia4qvvmffac2shqc` | 1×1 | 70 |
| `plusmark/products/metallic-ceramic-chalk-board/1` | 1600×656 | 61830 |
| `plusmark/products/metallic-ceramic-chalk-board/2` | 1600×656 | 109738 |
| `plusmark/products/metallic-ceramic-chalk-board/3` | 1600×656 | 105576 |
| `plusmark/products/metallic-ceramic-chalk-board/4` | 1600×656 | 106588 |
| `plusmark/products/metallic-ceramic-white-board/1` | 1600×656 | 74198 |
| `plusmark/products/metallic-ceramic-white-board/2` | 1600×656 | 95204 |
| `plusmark/products/metallic-ceramic-white-board/3` | 1600×656 | 93576 |
| `plusmark/products/metallic-ceramic-white-board/4` | 1600×656 | 114390 |
| `plusmark/products/metallic-chalk-board/1` | 1600×656 | 42214 |
| `plusmark/products/metallic-chalk-board/2` | 1600×656 | 105866 |
| `plusmark/products/metallic-chalk-board/3` | 1600×656 | 107546 |
| `plusmark/products/metallic-chalk-board/4` | 1600×656 | 87604 |
| `plusmark/products/metallic-magnetic-chalk-board/1` | 1600×656 | 61670 |
| `plusmark/products/metallic-magnetic-chalk-board/2` | 1600×656 | 113386 |
| `plusmark/products/metallic-magnetic-chalk-board/3` | 1600×656 | 75850 |
| `plusmark/products/metallic-magnetic-chalk-board/4` | 1600×656 | 121058 |
| `plusmark/products/metallic-magnetic-white-board/1` | 1600×656 | 60922 |
| `plusmark/products/metallic-magnetic-white-board/2` | 1600×656 | 104894 |
| `plusmark/products/metallic-magnetic-white-board/3` | 1600×656 | 83452 |
| `plusmark/products/metallic-magnetic-white-board/4` | 1600×656 | 96040 |
| `plusmark/products/metallic-notice-board/1` | 1600×656 | 131040 |
| `plusmark/products/metallic-notice-board/2` | 1600×656 | 123096 |
| `plusmark/products/metallic-notice-board/3` | 1600×656 | 164068 |
| `plusmark/products/metallic-notice-board/4` | 1600×656 | 170400 |
| `plusmark/products/metallic-premium-both-side-board` | 1400×1109 | 66390 |
| `plusmark/products/metallic-premium-ceramic-chalk-board-2` | 1400×1400 | 46018 |
| `plusmark/products/metallic-premium-ceramic-chalk-board-3` | 1400×1400 | 58722 |
| `plusmark/products/metallic-premium-ceramic-chalk-board-4` | 1400×1400 | 100146 |
| `plusmark/products/metallic-premium-ceramic-chalk-board-5` | 1400×1400 | 25466 |
| `plusmark/products/metallic-premium-ceramic-chalk-board-6` | 1400×1400 | 36522 |
| `plusmark/products/metallic-premium-ceramic-chalk-board-7` | 1400×1400 | 135318 |
| `plusmark/products/metallic-white-board/1` | 1600×656 | 55546 |
| `plusmark/products/metallic-white-board/2` | 1600×656 | 82094 |
| `plusmark/products/metallic-white-board/3` | 1600×656 | 82992 |
| `plusmark/products/metallic-white-board/4` | 1600×656 | 103584 |
| `plusmark/products/n5r1fqrmhcdv6h2kneph` | 1×1 | 70 |

## 4. Implementation plan

1. **Single catalogue source of truth.** Keep `catalog.json` as the storefront source; extend `scripts/seed-catalog.mjs` (idempotent, `--dry-run`) and add a migration for the new columns so admin and storefront stay identical after each content change.
2. **Categories:** add `acrylic-door-cover-notice-boards`; move 12 products to their B2B category; add `series`, `board_type`, `surface` attributes (derived in metadata, stored in JSON/SQL); fix category images.
3. **Ceramic destination:** keep `/collections/ceramic-boards` as the only “Ceramic Boards” destination in nav/home; keep `/shop/white-boards/white-boards-ceramic` and `/shop/chalk-boards/chalk-boards-ceramic` as narrower subcategories (different product sets), no duplicate URL.
4. **Names/copy:** apply 3c display names (slugs unchanged), normalize units/brand, rebuild descriptions/spec tables from B2B metadata, add the “ADC” expansion in the ADC PDP description.
5. **Missing product:** add `deluxe-standard-ceramic-chalk-board` as draft + `needs_data` (no price/size weight photo), category chalk/ceramic, series deluxe-standard.
6. **Images:** fix ceramic-chalk mapping, draft nothing unnecessarily, rename `-correct` IDs, generate accurate dimensions, add `c_limit` presets, standardize alt text, wire existing videos to matching PDPs.
7. **Bugs:** metadata/canonical/OG/JSON-LD, trust copy, remove invented 10% discount, “From” on multi-size cards, footer admin link, config-driven reviews/announcement, single hero markup/h1, accessible cards, logo sizes, warranty questions.
8. **Verify:** build/lint/typecheck, link/redirect/sitemap, screenshots 375/768/1440, axe, Lighthouse, deliverables.

## 5. Assumptions (no owner input needed)

- B2B names are canonical except where the spec explicitly overrides (“Double-Sided”, “Eco”, “White Board”, “45 mm”).
- “Homework Table” is the B2B name for the existing `student-study-table` slug; it is the same product (B2B meta description says “student study table”).
- PDS-500 is a board stand, not a school bench (B2B breadcrumb: Board Stands & Storage).
- The dedicated ceramic-chalk photo set on dtdooieec is authentic Plusmark photography (same frame/corner system, green chalk surface); using it removes the duplicate without inventing media.
- `/collections/ceramic-boards` stays the single “Ceramic Boards” nav destination; ceramic subcategory pages remain narrower sets.
- No prices, sizes, weights or warranty text will be invented. The missing product stays draft until data is supplied.
