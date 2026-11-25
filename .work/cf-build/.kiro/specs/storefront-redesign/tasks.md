# Implementation Plan: Storefront Redesign

## Overview

The Storefront and this spec's backend additions are built in dependency order: tooling, backend foundations, the Site_Build pipeline, the page shell, the Storefront_Worker, prices and Persuasion_Components, catalog pages, Cart and checkout, accounts and shopper requests, consent with analytics and Experiments, presets with legal content and Admin_App screens, the cutover, and the release checks. Each task group leaves working, tested code that later groups build on. The backend of spec 1 and the Admin_App of spec 2 must be in place before this plan starts.

Implementation conventions:

- The Storefront lives in `apps/storefront/` as an Astro 6 site with Preact islands, deployed to Cloudflare Workers static assets with the Worker entry `src/worker.ts`.
- SQL is written as PL/pgSQL migrations in `supabase/migrations`, ordered after spec 2's and following spec 1's function conventions. Every new table is an `ext` table with RLS enabled and no policy, and no migration changes a Medusa_Parity_Table.
- New `api.admin_*` functions follow spec 2's conventions: the session and Permission checks, an Audit_Log entry in the same transaction, `p_idempotency_key` on writes, `p_expected_version` on edits and a JSON Schema in `supabase/contracts/admin/`.
- New recurring tasks are pg_cron jobs that use spec 1's job runner and write `ext.job_run` records.
- Persuasion_Components render only from Backend evidence, and their Component_Rationales live in `apps/storefront/src/persuasion/rationale.json`.
- Unit and property tests use Vitest with fast-check (`vitest --run`), database tests use pgTAP (`supabase test db`), Worker tests use `@cloudflare/vitest-pool-workers`, and browser tests use Playwright with axe-core.
- Every suite runs in single-run mode, never in watch mode.

## Tasks

- [x] 1. Set up the Storefront workspace and tooling
  - [x] 1.1 Create the Astro workspace
    - Create `apps/storefront/` with its own `package.json` and lockfile, excluded from the root build, lint and `tsconfig.json`
    - Configure Astro 6 static output with the Cloudflare adapter, Preact, nanostores, `build.format: 'file'`, `trailingSlash: 'never'`, `build.inlineStylesheets: 'never'` and i18n routing for English at the root and Hindi under `/hi/`
    - Write the Wrangler configuration with the assets directory, `html_handling: "auto-trailing-slash"`, the Worker entry `src/worker.ts` and the assets binding
    - Read only the Supabase project URL, the Supabase public key and public Store_Settings at build time
    - _Requirements: 1.1, 1.3, 1.13, 5.2_

  - [x] 1.2 Set up the test tooling
    - Add Vitest with fast-check, `@cloudflare/vitest-pool-workers`, Playwright with axe-core (320, 375, 768, 1,024 and 1,280 px, English and Hindi) and Lighthouse CI to `apps/storefront/`
    - Extend the CI workflow of specs 1 and 2 with the Storefront build and test suites, all in single-run mode
    - _Requirements: 3.1, 3.3, 4.5_

  - [x] 1.3 Add the build checks and lint rules
    - Measure each page type's compressed JavaScript before the first interaction against its budget (60 KB for the home page, PLPs and PDPs, 90 KB for the Cart and 120 KB for checkout), and fail with the page type and the measured value
    - Fail when a page holds an inline script outside the hashed set, or when `hi.json` lacks a key of `en.json`
    - Add lint rules that reject interface text written in components, counts, timers or claims rendered from literal values in Persuasion_Components, and optional inputs that start selected
    - _Requirements: 3.2, 3.3, 5.1, 5.9, 11.21, 11.22_

