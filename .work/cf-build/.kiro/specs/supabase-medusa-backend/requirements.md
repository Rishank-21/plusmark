# Requirements Document

## Introduction

This spec defines the commerce backend for Plusmark and for every future client that deploys the same app. The backend runs entirely on Supabase: Postgres tables, Row Level Security (RLS), database functions, Edge Functions, scheduled jobs, Storage and Auth. The database mirrors the schema of one pinned Medusa v2 release, so a store can later move to Medusa Cloud by copying data instead of transforming data. Commerce logic is ported from Medusa's MIT-licensed core, adapted to Supabase, and corrected where Medusa's behavior allows abuse or data errors. The backend is generic: no part of the backend depends on Plusmark's product range, brand or Supabase project.

This is spec 1 of 4:

1. Spec 1 (this spec): backend schema, commerce logic, security and anti-abuse, admin roles and audit logging, legacy data migration, and deployability.
2. Spec 2: admin panel with reports, analytics, trends and predictions.
3. Spec 3: storefront redesign (mobile-first, sales psychology) on Cloudflare's free tier with a CDN.
4. Spec 4: multi-client provisioning tooling and a complete deployment guide.

This spec captures the data and provides the interfaces that specs 2, 3 and 4 need, so those specs require no backend rework.

## Glossary

- **Backend**: The Supabase-hosted commerce system this spec defines: database schema, RLS policies, database functions, triggers, Edge Functions, scheduled jobs, Storage buckets and Auth settings, all deployed from the repository.
- **Pinned_Medusa_Version**: The single stable Medusa v2 release whose database schema and core logic the Backend follows. The design names the exact version.
- **Commerce_Schema**: The Postgres tables, columns, data types, defaults and constraints that copy the database schema of the Pinned_Medusa_Version, including module tables and module link tables.
- **Medusa_Parity_Table**: Any table in the Commerce_Schema.
- **Extension_Schema**: Tables owned by this project for data with no Medusa equivalent, such as Roles, the Audit_Log, Inventory_Holds, Inventory_Movements, Analytics_Events, reviews, Quotations, Enquiries, Wishlists, rate-limit counters, idempotency records and migration mappings.
- **Parity_Check**: An automated check that compares the Commerce_Schema with a reference database created by the Pinned_Medusa_Version's own migrations.
- **Medusa_Issue_Register**: A repository document that lists every deliberate difference between Backend logic and Pinned_Medusa_Version logic, with the Medusa behavior, the problem, the fix and the test that proves the fix.
- **Store_API**: The Backend entry points (database functions exposed through the Supabase API, and Edge Functions) that storefront clients call with the public anon key or a Customer session.
- **Admin_API**: The Backend entry points that only Admin_Users can call.
- **Public_Catalog_Read**: An anonymous Store_API read of published catalog data (products, variants, prices, categories and collections).
- **Catalog_Change_Event**: A Backend record or message that identifies changed catalog records, used by the storefront to refresh cached pages.
- **Customer**: A person who buys from the store, stored as a customer record in the Commerce_Schema.
- **Registered_Customer**: A Customer with a Supabase Auth account.
- **Guest_Customer**: A Customer without a Supabase Auth account.
- **Customer_Group**: A named set of Customers that Price_Lists, Promotions and Shipping_Option rules can target, for example wholesale buyers.
- **Admin_User**: A Supabase Auth user linked to a Medusa user record and holding at least one Role.
- **Role**: A named set of Permissions, defined in the Extension_Schema by this project.
- **Permission**: The right to perform one action on one resource type, for example refunding a payment.
- **Audit_Log**: An append-only Extension_Schema table that records data changes made by Admin_Users, Scheduler jobs and Webhook_Handlers.
- **Security_Event**: A record of a request the Backend rejected for a security reason, such as a failed signature check, a permission denial, a rate-limit block or a failed Bot_Check.
- **Region**: A Medusa region: a set of countries that share a currency, tax settings and enabled payment and fulfillment providers.
- **Sales_Channel**: A Medusa sales channel, such as a web store or a wholesale portal, that controls which products and Stock_Locations apply.
- **Default_Sales_Channel**: The Sales_Channel that Store_Settings name as the store's default.
- **Price_Set**: The Medusa pricing record that holds a variant's prices per currency, Region and quantity tier.
- **Price_List**: A Medusa set of sale or override prices with optional dates and Customer_Group targeting.
- **Tax_Rate**: A Medusa tax rate attached to a tax region (country or province), optionally limited to products or product types.
- **Default_Tax_Region**: The tax region that Store_Settings name as a Region's default for tax.
- **Pricing_Engine**: The Backend component that selects a variant's price for a given context.
- **Tax_Calculator**: The Backend component that computes tax lines.
- **Totals_Calculator**: The Backend component that computes Cart and Order totals from prices, Promotions, shipping and taxes.
- **Inventory_Item**: A Medusa inventory item: a stock-keeping unit tracked per Stock_Location.
- **Stock_Location**: A Medusa stock location, such as a warehouse or a shop.
- **Available_Quantity**: For an Inventory_Item at a Stock_Location, the stocked quantity minus the reserved quantity minus the quantity in active Inventory_Holds.
- **Inventory_Service**: The Backend component that manages stock levels, Inventory_Holds and Reservations.
- **Inventory_Hold**: A temporary claim on stock for a Cart during payment, with an expiry time. Medusa has no equivalent, so Inventory_Holds live in the Extension_Schema.
- **Reservation**: A Medusa reservation item that claims stock for an Order line item.
- **Inventory_Movement**: An Extension_Schema record of one stock change, with quantity change, reason, actor and time.
- **Cart**: A Medusa cart with line items, addresses, shipping methods and applied Promotions.
- **Cart_Token**: A secret value with at least 128 bits of randomness that proves ownership of a Guest_Customer's Cart.
- **Guest_Cart**: A Cart linked to no Registered_Customer, which clients access with the Cart's Cart_Token.
- **Promotion**: A Medusa promotion, applied automatically or through a code.
- **Campaign**: A Medusa campaign that groups Promotions with start and end dates and a usage or spend budget.
- **Promotion_Engine**: The Backend component that evaluates, applies and counts Promotions.
- **Checkout_Service**: The Backend component that validates a Cart and turns the Cart into an Order.
- **Order**: A Medusa order with line items, adjustments, tax lines, shipping methods, payments and fulfillments.
- **Order_Access_Token**: A secret value with at least 128 bits of randomness that grants a Guest_Customer read access to one Order.
- **Order_Change**: A Medusa order change record for a cancellation, return, exchange, claim or order edit.
- **Return**: A Medusa return: a request to send back fulfilled items.
- **Idempotency_Key**: A unique key that a client sends with a request so that repeats of the request produce one result.
- **Payment_Collection**: The Medusa record that groups the payments for one Cart or Order.
- **Payment_Provider_Interface**: The contract every payment provider implements, modeled on the Pinned_Medusa_Version's payment provider contract.
- **Payment_Provider**: An implementation of the Payment_Provider_Interface, such as Razorpay or Cash_On_Delivery.
- **Cash_On_Delivery**: A Payment_Provider for Orders paid in cash at delivery (COD).
- **Webhook_Handler**: An Edge Function that receives event notifications from a Payment_Provider or another external service.
- **Shipping_Option**: A Medusa shipping option that a Customer can choose for a Cart.
- **Serviceability_Rule**: A data record that states, for a postal code or postal code range, whether delivery is available, whether Cash_On_Delivery is available, and the estimated delivery days.
- **Fulfillment_Service**: The Backend component that offers Shipping_Options and records fulfillments.
- **Fulfillment_Provider_Interface**: The contract every fulfillment provider implements, modeled on the Pinned_Medusa_Version's fulfillment provider contract.
- **Notification_Service**: The Backend component that sends messages to Customers and Admin_Users.
- **Notification_Provider_Interface**: The contract every notification provider (email, SMS, WhatsApp) implements, modeled on the Pinned_Medusa_Version's notification provider contract.
- **Analytics_Event**: An Extension_Schema record of one storefront or business activity, such as a product view or a placed Order.
- **Rate_Limiter**: The Backend component that counts requests per client identity and blocks requests above configured limits.
- **Bot_Check**: Server-side verification of a Cloudflare Turnstile token, or of a token from another configured challenge provider.
- **Secret**: A credential that grants privileged access, such as the Supabase service-role key, Payment_Provider API secrets and webhook signing secrets.
- **Scheduler**: The Supabase scheduled-job mechanism that runs Backend jobs at configured intervals.
- **Quotation**: An Extension_Schema record of a Customer's request for prices on given products and quantities, together with the store's priced response.
- **Enquiry**: An Extension_Schema record of a question that a visitor submits about a product or the store.
- **Wishlist**: An Extension_Schema list of saved products or variants owned by a Registered_Customer (the current "saved boards").
- **Legacy_Schema**: The existing Plusmark tables, such as profiles, addresses, saved_boards, orders, order_items and product_reviews, plus the current catalog, coupon, enquiry and quotation tables.
- **Migration_Tool**: The Backend tool that copies Legacy_Schema data into the Commerce_Schema and Extension_Schema.
- **Migration_Report**: The output of one Migration_Tool run, with record counts, failures and checksums.
- **Deployment_Config**: The per-client set of configuration values and Secrets that a deployment supplies, such as the Supabase project URL, keys, provider credentials and store settings.
- **Client_Project**: One client's Supabase project running the Backend.
- **Reference_Medusa_Installation**: A Medusa installation of the Pinned_Medusa_Version, with a database created by that release's own migrations, used only by the Parity_Check.
- **Export_Rehearsal**: The part of the Parity_Check that copies a sample store's Commerce_Schema data into the Reference_Medusa_Installation and compares what the Reference_Medusa_Installation returns with the copied data.
- **Raw_Amount_Field**: The column that the Pinned_Medusa_Version stores next to a monetary amount to hold the amount's exact decimal value and precision.
- **Store_Settings**: The configuration data of one store, such as store name, currencies, Regions, Sales_Channels, Stock_Locations, tax settings, providers per Region, timezone, enabled Optional_Features and configured limits.
- **Optional_Feature**: A feature that each store enables or disables in Store_Settings: guest checkout, Cash_On_Delivery, reviews, Quotations, Enquiries, Wishlists or customer self-service returns.
- **Store_Seed**: The Backend procedure that creates a new store's initial records from Deployment_Config values.
- **Calculated_Price**: The price that the Pricing_Engine selects for a variant in a pricing context after applicable Price_Lists.
- **Original_Price**: The price that the Pricing_Engine selects for a variant in the same pricing context while ignoring sale Price_Lists, used as the compare-at price.
- **Stock_Claim**: An Inventory_Hold or a Reservation.
- **Active_Inventory_Hold**: An Inventory_Hold that has not reached its expiry time, been released or been converted into a Reservation.
- **Cart_Hold_Time**: The total time during which a Cart has had at least one Active_Inventory_Hold, including time covered by replacement Inventory_Holds.
- **Sellable_Quantity**: For a variant in a Sales_Channel, the number of units that the Available_Quantity of the variant's linked Inventory_Items at the Stock_Locations serving that Sales_Channel can supply, given each Inventory_Item's required quantity per unit.
- **Stock_State**: The availability label that the Store_API reports for a variant: in stock (Sellable_Quantity above the configured low-stock threshold, or the variant does not manage inventory), low stock (Sellable_Quantity from 1 up to the threshold), out of stock (Sellable_Quantity 0 with backorders disallowed) or backorder (Sellable_Quantity 0 with backorders allowed).

