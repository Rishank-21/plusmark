# Requirements Document

## Introduction

This spec defines the Storefront, the web store in which shoppers browse, compare and buy. It is spec 3 of 4. Spec 1 (supabase-medusa-backend) built the backend that the Storefront uses: the Store_API, catalog reads with CDN cache headers, catalog versions and Catalog_Change_Events, Carts, checkout, Razorpay and Cash_On_Delivery payments, the Bot_Check gateway and Analytics_Events. Spec 2 (admin-panel-analytics) built the Admin_App, its Reports and the Storefront_Funnel. Spec 4 covers multi-client provisioning.

The Storefront replaces the Legacy_Storefront. It is designed for phones first and works equally well on tablets and desktops. Site_Builds generate its pages ahead of time, and Cloudflare's CDN serves them on the free plan. Prices, stock, delivery dates and the Cart load live inside each page.

Every Persuasion_Component applies a published behavioral principle, such as social proof or loss aversion, to true store data. Indian law forbids false urgency, hidden charges and the other Dark_Patterns, and from 1 January 2027 it requires each announced price reduction to show the lowest price of the previous 30 days. Each Persuasion_Component has a Component_Rationale, a Component_Switch and support for Experiments, so the store owner can see the component's effect on the store's own sales.

Requirements 1 to 5 set the foundations that every page depends on: hosting and builds, live data, speed, layout and accessibility, and languages. Requirements 6 to 16 cover the shopping journey, Requirements 17 to 21 cover privacy, measurement, search engines and security, and Requirements 22 and 23 cover the backend additions and the cutover.

## Glossary

Terms defined in spec 1 and spec 2 keep their meaning here, including Store_API, Admin_API, Admin_App, Admin_User, Role, Permission, Audit_Log, Secret, Backend, Scheduler, Extension_Schema, Medusa_Parity_Table, Parity_Check, Migration_Tool, Public_Catalog_Read, Catalog_Change_Event, Analytics_Event, Bot_Check, Cart, Guest_Cart, Cart_Token, Customer, Guest_Customer, Registered_Customer, Customer_Group, Order, Idempotency_Key, Region, Promotion, Price_List, Stock_State, Sellable_Quantity, Shipping_Option, Serviceability_Rule, Cash_On_Delivery, Payment_Provider, Credential_Check, One_Time_Code, Order_Access_Token, Optional_Feature, Wishlist, Enquiry, Quotation, Store_Settings, Client_Branding, Sensitive_Action, Edit_Conflict, Alert, Storefront_Session, Storefront_Funnel, UTM_Parameters, Store_Timezone, PII_Field, Tax_Invoice and Valid_GSTIN. The terms below are new in this spec.

- **Storefront**: The shopper-facing web application that this spec builds with the Astro framework and that Cloudflare serves at the store's domain.
- **Legacy_Storefront**: The current storefront at `src/app/(storefront)` in the current Next.js app.
- **Site_Build**: One run of the Storefront build, which generates every Static_Page from Public_Catalog_Read data and Store_Settings and deploys the result to Cloudflare.
- **Static_Page**: An HTML page that a Site_Build generates and Cloudflare serves as a static file, without running server code for the request.
- **On_Demand_Page**: A catalog page that the Storefront_Worker renders at request time because the page has no Static_Page yet, such as the page of a product published after the last Site_Build.
- **Storefront_Worker**: The Cloudflare Worker of the Storefront. It renders On_Demand_Pages and serves Live_Data, and it runs only for requests that no Static_Page or static file answers.
- **Rebuild_Interval**: A Store_Settings value (default 60 minutes, allowed 30 to 1,440 minutes) that sets the shortest time between the starts of two Site_Builds that changes trigger.
- **Live_Island**: A part of a Static_Page that loads current data in the browser after the page loads, such as the price, the Stock_State, the Delivery_Estimate, the Cart count or the signed-in state.
- **Live_Data**: The current price, Prior_Price, Stock_State, Sellable_Quantity and Popularity_Count of a product's variants, as the Storefront_Worker serves them to Live_Islands.
- **Live_Data_Max_Age**: A Store_Settings value (default 60 seconds, allowed 15 to 600 seconds) that sets the oldest Live_Data that a Live_Island may show.
- **Business_Preset**: A named starting configuration of home page Sections, PDP_Blocks, listing filters, Product_Card badges and product attributes for one business type: fashion and apparel, electronics and gadgets, grocery and FMCG, home and furniture, beauty and personal care, B2B and industrial, or jewellery and handmade.
- **Section**: A configurable block of the home page or of a landing page, such as a hero banner, a category grid or a product rail.
- **PLP**: A product listing page: a category page, a collection page or a search results page.
- **PDP**: A product detail page, which shows one product and its variants.
- **PDP_Block**: A configurable part of a PDP that shows one kind of product information, such as specifications, a size guide or ingredients.
- **Product_Card**: The summary of one product in a PLP or a product rail.
- **Key_Highlights**: Up to 5 short points that the store writes for a product to sum up its main benefits.
- **Buy_Box**: The area of a PDP with the price, the variant selection, the quantity, the Delivery_Estimate and the add-to-cart control.
- **Sticky_Buy_Bar**: A bar fixed to the bottom of the viewport below 768 CSS px, with the price and the add-to-cart control, shown while the Buy_Box is out of view.
- **Delivery_Estimate**: The earliest and latest delivery dates for a postal code, computed from spec 1's postal code check, the Dispatch_Cutoff and the store's working days in the Store_Timezone.
- **Dispatch_Cutoff**: A Store_Settings value (default unset) that sets the latest local time on a working day at which an Order placed that day is dispatched the same day.
- **Prior_Price**: For a product variant whose most recent change of offered price was a fall, the lowest price at which the store offered the variant, in the same currency and Region, during the 30 days before that fall.
- **Price_Reduction**: The state of a product variant whose current offered price is below the variant's Prior_Price.
- **MRP**: The maximum retail price, inclusive of all taxes, that the store declares for a product variant where Indian law requires one.
- **Mandatory_Declarations**: The product details that Indian law requires an online listing to show where they apply: the name and address of the manufacturer, packer or importer; the country of origin; the common or generic name; the net quantity; the month and year of manufacture or the best-before or use-by date; the MRP; the unit sale price; and the consumer care contact.
- **Seller_Details**: The store's legal name, registered address, GSTIN, customer care contact and Grievance_Officer, as set in Store_Settings.
- **Grievance_Officer**: The person whom the store names for consumer complaints, with the name, designation, phone number and email address that the Storefront shows.
- **Dark_Pattern**: Any of the 13 practices that India's Guidelines for Prevention and Regulation of Dark Patterns, 2023 specify: false urgency, basket sneaking, confirm shaming, forced action, subscription trap, interface interference, bait and switch, drip pricing, disguised advertisement, nagging, trick question, SaaS billing and rogue malware.
- **Ranking_Disclosure**: A Storefront page that states, in plain language, the main factors that set the order of products in PLPs and search results and the relative importance of each factor.
- **Compliance_Certificate**: The certificate that the store issues after its annual self-audit of the Storefront's interface, confirming compliance with the Dark_Pattern guidelines, as the Consumer Protection (E-Commerce) (Amendment) Rules, 2026 require.
- **Persuasion_Component**: A Storefront component listed in Requirement 11 that helps shoppers decide and buy by applying a named behavioral principle to true store data.
- **Review_Summary, Review_Highlights, Popularity_Notice, Low_Stock_Notice, Sale_Countdown, Dispatch_Countdown, Delivery_Promise, Free_Delivery_Progress, Savings_Summary, Trust_Strip, Goes_Well_With, Bundle_Offer, Recently_Viewed, Back_In_Stock_Alert, First_Order_Offer and Checkout_Progress**: The Persuasion_Components that Requirement 11 defines, together with the Sticky_Buy_Bar.
- **Component_Rationale**: The documented record of a Persuasion_Component: the behavioral principle, the published evidence, the expected effect, the Storefront_Funnel metric that measures the effect, the data source and the Dark_Pattern check.
- **Component_Switch**: A Store_Settings value that turns one Persuasion_Component on or off for the store.
- **Experiment**: An A/B test that assigns consenting Storefront_Sessions at random to a control or a treatment Experiment_Variant of one Persuasion_Component and compares the Conversion of the two groups.
- **Experiment_Variant**: The control or the treatment of an Experiment. The control is the component's state under its Component_Switch, and the treatment is the other state or an alternative design of the component.
- **Exposure**: The first time in a Storefront_Session that the Storefront shows a page area that an Experiment changes.
- **Conversion**: A Storefront_Session with an Exposure that reached the Order placed step of the Storefront_Funnel after the Exposure.
- **Popularity_Count**: The number of non-canceled Orders that contained a product and were placed in the last 7 days.
- **Consent_Choice**: A shopper's recorded decision to allow or refuse each optional processing purpose: analytics with Experiments, and Marketing_Tags.
- **Marketing_Tag**: A third-party measurement script that the store configures, limited to Google Analytics 4, Google Ads and Meta Pixel.
- **Storefront_Language**: The language of the Storefront's interface text: English or Hindi.
- **Core_Web_Vitals**: Google's page experience metrics Largest Contentful Paint (LCP), Interaction to Next Paint (INP) and Cumulative Layout Shift (CLS).
- **Free_Delivery_Threshold**: The Cart subtotal from which an order-value-threshold Shipping_Option of spec 1 costs nothing for the Cart's address.
- **Storefront_Cutover**: The switch from the Legacy_Storefront to the Storefront at the store's domain, confirmed by an Admin_User who holds the owner Role.