- [x] 2. Build the backend foundations
  - [x] 2.1 Add the settings, attributes and catalog tables
    - Add the `storefront.*` setting definitions of Data Models with their defaults, ranges and JSON Schemas
    - Reserve the product attribute keys of Data Models, and create `ext.variant_declaration`, `ext.product_pairing` and `ext.handle_history`, with a trigger that records each old handle of a product, category or collection
    - Add `session_id` to `ext.cart_attribution`, the `back_in_stock` and `newsletter_confirm` templates in English and Hindi, spec 2's seeded warning Alert_Rules for the build-minute stop and the due Compliance_Certificate, and the `ext.pii_field` entry for `back_in_stock_request.email`
    - _Requirements: 6.1, 16.4, 20.8, 22.1, 22.2_

  - [x] 2.2 Implement the offered price log and the Prior_Price
    - Create `ext.offered_price_log` and `ext.variant_prior_price`
    - Add the trigger on spec 1's `ext.catalog_variant_price` that closes the open log row and opens a new one when the anonymous calculated amount changes, using `app.price_effective_at` from spec 1's `price_boundary` job as the change time
    - Implement `internal.prior_price`: when the most recent change was a fall at time t, the lowest amount offered in the 30 days before t, and otherwise none
    - _Requirements: 10.8, 10.9_

  - [x] 2.3 Implement countdown ends and popularity bands
    - Create `ext.countdown_end`, and record a Price_List's or Promotion's end the first time it comes within 48 hours
    - Create `ext.product_popularity` and a job that runs every 15 minutes and stores only the band of each product's non-canceled Orders of the last 7 days, from spec 2's facts
    - _Requirements: 11.4, 11.6, 11.7, 22.2, 22.8_

  - [x] 2.4 Implement the Live_Data and path reads
    - Implement `api.store_live_data` as an anonymous GET read that returns, per product, `available` and the current handle, and per variant the price, the Prior_Price in a Price_Reduction, the Stock_State, the Sellable_Quantity only at or below the low-stock threshold, the backorder flag, the popularity band and an allowed countdown's end and later price, together with the server time, the data time and the dispatch settings
    - Implement `api.store_resolve_path`, which returns the published record, the current handle of a renamed record, or nothing
    - _Requirements: 1.9, 1.10, 1.11, 2.1, 10.9, 11.4, 11.6, 20.8_

  - [x] 2.5 Implement the build and offer reads
    - Implement `api.store_catalog_export` in pages of 250 products with attributes, declarations, Key_Highlights, pairings, prices with Prior_Prices and tiers, rating summaries and best-seller ranks without counts
    - Implement `api.store_delivery_rules`, and `api.store_list_offers`, which returns running automatic Promotions and advertised code Promotions with their conditions and end times, and never an unadvertised code
    - _Requirements: 10.7, 10.10, 21.8, 22.2_

  - [x] 2.6 Write the backend security checks
    - Write pgTAP tests that every new table has RLS enabled and no grants to `anon` or `authenticated`, and that the new GET functions are anonymous, read-only and return no raw sales count
    - Run spec 1's Parity_Check in CI with this spec's migrations applied
    - _Requirements: 22.1, 22.2_

  - [ ]* 2.7 Write property test for the Prior_Price
    - **Property 1: Prior_Price reference model**
    - **Validates: Requirements 10.2, 10.3, 10.8, 10.9**

- [x] 3. Build the Site_Build pipeline
  - [x] 3.1 Implement build records and the build trigger
    - Create `ext.site_build` and `ext.storefront_state`, with triggers that set `last_change_at` on Catalog_Change_Events, review moderation and saves of the layout, branding, Component_Switches, Experiments, pairings, Key_Highlights, declarations and legal content
    - Add the job that runs every minute and calls the deploy hook from Vault when a change is newer than the last snapshot, no build runs, the last build started at least one Rebuild_Interval ago and the month's build minutes are below 90% of the allowance, raising the warning Alert at 90%
    - Implement the `storefront-build-report` Edge Function with `api.service_site_build_report`, which records each build and a failed `ext.job_run` row for a failure, and count a build without an end report after 30 minutes as failed with 20 minutes used
    - Implement `api.admin_site_builds_list` and `api.admin_site_build_start`
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 21.8, 22.8_

  - [x] 3.2 Write the build scripts
    - Write `scripts/fetch-catalog.mjs`, `scripts/build-report.mjs` and `scripts/deploy.mjs`, reading data with the public key only
    - Fail the build on more files than the plan limit, a JavaScript budget breach, an inline script outside the hashed set or a legacy URL of a published record without a page or route, and list products that lack required Mandatory_Declarations as warnings
    - Generate `_headers` with the CSP, security headers and cache lifetimes, `_redirects` with the legacy non-catalog paths, and the configuration JSON that On_Demand rendering reads
    - _Requirements: 1.1, 1.2, 1.8, 16.5, 23.1, 23.2_

  - [x] 3.3 Implement image processing
    - Write `scripts/process-images.mjs`, which makes WebP and JPEG variants 320, 480, 720, 1080 and 1440 px wide with `sharp` for new and changed images and uploads them to the R2 bucket `storefront-media` under content-hash paths
    - Stop image work after 8 minutes with a warning, and delete the variants of removed images 30 days later
    - _Requirements: 3.4_

  - [x] 3.4 Generate the PIN code shards
    - Add the All India Pincode Directory with its licence note to `data/pincodes/`, split it into JSON shards by the first two digits at build, and add a refresh script
    - _Requirements: 13.4_

  - [ ]* 3.5 Write property test for the build trigger
    - **Property 18: Build trigger**
    - **Validates: Requirements 1.4, 1.5, 1.7**

  - [ ]* 3.6 Write property test for failed builds
    - **Property 19: Failed builds keep the site**
    - **Validates: Requirements 1.8**