## Assumptions

1. **Medusa version.** The Commerce_Schema mirrors the database schema of one pinned, latest stable Medusa v2 release. The design chooses the exact version. Medusa_Parity_Tables stay unmodified, so a future move to Medusa is a data copy, not a transformation.
2. **Licensing.** Medusa is open-core. The core is MIT-licensed, so core schema and logic may be copied and adapted if Medusa's copyright and license notice is kept. The Enterprise Edition materials listed in Medusa's ENTERPRISE-LICENSE.md, including RBAC, need a commercial agreement and are not copied. Admin Roles and Permissions are this project's own implementation. Sources: [Medusa repository README, License section](https://github.com/medusajs/medusa) and [Medusa Cloud vs self-hosting](https://medusajs.com/kb/build-vs-buy/medusa-cloud-vs-self-hosting). The design re-checks the license files of the Pinned_Medusa_Version before any material is copied.
3. **Runtime.** All business logic runs on Supabase (database functions, RLS, Edge Functions, scheduled jobs, Storage, Auth). No business logic runs in Next.js API routes. The Medusa Node.js server is not deployed; Medusa workflows are re-implemented on Supabase.
4. **Identity.** Supabase Auth is the identity provider for Customers and Admin_Users. Medusa's auth tables exist only for schema parity.
5. **Legacy data.** Existing Plusmark data (catalog, customers, addresses, orders, reviews, saved boards) moves into the new schema. Legacy_Schema tables stay until the migration is verified.
6. **Payments.** Payments use a provider interface modeled on Medusa's payment module. Launch providers are Razorpay (in use today) and Cash on Delivery. More providers can be added later.
7. **Extensions.** Features that Medusa core lacks (product reviews, Quotations, Enquiries, Wishlists) live in separate Extension_Schema tables.
8. **Coexistence.** The current storefront and admin, including the existing Razorpay route in `src/app/api/payments`, keep working against the Legacy_Schema until specs 2 and 3 move them to the Backend.
9. **Plusmark as a client.** Plusmark's current settings (INR, India Region, GST rates, pincode serviceability, Razorpay, Cloudflare Turnstile) become Plusmark's configuration data and seed, not Backend code.
10. **Out of scope.** Admin panel screens, reports, analytics and predictions (spec 2); storefront UI (spec 3); provisioning tooling and the deployment guide (spec 4).
11. **Owner decisions.** The owner confirmed these decisions:
    - Tax for a Cart without a shipping address, such as digital goods (Requirement 4): the billing address, else the Region's Default_Tax_Region.
    - Catalog reads without a Sales_Channel (Requirement 3): the Store_API uses the Default_Sales_Channel instead of rejecting the request.
    - Inventory_Hold time cap (Requirement 5): a Cart whose Cart_Hold_Time exceeds a configured maximum (default 60 minutes) gets no further Inventory_Holds, so bots cannot hold limited stock indefinitely.
    - Cart merge at sign-in (Requirement 7): a Guest_Cart merges into the Registered_Customer's active Cart within the quantity, line-item and stock limits, then closes.
    - COD refusals (Requirement 10): a configured number of refused deliveries (default 2) ends Cash_On_Delivery for that Customer until an authorized Admin_User re-enables Cash_On_Delivery.
    - Promotion code errors (Requirement 8): one generic error for invalid codes, a specific error for unmet rules on valid codes, and one rate limit for both.