## Assumptions

Owner decisions:

1. The Storefront is static-first. Site_Builds pre-render pages with Astro as Static_Pages on Cloudflare's free plan, Live_Islands load current data, and the Storefront_Worker renders only the pages that have no Static_Page yet.
2. One design system serves every store. The Business_Preset chosen at setup sets the starting Sections and PDP_Blocks, and the store can change the preset and edit Sections later. The Business_Presets are fashion and apparel, electronics and gadgets, grocery and FMCG, home and furniture, beauty and personal care, B2B and industrial, and jewellery and handmade.
3. Interface text is in English and Hindi. Product names, descriptions, reviews and other store content show as the store or the shopper wrote them, untranslated.
4. Every Persuasion_Component has a Component_Switch, and Admin_Users can run Experiments on Persuasion_Components and read the results in the Admin_App.

Other assumptions:

5. The spec 1 backend and the spec 2 Admin_App are in place. This spec may add Store_API functions, Admin_API functions, tables, scheduled jobs and Admin_App screens that follow the conventions of spec 1 and spec 2.
6. Each store sells in India in INR, the default Store_Timezone is Asia/Kolkata, and each store is a single seller, not a marketplace, so the Storefront shows no sponsored listings.
7. Persuasion_Components use only true data from the Backend and Store_Settings. Fake timers, fake stock counts, invented popularity, pre-selected paid add-ons and every other Dark_Pattern are out of scope.
8. Shoppers pay online in Razorpay's own checkout window, so the Storefront never handles card numbers or UPI credentials.
9. Product review photos and videos, live chat, back-office features beyond Requirement 22 and an installable offline app are out of scope.
10. Spec 4 sets each client's domain, Cloudflare account and initial Business_Preset during provisioning.
11. India's Digital Personal Data Protection Rules, 2025 apply their notice and consent duties to stores from 13 May 2027, and the Consumer Protection (E-Commerce) (Amendment) Rules, 2026 apply from 1 January 2027. The Storefront meets both from its first release.

## Requirements

### Requirement 1: Static-first hosting on Cloudflare's free plan

**User Story:** As a store owner, I want the Storefront served from Cloudflare's CDN as pre-built pages, so that pages load fast and hosting stays free however many shoppers visit.

#### Acceptance Criteria