- [x] 4. Build the page shell, languages and shared modules
  - [x] 4.1 Implement layouts, tokens and primitives
    - Implement the phone, tablet and desktop layouts, Client_Branding colours as CSS variables, body text of at least 16 px, system fonts with an optional subset heading font, and 44 × 44 px touch targets
    - Implement the sheet, dialog, disclosure, tabs and live region primitives, fields whose labels stay visible and whose errors show when the shopper leaves the field, and `inputmode` and `autocomplete` values
    - Apply the design's WCAG 2.2 details, carousels that move only on a swipe or tap, and the reduced-motion behavior
    - _Requirements: 3.9, 4.1, 4.4, 4.5, 4.7, 4.8, 4.9, 4.10, 6.10_

  - [x] 4.2 Implement the header, bottom navigation and footer
    - Build the header with the logo, search, Cart count and account entry, and the bottom navigation that hides while a bottom action bar shows
    - Load the Cart count and signed-in state after the first render, and update the count in every tab through a `BroadcastChannel` and the `storage` event
    - Build the footer with the links of Req 7.9, the language switch, the PIN code data credit and the seller summary
    - _Requirements: 2.8, 2.9, 4.2, 4.3, 7.1, 7.9_

  - [x] 4.3 Implement the `<head>` script and the security headers
    - Write the fixed inline `<head>` script that reads the Consent_Choice and session ID, assigns Experiments and starts the Save-Data observer, and put island data in `application/json` blocks
    - Compute the SHA-256 hashes of the fixed inline scripts at build, and write the design's CSP, HSTS, `nosniff`, referrer and permissions headers into `_headers`
    - _Requirements: 3.8, 19.5, 21.1, 21.2_

  - [x] 4.4 Implement English and Hindi
    - Create `src/i18n/en.json` and `hi.json`, build every page at its path and under `/hi/` with `hreflang` links, and mark store content with its language
    - Implement the language switch that keeps the query string, the stored choice on the device and in the Customer's metadata, and the one-time Hindi prompt
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 4.5 Implement the formatting module
    - Implement `src/lib/format.ts` with Latin digits and lakh and crore grouping, INR with paise only when present, and dates with the weekday, day and short month in the Store_Timezone, adding the year outside the current year
    - _Requirements: 5.7, 5.8_

  - [x] 4.6 Implement the sanitizer
    - Implement `src/lib/sanitize.ts` with the design's allowlist and `rel="nofollow noopener"` on links, for use by the build and the Worker, and render reviews and Enquiry text as plain text
    - _Requirements: 21.3_

  - [x] 4.7 Implement the Store_API client
    - Implement GET catalog reads and POST writes with the public key and the session, the error-envelope mapping with the request ID, and `rate_limited` handling that shows the time from `Retry-After` and keeps the input
    - Send no price, discount, tax or total other than spec 1's expected total
    - _Requirements: 21.5, 21.6_

  - [ ]* 4.8 Write property test for display formats
    - **Property 13: Display formats**
    - **Validates: Requirements 5.7, 5.8**

  - [ ]* 4.9 Write property test for language paths
    - **Property 14: Language paths**
    - **Validates: Requirements 5.2, 5.3, 20.6**

  - [ ]* 4.10 Write property test for CSP hashes
    - **Property 21: CSP hashes**
    - **Validates: Requirements 21.1**

  - [ ]* 4.11 Write property test for the sanitizer
    - **Property 22: Sanitizer**
    - **Validates: Requirements 21.3**

- [x] 5. Implement the Storefront_Worker and Live_Data
  - [x] 5.1 Implement Worker routing and headers
    - Accept only GET and HEAD, with 405 for other methods, serve the routes of the design's table, and answer every other path, including outside requests for `/_ondemand/`, with the static not-found page and 404
    - Allow outgoing requests only to the Supabase project URL, and add the security headers to every Worker response
    - _Requirements: 1.10, 21.7_

  - [x] 5.2 Implement Live_Data serving
    - Serve `/_live/v1/products` for up to 60 products from the Cache API, keyed by the catalog version, the Region and the sorted IDs, refreshing the version at most every 10 seconds and keeping answers for the Live_Data_Max_Age
    - Never answer from the cache or store in it a request with an `Authorization` header, and skip the cache on `*.workers.dev` hosts
    - _Requirements: 2.1, 2.3, 2.7_

  - [x] 5.3 Implement the Live_Island client
    - Send one Live_Data request per page after the first render, keep each Live_Island's built box, and read signed-in prices from spec 1's `api.store_price_for_customer`
    - Apply the stale rule after 8 seconds or past the Live_Data_Max_Age, fall back to `api.store_live_data` on Supabase when the Worker fails, disable add-to-cart for an unavailable product, and replace the URL when Live_Data reports a new handle
    - _Requirements: 1.11, 1.12, 2.1, 2.2, 2.4, 2.7, 20.8_

  - [ ]* 5.4 Write property test for Live_Data cache keys
    - **Property 16: Live_Data cache keys**
    - **Validates: Requirements 2.3, 2.7**