## Requirements

### Requirement 1: Medusa v2 schema parity, version pinning and license attribution

**User Story:** As a store owner, I want the database to match a pinned Medusa v2 release exactly, so that I can move my store to Medusa Cloud later by copying data.

#### Acceptance Criteria

1. THE Backend SHALL record the Pinned_Medusa_Version's release number and source commit in the repository.
2. THE Commerce_Schema SHALL contain every table, column, data type, default, nullability rule, constraint and unique index that the Pinned_Medusa_Version's migrations create for the release's modules and module links.
3. THE Backend SHALL limit changes to Medusa_Parity_Tables to added RLS policies, grants, triggers, indexes and check constraints.
4. THE Backend SHALL write each value in a Medusa_Parity_Table column in the format that the Pinned_Medusa_Version writes to that column, including identifier prefixes, timestamp precision and status values.
5. THE Backend SHALL write each monetary amount in a Medusa_Parity_Table together with the amount's Raw_Amount_Field, with both fields holding the same value.
6. WHEN the Backend deletes a record of an entity that the Pinned_Medusa_Version soft-deletes, THE Backend SHALL set the record's deletion timestamp and keep the row.
7. THE Backend SHALL store each relation between records of different Medusa modules as a row in the module link table that the Pinned_Medusa_Version uses for that relation.
8. THE Parity_Check SHALL build the Reference_Medusa_Installation from the release number and source commit recorded in the repository.
9. WHEN the Parity_Check runs, THE Parity_Check SHALL report every difference between the Commerce_Schema and the Reference_Medusa_Installation's database, with the table, the database object, and the expected and actual definitions.
10. IF the Parity_Check finds a difference in tables, columns, data types, defaults, nullability rules, unique indexes or Medusa-defined constraints, THEN THE Parity_Check SHALL fail.
11. IF the Parity_Check cannot build the Reference_Medusa_Installation, THEN THE Parity_Check SHALL fail with an error that names the failed step.
12. THE Parity_Check SHALL include an Export_Rehearsal that copies a sample store, with at least one row in each Medusa_Parity_Table that the Backend writes, into the Reference_Medusa_Installation.
13. IF, during the Export_Rehearsal, the Reference_Medusa_Installation's store or admin API omits a copied product, Customer, Cart or Order, or returns a field value or total that differs from the Backend's data, THEN THE Parity_Check SHALL fail and name the record.
14. THE Totals_Calculator SHALL produce, for each Cart and Order, the unit prices, tax lines, promotion adjustments and totals that the Pinned_Medusa_Version produces from the same inputs, except for differences listed in the Medusa_Issue_Register.
15. THE Backend SHALL take copied or adapted Medusa material only from files that the Pinned_Medusa_Version's source commit licenses under the MIT license.
16. THE Backend SHALL keep Medusa's copyright and license notice in each file that contains copied or adapted Medusa material.
17. THE Backend SHALL include a repository NOTICE file with Medusa's copyright and license notice and a list of the Medusa source files that the Backend copies or adapts.

### Requirement 2: Store configuration for any business type

**User Story:** As a business owner in any industry, I want to configure currencies, regions, sales channels and product structures as data, so that the same backend fits my business without code changes.

#### Acceptance Criteria

1. THE Backend SHALL store all Store_Settings as data, including store name, currencies, Regions and countries, Sales_Channels, Stock_Locations, tax settings, Payment_Providers and fulfillment providers per Region, store timezone and enabled Optional_Features.
2. THE Backend SHALL let one store hold multiple currencies, Regions, Sales_Channels and Stock_Locations at the same time.
3. IF an Admin_User assigns a country to a Region while the country belongs to another Region of the store, THEN THE Backend SHALL reject the change and name the country.
4. IF an Admin_User removes a currency from the store while a Region uses that currency, THEN THE Backend SHALL reject the removal and name the Region.
5. THE Backend SHALL let Admin_Users create product types as data, with no schema change.
6. THE Backend SHALL let Admin_Users define product options and option values per product as data, with no schema change.
7. WHEN a client requests order placement for a Cart in which every line item's variant requires no shipping, THE Checkout_Service SHALL place the Order without a shipping address and without a shipping method.
8. IF a client calls a Store_API action of an Optional_Feature that is disabled, THEN THE Store_API SHALL reject the request with a feature-disabled error.
9. WHEN an Admin_User disables an Optional_Feature, THE Backend SHALL keep the feature's existing records unchanged.
10. WHEN an Admin_User saves a Store_Settings value, THE Backend SHALL apply the new value to every Store_API and Admin_API request received after the save, without a redeploy.
11. IF an Admin_User saves a Store_Settings value that fails the setting's declared type, allowed values or range, THEN THE Backend SHALL reject the save with a field-level error and keep the previous value.
12. THE Backend SHALL read business-specific values (store name, currencies, tax rates, countries, postal code rules and brand text) only from configuration data, keeping migrations, database functions and Edge Function code free of those values.
13. THE Store_Seed SHALL create, from Deployment_Config values, a store with one Region, one currency, one Sales_Channel, one Stock_Location, one Shipping_Option, the enabled Payment_Providers and an invitation for the first owner Admin_User.
14. WHEN an Admin_User adds a published product with stock to a store that the Store_Seed created, THE Store_API SHALL let a client place an Order for that product with no further store configuration.
15. WHEN the Store_Seed runs against a store that the Store_Seed already seeded, THE Store_Seed SHALL leave the existing records unchanged and create no duplicate records.
16. IF the Store_Seed fails before completion, THEN THE Store_Seed SHALL leave no records from the failed run in the database.
17. IF a person presents an owner invitation that was already accepted or was issued more than a configured validity period ago (default 72 hours), THEN THE Backend SHALL reject the invitation.