1. THE Storefront SHALL serve the home page, every PLP, PDP and content page that existed at the last Site_Build, and the not-found page, as Static_Pages from Cloudflare.
2. THE Storefront SHALL serve scripts, style sheets, fonts and images from Cloudflare with content-hashed file names and a cache lifetime of at least one year.
3. THE Storefront SHALL run no server code for a request that a Static_Page or static file answers.
4. WHEN the Backend records a Catalog_Change_Event, or an Admin_User saves a change to the Sections, the PDP_Blocks, the Business_Preset, the Client_Branding, a Component_Switch or the content of Requirement 16, THE Backend SHALL start a Site_Build that includes the change no later than one Rebuild_Interval plus 2 minutes after the change.
5. THE Backend SHALL start the Site_Builds of criterion 4 at least one Rebuild_Interval apart, so that one Site_Build covers every change recorded since the previous Site_Build started.
6. THE Admin_App SHALL let an Admin_User who holds the settings:write Permission start a Site_Build at once, and show the start time, status, duration, page count and warnings of the last 20 Site_Builds and the build minutes used in the current month.
7. IF the build minutes used in the current calendar month reach 90% of the monthly build-minute allowance in Store_Settings (default 3,000, the free plan's allowance), THEN THE Backend SHALL start no further Site_Build under criterion 4 in that month and raise a warning Alert of spec 2, while Live_Islands keep prices and stock current.
8. IF a Site_Build fails or would exceed a Cloudflare free plan limit (20 minutes per build or 20,000 files per deployment), THEN THE Site_Build SHALL deploy nothing, the Storefront SHALL keep serving the previous deployment, and THE Backend SHALL raise the job-failure Alert of spec 2 with the failed step or the exceeded limit.
9. WHEN a shopper requests the URL of a published product, category or collection that has no Static_Page, THE Storefront_Worker SHALL render an On_Demand_Page with the content and layout that the record's Static_Page would have.
10. IF a shopper requests a catalog URL whose record does not exist or is not published, THEN THE Storefront SHALL show the not-found page with HTTP status 404.
11. WHILE the Static_Page of a product that was unpublished or deleted after the last Site_Build is open, THE Storefront SHALL show, within the Live_Data_Max_Age, that the product is no longer available, and disable the product's add-to-cart control.
12. IF the Storefront_Worker cannot serve a request because a Cloudflare free plan limit was reached, THEN THE Storefront SHALL keep serving Static_Pages and static files, and Live_Islands SHALL load Live_Data from the Store_API directly.
13. THE Storefront SHALL hold in its static files only the Supabase project URL, the Supabase public key and public Store_Settings values, and no Secret.

### Requirement 2: Live prices, stock and Cart state

**User Story:** As a shopper, I want the prices, stock and delivery dates on every page to be current, so that what I see is what I pay and receive.

#### Acceptance Criteria

1. WHEN a page that shows a price, a Stock_State or a Popularity_Count loads, THE Storefront SHALL replace the values built into the page with Live_Data no older than the Live_Data_Max_Age.
2. THE Storefront SHALL reserve the space of every Live_Island in the built page, so that loading Live_Data shifts no other content.
3. THE Storefront_Worker SHALL answer Live_Data requests from a cache entry no older than the Live_Data_Max_Age, keyed by the catalog version of spec 1, so that repeated requests within that time do not reach the Backend.
4. IF Live_Data does not load within 8 seconds, THEN THE Storefront SHALL keep the built price, hide the Low_Stock_Notice, the Popularity_Notice and the Sale_Countdown, and state next to the price that the price is confirmed in the Cart.
5. WHEN a shopper adds a variant to the Cart, THE Storefront SHALL show the line price that the Store_API returns for the Cart.
6. IF the Cart line price differs from the price that the page showed, THEN THE Storefront SHALL state the new price and the old price in the add-to-cart confirmation.
7. WHILE a Registered_Customer whose Customer_Groups have their own prices is signed in, THE Storefront SHALL load that Customer's prices from the Store_API's signed-in price read and keep them out of Static_Pages, the Storefront_Worker cache and every other shared cache.
8. THE Storefront SHALL show on every page the item count of the Cart on the device and the signed-in state, loaded after the page's first render.
9. WHEN the Cart changes in one browser tab, THE Storefront SHALL update the Cart count in every other open Storefront tab within 2 seconds.

### Requirement 3: Speed on budget phones and slow networks

**User Story:** As a shopper on a budget Android phone and a slow mobile network, I want pages to appear and respond at once, so that I can shop without waiting.

#### Acceptance Criteria

1. WHEN the home page, a PLP, a PDP, the Cart or checkout loads under Lighthouse's default mobile throttling (simulated slow 4G with 4× CPU slowdown), THE Storefront SHALL reach a Largest Contentful Paint within 2.5 seconds, a Total Blocking Time within 200 ms and a Cumulative Layout Shift of 0.1 or less, each taken as the median of 5 Lighthouse runs.
2. THE Storefront SHALL keep the compressed JavaScript that a page loads before the first shopper interaction within a configured budget per page type (default 60 KB for the home page, PLPs and PDPs, 90 KB for the Cart and 120 KB for checkout, where 1 KB is 1,024 bytes), not counting the Razorpay and Turnstile scripts.
3. THE Storefront's continuous integration checks SHALL reject a code change that makes a page type exceed its JavaScript budget or a limit of criterion 1, naming the page type and the measured value.
4. THE Storefront SHALL deliver each product and banner image in AVIF or WebP with a JPEG fallback, in a size chosen for the viewport width and pixel density, from Cloudflare's CDN.
5. THE Storefront SHALL load the largest image of the first viewport with high fetch priority, and load every other image only as it approaches the viewport.
6. THE Storefront SHALL set the dimensions or aspect ratio of every image, video and embed before it loads.
7. THE Storefront SHALL load the Razorpay checkout script only when the shopper chooses to pay online, the Turnstile script only when an action that needs a Bot_Check starts, and Marketing_Tags only after the shopper's Consent_Choice allows them and the page has finished loading.
8. WHILE the browser reports the Save-Data preference, THE Storefront SHALL load every image other than the largest image of the first viewport at 1× pixel density, and start no video automatically.
9. THE Storefront SHALL use at most one web font family for Latin text and one for Devanagari text, each shown with a system-font fallback while it loads, and load the Devanagari font only on Hindi pages and on pages whose store content contains Devanagari text.
10. WHILE the Consent_Choice allows analytics, THE Storefront SHALL record the Core_Web_Vitals of real page loads with no PII_Field, so that the Admin_App can show the 75th percentile LCP, INP and CLS of each page type for the last 28 days and mark each page type whose values exceed 2.5 seconds, 200 ms or 0.1.

### Requirement 4: Mobile-first layout, touch and accessibility

**User Story:** As a shopper using a phone with one hand, I want every page to fit my screen and every action to be within easy reach, so that shopping is quick and comfortable on any device.

#### Acceptance Criteria

1. THE Storefront SHALL lay out every page without page-level horizontal scrolling at every viewport width of 320 CSS px or more, with a phone layout below 768 px, a tablet layout from 768 to 1,023 px and a desktop layout from 1,024 px.
2. WHILE the viewport is below 768 px, THE Storefront SHALL show a bottom navigation bar with Home, Categories, Search, Cart (with the item count) and Account on every page that shows no bottom action bar of criterion 3 or of Requirement 9.
3. WHILE the viewport is below 768 px, THE Storefront SHALL show the primary action of the Cart and of each checkout step in a bar fixed to the bottom of the viewport.
4. THE Storefront SHALL give every interactive control, other than links inside running text, a touch target of at least 44 × 44 CSS px that overlaps no other control's touch target.
5. THE Storefront SHALL meet every WCAG 2.2 Level A and Level AA success criterion on every page, in English and Hindi, in every page state, including open menus, open dialogs, error states and loading states.
6. THE Storefront SHALL let a shopper browse, search, filter, add to the Cart, check out and pay using only a keyboard, and using only a screen reader.
7. THE Storefront SHALL advance carousels only when the shopper swipes or taps a control, with no automatic rotation.
8. WHILE the device requests reduced motion, THE Storefront SHALL replace animations and transitions with instant changes and start no video automatically.
9. THE Storefront SHALL keep each form field's visible label while the field holds input, and show each field's error next to the field as soon as the shopper leaves the field.
10. THE Storefront SHALL open the numeric keyboard for phone numbers, postal codes, quantities and One_Time_Codes, and mark name, address, email and phone fields with their autocomplete purposes.
11. WHEN a shopper returns to a PLP from a PDP with the browser's back control, THE Storefront SHALL restore the PLP's loaded products, filters and scroll position.

### Requirement 5: English and Hindi

**User Story:** As a shopper, I want to use the Storefront in Hindi or English, so that I can shop in the language I read best.

#### Acceptance Criteria

1. THE Storefront SHALL provide every interface string, including labels, messages, accessible names, error messages and the text of every Persuasion_Component, in English and in Hindi.
2. THE Storefront SHALL serve every page in English at the page's path and in Hindi at the same path under `/hi/`, with alternate-language links between the two versions.
3. THE Storefront SHALL show a language switch in the header menu and in the footer of every page, which opens the current page in the other Storefront_Language and keeps the Cart, the applied filters and the search query.
4. WHEN a shopper selects a Storefront_Language, THE Storefront SHALL remember the choice on the device and, for a signed-in Registered_Customer, in the Customer's profile.
5. IF a shopper opens an English page with no remembered choice and the browser's first preferred language is Hindi, THEN THE Storefront SHALL offer the Hindi version once, in a prompt that blocks no content and closes with one tap.
6. THE Storefront SHALL show store content, such as product names, descriptions and reviews, as written in both language versions, marked with the content's language for assistive technologies.
7. THE Storefront SHALL show every number with the digits 0 to 9 and lakh and crore grouping, and every INR amount with the ₹ sign, showing paise only when the amount has paise (for example ₹1,499 and ₹1,499.50), in both languages.
8. THE Storefront SHALL show dates with the weekday, the day and the month name in the active language, adding the year when the date is not in the current year (for example Thu, 12 Nov or गुरु, 12 नव॰), in the Store_Timezone.
9. THE Storefront's continuous integration checks SHALL reject a code change that leaves an interface string without Hindi text, naming each such string.

### Requirement 6: Business_Presets, Sections and branding

**User Story:** As a store owner in any industry, I want the Storefront to start with the sections and product details that suit my business and let me adjust them, so that my store fits my products without custom code.

#### Acceptance Criteria

1. THE Storefront SHALL provide the seven Business_Presets of Assumption 2, each with a default list of home page Sections, PDP_Blocks, PLP filters, Product_Card badges and product attribute keys.
2. WHEN an Admin_User who holds the settings:write Permission applies a Business_Preset, THE Admin_App SHALL show a preview of the Sections, PDP_Blocks, filters and badges that would change, and THE Backend SHALL save the change only after the Admin_User confirms the preview.
3. THE Admin_App SHALL let an Admin_User who holds the settings:write Permission add, remove, reorder, hide and edit home page Sections and PDP_Blocks, and open a preview of the home page or a chosen PDP with the unsaved changes.
4. THE Storefront SHALL support the Section types hero banner, category grid, collection grid, product rail, review highlights, Trust_Strip, brand story, offer banner, FAQ and newsletter sign-up.
5. THE Storefront SHALL fill a product rail from a collection, a category, the newest products, the best-selling products of the last 30 days or a list that the store picks, and hide a rail that has fewer than 2 products.
6. THE Storefront SHALL show on each PDP only the PDP_Blocks for which the product has data, in the order of the store's PDP_Block list.
7. THE Storefront SHALL provide these PDP_Blocks for the Business_Presets that use them: size guide and fit notes (fashion and apparel); key specifications, warranty and a comparison of up to 3 products (electronics and gadgets); net quantity, unit sale price, best-before date and ingredients (grocery and FMCG); dimensions, materials and assembly (home and furniture); ingredients, suitability and how to use (beauty and personal care); quantity tier prices, minimum order quantity and quotation request (B2B and industrial); and metal, purity, weight and certification (jewellery and handmade).
8. WHERE the B2B and industrial Business_Preset is applied, THE Storefront SHALL show a price-on-request product with a quotation request control and an Enquiry control in place of the price and the add-to-cart control.
9. WHERE the grocery and FMCG Business_Preset is applied, THE Storefront SHALL show an add control with a quantity stepper on the Product_Card of each single-variant product, and a list of the products from a signed-in Customer's past Orders for quick re-ordering.
10. THE Storefront SHALL show the Client_Branding name, logo and brand colours from Store_Settings on every page.

### Requirement 7: Navigation and search

**User Story:** As a shopper, I want to find any product in a few taps, so that I reach what I came for before I give up.

#### Acceptance Criteria

1. THE Storefront SHALL show on every page a header with the Client_Branding logo linking to the home page, a search field or search control, the Cart with its item count and the account entry.
2. THE Storefront SHALL show a category menu with the store's top-level categories in the store's order, each opening its subcategories, and a link to every top-level category's PLP.
3. THE Storefront SHALL show a search submit button next to the search field.
4. WHEN a shopper has typed at least 2 characters into the search field and paused typing for 250 ms, THE Storefront SHALL show up to 6 matching products with images and prices and up to 4 matching categories, with the matched text highlighted.
5. WHEN a shopper submits a search, THE Storefront SHALL open the search results PLP with the Backend's spelling-tolerant matches for the query.
6. IF a search has no results, THEN THE Storefront SHALL show a no-results message with the query, links to the top-level categories and a rail of best-selling products.
7. WHEN the empty search field gains focus, THE Storefront SHALL show the shopper's last 5 searches stored on the device, with a control that clears them.
8. THE Storefront SHALL show breadcrumbs from the home page to the current category on every PLP and PDP.
9. THE Storefront SHALL show in the footer of every page links to the policy pages, the Seller_Details, the Grievance_Officer, the Ranking_Disclosure, the Compliance_Certificate, the contact page, the privacy choices of Requirement 17 and the language switch.

### Requirement 8: Product listing pages

**User Story:** As a shopper, I want listings that I can scan, filter and sort quickly, so that I can compare products and pick one without effort.

#### Acceptance Criteria

1. THE Storefront SHALL show a PLP's products as Product_Cards in 2 columns below 768 px, 3 columns from 768 px and 4 columns from 1,280 px.
2. THE Storefront SHALL show one Product_Card per product, with the product's colour or other swatch options shown as swatches on the card instead of one card per variant.
3. THE Storefront SHALL show on each Product_Card the product image, the product name, the price or the lowest variant price marked "from", the Prior_Price and the saving when a Price_Reduction applies, the Review_Summary when the product has published reviews, and at most 2 badges from the Business_Preset's badge list.
4. WHILE the viewport is below 768 px, THE Storefront SHALL open the filters in a sheet that covers the screen, with an apply button that states the number of matching products.
5. WHILE the viewport is 1,024 px or wider, THE Storefront SHALL show the filters in a column beside the products.
6. THE Storefront SHALL show each applied filter value as a chip with a remove control, and a control that clears all filters.
7. THE Storefront SHALL offer the sort orders featured (the store's order, the default for categories), relevance (the default for searches), newest, price from low to high, price from high to low, best rated and best-selling.
8. THE Storefront SHALL show the first 24 products of a PLP and a load-more button that adds the next 24, with the number of products shown and the total, and record the loaded count, the filters and the sort order in the page URL.
9. IF no product matches a PLP's filters, THEN THE Storefront SHALL show a no-matching-products message with a control that clears the filters.
10. THE Storefront SHALL show a link to the Ranking_Disclosure next to every sort control.
11. THE Storefront SHALL show the category's or collection's description below the product grid.

### Requirement 9: Product detail pages

**User Story:** As a shopper, I want a product page that answers my key questions first and lets me buy in one tap, so that I can decide with confidence without reading a wall of text.

#### Acceptance Criteria

1. THE Storefront SHALL order each PDP as the gallery, the product name, the Review_Summary, the price block, the variant selectors, the stock and delivery information, the Buy_Box actions, the Trust_Strip, the Key_Highlights, the PDP_Blocks, the reviews and up to 2 product rails.
2. THE Storefront SHALL show the product's images in a gallery that moves between images by swipe on touch screens and by controls on every device, shows the position and the number of images, and opens an image at full size with zoom.
3. THE Storefront SHALL show every option value of a product as a button or swatch, marking each value that has no available variant as out of stock without hiding it.
4. WHEN a shopper selects a variant, THE Storefront SHALL update the price, the images, the Stock_State, the SKU and the Delivery_Estimate for that variant without reloading the page, and record the variant in the page URL.
5. WHEN a shopper taps the add-to-cart control, THE Storefront SHALL add the selected variant and quantity to the Cart without leaving the page, and show a confirmation with the added line, the Cart subtotal, the Free_Delivery_Progress and controls that open the Cart and checkout.
6. IF a shopper taps the add-to-cart control before selecting a required option, THEN THE Storefront SHALL name the missing option, move the focus to it and add nothing to the Cart.
7. WHILE the viewport is below 768 px and the Buy_Box is out of view, THE Storefront SHALL show the Sticky_Buy_Bar.
8. THE Storefront SHALL show the product's Key_Highlights above the PDP_Blocks.
9. WHILE the viewport is below 768 px, THE Storefront SHALL show each PDP_Block as a collapsible section, with only the description expanded when the page opens.
10. THE Storefront SHALL let a shopper enter a 6-digit postal code on the PDP, show the Delivery_Estimate, the Cash_On_Delivery availability and the serviceability for that code, remember the code on the device and apply it on later PDPs.
11. THE Storefront SHALL show a share control that opens the device's share sheet where the browser supports one, and otherwise copies the page link and offers a WhatsApp share link.
12. WHERE the reviews Optional_Feature is enabled, THE Storefront SHALL show the product's published reviews with the rating distribution, sorting by newest, highest rating and lowest rating, filtering by star rating, and a verified-purchase label on each review by a Customer who bought the product.

### Requirement 10: Honest prices and discounts

**User Story:** As a shopper, I want every price and discount to be real and complete, so that I can trust the store and never meet a surprise charge.

#### Acceptance Criteria

1. THE Storefront SHALL show each product price as the final price including all taxes, with the words "incl. of all taxes".
2. WHEN a product variant is in a Price_Reduction, THE Storefront SHALL show the current price, the Prior_Price struck through with a control that explains the Prior_Price, and the saving as an amount and as a percentage of the Prior_Price rounded down to a whole number.
3. IF a product variant is not in a Price_Reduction, THEN THE Storefront SHALL show no struck-through price, no saving and no sale label for the variant.
4. WHERE a product variant has an MRP, THE Storefront SHALL show the MRP labeled "MRP (incl. of all taxes)" without striking it through, and SHALL compute no saving from the MRP.
5. WHERE the Business_Preset requires a unit sale price, THE Storefront SHALL show the price per kilogram, litre, metre or unit computed from the variant's net quantity.
6. WHERE a variant has quantity tier prices, THE Storefront SHALL show each tier's minimum quantity, unit price and saving per unit against the single-unit price.
7. THE Storefront SHALL show the delivery charge rules and the Cash_On_Delivery fee on the PDP and the exact amounts in the Cart before checkout starts, and add no charge after the shopper reaches the payment step.
8. THE Backend SHALL record every change of each product variant's offered price per currency and Region, including the start and end of each Price_List, and compute the Prior_Price of every variant from that record.
9. THE Store_API SHALL return the Prior_Price with every price of a variant in a Price_Reduction, in Public_Catalog_Read responses and in Live_Data.
10. WHEN a shopper views a Promotion offer on a PDP or in the Cart, THE Storefront SHALL show the Promotion's conditions, such as the minimum Cart value or the eligible products, next to the offer.

### Requirement 11: Persuasion_Components built on true data

**User Story:** As a store owner, I want proven sales-psychology components that use only true data, so that shoppers buy with confidence and the store stays within Indian consumer law.

#### Acceptance Criteria

1. THE Storefront SHALL provide the Persuasion_Components named in the glossary, each with a Component_Switch that is on by default, and show each Persuasion_Component only while its Component_Switch is on or an Experiment assigns the Storefront_Session to an Experiment_Variant that shows it.
2. THE Storefront SHALL show the Review_Summary, the average rating to 1 decimal place with the number of published reviews, only for a product with at least 1 published review.
3. THE Storefront SHALL show as Review_Highlights the newest published review rated 4 or 5 stars and the newest published review rated 1 to 3 stars, each with at least 100 characters of text, when both exist.
4. THE Storefront SHALL show the Popularity_Notice only when the product's Popularity_Count is 5 or more, stating the largest of 5, 10, 25, 50, 100, 250, 500 and 1,000 that is at or below the Popularity_Count, followed by a plus sign and "bought in the last 7 days".
5. THE Storefront SHALL show the Low_Stock_Notice, stating the exact Sellable_Quantity, only while the selected variant's Sellable_Quantity is above 0 and at or below the low-stock threshold of spec 1, and never for a variant that allows backorders.
6. THE Storefront SHALL show the Sale_Countdown, the time left until the end of the Price_List or Promotion that gives the current price, only when that end is within 48 hours.
7. WHEN a Sale_Countdown reaches zero, THE Storefront SHALL show the price that applies after the end, and never restart a countdown for the same Price_List or Promotion.
8. THE Storefront SHALL show the Dispatch_Countdown, the time left to order for same-day dispatch, only while a Dispatch_Cutoff is set, the current day is a working day, the current time is before the Dispatch_Cutoff and the selected variant has a Sellable_Quantity above 0.
9. THE Storefront SHALL show the Delivery_Promise, the Delivery_Estimate as a date range such as "Delivery between Thu, 12 Nov and Sat, 14 Nov", on the PDP, in the Cart and in checkout once the shopper's postal code is known.
10. THE Storefront SHALL show the Free_Delivery_Progress, the amount still needed to reach the Free_Delivery_Threshold with a progress bar, in the Cart and in the add-to-cart confirmation, and state that delivery is free once the Cart subtotal reaches the threshold.
11. THE Storefront SHALL show the Savings_Summary, the total of each line's saving against its Prior_Price plus the Promotion discounts, in the Cart and in checkout, only when the total is above 0.
12. THE Storefront SHALL show in the Trust_Strip only statements that Store_Settings and the Backend confirm for the product and the shopper's postal code, chosen from secure online payment, Cash_On_Delivery availability, the return window, GST invoice availability and the country of origin.
13. THE Storefront SHALL show as Goes_Well_With the products that the store pairs with the product, and add a paired product to the Cart only when the shopper taps that product's own add control.
14. THE Storefront SHALL show as a Bundle_Offer a Promotion that discounts a set of products bought together, with the set's total price and saving, and add the set's products to the Cart only when the shopper taps the offer's add control.
15. THE Storefront SHALL show as Recently_Viewed up to 10 products that the shopper viewed on the device, newest first, on the home page and on PDPs, with a control that clears the list.
16. THE Storefront SHALL offer as the Back_In_Stock_Alert, for a variant with a Sellable_Quantity of 0, a control that records the shopper's email address and the variant after a Bot_Check.
17. WHEN the Stock_State of a variant with Back_In_Stock_Alert requests changes from out of stock, THE Backend SHALL email each requesting shopper once and then delete the shopper's request.
18. THE Backend SHALL delete each Back_In_Stock_Alert request that is still unsent 90 days after it was recorded.
19. THE Storefront SHALL show the First_Order_Offer, a banner with a configured first-order Promotion and its conditions, at most once per Storefront_Session, and not again on the device for 30 days after the shopper closes it.
20. THE Storefront SHALL show the Checkout_Progress, the checkout steps with the current step and the completed steps, on every checkout step.
21. THE Storefront SHALL show no countdown, stock count, popularity count, rating, delivery promise or price claim that the Backend's current data does not support.
22. THE Storefront SHALL pre-select no optional paid item, donation, insurance, gift wrap, subscription or marketing consent in the Cart, in checkout or in any form.
23. THE Storefront SHALL give every decline, close or skip control the same size and contrast as the matching accept control, worded neutrally and without shaming the shopper.
24. THE Storefront SHALL show any banner or dialog that interrupts the page at most once per Storefront_Session, with a close control, and never as an offer that blocks the page.
25. THE Admin_App SHALL show the Component_Rationale of each Persuasion_Component, in English and Hindi, next to the component's Component_Switch.

### Requirement 12: Cart

**User Story:** As a shopper, I want a Cart that shows the full cost and lets me change my order easily, so that I go to checkout knowing exactly what I will pay.

#### Acceptance Criteria

1. THE Storefront SHALL show the Cart as a panel that opens over the current page and as a full page, each listing every line with the image, name, variant, unit price, quantity control, line total and remove control.
2. WHEN a shopper changes a line's quantity or removes a line, THE Storefront SHALL update the line and the totals from the Store_API's response without reloading the page, and offer to undo a removal for 10 seconds.
3. THE Storefront SHALL show the Cart's subtotal, each Promotion's discount, the delivery charge for the remembered postal code or the lowest delivery charge marked as an estimate, the Cash_On_Delivery fee where it applies, and the total including all taxes.
4. THE Storefront SHALL show the promotion code field behind a "Have a promotion code?" control, and show the Store_API's message when the Store_API rejects a code.
5. WHEN a shopper opens the Cart, THE Storefront SHALL mark each line whose price, availability or quantity changed since the line was added, stating the change.
6. IF a line's variant is out of stock or unpublished, THEN THE Storefront SHALL show the line as unavailable and keep the checkout control disabled until the shopper removes the line.
7. WHILE a Registered_Customer is signed in, THE Storefront SHALL offer a control that moves a line to the Customer's Wishlist.
8. THE Storefront SHALL keep a Guest_Customer's Cart on the device through the Cart_Token for as long as the Backend keeps the Cart, and transfer the Cart when the shopper signs in, under spec 1's sign-in rules.
9. IF the Cart is empty, THEN THE Storefront SHALL show an empty-Cart message with links to the top-level categories and the Recently_Viewed products.

### Requirement 13: Checkout

**User Story:** As a shopper, I want a short checkout that works on my phone, lets me pay the way I prefer and never surprises me, so that I can finish my purchase in a few minutes.

#### Acceptance Criteria

1. THE Storefront SHALL let every shopper place an Order as a Guest_Customer without creating an account, and offer sign-in as an option.
2. THE Storefront SHALL show checkout as one page with the steps contact, delivery address, delivery option and payment, where each completed step collapses to a summary with an edit control.
3. THE Storefront SHALL ask only for the email address, the mobile phone number, the name, the address lines, the postal code, the city and the state, with an optional landmark, an optional billing address and an optional GSTIN.
4. WHEN a shopper enters a 6-digit postal code, THE Storefront SHALL fill the city and state from the bundled India Post PIN code directory, keep both fields editable, and show the serviceability, the Cash_On_Delivery availability and the Delivery_Estimate for the code.
5. IF a shopper enters a postal code that is not serviceable, THEN THE Storefront SHALL state that the address cannot be delivered to and keep the payment step disabled.
6. IF a shopper enters a mobile number that is not 10 digits starting with 6, 7, 8 or 9, or an email address without a valid format, THEN THE Storefront SHALL show a field-level error.
7. IF a shopper enters a GSTIN that is not a Valid_GSTIN, THEN THE Storefront SHALL show a field-level error, and IF the GSTIN is a Valid_GSTIN, THEN THE Storefront SHALL ask for the business name and store both with the Order.
8. THE Storefront SHALL list the available Shipping_Options with each option's charge and Delivery_Estimate, with the lowest-charge option selected first.
9. THE Storefront SHALL list UPI first among the online payment methods, then cards, net banking and wallets, all through Razorpay, and Cash_On_Delivery last when the Backend reports the Cart eligible, with its fee.
10. THE Storefront SHALL show on the payment control the exact total to be charged, such as "Pay ₹1,499", and send that total as the expected total of spec 1.
11. IF the Store_API reports that the totals changed, THEN THE Storefront SHALL show the new totals with the changes and ask the shopper to confirm before trying again.
12. IF an online payment fails or the shopper closes the payment window, THEN THE Storefront SHALL keep the shopper on checkout with the Cart and the entered details unchanged, and offer to retry or to choose another payment method.
13. THE Storefront SHALL send each Order placement with an Idempotency_Key that the Storefront creates when the shopper confirms and reuses for every retry of that placement.
14. WHEN a Guest_Customer places an Order, THE Storefront SHALL pass the Bot_Check of spec 1 for that placement only, without a challenge on earlier steps.
15. WHILE a Registered_Customer is signed in, THE Storefront SHALL select the Customer's default address and offer the Customer's saved addresses.
16. THE Storefront SHALL show an unselected control for marketing messages by email, SMS or WhatsApp, separate from the order updates that every Order receives.

### Requirement 14: Order confirmation, tracking and accounts

**User Story:** As a shopper, I want a clear confirmation, easy tracking and a simple account, so that I know what happens next and can come back with confidence.

#### Acceptance Criteria

1. WHEN an Order is placed, THE Storefront SHALL show a confirmation page with the Order number, the items, the total paid or due on delivery, the payment status, the Delivery_Estimate and the next steps of the Order.
2. WHEN a Guest_Customer's Order is placed, THE Storefront SHALL offer on the confirmation page to create an account by choosing a password only, using the Order's email address.
3. THE Storefront SHALL let a Guest_Customer open an Order with the Order number and the email address, after a Bot_Check and a One_Time_Code sent to that email address, under spec 1's order access rules.
4. THE Storefront SHALL show each Order's status, items, totals, delivery address, payment method, tracking link and status history, and the Tax_Invoice once the Backend has issued it.
5. THE Storefront SHALL show a cancel control on an Order only while spec 1's cancellation rules allow the cancellation.
6. WHERE the self-service returns Optional_Feature is enabled, THE Storefront SHALL show a return request control on each Order that spec 1's return rules allow to be returned.
7. THE Storefront SHALL let a Registered_Customer sign up, sign in, reset the password and sign out through Supabase Auth with its Turnstile captcha.
8. THE Storefront SHALL let a signed-in Registered_Customer view Orders, manage saved addresses, manage Wishlists, view the Customer's reviews, change marketing preferences, choose the Storefront_Language and request account deletion under spec 1's deletion rules.
9. WHEN a Registered_Customer signs out, THE Storefront SHALL remove the session, the account data and the reference to the Customer's Cart from the device.

### Requirement 15: Reviews, Enquiries, Quotations and Wishlists

**User Story:** As a shopper, I want to review products, ask questions, request quotes and save favourites, so that I can decide and buy on my own terms.

#### Acceptance Criteria

1. WHERE the reviews Optional_Feature is enabled, THE Storefront SHALL let a Registered_Customer whom spec 1's review rules allow submit a rating of 1 to 5 stars with a title and text after a Bot_Check, and show the review to its author as awaiting moderation until an Admin_User approves it.
2. WHERE the Enquiries Optional_Feature is enabled, THE Storefront SHALL show on each PDP and on the contact page an Enquiry form with the name, email address, phone number and message, submitted after a Bot_Check, and confirm the submission with the store's configured reply time.
3. WHERE the Quotations Optional_Feature is enabled, THE Storefront SHALL let a shopper request a Quotation for one or more products with quantities after a Bot_Check, and let a signed-in Registered_Customer view priced Quotations and accept one into a Cart under spec 1's Quotation rules.
4. THE Storefront SHALL show a save control on every Product_Card and PDP that saves the product on the device for a Guest_Customer, up to 50 products, and to the default Wishlist for a signed-in Registered_Customer.
5. WHEN a shopper with products saved on the device signs in, THE Storefront SHALL add those products to the Customer's default Wishlist and clear them from the device.
6. IF an Optional_Feature is disabled, THEN THE Storefront SHALL show no entry point of that feature.

### Requirement 16: Seller details, policies and legal disclosures

**User Story:** As a store owner, I want the Storefront to show every disclosure that Indian e-commerce law requires, so that shoppers trust the store and the store avoids penalties.

#### Acceptance Criteria

1. THE Storefront SHALL show the Seller_Details and the Grievance_Officer on a page linked from the footer of every page, with the complaint acknowledgement time of 48 hours, the resolution time of one month and the National Consumer Helpline contact.
2. THE Storefront SHALL show policy pages for returns, refunds, exchanges, cancellations, shipping and delivery, payment methods, warranties and guarantees, the privacy notice and the terms of use, from content that the store edits in the Admin_App.
3. THE Storefront SHALL show on each PDP the product's return, warranty and delivery terms as a short summary with links to the full policies.
4. THE Storefront SHALL show on each PDP the product's Mandatory_Declarations that apply, including the country of origin, and the importer's name and address for an imported product.
5. WHEN a Site_Build finds a published product without the country of origin or without another of the Mandatory_Declarations that the Business_Preset marks as required, THE Site_Build SHALL list the product and the missing declaration in the Site_Build's warnings in the Admin_App.
6. THE Storefront SHALL show the Ranking_Disclosure, written from the sort orders and the factors that the Storefront uses, on a page linked from the footer and from every sort control.
7. THE Storefront SHALL show the store's Compliance_Certificate with its date on a page linked from the footer of every page.
8. WHEN the Compliance_Certificate is older than 11 months, THE Backend SHALL raise a warning Alert to the owner Role that the annual self-audit is due.
9. THE Admin_App SHALL provide a self-audit checklist of the 13 Dark_Patterns that names the Storefront pages and Persuasion_Components that each check covers.
10. THE Storefront SHALL show a contact page with the store's phone number, email address, WhatsApp number where set, and support hours.

### Requirement 17: Privacy notice and consent

**User Story:** As a shopper, I want to know what data the store collects and to choose what I allow, so that my data is used only as I agree.

#### Acceptance Criteria

1. WHEN a shopper opens the Storefront with no recorded Consent_Choice, THE Storefront SHALL show a consent banner at the bottom of the page that blocks no content, with the buttons "Accept all", "Only necessary" and "Choose" in equal size and prominence, in the active Storefront_Language.
2. WHILE no Consent_Choice is recorded, THE Storefront SHALL treat every optional purpose as refused.
3. THE Storefront SHALL let a shopper allow or refuse analytics with Experiments and Marketing_Tags separately, with a plain-language description of each purpose and a link to the privacy notice.
4. THE Storefront SHALL show the privacy notice in English and in Hindi.
5. THE Storefront SHALL record each Consent_Choice on the device and in the Backend with the allowed purposes, the privacy notice version and the time, under a pseudonymous ID that holds no PII_Field.
6. THE Storefront SHALL show in the footer of every page a privacy choices link that reopens the choices, so that withdrawing consent takes no more steps than giving it.
7. WHEN a shopper withdraws consent for a purpose, THE Storefront SHALL stop the processing for that purpose at once and remove the purpose's identifiers from the device.
8. WHEN the privacy notice version changes, THE Storefront SHALL ask for a new Consent_Choice on the shopper's next visit.
9. THE Storefront SHALL put no PII_Field in page URLs, Analytics_Events, Experiment data or Marketing_Tag events.
10. THE Storefront SHALL store in browser storage only the Supabase Auth session, the Cart_Token with the price, availability and quantity of each Cart line when the line was added, the Order_Access_Token of the shopper's latest Order until the browser session ends, the Storefront_Language, the Consent_Choice, the remembered postal code, the Recently_Viewed products, the products saved on the device, the recent searches, the banners shown in the current browser session, the times at which the shopper closed the First_Order_Offer and the Hindi prompt of Requirement 5, and the analytics and Marketing_Tag identifiers, Exposure records and waiting Analytics_Events that the Consent_Choice allows.

### Requirement 18: Analytics capture

**User Story:** As a store owner, I want the Storefront to record how shoppers move through the store, so that the Admin_App's funnel, search and attribution Reports and the Experiments have the data they need.

#### Acceptance Criteria

1. WHILE the Consent_Choice allows analytics, THE Storefront SHALL send Analytics_Events for session start (with the UTM_Parameters, the referrer domain, the landing path, the device class and the Storefront_Language), product view, add to Cart, removal from Cart, checkout start, each completed checkout step, search (with the normalized query and the result count) and Exposure.
2. THE Storefront SHALL send Analytics_Events in batches of at most 50 through spec 1's event function, at least every 10 seconds while events are waiting and when the page is hidden.
3. THE Storefront SHALL identify each Storefront_Session with a random ID that holds no PII_Field and that the Storefront replaces after 30 minutes without shopper activity.
4. IF sending Analytics_Events fails, THEN THE Storefront SHALL keep up to 200 waiting events on the device and retry with growing delays, without affecting any shopper action.
5. WHILE the Consent_Choice refuses analytics, THE Storefront SHALL send no Analytics_Events, and THE Backend SHALL still record the Order events that spec 1 records for every Order.

### Requirement 19: Component_Switches and Experiments

**User Story:** As a store owner, I want to switch each Persuasion_Component on or off and test its effect on my own sales, so that I keep only the components that work for my customers.

#### Acceptance Criteria

1. THE Admin_App SHALL let an Admin_User who holds the settings:write Permission turn each Component_Switch on or off, and apply the change at the next Site_Build.
2. THE Admin_App SHALL let an Admin_User who holds the settings:write Permission create an Experiment on one Persuasion_Component with a name, the treatment Experiment_Variant, the share of Storefront_Sessions in the treatment (default 50%, allowed 10% to 90%) and the smallest relative change in Conversion rate to detect (default 20%, allowed 5% to 100%).
3. WHEN an Admin_User creates an Experiment, THE Admin_App SHALL show the number of Storefront_Sessions with an Exposure that each Experiment_Variant needs for 80% power at a 5% significance level, computed from the share of the last 28 days' Storefront_Sessions that reached the Order placed step, and the expected duration at the store's recent traffic.
4. IF an Admin_User starts an Experiment on a Persuasion_Component that already has a running Experiment, or starts a fourth running Experiment, THEN THE Admin_API SHALL reject the start with a message that states the rule.
5. WHILE an Experiment runs, THE Storefront SHALL assign each Storefront_Session whose Consent_Choice allows analytics to an Experiment_Variant at random, keep the assignment for the whole Storefront_Session, and apply the Experiment_Variant's design before the component first appears, so that the shopper never sees the other variant.
6. WHILE an Experiment runs, THE Storefront SHALL show the control to every Storefront_Session whose Consent_Choice refuses analytics, and count no such session in the Experiment.
7. THE Storefront SHALL record one Exposure per Storefront_Session and Experiment, when the changed page area first appears on screen.
8. THE Admin_App SHALL show for each Experiment_Variant the Storefront_Sessions with an Exposure, the Conversions, the Conversion rate and the revenue per exposed Storefront_Session, and for the treatment the difference in Conversion rate with its 95% confidence interval.
9. WHILE an Experiment_Variant has fewer Storefront_Sessions with an Exposure than criterion 3 requires, THE Admin_App SHALL show the Experiment as collecting data and show no winner.
10. WHEN both Experiment_Variants reach the Storefront_Sessions that criterion 3 requires, THE Admin_App SHALL show the treatment as better, worse or not clearly different, according to whether the 95% confidence interval of the difference lies above 0, lies below 0 or includes 0.
11. WHEN an Admin_User stops an Experiment, THE Backend SHALL end the assignments, keep the Experiment's results, and set the component's Component_Switch to the state that the Admin_User chooses.

### Requirement 20: Search engines and sharing

**User Story:** As a store owner, I want search engines and social apps to show my products correctly, so that shoppers find the store and click through.

#### Acceptance Criteria

1. THE Storefront SHALL give every page a unique title, a meta description built from the page's data, and a canonical URL.
2. THE Storefront SHALL mark search results pages, and PLPs with more than one applied filter value, as not to be indexed.
3. THE Storefront SHALL include on each PDP structured data of the Product type with the name, images, brand, SKU and an Offer whose price, currency and availability equal the page's built values, with the sale end time where a Price_List ends.
4. THE Storefront SHALL include rating structured data only for a product with at least 1 published review, built from the published reviews only.
5. THE Storefront SHALL include breadcrumb structured data on PLPs and PDPs, and organization structured data with the Client_Branding name, logo and contact on the home page.
6. WHEN a Site_Build runs, THE Site_Build SHALL generate the sitemap files, with the last change time of each page and the alternate-language URLs, and the robots file.
7. THE Storefront SHALL give every page Open Graph and Twitter card data with the page's title, description and main image.
8. WHEN a product's handle changes, THE Storefront SHALL redirect the old URL to the new URL with HTTP status 301.
9. THE Storefront SHALL show a not-found page with a search field and links to the top-level categories.

### Requirement 21: Security and abuse resistance

**User Story:** As a store owner, I want the Storefront to resist bots, script injection and data theft, so that shoppers, payments and store data stay safe.

#### Acceptance Criteria

1. THE Storefront SHALL serve every page with a Content-Security-Policy that allows scripts only from the Storefront's origin and, where needed, from Cloudflare Turnstile, Razorpay and the consented Marketing_Tags, with inline scripts allowed only by hash, and with `frame-ancestors 'none'`.
2. THE Storefront SHALL serve every response with Strict-Transport-Security (max-age of at least 31,536,000 seconds), `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.
3. THE Storefront SHALL show store and shopper content, such as product descriptions, reviews and Enquiry text, as plain text or as an allowlist of formatting (paragraphs, lists, bold, italic and links), with every other markup removed and every link marked `rel="nofollow noopener"`.
4. THE Storefront SHALL require a Bot_Check for guest Order placement, order access requests, Enquiries, Quotation requests, review submission, Back_In_Stock_Alert requests and newsletter sign-up.
5. THE Storefront SHALL send no price, discount or total to the Store_API other than the expected total of spec 1.
6. IF the Store_API rejects a request for a rate limit, THEN THE Storefront SHALL show when the shopper can try again and keep the shopper's input.
7. THE Storefront_Worker SHALL accept only GET and HEAD requests for page and Live_Data paths, fetch only from the Store_API, and reject every other method with HTTP status 405 and every other path with HTTP status 404.
8. THE Site_Build SHALL read the catalog through Public_Catalog_Read with the Supabase public key only, and THE Backend SHALL keep the Site_Build trigger URL as a Secret in Supabase Vault.

### Requirement 22: Backend and Admin_App additions

**User Story:** As a store owner, I want the backend parts and admin screens that the Storefront needs built to the same rules as specs 1 and 2, so that security, auditing and data quality stay the same.

#### Acceptance Criteria

1. THE Backend SHALL keep every new table of this spec in the Extension_Schema, leave every Medusa_Parity_Table unchanged and pass the Parity_Check of spec 1 with this spec's migrations applied.
2. THE Backend SHALL add the parts that this spec needs: the price history and Prior_Price of Requirement 10, Popularity_Counts and best-selling product reads that return only the bands of Requirement 11, Back_In_Stock_Alert requests, Consent_Choice records, Experiments with their assignments and results, Site_Build triggers and records, product handle history, product pairings, Key_Highlights and the Storefront settings of this spec.
3. THE Store_API SHALL reject a Cart quantity below a variant's minimum order quantity with an error that states the minimum.
4. THE Store_API SHALL return the Tax_Invoice of an Order, once the Backend has issued it, to the signed-in Registered_Customer who owns the Order or to a request with a valid Order_Access_Token for the Order.
5. THE Admin_App SHALL provide screens for the Business_Preset, Sections and PDP_Blocks, Component_Switches with their Component_Rationales, Experiments, the content of Requirement 16, Site_Builds and the Core_Web_Vitals of Requirement 3, and add product pairings, Key_Highlights, Mandatory_Declarations and the Business_Preset's product attributes to the product editor.
6. THE Admin_API SHALL check the settings:write Permission for every change of this spec's settings and Experiments, and the reports:read Permission for every read of Experiment results and Core_Web_Vitals.
7. WHEN a new Admin_API function of this spec changes data, THE Admin_API SHALL write an Audit_Log entry in the same transaction and follow spec 2's conventions for Idempotency_Keys and Edit_Conflicts.
8. THE Backend SHALL run each new recurring task of this spec, such as the Site_Build trigger, the Back_In_Stock_Alert sender and the Experiment result refresh, as a Scheduler job that writes a run record.

### Requirement 23: Legacy_Storefront cutover

**User Story:** As a store owner, I want a controlled switch from the Legacy_Storefront that keeps every old link working, so that shoppers and search rankings carry over without loss.

#### Acceptance Criteria

1. THE Storefront SHALL keep the Legacy_Storefront's URL paths for products, categories, subcategories, collections and policy pages, and redirect every other Legacy_Storefront page path with HTTP status 301 to its Storefront page.
2. WHEN an Admin_User who holds the owner Role opens the cutover screen, THE Admin_App SHALL show each readiness item as passed or failed: spec 1's Migration_Tool cutover is confirmed; the last Site_Build succeeded; every enabled Payment_Provider passes a Credential_Check; the Seller_Details, the Grievance_Officer, the privacy notice and the policies of Requirement 16 are set; and every Legacy_Storefront URL of a published record resolves on the Storefront.
3. IF an Admin_User confirms the Storefront_Cutover while any readiness item fails, THEN THE Admin_API SHALL reject the confirmation and name each failed item.
4. WHEN an Admin_User who holds the owner Role confirms the Storefront_Cutover with the Sensitive_Action re-authentication of spec 2, THE Admin_API SHALL record the confirmation with an Audit_Log entry.
5. WHILE the Storefront_Cutover is unconfirmed, THE Legacy_Storefront SHALL keep serving every storefront route with its current behavior.
6. WHILE the Storefront_Cutover is confirmed, THE Legacy_Storefront SHALL redirect every storefront route to the matching Storefront URL with HTTP status 301 and accept no new Order.
7. WHILE the Storefront_Cutover is confirmed, THE Legacy_Storefront's payment webhook route SHALL keep processing events for payments started before the cutover for 7 days.