- [x] 6. Implement prices, delivery dates and the Persuasion_Components
  - [x] 6.1 Implement the price block
    - Implement `src/lib/price-display.ts` with "incl. of all taxes", the struck-through Prior_Price and the rounded-down saving only in a Price_Reduction, the MRP line never struck through, the unit sale price, tier savings, and "Your price" for Customer_Group prices
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 6.2 Implement delivery dates and countdowns
    - Implement `src/lib/delivery.ts` with the dispatch day, the Delivery_Estimate in working days and the Dispatch_Countdown, using the server time and dispatch settings from Live_Data
    - Implement the Sale_Countdown with the later price at zero, ticking only while visible, with a silent live region and a static end time for screen readers
    - _Requirements: 9.10, 11.6, 11.7, 11.8, 11.9_

  - [x] 6.3 Implement the social proof and trust components
    - Implement the Review_Summary, Review_Highlights, Popularity_Notice, Low_Stock_Notice and Trust_Strip, each rendering only from complete current evidence and hiding under the stale rule
    - _Requirements: 2.4, 11.2, 11.3, 11.4, 11.5, 11.12, 11.21_

  - [x] 6.4 Implement the basket and journey components
    - Implement the Free_Delivery_Progress, Savings_Summary, Goes_Well_With, Bundle_Offer, Recently_Viewed, First_Order_Offer, Checkout_Progress, Sticky_Buy_Bar and Delivery_Promise
    - Add items to the Cart only through their own add controls, and show the First_Order_Offer at most once per browser session and not for 30 days after a close
    - _Requirements: 9.7, 11.9, 11.10, 11.11, 11.13, 11.14, 11.15, 11.19, 11.20, 11.24_

  - [x] 6.5 Implement badges and the honesty rules
    - Implement the badge rules with at most 2 badges in the Business_Preset's priority order
    - Make every decline, close and skip control match its accept control in size and contrast, and show each interrupting element at most once per browser session without blocking the page
    - _Requirements: 8.3, 11.22, 11.23, 11.24_

  - [x] 6.6 Write the Component_Rationales and switches
    - Write `src/persuasion/rationale.json` with each component's principle, evidence, conditions, expected effect, metric and Dark_Pattern guard in English and Hindi, from the design's table
    - Read each Component_Switch from the build data, and show a component while its switch is on or an Experiment assigns it
    - _Requirements: 11.1, 11.25_

  - [ ]* 6.7 Write property test for the price block
    - **Property 2: Honest price block**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

  - [ ]* 6.8 Write property test for unit and tier prices
    - **Property 3: Unit and tier prices**
    - **Validates: Requirements 10.5, 10.6**

  - [ ]* 6.9 Write property test for popularity and stock notices
    - **Property 4: Popularity and stock notices**
    - **Validates: Requirements 11.4, 11.5, 22.2**

  - [ ]* 6.10 Write property test for countdowns
    - **Property 5: Countdowns never restart**
    - **Validates: Requirements 11.6, 11.7**

  - [ ]* 6.11 Write property test for delivery dates
    - **Property 6: Delivery dates**
    - **Validates: Requirements 9.10, 11.8, 11.9**

  - [ ]* 6.12 Write property test for free delivery and savings
    - **Property 7: Free delivery and savings**
    - **Validates: Requirements 11.10, 11.11**

  - [ ]* 6.13 Write property test for review components
    - **Property 8: Review components**
    - **Validates: Requirements 11.2, 11.3, 20.4**

  - [ ]* 6.14 Write property test for evidence-only rendering
    - **Property 9: No evidence, no claim**
    - **Validates: Requirements 2.4, 11.21**

  - [ ]* 6.15 Write property test for pre-selection
    - **Property 10: Nothing pre-selected**
    - **Validates: Requirements 11.22, 11.23, 13.16, 17.1**

  - [ ]* 6.16 Write property test for interruptions
    - **Property 11: Interruptions once per session**
    - **Validates: Requirements 5.5, 11.19, 11.24**

  - [ ]* 6.17 Write property test for badges
    - **Property 12: Badges**
    - **Validates: Requirements 8.3**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build the catalog pages
  - [x] 8.1 Implement image markup
    - Write `<picture>` elements with WebP and JPEG `srcset` lists, `sizes` per slot, `width` and `height`, high fetch priority for the largest first-viewport image, lazy loading for the rest, and the `data-sd` 1× candidates for Save-Data
    - _Requirements: 3.4, 3.5, 3.6, 3.8_

  - [x] 8.2 Build the home page and Sections
    - Implement the ten Section types, product rails resolved at build from their sources and left out below 2 products, Recently_Viewed for returning shoppers, and an offer banner only while a Promotion runs
    - _Requirements: 6.4, 6.5, 11.15_

  - [x] 8.3 Build the PLP
    - Build the grid of Product_Cards with swatches, the filter sheet with the matching count below 768 px and the filter column from 1,024 px, filter chips, the sort orders with the Ranking_Disclosure link, load-more by 24 with the count and URL state, the no-match message and the description below the grid
    - Query spec 1's `store_list_products` with GET for filters, sorting and load-more, and restore the products, filters and scroll position on back navigation
    - _Requirements: 4.11, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11_

  - [x] 8.4 Build the PDP
    - Build the PDP in the design's order with the gallery, variant buttons and swatches with out-of-stock marking and `?variant=`, the add-to-cart confirmation, the missing-option message, the Sticky_Buy_Bar, Key_Highlights, collapsible blocks on phones, the postal code check with the remembered code, the share control, offers with their conditions and the reviews list
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 10.10_

  - [x] 8.5 Implement the PDP_Blocks of the Business_Presets
    - Implement each preset's PDP_Blocks, rendered only with data and in the stored order, including the comparison block from comparison pairings
    - Show price-on-request products with the Quotation and Enquiry controls, and give single-variant grocery Product_Cards an add control with a stepper and signed-in Customers a "Buy again" rail
    - _Requirements: 6.6, 6.7, 6.8, 6.9_

  - [x] 8.6 Build navigation and search
    - Build the category menu, the search field with its submit button, suggestions after 2 characters and a 250 ms pause with highlighted matches, the results PLP, the no-results page, the last 5 searches and breadcrumbs
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 8.7 Implement search engine data
    - Implement `src/lib/seo.ts` with unique titles, descriptions, canonical URLs and the `noindex` rules, the design's JSON-LD, sitemaps with `lastmod` and alternates, `robots.txt`, social cards and the not-found page with search and categories
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.9_

  - [x] 8.8 Implement On_Demand_Pages
    - Rewrite catalog paths without a Static_Page to internal `/_ondemand/` routes that use the same components, call `api.store_resolve_path`, answer old handles with a 301 to the current handle and missing records with 404, and cache rendered pages by catalog version
    - Add a CI check that renders the largest product page in the Workers runtime within 6 ms of CPU time
    - _Requirements: 1.9, 1.10, 20.8_

  - [ ]* 8.9 Write property test for PLP URL state
    - **Property 15: PLP URL state**
    - **Validates: Requirements 4.11, 8.8**

  - [ ]* 8.10 Write property test for Worker routing
    - **Property 17: Worker routing**
    - **Validates: Requirements 1.9, 1.10, 20.8, 21.7**

  - [ ]* 8.11 Write property test for static output
    - **Property 20: Static output**
    - **Validates: Requirements 1.1, 1.13, 5.2**

  - [ ]* 8.12 Write property test for structured data
    - **Property 35: Structured data matches the page**
    - **Validates: Requirements 20.3**

  - [ ]* 8.13 Write property test for rails and PDP_Blocks
    - **Property 40: Rails and PDP_Blocks**
    - **Validates: Requirements 6.5, 6.6**