### Requirement 3: Catalog and media

**User Story:** As a store owner, I want to manage products with variants, categories, collections and images, and have shoppers read the catalog from a CDN cache, so that pages load fast and server work stays within free-tier limits.

#### Acceptance Criteria

1. THE Backend SHALL store products, variants, product options and option values, images, nested categories, collections, tags and product types in the Commerce_Schema.
2. IF an Admin_User sets a category's parent to the category itself or to one of the category's descendants, THEN THE Backend SHALL reject the change.
3. IF an Admin_User saves a variant whose option values match the option values of another variant of the same product, THEN THE Backend SHALL reject the variant.
4. THE Store_API SHALL return only products that have status published and are linked to the Sales_Channel named in the request.
5. THE Store_API SHALL return only categories that are active and not internal.
6. WHEN a Public_Catalog_Read omits the Sales_Channel, THE Store_API SHALL serve the request as if the request named the Default_Sales_Channel.
7. IF a Public_Catalog_Read names a Sales_Channel, Region or currency that is not enabled in the store, THEN THE Store_API SHALL reject the request with an error that names the parameter.
8. THE Store_API SHALL return only the product and variant fields on a declared public field list, including when a request asks for other fields or relations, so that cost data, internal notes and admin-only metadata stay out of Store_API responses.
9. THE Store_API SHALL serve each Public_Catalog_Read with or without a session, with the response determined only by the request parameters (Sales_Channel, Region, currency, query, filters, sort and page) and the catalog data, so that a CDN can cache each response by URL.
10. THE Store_API SHALL return Customer_Group-specific prices only in responses to requests with a Registered_Customer session, marked as not cacheable by shared caches.
11. WHEN a change adds, alters or removes a product, variant, price, category or collection that Public_Catalog_Reads return or returned, including unpublishing, deletion and removal from a Sales_Channel, THE Backend SHALL emit a Catalog_Change_Event that identifies the affected records within 60 seconds of the change.
12. WHEN a client searches or filters the catalog by text, category, collection, tag, product type, option value or price range (compared with the Calculated_Price in the request's currency), THE Store_API SHALL return, in pages, the published products that match every given filter.
13. WHEN the Store_API returns a search or filter result, THE Store_API SHALL include the filter values available across all pages of the result set.
14. THE Backend SHALL store product attributes that have no Medusa column, such as specification fields, as data linked to the product, without adding columns to Medusa_Parity_Tables.
15. IF the content of an uploaded media file is not a JPEG, PNG, WebP or AVIF image, whatever the file name or declared type, THEN THE Backend SHALL reject the upload with an unsupported-file-type error.
16. IF an uploaded media file exceeds a configured maximum size (default 10 MB), THEN THE Backend SHALL reject the upload with a file-too-large error.

### Requirement 4: Pricing and tax

**User Story:** As a store owner, I want prices, discounts and taxes computed by the server for each region and currency, so that customers pay the correct amount and no client can change a price.

#### Acceptance Criteria

1. THE Pricing_Engine SHALL hold each variant's prices in a Price_Set, with amounts per currency, optional Region rules and optional quantity tiers.
2. THE Pricing_Engine SHALL hold Price_Lists of type sale or override, each with optional start and end dates and optional Customer_Group targeting.
3. WHEN the Backend needs a variant price for a context of currency, Region, Customer_Group, quantity and time, THE Pricing_Engine SHALL select the price by the price selection rules of the Pinned_Medusa_Version.
4. IF no price in a variant's Price_Set matches the pricing context, THEN THE Pricing_Engine SHALL report the variant as unpriced instead of returning an amount of zero.
5. IF a client adds to a Cart a variant that is unpriced for the Cart's pricing context, THEN THE Store_API SHALL reject the line item and name the variant.
6. THE Store_API SHALL return the Original_Price and the Calculated_Price of each variant, so that a storefront can show a compare-at price.
7. THE Totals_Calculator SHALL compute line item subtotals, discounts, taxes, shipping amounts and totals on the server from stored prices, Promotions, Shipping_Options and Tax_Rates.
8. IF a client request contains a price, discount, tax amount or total, THEN THE Store_API SHALL discard that value and use the server-computed value.
9. THE Totals_Calculator SHALL compute amounts with exact decimal arithmetic.
10. THE Totals_Calculator SHALL round amounts to the minor unit of the Cart's or Order's currency (the number of decimal digits that ISO 4217 defines for the currency) at the rounding steps that the design defines.
11. THE Totals_Calculator SHALL produce rounded line item, shipping, discount and tax totals that add up exactly to the Cart or Order total.
12. THE Tax_Calculator SHALL compute tax lines for each line item from the Tax_Rates of the shipping address's country and province, including Tax_Rates limited to the line item's product or product type.
13. THE Tax_Calculator SHALL compute tax lines for each shipping method from the Tax_Rates of the shipping address's country and province.
14. WHILE a Cart has a billing address and no shipping address, THE Tax_Calculator SHALL compute the Cart's tax lines from the Tax_Rates of the billing address's country and province, including Tax_Rates limited to a line item's product or product type.
15. WHILE a Cart has neither a shipping address nor a billing address, THE Tax_Calculator SHALL compute the Cart's tax lines from the Tax_Rates of the Default_Tax_Region of the Cart's Region, including Tax_Rates limited to a line item's product or product type.
16. IF the country of the shipping address or billing address that the Tax_Calculator uses for a Cart has no tax region, THEN THE Checkout_Service SHALL reject order placement with a tax-configuration error that names the country.
17. WHERE prices are tax-inclusive for a currency or Region, THE Totals_Calculator SHALL derive each line item's tax from the tax-inclusive price, so that the line item's total before discounts equals the tax-inclusive unit price multiplied by the quantity.

### Requirement 5: Inventory, stock locations and reservations

**User Story:** As a store owner, I want stock tracked per location and claimed safely during checkout, so that the store sells no more units than it has in stock.

#### Acceptance Criteria

1. THE Inventory_Service SHALL track stocked, reserved and incoming quantities per Inventory_Item per Stock_Location.
2. THE Inventory_Service SHALL link each variant that manages inventory to one or more Inventory_Items, each with a required quantity per unit sold, so that one bundle variant can draw on several Inventory_Items.
3. IF a variant manages inventory and has no linked Inventory_Item, THEN THE Inventory_Service SHALL report a Sellable_Quantity of zero for the variant.
4. WHEN the Store_API initiates payment for a Cart, THE Inventory_Service SHALL create an Inventory_Hold for each line item whose variant manages inventory, with an expiry time a configured hold period (default 15 minutes) after creation.
5. WHEN the Store_API initiates payment for a Cart that already has Active_Inventory_Holds, THE Inventory_Service SHALL replace those Active_Inventory_Holds, so that each line item has at most one Active_Inventory_Hold.
6. IF a Cart's Cart_Hold_Time exceeds a configured maximum (default 60 minutes), THEN THE Inventory_Service SHALL reject further Inventory_Holds for that Cart.
7. IF the requested quantity of a variant that disallows backorders exceeds the variant's Sellable_Quantity in the Cart's Sales_Channel, THEN THE Inventory_Service SHALL reject the Stock_Claim and report the variant and the Sellable_Quantity.
8. IF the Inventory_Service rejects the Inventory_Hold of any line item in a Cart, THEN THE Inventory_Service SHALL create no Inventory_Holds for that Cart.
9. WHEN concurrent Stock_Claims target the same Inventory_Item, THE Inventory_Service SHALL accept only the claims that keep the reserved quantity plus the quantity in Active_Inventory_Holds at or below the stocked quantity at each Stock_Location, for variants that disallow backorders.
10. WHEN an Order is placed, THE Inventory_Service SHALL convert the Cart's Active_Inventory_Holds into Reservations for the Order's line items within the order placement transaction.
11. WHEN an Inventory_Hold reaches the hold's expiry time without an Order, THE Inventory_Service SHALL release the Inventory_Hold, so that the hold's quantity counts toward Available_Quantity from the expiry time onward.
12. THE Inventory_Service SHALL record every stock change (manual adjustment, Inventory_Hold, Reservation, release, fulfillment, return restock and data import) as an Inventory_Movement, so that each Inventory_Item's stocked quantity at a Stock_Location equals the sum of the stocked-quantity changes in the Inventory_Item's Inventory_Movements at that Stock_Location.
13. IF a manual adjustment would set an Inventory_Item's stocked quantity at a Stock_Location below zero, THEN THE Inventory_Service SHALL reject the adjustment.
14. THE Store_API SHALL report each variant's availability as a Stock_State.
15. THE Store_API SHALL include a variant's exact Sellable_Quantity only when the Sellable_Quantity is at or below a configured low-stock threshold (default 5).
16. WHEN a stock change alters the Stock_State or the reported Sellable_Quantity of a variant, THE Inventory_Service SHALL emit a Catalog_Change_Event for the variant within 60 seconds of the change.

### Requirement 6: Customers, authentication and guest checkout

**User Story:** As a shopper, I want to buy as a guest or with an account and manage my addresses, so that I can check out the way I prefer while my data stays private.

#### Acceptance Criteria

1. WHEN a person signs up through Supabase Auth, THE Backend SHALL create a Customer record marked as having an account and link the Auth user to that Customer without adding columns to Medusa_Parity_Tables.
2. WHERE guest checkout is enabled, THE Store_API SHALL let a Guest_Customer place an Order with an email address, a phone number and addresses, without a Supabase Auth account.
3. WHEN a Guest_Customer places an Order, THE Backend SHALL issue an Order_Access_Token that grants read access to that Order only and expires after a configured period (default 90 days).
4. WHEN a Guest_Customer requests access to an Order by display number and email address, THE Backend SHALL send a one-time code to the Order's email address and grant access only after the code is verified.
5. WHEN a Registered_Customer verifies ownership of an email address, THE Backend SHALL link earlier Guest_Customer Orders placed with that email address to the Registered_Customer.
6. THE Store_API SHALL let each Registered_Customer create, read, update and delete addresses owned by that Registered_Customer, after validating required fields, the country against the Region's countries, and the postal code format of the country.
7. THE Backend SHALL support Customer_Groups that Price_Lists, Promotions and Shipping_Option rules can target.
8. WHEN a Registered_Customer requests account deletion, THE Backend SHALL erase or anonymize the Customer's personal data within 30 days, keeping only the Order data that the configured legal retention rules require.

### Requirement 7: Cart and abandoned-cart tracking

**User Story:** As a store owner, I want carts priced by the server and abandoned carts recorded, so that customers see correct totals and I can measure and recover lost sales.

#### Acceptance Criteria

1. THE Store_API SHALL let a client create a Cart for a Region and Sales_Channel, and add, update or remove line items by variant ID and quantity.
2. WHEN a Cart's line items, addresses, shipping method or Promotions change, THE Totals_Calculator SHALL recompute unit prices, adjustments, taxes and totals on the server before the Store_API returns the Cart.
3. IF a requested quantity is not a positive integer, exceeds the configured maximum quantity for the variant (default 100), or would raise the Cart above the configured maximum number of line items (default 50), THEN THE Store_API SHALL reject the change.
4. THE Store_API SHALL permit reads and changes of a Cart only by the Registered_Customer linked to the Cart or by a client holding the Cart's Cart_Token.
5. WHEN a Guest_Customer holding the Cart_Token of an active Guest_Cart signs in as a Registered_Customer who has no active Cart, THE Backend SHALL attach the Guest_Cart to the Registered_Customer.
6. WHEN a Guest_Customer holding the Cart_Token of an active Guest_Cart signs in as a Registered_Customer who already has an active Cart, THE Backend SHALL merge the Guest_Cart into the Registered_Customer's active Cart.
7. WHEN the Backend merges a Guest_Cart into a Registered_Customer's Cart, THE Backend SHALL add each Guest_Cart line item to the Registered_Customer's Cart, combining line items for the same variant into one line item with the sum of both quantities.
8. IF adding a Guest_Cart line item's quantity would raise the variant's quantity in the Registered_Customer's Cart above the configured maximum quantity for the variant (default 100), THEN THE Backend SHALL add only the part of the quantity that stays within that maximum.
9. IF the variant of a Guest_Cart line item disallows backorders and adding the line item's quantity would raise the variant's quantity in the Registered_Customer's Cart above the variant's Sellable_Quantity in that Cart's Sales_Channel, THEN THE Backend SHALL add only the part of the quantity that stays within the Sellable_Quantity.
10. IF adding a Guest_Cart line item as a new line item would raise the Registered_Customer's Cart above the configured maximum number of line items (default 50), THEN THE Backend SHALL leave that Guest_Cart line item out of the merge.
11. WHEN the Backend leaves out all or part of a Guest_Cart line item's quantity during a merge, THE Backend SHALL report the variant and the left-out quantity to the client.
12. WHEN the Backend merges a Guest_Cart into a Registered_Customer's Cart, THE Backend SHALL mark the Guest_Cart closed.
13. WHEN the Backend merges a Guest_Cart into a Registered_Customer's Cart, THE Backend SHALL revoke the Guest_Cart's Cart_Token.
14. WHEN a Cart with at least one line item and a known email address or Customer has no activity for a configured period (default 60 minutes) and has no Order, THE Backend SHALL mark the Cart abandoned and record the abandonment time, the Cart total and the last checkout step reached.
15. WHEN an abandoned Cart later produces an Order, THE Backend SHALL mark the Cart recovered and record the recovery time.
16. WHEN a Cart has no activity for a configured period (default 30 days), THE Backend SHALL mark the Cart expired and release the Cart's Inventory_Holds, keeping the Cart data for the configured retention period.

### Requirement 8: Promotions and coupon abuse prevention

**User Story:** As a store owner, I want flexible promotions that resist abuse, so that discounts drive sales without losing money to coupon fraud.

#### Acceptance Criteria

1. THE Promotion_Engine SHALL support the Pinned_Medusa_Version's promotion model: standard and buy-get Promotions, automatic and code-based application, percentage and fixed values, item, shipping and order targets, rules, and Campaigns with dates and budgets.
2. WHEN a Cart changes, THE Promotion_Engine SHALL re-evaluate each applied Promotion and remove any Promotion whose rules, dates or budget the Cart no longer satisfies.
3. THE Promotion_Engine SHALL limit discounts so that each line item, shipping method and Cart total stays at or above zero.
4. WHEN concurrent Orders use the same Promotion, THE Promotion_Engine SHALL record usage atomically so that usage count and spend stay within the Campaign budget and the Promotion's usage limit.
5. WHERE a Promotion has a per-customer usage limit, THE Promotion_Engine SHALL count prior uses across the Customer ID, the normalized email address and the normalized phone number of the Cart, so that guest checkouts with the same email address or phone number count toward the same limit.
6. THE Promotion_Engine SHALL apply code-based Promotions according to configured stacking rules: a combinable or exclusive setting per Promotion, and a maximum number of codes per Cart (default 1).
7. IF a client submits a promotion code that is unknown, expired, inactive or exhausted (the Promotion's usage limit or Campaign budget reached), THEN THE Store_API SHALL reject the code with the same generic invalid-code error in each case.
8. IF a client submits a valid promotion code whose rules the Cart does not satisfy, THEN THE Store_API SHALL reject the code with an error that names the unmet rule, including the minimum Cart value and the amount still needed when the unmet rule is a minimum Cart value.
9. IF a client submits more rejected promotion codes (invalid codes and valid codes with unmet rules) than the configured limit (default 5 within 10 minutes) for one Cart, Customer or client fingerprint, THEN THE Rate_Limiter SHALL block code entry for that Cart, Customer or fingerprint for a configured cooldown (default 30 minutes).
10. WHEN an Order that used a Promotion is canceled, THE Promotion_Engine SHALL restore the usage count and budget spend consumed by that Order.

### Requirement 9: Checkout and order placement

**User Story:** As a shopper, I want order placement to succeed exactly once with the totals I confirmed, so that I am charged once, for the amount I saw.

#### Acceptance Criteria

1. WHEN a client requests order placement for a Cart, THE Checkout_Service SHALL verify that the Cart has an email address, the required addresses, a valid shipping method for each item that requires shipping, available stock, valid Promotions, and an authorized payment or an eligible Cash_On_Delivery selection.
2. THE Checkout_Service SHALL create the Order with line items, adjustments, tax lines, shipping methods, Reservations, promotion usage and payment links in one database transaction, so that a failure leaves no partial Order.
3. WHEN the Checkout_Service receives a repeat placement request with the same Idempotency_Key, or for a Cart that already produced an Order, THE Checkout_Service SHALL return the existing Order and create no second Order.
4. IF the totals computed at placement differ from the totals the client confirmed, THEN THE Checkout_Service SHALL reject the placement and return the current totals for confirmation.
5. WHEN an Order is placed, THE Checkout_Service SHALL store snapshots of product titles, variant titles, SKUs, unit prices, tax rates, addresses and promotion details on the Order, so that later catalog changes leave the Order unchanged.
6. THE Backend SHALL use the Order, payment and fulfillment status values of the Pinned_Medusa_Version and permit only the status transitions in the design's order state machine.
7. THE Backend SHALL assign each Order a human-readable display number that grants no access to the Order without an owner session or an Order_Access_Token.
8. IF a payment succeeds for a Cart whose items can no longer be reserved, THEN THE Checkout_Service SHALL refund the payment in full or accept the Order as a backorder, according to the configured policy, and notify the Customer and Admin_Users.

### Requirement 10: Payments

**User Story:** As a store owner, I want payments handled through a provider interface with verified confirmations, so that orders are marked paid only when money was received and new providers can be added later.

#### Acceptance Criteria

1. THE Backend SHALL process payments through the Payment_Provider_Interface, which covers initiate, authorize, capture, refund, cancel, status retrieval and webhook event parsing.
2. THE Backend SHALL provide a Razorpay Payment_Provider and a Cash_On_Delivery Payment_Provider at launch, each enabled per Region through configuration.
3. WHEN the Backend initiates a provider payment, THE Backend SHALL take the amount and currency from the server-computed Payment_Collection and convert the amount to the provider's minor unit without changing the total.
4. WHEN a client reports a completed payment, THE Backend SHALL confirm the payment status, amount, currency and provider order reference with the Payment_Provider before marking the Payment_Collection authorized or captured.
5. IF the signature on a webhook request fails verification against the raw request body, THEN THE Webhook_Handler SHALL reject the request with HTTP status 401 and leave all data unchanged.
6. WHEN the Webhook_Handler receives an event whose provider event ID was already processed, THE Webhook_Handler SHALL return a success response without processing the event again.
7. THE Backend SHALL perform each capture and refund at the Payment_Provider at most once per request, including when the request is retried.
8. WHERE Cash_On_Delivery is enabled, THE Backend SHALL offer Cash_On_Delivery only for Carts that meet the configured COD rules (maximum order value, serviceable postal codes, Customer eligibility and optional phone one-time-code verification).
9. THE Admin_API SHALL let an Admin_User record a Cash_On_Delivery Order as refused at delivery.
10. WHEN the Cash_On_Delivery Orders recorded as refused at delivery for a Customer reach a configured number (default 2), counted across the Customer ID, the normalized email address and the normalized phone number, THE Backend SHALL stop offering Cash_On_Delivery for every Cart whose Customer ID, normalized email address or normalized phone number matches that Customer.
11. THE Admin_API SHALL let an Admin_User holding the required Permission re-enable Cash_On_Delivery for a Customer whose refused Cash_On_Delivery Orders reached the configured number.

### Requirement 11: Fulfillment and shipping

**User Story:** As a shopper, I want to see which shipping options and delivery times apply to my address, so that I know whether and when my order can arrive.

#### Acceptance Criteria

1. THE Backend SHALL model shipping with the Pinned_Medusa_Version's fulfillment data: fulfillment sets, service zones, geo zones, shipping profiles, Shipping_Options and Shipping_Option rules.
2. WHEN a client requests shipping options for a Cart, THE Fulfillment_Service SHALL return only Shipping_Options whose service zones cover the Cart's shipping address and whose rules the Cart meets, with prices computed on the server.
3. THE Fulfillment_Service SHALL support flat-rate, order-value-threshold and provider-calculated Shipping_Option prices.
4. WHEN a client checks a postal code, THE Fulfillment_Service SHALL return serviceability, Cash_On_Delivery availability and estimated delivery days from the Serviceability_Rules.
5. IF a Cart's shipping address is not serviceable for an item that requires shipping, THEN THE Checkout_Service SHALL reject order placement with a non-serviceable error that names the affected items.
6. THE Backend SHALL create shipments through the Fulfillment_Provider_Interface, with a manual fulfillment provider at launch.
7. WHEN an Admin_User creates a fulfillment, marks a shipment shipped or marks a shipment delivered, THE Fulfillment_Service SHALL update the Order's fulfillment status, store the tracking details and emit the matching order event.
8. IF a fulfillment quantity exceeds the unfulfilled quantity of a line item, THEN THE Fulfillment_Service SHALL reject the fulfillment.

### Requirement 12: Order changes, cancellations, returns, exchanges and refunds

**User Story:** As a store owner, I want cancellations, returns, exchanges and refunds recorded as order changes with server-computed amounts, so that order history stays accurate and refunds stay within what was paid.

#### Acceptance Criteria

1. THE Backend SHALL record cancellations, returns, exchanges, claims and order edits as Order_Changes in the Pinned_Medusa_Version's order change tables, keeping the original Order lines and versions.
2. WHEN an Order without fulfillments is canceled by an Admin_User, or by the Customer within the configured cancellation window, THE Backend SHALL release the Order's Reservations, void uncaptured payments and refund captured payments.
3. WHERE customer self-service returns are enabled, WHEN a Customer requests a Return within the configured return window, THE Backend SHALL create a requested Return for the selected fulfilled items with a return reason.
4. IF a Return, exchange or claim covers more than the fulfilled and not yet returned quantity of a line item, THEN THE Backend SHALL reject the request.
5. WHEN an Admin_User receives a Return, THE Backend SHALL restock the items marked resaleable at the chosen Stock_Location and record Inventory_Movements.
6. WHEN an exchange or order edit changes the Order total, THE Backend SHALL compute the difference on the server and create a payment request for an increase or a refund for a decrease.
7. THE Backend SHALL cap the total refunds on an Order at the amount captured for that Order.
8. WHEN a refund is created, THE Backend SHALL require a refund reason and link the refund to the Order_Change, cancellation or manual refund note that caused the refund.

### Requirement 13: Admin users, roles, permissions and audit logging

**User Story:** As a store owner, I want to give each staff member only the permissions their job needs and see who changed what, so that mistakes and insider abuse are limited and traceable.

#### Acceptance Criteria

1. THE Admin_API SHALL serve requests only from sessions of active Admin_Users who hold at least one Role and have completed multi-factor authentication.
2. THE Backend SHALL implement Roles and Permissions as this project's own design in the Extension_Schema, using no code, schema or documentation from Medusa's Enterprise Edition.
3. THE Backend SHALL check the caller's Permissions inside every Admin_API function and every RLS policy that grants Admin_User access, before the action runs.
4. THE Backend SHALL provide predefined Roles (owner, manager, catalog editor, order manager, support agent and read-only analyst) and custom Roles that owners build from the Permission list.
5. IF a change would leave the store without an active Admin_User holding the owner Role, THEN THE Backend SHALL reject the change.
6. IF an Admin_User calls an Admin_API action without the required Permission, THEN THE Admin_API SHALL reject the call with a permission error and record a Security_Event.
7. WHEN an Admin_User, a Scheduler job or a Webhook_Handler changes data, THE Backend SHALL write an Audit_Log entry with the actor, action, target record, changed fields with old and new values, time and request ID.
8. IF any API role attempts to update or delete an Audit_Log entry, THEN THE Backend SHALL reject the attempt, including for Admin_Users holding the owner Role.

### Requirement 14: Platform-wide anti-abuse and data-access security

**User Story:** As a store owner, I want every table and endpoint protected against unauthorized access, scraping, bots and tampering, so that customer data and revenue stay safe.

#### Acceptance Criteria

1. THE Backend SHALL enable RLS on every table in every schema exposed through the Supabase API, with policies that grant each database role only the rows and operations listed in the design's access matrix.
2. IF a client using the anon or authenticated database role attempts a direct insert, update or delete on a Commerce_Schema table, THEN THE Backend SHALL reject the operation.
3. IF a client requests a Customer-owned record (Cart, Order, address, payment, Return, Quotation or Wishlist) without proof of ownership through a Customer session, Cart_Token or Order_Access_Token, THEN THE Store_API SHALL return the same not-found response as for a nonexistent record.
4. IF a client exceeds a configured rate limit for a Store_API action, THEN THE Rate_Limiter SHALL reject further requests for that action with HTTP status 429 and a retry-after time until the limit window ends.
5. WHEN a client submits an action listed for Bot_Check in configuration (default: sign-up, sign-in, password reset, guest order placement, Enquiry, Quotation request and review submission), THE Backend SHALL verify the Bot_Check token on the server before processing the action.
6. THE Backend SHALL validate every Store_API and Admin_API input against a declared schema of types, lengths, ranges, formats, allowed values and page-size limits (default maximum 100 records per page), and reject invalid input with field-level errors.
7. THE Backend SHALL keep Secrets only in server-side secret storage, so that clients need only the Supabase project URL and anon key.
8. WHEN the Backend rejects a request for a security reason, THE Backend SHALL record a Security_Event with the event type, the actor or a hashed client identifier, and the time, with Secrets, passwords, one-time codes and access tokens removed.

### Requirement 15: Notifications through a provider interface

**User Story:** As a customer, I want messages when my order's status changes, so that I know the status without contacting support.

#### Acceptance Criteria

1. THE Notification_Service SHALL send messages through the Notification_Provider_Interface, with at least one email provider at launch and SMS or WhatsApp providers added through the same interface.
2. WHEN a business event that the configuration maps to a message occurs (for example Order placed, payment failed, shipment sent, refund issued or low stock), THE Notification_Service SHALL send that message to the mapped Customer or Admin_User recipients.
3. WHEN an event triggers a message, THE Backend SHALL queue the message, so that order placement and status changes complete independently of Notification_Provider availability.
4. THE Notification_Service SHALL send each event's message at most once per recipient and channel, using an idempotency key derived from the event.
5. IF a Notification_Provider call fails, THEN THE Notification_Service SHALL retry with exponential backoff up to a configured number of attempts (default 5) and then mark the message failed.
6. THE Notification_Service SHALL record each message's recipient, channel, template, status and provider reference in the Pinned_Medusa_Version's notification table.
7. THE Notification_Service SHALL render message templates with store branding and text from configuration data, so that each client sends branded messages without code changes.
8. WHERE abandoned-cart reminders or other marketing messages are enabled, THE Notification_Service SHALL send marketing messages only to recipients with recorded consent, with an unsubscribe link in each message.

### Requirement 16: Analytics-ready data capture

**User Story:** As a store owner, I want the backend to capture sales, cart, inventory, promotion and customer activity data from day one, so that the admin panel in spec 2 can show reports, trends and predictions.

#### Acceptance Criteria

1. THE Backend SHALL record Analytics_Events for product views, searches, cart additions and removals, checkout steps, promotion code attempts, Order placement, payment outcomes, cancellations, Returns and refunds, each with time, session ID, Customer ID when known, Sales_Channel, Region and related record IDs.
2. THE Backend SHALL generate Analytics_Events for Orders, payments, refunds, Inventory_Movements and promotion usage from server-side data changes, so that revenue and stock reports depend only on server-verified data.
3. WHEN a client submits an Analytics_Event, THE Store_API SHALL accept only allow-listed event types with schema-valid payloads, within a per-session rate limit.
4. WHEN a session starts with campaign parameters (UTM source, medium and campaign) or a referrer, THE Backend SHALL store the attribution on the session's Cart and on the resulting Order.
5. THE Backend SHALL keep Orders, Carts (including abandoned and expired Carts), Inventory_Movements, promotion usage records and Analytics_Events for the retention periods set in configuration.
6. THE Backend SHALL store Analytics_Events with pseudonymous session IDs and with IP addresses hashed or truncated.
7. THE Admin_API SHALL give Admin_Users holding the reports Permission read-only access to analytics data through database functions and views.

### Requirement 17: Extension features (reviews, quotations, enquiries, wishlists)

**User Story:** As a store owner, I want reviews, quotations, enquiries and wishlists alongside the Medusa schema, so that I keep these features without breaking Medusa compatibility.

#### Acceptance Criteria

1. THE Backend SHALL store reviews, Quotations, Enquiries and Wishlists in Extension_Schema tables that reference Commerce_Schema records by ID.
2. WHERE reviews are enabled, WHEN a Registered_Customer submits a review, THE Backend SHALL accept one review per Registered_Customer per product and set the review status to pending moderation.
3. THE Backend SHALL mark a review as a verified purchase only when the reviewer has a delivered Order that contains the reviewed product.
4. THE Store_API SHALL return only approved reviews, with rating averages and counts computed by the Backend.
5. WHEN a visitor submits an Enquiry or a Quotation request, THE Backend SHALL store the submission with status new and notify Admin_Users as configured.
6. WHEN a Customer accepts a priced Quotation before the Quotation's expiry date, THE Backend SHALL convert the Quotation into a Cart at the quoted prices that only that Customer can complete, once.
7. IF a Quotation is expired, already converted or owned by a different Customer, THEN THE Backend SHALL reject any attempt to accept or convert the Quotation.
8. THE Store_API SHALL let each Registered_Customer create named Wishlists, add and remove products or variants, and read and change only Wishlists owned by that Registered_Customer.

### Requirement 18: Legacy Plusmark data migration with verification

**User Story:** As the Plusmark owner, I want existing catalog, customer, address, order and review data moved into the new schema with verified counts, so that no data is lost and customers keep their accounts and order history.

#### Acceptance Criteria

1. THE Migration_Tool SHALL copy the Legacy_Schema catalog, media references, inventory, customers, addresses, Orders with line items and payments, reviews and saved boards, plus the other legacy records listed in the design's mapping, into the Commerce_Schema and Extension_Schema.
2. THE Migration_Tool SHALL record a legacy-to-new ID mapping for every migrated record and use the mapping to update, not duplicate, records on repeated runs.
3. THE Migration_Tool SHALL link each migrated Customer to the existing Supabase Auth user, so that Registered_Customers sign in with their current credentials.
4. THE Migration_Tool SHALL import legacy Orders with their original numbers, dates, totals, statuses and payment references, flagged as imported, so that the import triggers no notifications, Reservations, promotion usage or new-activity Analytics_Events.
5. WHEN a migration run finishes, THE Migration_Tool SHALL produce a Migration_Report with source, migrated, skipped and failed counts per entity, the reason for each skipped or failed record, and checksums of Order totals and stock quantities for source and target.
6. IF the Migration_Report shows a count or checksum mismatch, THEN THE Migration_Tool SHALL mark the run failed and block the cutover step.
7. THE Migration_Tool SHALL leave Legacy_Schema tables and data unmodified until an Admin_User holding the owner Role confirms the verified Migration_Report.
8. WHILE Legacy_Schema tables exist, THE Backend SHALL run in the same database as the Legacy_Schema without table name collisions and without changes to the behavior of the current storefront and admin.

### Requirement 19: Deployability to any fresh Supabase project, and scheduled jobs

**User Story:** As an operator deploying the app for a new client, I want the backend to install on a fresh Supabase project from the repository using only that client's configuration, so that each client gets a working store without manual database work.

#### Acceptance Criteria

1. WHEN the documented deployment steps run against a fresh Supabase project, THE Backend SHALL create the complete Commerce_Schema, Extension_Schema, RLS policies, database functions, Edge Functions, Storage buckets and scheduled jobs from the repository without manual SQL steps.
2. THE Backend SHALL read project-specific values (project URL, project reference, keys, provider credentials and client name) from the Deployment_Config, keeping migrations, database functions and Edge Function code free of those values.
3. THE Backend SHALL include a machine-readable manifest of every Secret and configuration value, with name, purpose and required or optional status.
4. IF a required Secret or configuration value is missing, THEN THE Backend SHALL fail the affected operation with an error that names the missing value without revealing any Secret.
5. WHEN a newer Backend version is deployed to an existing Client_Project, THE Backend SHALL apply the pending migrations in order and preserve existing data.
6. THE Scheduler SHALL run cart expiry, abandoned-cart detection, Inventory_Hold release, payment reconciliation, notification retry and expired-record cleanup jobs at intervals set in configuration, recording each run's start time, end time, outcome and processed record count.
7. WHEN the payment reconciliation job runs, THE Scheduler SHALL fetch the provider status of each Payment_Collection that has been pending or authorized for longer than a configured age (default 30 minutes) and apply the state changes that a verified webhook would apply.
8. WHILE a run of a scheduled job is in progress, THE Scheduler SHALL skip new runs of the same job.