- [x] 9. Implement the Cart and checkout
  - [x] 9.1 Add the backend Cart functions
    - Add the minimum order quantity check to spec 1's Cart adds and updates, rejecting a quantity below the minimum with `below_min_order_qty` and the minimum
    - Implement `api.store_cart_delivery_preview`, `api.store_cart_set_business_details` (checked with spec 2's `internal.is_valid_gstin` and copied to the Order at placement), `api.store_cart_set_session` and `api.store_cart_set_marketing_consent` (recorded in `ext.marketing_consent` at placement)
    - Add the Turnstile check for Guest_Carts to spec 1's `payment-initiate`
    - _Requirements: 13.7, 13.14, 13.16, 18.1, 21.4, 22.3_

  - [x] 9.2 Build the Cart
    - Keep the Cart in a nanostore with the guest Cart_Token and line snapshots on the device, transfer it at sign-in through spec 1's `api.store_cart_transfer`, and build the Cart sheet and the `/cart` page
    - Send quantity changes 400 ms after the last tap, offer undo for 10 seconds after a removal, mark changed lines, keep checkout disabled while an unavailable line remains, and show the totals with the delivery preview, the promotion code field, the move to the Wishlist and the empty Cart
    - _Requirements: 2.5, 2.6, 10.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

  - [x] 9.3 Build the checkout steps
    - Build the one-page checkout with guest checkout by default, the contact step, the address step with the PIN code autofill, serviceability and the optional GSTIN with the business name, the delivery options with dates, and saved addresses for signed-in Customers
    - List UPI, cards, net banking and wallets, then Cash_On_Delivery with its fee, show the exact total on the pay bar, and show unselected marketing checkboxes
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.8, 13.9, 13.10, 13.15, 13.16_

  - [x] 9.4 Implement placement and payment
    - Create one Idempotency_Key per confirmed placement, reuse it for every retry and send the shown total as spec 1's expected total
    - Place Cash_On_Delivery Orders through `api.store_complete_cart` or the gateway, and online payments through `payment-initiate`, Razorpay Checkout with UPI first and `payment-confirm`, loading the Razorpay and Turnstile scripts only at this step
    - Handle `totals_changed`, failed payments and closed payment windows without losing the shopper's details
    - _Requirements: 3.7, 13.10, 13.11, 13.12, 13.13, 13.14, 21.5_

  - [x] 9.5 Implement the input checks
    - Implement the mobile number, postal code and GSTIN checks, with the GSTIN check following spec 2's `internal.is_valid_gstin`
    - _Requirements: 13.6, 13.7_

  - [ ]* 9.6 Write property test for input checks
    - **Property 23: Input checks**
    - **Validates: Requirements 13.6, 13.7**

  - [ ]* 9.7 Write property test for the PIN code lookup
    - **Property 24: PIN code lookup**
    - **Validates: Requirements 13.4**

  - [ ]* 9.8 Write property test for charges before payment
    - **Property 25: Charges known before payment**
    - **Validates: Requirements 10.7, 12.3, 13.10**

  - [ ]* 9.9 Write property test for placement requests
    - **Property 26: Placement requests**
    - **Validates: Requirements 13.13, 21.5**

- [x] 10. Implement accounts, orders and shopper requests
  - [x] 10.1 Add the backend account and request functions
    - Implement `api.store_get_tax_invoice`, `api.store_list_my_reviews`, `api.store_list_my_quotations` and `api.store_buy_again`, and add allowed actions to the Customer's order reads, adding an order list and an order read where spec 1 lacks them
    - Add the `back_in_stock` and `newsletter_signup` gateway actions with their service functions, create `ext.back_in_stock_request`, and add the sender job (every 5 minutes) and the 90-day cleanup job
    - Add a confirm action to spec 1's `unsubscribe` Edge Function for newsletter double opt-in
    - _Requirements: 11.16, 11.17, 11.18, 14.4, 14.5, 14.6, 15.1, 15.3, 22.4, 22.8_

  - [x] 10.2 Build the confirmation page and guest order access
    - Fill the confirmation page from the placement response, keep a guest's Order_Access_Token in `sessionStorage`, and offer account creation by password
    - Build `/track-order` with the gateway's Bot_Check and the One_Time_Code
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 10.3 Build sign-in and the account area
    - Build sign-up, sign-in and password reset through Supabase Auth with its Turnstile captcha, allowing only same-origin return paths
    - Build the account area with Orders, addresses, Wishlists, reviews, marketing preferences, the language and account deletion; the order view with cancel and return controls from the allowed actions and the printable Tax_Invoice; and sign-out that clears the device
    - _Requirements: 14.4, 14.5, 14.6, 14.7, 14.8, 14.9_

  - [x] 10.4 Build reviews, Enquiries, Quotations, saved products and Back_In_Stock_Alerts
    - Build the review, Enquiry and Quotation forms through the gateway, the awaiting-moderation state, the reply time, and priced Quotations with acceptance
    - Save up to 50 products on the device for guests and to the default Wishlist for Customers, moving the device list at sign-in, and build the Back_In_Stock_Alert control and the newsletter sign-up
    - Leave out the entry points of disabled Optional_Features
    - _Requirements: 11.16, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 21.4_

  - [ ]* 10.5 Write property test for Back_In_Stock_Alerts
    - **Property 34: Back_In_Stock_Alert**
    - **Validates: Requirements 11.17, 11.18**

  - [ ]* 10.6 Write property test for Cart rules
    - **Property 39: Cart rules**
    - **Validates: Requirements 12.8, 15.4, 15.5, 22.3**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement consent, analytics and Experiments
  - [x] 12.1 Add the backend consent, event and vitals parts
    - Create `ext.consent_choice` and implement `api.store_record_consent`
    - Add `session_started`, `experiment_exposed` and `web_vital` to spec 1's client event allowlist with their payload schemas
    - Create `ext.web_vital_histogram` with a job that runs every 15 minutes, and implement `api.admin_web_vitals` with 28-day 75th percentiles per page type and the marks above 2.5 seconds, 200 ms or 0.1
    - _Requirements: 3.10, 17.5, 18.1, 22.6, 22.8_

  - [x] 12.2 Build the consent banner and privacy choices
    - Show the banner at the bottom without blocking content, with equal "Accept all", "Only necessary" and "Choose" buttons and two switches that start off, and treat every purpose as refused until a choice is recorded
    - Record each choice on the device and through `api.store_record_consent`, reopen the choices from the footer link, ask again when the privacy notice version changes, and on withdrawal stop the purpose's processing and delete its identifiers
    - _Requirements: 17.1, 17.2, 17.3, 17.5, 17.6, 17.7, 17.8_

  - [x] 12.3 Implement the event queue and analytics events
    - Implement the event builder with the allowed fields of each event type and masked search terms, the session ID that changes after 30 idle minutes, and the queue of at most 200 events sent in batches of at most 50 every 10 seconds and on page hide with `keepalive`, retrying with growing delays
    - Send `session_started`, the page and search events and `checkout_step_viewed` only with analytics consent, link the Cart to the session through `api.store_cart_set_session`, and keep browser storage to the keys of the design's list
    - _Requirements: 17.9, 17.10, 18.1, 18.2, 18.3, 18.4, 18.5_

  - [x] 12.4 Implement Core_Web_Vitals and Marketing_Tags
    - Load `web-vitals` when the browser is idle after analytics consent, and send LCP, INP and CLS with the page type
    - Load GA4, Google Ads and Meta Pixel only with Marketing_Tag consent and after the page's `load` event, with purchase events that carry no PII_Field, and delete their cookies on withdrawal
    - _Requirements: 3.7, 3.10, 17.7, 17.9_

  - [x] 12.5 Implement the Experiment backend
    - Create `ext.experiment` and `ext.experiment_result`, with a partial unique index that allows one running Experiment per component
    - Implement `api.admin_experiments_list`, `api.admin_experiment_plan` with the design's sample-size formula, `api.admin_experiment_save`, `api.admin_experiment_start` with an advisory lock and the limit of 3 running Experiments, `api.admin_experiment_stop`, which keeps the results and sets the Component_Switch, and `api.admin_experiment_results` with the 95% interval and the verdict rule
    - Add the hourly job that counts the Exposures, Conversions and revenue per exposed session of each Experiment_Variant from Analytics_Events and spec 2's facts
    - _Requirements: 19.2, 19.3, 19.4, 19.8, 19.9, 19.10, 19.11, 22.6, 22.8_

  - [x] 12.6 Implement Experiment assignment and Exposures
    - Write the running Experiments into each page at build, assign consenting sessions in the `<head>` script with the FNV-1a rule before the first paint, show the assigned variant through CSS, and give sessions without analytics consent the control
    - Send one `experiment_exposed` per session and Experiment when half of the changed area is visible
    - _Requirements: 19.5, 19.6, 19.7_

  - [ ]* 12.7 Write property test for consent gating
    - **Property 27: Consent gating**
    - **Validates: Requirements 17.2, 17.7, 18.5, 19.6**

  - [ ]* 12.8 Write property test for the storage allowlist
    - **Property 28: Storage allowlist**
    - **Validates: Requirements 17.10**

  - [ ]* 12.9 Write property test for PII in measurement
    - **Property 29: No PII in measurement**
    - **Validates: Requirements 3.10, 17.9**

  - [ ]* 12.10 Write property test for the event queue
    - **Property 30: Event queue**
    - **Validates: Requirements 18.2, 18.3, 18.4**

  - [ ]* 12.11 Write property test for Experiment assignment
    - **Property 31: Experiment assignment**
    - **Validates: Requirements 19.5, 19.6, 19.7**

  - [ ]* 12.12 Write property test for Experiment plans and verdicts
    - **Property 32: Experiment plan and verdicts**
    - **Validates: Requirements 19.3, 19.8, 19.9, 19.10**

  - [ ]* 12.13 Write property test for Experiment limits
    - **Property 33: Experiment limits**
    - **Validates: Requirements 19.4**

  - [ ]* 12.14 Write property test for Core_Web_Vitals percentiles
    - **Property 36: Core_Web_Vitals percentiles**
    - **Validates: Requirements 3.10**

- [x] 13. Implement presets, legal content and the Admin_App screens
  - [x] 13.1 Write the Business_Preset files and layout functions
    - Write the seven preset files with their Sections, PDP_Blocks, filters, badge priority and attribute definitions, including the required Mandatory_Declarations
    - Implement `api.admin_storefront_settings_get`, `api.admin_storefront_settings_save`, `api.admin_storefront_preset_preview`, `api.admin_storefront_preset_apply` (saved only with the preview's version) and `api.admin_storefront_draft_save` with `ext.storefront_draft`
    - Extend spec 2's `api.admin_preview_token` to drafts, implement `api.store_preview`, and render `/_preview/` paths in the Storefront_Worker with `private, no-store` and `noindex`
    - _Requirements: 6.1, 6.2, 6.3, 22.5, 22.6, 22.7_

  - [x] 13.2 Build the legal and content pages
    - Build the policy pages, the seller page with the Seller_Details, the Grievance_Officer, the response times and the National Consumer Helpline, the contact page, the Ranking_Disclosure generated from the sort orders and the Compliance_Certificate page, all from sanitized content
    - Show the PDP's return, warranty and delivery summary and its Mandatory_Declarations, including the country of origin and an importer's details, and warn in the Site_Build when the Hindi privacy notice is missing
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6, 16.7, 16.10, 17.4_

  - [x] 13.3 Implement the compliance functions and job
    - Implement `api.admin_compliance_certificate_save`, and the daily job that raises the warning Alert to the owner Role once the Compliance_Certificate is older than 11 months
    - _Requirements: 16.7, 16.8, 22.8_

  - [x] 13.4 Build the Admin_App storefront screens
    - Build the Storefront layout screen for the preset with its preview, the Sections, the PDP_Blocks, the filters and the badges; the Persuasion_Components screen with each Component_Switch and its Component_Rationale in English and Hindi; the Experiments screen with the plan, start, stop and results; and the Site_Builds and Core_Web_Vitals screens
    - Build the legal content screen with the Seller_Details, the Grievance_Officer, the policies, the contact details, the Compliance_Certificate and the self-audit checklist of the 13 Dark_Patterns
    - Add pairings, Key_Highlights, Mandatory_Declarations and preset attributes to the product editor through `api.admin_product_storefront_save`, and warn in spec 2's Price_List and Promotion editors before an end with a recorded countdown moves
    - _Requirements: 1.6, 6.2, 6.3, 11.7, 11.25, 16.9, 19.1, 19.2, 19.3, 19.8, 22.5_

- [x] 14. Implement the Legacy_Storefront cutover
  - [x] 14.1 Implement readiness and confirmation
    - Create `ext.storefront_cutover_state`, and implement `api.admin_storefront_cutover_readiness` for the owner Role with each readiness item, including a live Credential_Check through spec 1's `admin-providers` and the last Site_Build's legacy URL check
    - Implement `api.admin_storefront_cutover_confirm` with the owner Role, spec 2's step-up and an Idempotency_Key, rejecting the request with the failed items and otherwise recording the confirmation with an Audit_Log entry
    - _Requirements: 23.2, 23.3, 23.4_

  - [x] 14.2 Switch the Legacy_Storefront
    - Add the public cutover-status function, and make the Legacy_Storefront middleware cache it for 60 seconds and, once confirmed, answer every storefront route with a 301 to the same path at the Storefront URL
    - Make the legacy order route return 410 and add the migration that rejects new legacy Orders after the confirmation, while the Razorpay webhook route keeps processing payments created before the confirmation for 7 days
    - _Requirements: 23.5, 23.6, 23.7_

  - [x] 14.3 Build the cutover screen
    - Show each readiness item as passed or failed, the confirmation with the step-up, and the step that points the store's domain at the Storefront's Worker
    - _Requirements: 23.2, 23.3, 23.4_

  - [ ]* 14.4 Write property test for legacy URLs
    - **Property 37: Legacy URLs**
    - **Validates: Requirements 23.1**

  - [ ]* 14.5 Write property test for cutover gating
    - **Property 38: Cutover gating**
    - **Validates: Requirements 23.3, 23.5, 23.6**

- [x] 15. Add the release checks
  - [x] 15.1 Configure the Lighthouse CI gates
    - Run the median of 5 Lighthouse runs under mobile throttling for the home page, a PLP, a PDP, the Cart and checkout, and fail above 2.5 seconds of LCP, 200 ms of Total Blocking Time or a CLS of 0.1
    - _Requirements: 3.1, 3.3_

  - [x] 15.2 Write the build fixture tests
    - Build fixture catalogs of 500 and 9,000 products and check the file counts, both languages, sitemaps with `hreflang`, CSP hashes, JavaScript budgets, legacy URLs and missing-declaration warnings
    - _Requirements: 1.1, 1.8, 3.2, 5.2, 16.5, 20.6, 23.1_

  - [ ]* 15.3 Write the browser tests
    - Test browsing, filtering, variant selection, Cart edits with undo, guest Cash_On_Delivery and online checkout in Razorpay test mode, order access, consent choices, the language switch and keyboard-only checkout at 320, 375, 768, 1,024 and 1,280 px in English and Hindi, with no axe violation at WCAG 2.2 A or AA, no page-level horizontal scrolling and 44 × 44 px targets
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 13.1, 17.1_

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster first version.
- Each sub-task lists the requirements it covers.
- Checkpoints stop for a test run and for any questions.
- Property tests check the universal properties from the design, with one test per property tagged `Feature: storefront-redesign, Property N: <title>`, while example and integration tests cover specific cases.
- Spec 1's backend and spec 2's Admin_App must be complete first. Tasks that extend their functions add only the checks and parameters that those specs lack.
- R2 needs a payment method on the Cloudflare account, and spec 4 sets up the account, the R2 bucket, the Workers Builds project and the rate limiting rule.
- The CPU check in 8.8 must pass before On_Demand_Pages ship on the free plan.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.4", "2.5", "2.7", "3.1", "3.3", "3.4", "4.1", "4.5", "4.6", "4.7", "5.1", "9.1", "9.5", "10.1", "12.1", "13.3"] },
    { "id": 2, "tasks": ["2.6", "3.2", "3.5", "4.2", "4.4", "4.8", "4.11", "5.2", "6.1", "6.2", "8.1", "9.6", "10.5", "12.5", "13.2"] },
    { "id": 3, "tasks": ["3.6", "4.3", "4.9", "5.3", "5.4", "6.5", "6.7", "6.8", "6.10", "6.11", "10.3", "12.12", "12.13", "14.1"] },
    { "id": 4, "tasks": ["4.10", "6.3", "6.4", "6.17", "8.3", "12.2", "14.2", "14.3"] },
    { "id": 5, "tasks": ["6.6", "6.9", "6.12", "6.13", "6.14", "6.16", "8.2", "8.4", "8.6", "8.9", "9.2", "12.3", "14.5"] },
    { "id": 6, "tasks": ["8.5", "8.7", "8.8", "8.11", "9.3", "10.4", "12.4", "12.6", "12.10", "13.1", "15.2"] },
    { "id": 7, "tasks": ["6.15", "8.10", "8.12", "8.13", "9.4", "9.7", "10.6", "12.7", "12.9", "12.11", "12.14", "13.4", "14.4", "15.1"] },
    { "id": 8, "tasks": ["9.8", "9.9", "10.2"] },
    { "id": 9, "tasks": ["12.8", "15.3"] }
  ]
}
```
