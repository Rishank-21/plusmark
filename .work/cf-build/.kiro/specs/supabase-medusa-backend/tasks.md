# Implementation Plan: Supabase Medusa Backend

## Overview

The backend is built in dependency order: foundations, catalog and pricing, inventory, customers, cart, promotions and fulfillment, checkout and payments, order changes, notifications, analytics and extensions, Scheduler and deployment, Export_Rehearsal, and legacy migration. Each task group leaves working, tested code that later groups build on.

Implementation conventions:

- SQL is written as PL/pgSQL migrations in `supabase/migrations`.
- Edge Functions are written in TypeScript on Deno in `supabase/functions`.
- Database tests use pgTAP and run with `supabase test db`.
- Integration and property tests use Vitest with fast-check in the `tests/` workspace and run against the local stack started with `supabase start`.
- Edge Function tests use `deno test`.
- Every suite runs in single-run mode, never in watch mode.

## Tasks

- [x] 1. Set up tooling, the Medusa pin and schema parity
  - [x] 1.1 Set up the test tooling
    - Configure pgTAP tests under `supabase/tests`, run with `supabase test db`
    - Create the `tests/` Vitest workspace with fast-check, `pg` and `supabase-js`, running against the local stack from `supabase start`
    - Set up `deno test` for `supabase/functions`
    - Add a CI workflow that runs the pgTAP, Vitest and Deno suites in single-run mode
    - _Requirements: 1.10, 19.5_

  - [x] 1.2 Implement the license gate
    - Read `LICENSE` and `ENTERPRISE-LICENSE.md` at Medusa tag `v2.22.4`
    - Record the excluded paths in `tools/medusa-reference/medusa-pin.json`
    - Create the root `NOTICE` file
    - Add a CI check that fails when a `NOTICE` entry points into an excluded path
    - _Requirements: 1.15, 1.16, 1.17, 13.2_

  - [x] 1.3 Create the `tools/medusa-reference` package
    - Give it its own `package.json` and lockfile with the pinned `@medusajs` packages
    - Exclude it from the Next.js build and the root `tsconfig.json`
    - Write `medusa-pin.json` with the Medusa version, tag, commit, package versions, module set and Postgres major version, alongside the excluded paths from 1.2
    - _Requirements: 1.1_

  - [x] 1.4 Build the schema pipeline
    - Run Medusa's migrations from the pinned packages on a scratch Postgres of the pinned major version and dump the schema
    - Rewrite the dump to the `medusa` schema and strip environment-specific statements
    - Emit `supabase/migrations/<timestamp>_medusa_v2_22_4_schema.sql` with the MIT license header
    - Add a CI step that regenerates the migration and fails on any diff
    - _Requirements: 1.2_

  - [x] 1.5 Implement the Parity_Check script
    - Rebuild the reference database from `medusa-pin.json`
    - Introspect the reference database and the Supabase database through `pg_catalog`
    - Ignore the allowed additions and fail on any other difference
    - Fail when the reference build fails
    - _Requirements: 1.3, 1.8, 1.9, 1.10, 1.11_

  - [x]* 1.6 Write example tests for the Parity_Check
    - Inject a column difference, a default difference and an index difference, and assert that each one fails the check
    - Add `ext_`-prefixed objects and assert that the check ignores them
    - _Requirements: 1.10_

  - [x] 1.7 Create the Medusa issue register
    - Write `docs/medusa-issue-register.md` with MIR-1 to MIR-5 recorded as candidates
    - _Requirements: 1.14_

- [x] 2. Create schemas, conventions and shared helpers
  - [x] 2.1 Create the schemas and base privileges
    - Write a migration that creates the `medusa`, `ext`, `internal`, `api` and `reporting` schemas
    - Revoke all privileges from `public`, `anon`, `authenticated` and `service_role`
    - Set default privileges so objects created later stay revoked from those roles
    - Enable RLS on every `medusa` table
    - _Requirements: 14.1, 14.2_

  - [x] 2.2 Implement the core database helpers
    - Implement `internal.generate_id`, returning the Medusa prefix plus a ULID
    - Add the `ext_`-prefixed `updated_at` triggers
    - Add the Raw_Amount_Field check constraints
    - Implement soft-delete helpers that apply Medusa's cascades
    - _Requirements: 1.4, 1.5, 1.6_

  - [x] 2.3 Implement the convention helpers
    - Implement the error envelope with the BK000 inner-block pattern, setting `response.status` and the response headers
    - Create `ext.error_log`
    - Implement the actor context settings
    - Implement `internal.validate_input` and amount-key stripping
    - Implement the `ext.idempotency_record` helpers
    - _Requirements: 4.8, 9.3, 14.6_

  - [x] 2.4 Implement Store_Settings
    - Create `ext.setting_definition` and `ext.store_setting`
    - Implement `internal.setting` and `internal.require_feature`
    - Implement `api.admin_get_settings` and `api.admin_update_settings`
    - _Requirements: 2.1, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [ ]* 2.5 Write property test for Store_Settings validation
    - **Property 35: Settings validation**
    - **Validates: Requirements 2.11**

  - [x] 2.6 Implement the Rate_Limiter and Security_Events
    - Create the rule table (with session scope), the UNLOGGED counter table, the block table and the partitioned `security_event` table
    - Implement `check_rate_limit`
    - Implement `client_identifier` using the signed proxy header and the salt stored in Vault
    - Implement `record_security_event` and `redact`
    - _Requirements: 14.4, 14.8_

  - [ ]* 2.7 Write property test for the Rate_Limiter
    - **Property 23: Rate limit bound**
    - **Validates: Requirements 14.4**

  - [ ]* 2.8 Write property test for secret storage
    - **Property 22: No raw secrets at rest**
    - **Validates: Requirements 14.8**

  - [x] 2.9 Write pgTAP security tests
    - Assert that every `medusa` and `ext` table has RLS enabled and grants no privilege to an API role
    - Assert that direct writes by `anon` and `authenticated` fail
    - Assert that each `api` function's grants match its function family
    - _Requirements: 14.1, 14.2_

- [x] 3. Implement admin access, Roles and the Audit_Log
  - [x] 3.1 Implement Permission checks
    - Create the admin tables, the Permission list and the predefined Roles
    - Implement `internal.has_permission` and `internal.require_permission`, which require an `aal2` session and an active admin link
    - Raise `permission_denied` and record a Security_Event when a check fails
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_

  - [x] 3.2 Implement the admin user functions
    - Implement `api.admin_me`
    - Implement invitations with hashed tokens that expire after 72 hours, and invitation acceptance
    - Implement Role assignment, admin disabling and Role management
    - Enforce the last-owner rule by locking the owner Role row
    - _Requirements: 2.17, 13.5_

  - [x] 3.3 Implement the Audit_Log
    - Create the Audit_Log table with monthly partitions
    - Implement the `internal.audit_row` trigger, redacting sensitive values
    - Add triggers that keep the Audit_Log append-only and block truncation
    - Implement `api.admin_list_audit_log`
    - _Requirements: 13.7, 13.8_

  - [ ]* 3.4 Write property test for the Audit_Log
    - **Property 31: Audit complete and append-only**
    - **Validates: Requirements 13.7, 13.8**

  - [ ]* 3.5 Write property test for the last-owner rule
    - **Property 32: Last owner**
    - **Validates: Requirements 13.5**

  - [x] 3.6 Write a pgTAP test for admin Permission checks
    - Assert that every `api.admin_*` function starts with its Permission check
    - _Requirements: 13.3_

- [x] 4. Implement store configuration and the Store_Seed
  - [x] 4.1 Implement the store configuration admin functions
    - Implement `api.admin_upsert_region`, which rejects a country that already belongs to another Region and names that country in the error
    - Implement `api.admin_update_store_currencies`, which rejects removing a currency that a Region uses and names that Region in the error
    - Implement the Sales_Channel and Stock_Location admin functions
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 4.2 Implement the Store_Seed
    - Implement `internal.seed_store` and `scripts/seed-store.mjs`
    - Run the whole seed in one transaction
    - Make reruns idempotent through natural keys and `ext.seed_run`
    - Finish the seed by creating the owner invitation
    - _Requirements: 2.13, 2.15, 2.16, 2.17_

  - [ ]* 4.3 Write property test for Store_Seed idempotency
    - **Property 36: Seed and migration idempotent**
    - **Validates: Requirements 2.15**
    - Cover the Store_Seed part of the property

- [x] 5. Implement the catalog
  - [x] 5.1 Implement the admin catalog functions
    - Implement the product functions, including status changes and soft delete
    - Implement the variant functions, which reject a variant whose option set duplicates another variant of the same product
    - Implement the category functions, which run the cycle check while holding a tree advisory lock
    - Implement the collection and product attribute functions
    - Manage product types and options as data
    - _Requirements: 2.5, 2.6, 3.1, 3.2, 3.3, 3.14_

  - [x] 5.2 Build the catalog read model
    - Create `ext.catalog_product_index` with tsvector, trigram and array indexes
    - Create `ext.catalog_variant_price`
    - Create `ext.catalog_dirty`, filled by statement-level triggers, and the function that rebuilds dirty rows
    - _Requirements: 3.12, 3.13_

  - [x] 5.3 Emit Catalog_Change_Events
    - Write Catalog_Change_Events and update `ext.catalog_version` from statement-level triggers
    - Cover unpublishing, deletion, removal from a Sales_Channel and changes to the default Sales_Channel
    - _Requirements: 3.11_

  - [x] 5.4 Implement the store catalog functions
    - Implement the `api` GET functions `store_get_store`, `store_list_regions`, `store_list_products`, `store_get_product`, `store_list_categories`, `store_list_collections`, `store_list_product_handles` and `store_catalog_versions`
    - Set Cache-Control headers on the GET responses
    - Apply the Default_Sales_Channel fallback
    - Check request parameters
    - Build responses with the public field builder
    - Implement filters, facets, sort orders and paging caps
    - Implement the POST function `store_price_for_customer`
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.12, 3.13_

  - [x] 5.5 Implement product media upload
    - Create the `catalog-media` storage bucket
    - Implement the `admin-media-upload` Edge Function, which checks the file's magic bytes and enforces the size cap while streaming
    - Implement `api.admin_authorize_upload` and `api.service_add_product_image`
    - _Requirements: 3.15, 3.16_

  - [ ]* 5.6 Write property test for catalog determinism
    - **Property 24: Catalog determinism**
    - **Validates: Requirements 3.8, 3.9**

  - [ ]* 5.7 Write property test for catalog filters
    - **Property 25: Catalog filters**
    - **Validates: Requirements 3.12, 3.13**

  - [ ]* 5.8 Write property test for acyclic categories
    - **Property 26: Acyclic categories**
    - **Validates: Requirements 3.2**

  - [ ]* 5.9 Write property test for unique variant options
    - **Property 27: Unique variant options**
    - **Validates: Requirements 3.3**

  - [ ]* 5.10 Write an integration test for Cache-Control headers
    - Assert that the Cache-Control headers set by the store GET functions reach the client through the Supabase API gateway
    - _Requirements: 3.9_

- [x] 6. Implement pricing, tax and totals
  - [x] 6.1 Implement the Pricing_Engine
    - Implement the pricing contexts
    - Implement `internal.calculate_prices` with the price selection steps
    - Implement `internal.next_price_boundary`
    - Implement the admin price functions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [x] 6.2 Build the differential harness
    - Add a harness to `tools/medusa-reference` that runs the pinned Medusa pricing, tax and totals logic on generated inputs
    - _Requirements: 1.14_

  - [ ]* 6.3 Write property test for price selection
    - **Property 5: Price selection matches Medusa**
    - **Validates: Requirements 1.14, 4.3, 4.4**

  - [x] 6.4 Implement the Tax_Calculator
    - Choose the tax address in this order: the shipping address, the billing address, then the Default_Tax_Region; raise `tax_configuration_error` when none is available
    - Implement tax rate selection
    - Create tax lines for line items and shipping methods
    - _Requirements: 4.12, 4.13, 4.14, 4.15, 4.16_

  - [x] 6.5 Implement the Totals_Calculator
    - Implement the rounding steps and largest-remainder allocation
    - Implement the tax-inclusive and tax-exclusive paths
    - Implement the `internal.refresh_cart` skeleton, `internal.cart_totals` and `internal.order_totals`
    - _Requirements: 4.7, 4.9, 4.10, 4.11, 4.17_

  - [ ]* 6.6 Write property test for totals
    - **Property 1: Totals add up**
    - **Validates: Requirements 4.9, 4.10, 4.11**

  - [ ]* 6.7 Write property test for tax-inclusive gross amounts
    - **Property 4: Tax-inclusive gross**
    - **Validates: Requirements 4.17**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement inventory
  - [x] 8.1 Create the inventory tables and the movement ledger
    - Create `ext.inventory_hold`, `ext.cart_hold_window`, `ext.inventory_movement` and `ext.stock_location_priority`
    - Add the AFTER INSERT OR UPDATE ledger trigger on `medusa.inventory_level`, which records each change in `ext.inventory_movement`
    - Implement `api.admin_adjust_inventory`, which rejects any adjustment that would make stock negative
    - _Requirements: 5.1, 5.12, 5.13_

  - [x] 8.2 Implement sellable quantity and Stock_State
    - Implement `internal.sellable_quantity` with the single-location rule
    - Derive Stock_State from the sellable quantity and the low-stock threshold
    - Emit Stock_State change events
    - _Requirements: 5.2, 5.3, 5.14, 5.15, 5.16_

  - [x] 8.3 Implement inventory holds
    - Implement `internal.hold_cart_inventory`, which locks the Cart before placing holds
    - Reject new holds with hold_time_exceeded once the Cart's accumulated Cart_Hold_Time exceeds the configured maximum (default 60 minutes)
    - Replace the Cart's existing holds
    - Lock inventory rows in ascending ID order
    - Place all of the Cart's holds or none of them
    - Implement `internal.release_cart_holds`, `internal.convert_holds_to_reservations` and `internal.claim_order_stock`
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

  - [ ]* 8.4 Write property test for no overselling
    - **Property 8: No overselling**
    - **Validates: Requirements 5.9**

  - [ ]* 8.5 Write property test for all-or-nothing holds
    - **Property 9: Holds all or nothing**
    - **Validates: Requirements 5.5, 5.8**

  - [ ]* 8.6 Write property test for expired holds
    - **Property 10: Expired holds do not count**
    - **Validates: Requirements 5.11**

  - [ ]* 8.7 Write property test for ledger balance
    - **Property 11: Ledger balance**
    - **Validates: Requirements 5.12, 5.13**

- [x] 9. Implement customer accounts and guest access
  - [x] 9.1 Link Auth sign-ups to Customers
    - Add the Auth sign-up trigger, which writes `ext.customer_auth_link` with ON CONFLICT
    - Link a migrated Customer to the new Auth user instead of creating a second Customer
    - Link guest Orders to the Customer after the email address is confirmed
    - _Requirements: 6.1, 6.5_

  - [x] 9.2 Implement the customer profile and address functions
    - Implement the profile and address functions
    - Check addresses against `ext.country_address_format` and the Region's countries
    - Enforce the address cap
    - _Requirements: 6.6_

  - [x] 9.3 Implement Customer_Group membership
    - Implement the admin function for Customer_Group membership
    - Apply the Customer_Group context only to Carts linked to a Registered_Customer
    - _Requirements: 6.7_

  - [x] 9.4 Implement guest order access
    - Issue Order_Access_Tokens and implement `api.store_get_guest_order`
    - Implement order lookup with One_Time_Codes through `api.service_request_order_access`, called by the Bot_Check gateway, and `api.store_verify_order_access`
    - Enforce the send and attempt limits on One_Time_Codes
    - _Requirements: 6.3, 6.4_

  - [x] 9.5 Implement account deletion
    - Implement the `account-deletion` Edge Function, which requires a recent sign-in, bans the Auth user and signs the user out
    - Implement the erasure job
    - _Requirements: 6.8_

  - [ ]* 9.6 Write property test for one-time codes
    - **Property 37: One-time codes**
    - **Validates: Requirements 6.4**

  - [ ]* 9.7 Write property test for one Customer per sign-up
    - **Property 38: One Customer per sign-up**
    - **Validates: Requirements 6.1**

- [x] 10. Implement the cart functions
  - [x] 10.1 Implement the core cart functions
    - Create `ext.cart_token` and `ext.cart_state`
    - Implement `internal.authorize_cart`
    - Implement `api.store_create_cart`, which returns the Cart_Token only once and enforces the cart creation rate limit
    - Implement `api.store_get_cart` and the functions for items, email, addresses and Region
    - Follow the change steps and apply the item rules in every function that changes a Cart
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 10.2 Implement cart transfer
    - Implement `api.store_cart_transfer`, which attaches the Cart to the Customer or merges it with the Customer's open Cart
    - Apply the merge caps and list the items that were not merged in `not_merged`
    - Revoke the Cart_Token
    - Close the source Cart as merged
    - _Requirements: 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 7.13_

  - [x] 10.3 Implement abandonment, recovery and expiry
    - Implement the abandonment job
    - Record recovery when an abandoned Cart is placed as an Order
    - Implement the expiry job, which releases the Cart's inventory holds
    - _Requirements: 7.14, 7.15, 7.16_

  - [ ]* 10.4 Write property test for cart merge conservation
    - **Property 28: Cart merge conservation**
    - **Validates: Requirements 7.7, 7.8, 7.9, 7.10, 7.11**

  - [ ]* 10.5 Write property test for cart limits
    - **Property 29: Cart limits**
    - **Validates: Requirements 7.3**

  - [ ]* 10.6 Write property test for idempotent abandonment
    - **Property 30: Abandonment idempotent**
    - **Validates: Requirements 7.14**

  - [ ]* 10.7 Write property test for ignored client amounts
    - **Property 6: Client amounts ignored**
    - **Validates: Requirements 4.8**

  - [ ]* 10.8 Write property test for uniform not-found responses
    - **Property 21: Uniform not-found**
    - **Validates: Requirements 6.3, 7.4, 14.3**

- [x] 11. Implement the Promotion_Engine
  - [x] 11.1 Evaluate promotions in the cart refresh
    - Create `ext.promotion_setting` and `ext.promotion_usage`
    - Implement `internal.evaluate_promotions` for the supported promotion model and call it from `internal.refresh_cart`
    - Report promotions that no longer apply in `removed_promotions`
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 11.2 Implement promotion codes on the Cart
    - Implement `api.store_cart_apply_code` and `api.store_cart_remove_code`
    - Normalize codes before lookup
    - Return the generic `invalid_code` error, or `promotion_rules_not_met` when the code exists but the Cart does not meet its rules
    - Apply one attempt limit to code entry and block further attempts once it is reached
    - Enforce the stacking rules and the cap on codes per Cart
    - _Requirements: 8.6, 8.7, 8.8, 8.9_

  - [x] 11.3 Record and revert promotion usage
    - Implement `internal.record_promotion_usage`, which takes row locks on `medusa.promotion_campaign_budget` and per-identity advisory locks
    - Implement `internal.revert_promotion_usage`
    - _Requirements: 8.4, 8.5, 8.10_

  - [x] 11.4 Implement the admin promotion functions
    - Implement `api.admin_upsert_promotion` and `api.admin_upsert_campaign`
    - Check promotion values, dates and codes
    - _Requirements: 8.1_

  - [ ]* 11.5 Write property test for non-negative amounts
    - **Property 2: No negative amounts**
    - **Validates: Requirements 8.3**

  - [ ]* 11.6 Write property test for discount conservation
    - **Property 3: Discount conservation**
    - **Validates: Requirements 4.11, 8.3**

  - [ ]* 11.7 Write property test for promotion limits under concurrency
    - **Property 12: Promotion limits hold under concurrency**
    - **Validates: Requirements 8.4, 8.5**

  - [ ]* 11.8 Write property test for usage restored on cancel
    - **Property 13: Cancel restores usage**
    - **Validates: Requirements 8.10**

  - [ ]* 11.9 Write property test for code attempts
    - **Property 14: Code attempts**
    - **Validates: Requirements 8.7, 8.9**

- [x] 12. Implement the Fulfillment_Service and Serviceability_Rules
  - [x] 12.1 Implement the postal code check
    - Create `ext.serviceability_rule`
    - Implement the GET function `api.store_check_postal_code`
    - _Requirements: 11.4_

  - [x] 12.2 Implement shipping option selection and pricing
    - Select the shipping options available to a Cart
    - Price options with flat rates, order-value thresholds or stored provider quotes obtained through the `shipping-quote` Edge Function
    - Implement `api.store_cart_list_shipping_options` and `api.store_cart_set_shipping_method`
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 12.3 Implement fulfillments
    - Define the Fulfillment_Provider_Interface and implement the manual provider
    - Implement `api.admin_create_fulfillment`, `api.admin_mark_shipped`, `api.admin_mark_delivered` and `api.admin_cancel_fulfillment`
    - Implement the admin functions for shipping options and Serviceability_Rules
    - _Requirements: 11.6, 11.7, 11.8_

  - [ ]* 12.4 Write property test for fulfillment quantities
    - **Property 33: Fulfillment and return quantities**
    - **Validates: Requirements 11.8**
    - Cover the fulfillment part of the property

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement the Checkout_Service
  - [x] 14.1 Implement cart completion
    - Implement `internal.complete_cart`
    - Write the idempotency record, lock the Cart, and return the existing Order when the Cart was already placed
    - Run the checks in order, each failing with its own error code
    - Claim stock, record Promotion usage and run the payment checks
    - Write the Order with its snapshots and links
    - Record recovery when the Cart was abandoned
    - Issue an Order_Access_Token for guest Orders
    - Create the order notification and emit the order event
    - Implement `api.store_complete_cart` and `api.service_complete_cart`
    - _Requirements: 2.7, 6.2, 9.1, 9.2, 9.3, 9.4, 9.5, 11.5_

  - [x] 14.2 Implement order status transitions and display numbers
    - Create `ext.order_status_transition` and a trigger that rejects status changes it does not list
    - Lock the Order row before changing its status
    - Assign display numbers with an optional prefix
    - _Requirements: 9.6, 9.7_

  - [x] 14.3 Implement paid-Cart rejection
    - Create `ext.payment_incident` for paid Carts that cannot be placed
    - Apply the Out_Of_Stock_Policy, which refunds the payment by default or places the Order as a backorder
    - Send the related notifications
    - _Requirements: 9.8_

  - [x] 14.4 Implement the `bot-gateway` Edge Function
    - Check Turnstile tokens through siteverify
    - Verify the caller's JWT
    - Fail closed when a check fails or cannot be completed
    - Route guest order placement and the other actions listed in the design through the gateway
    - _Requirements: 6.2, 14.5_

  - [ ]* 14.5 Write property test for idempotent placement
    - **Property 15: Idempotent placement**
    - **Validates: Requirements 9.3**

  - [ ]* 14.6 Write property test for atomic placement
    - **Property 16: Atomic placement**
    - **Validates: Requirements 9.2**

  - [ ]* 14.7 Write property test for the Order snapshot
    - **Property 17: Order snapshot**
    - **Validates: Requirements 9.5**

  - [ ]* 14.8 Write property test for status transitions
    - **Property 18: Status transitions**
    - **Validates: Requirements 9.6**

  - [x] 14.9 Write the checkout smoke check
    - Seed a store and add one published product with stock
    - Place a Cash_On_Delivery or zero-total Order through the `api` functions
    - _Requirements: 2.14_

- [x] 15. Implement payments and the Webhook_Handler
  - [x] 15.1 Implement the payment providers
    - Define the Payment_Provider_Interface in `supabase/functions/_shared/payments`
    - Implement the Razorpay provider and the Cash_On_Delivery provider
    - _Requirements: 10.1, 10.2_

  - [x] 15.2 Implement payment initiation
    - Implement the `payment-initiate` Edge Function and `api.service_begin_payment`
    - Check that the provider is enabled for the Cart's Region
    - Create the Payment_Collection for the server-computed total and cancel stale payment sessions
    - Place the Cart's inventory holds
    - Send amounts to the provider in minor units
    - _Requirements: 10.2, 10.3_

  - [x] 15.3 Implement payment confirmation
    - Implement the `payment-confirm` Edge Function
    - Verify the Razorpay signature and fetch the payment from the provider
    - Check the payment's status, amount, currency and reference
    - Record a Security_Event when any of them does not match
    - _Requirements: 10.4_

  - [x] 15.4 Implement the Webhook_Handler
    - Implement the `payments-webhook` Edge Function and `api.service_process_payment_event`
    - Verify the signature over the raw request body
    - Return 401 and 503 in the cases defined in the design
    - Deduplicate events and only move payment statuses forward
    - Run the completion path for the Cart and roll back the event's changes when it fails
    - _Requirements: 10.5, 10.6_

  - [x] 15.5 Implement two-phase captures and refunds
    - Run captures and refunds in two phases through `ext.provider_operation`
    - Apply timeouts and handle operations whose outcome is unknown
    - _Requirements: 10.7, 12.7_

  - [x] 15.6 Implement COD_Rules
    - Implement COD_Rules, including refusals, blocks and re-enabling
    - Implement `api.admin_record_cod_payment`
    - _Requirements: 10.8, 10.9, 10.10, 10.11_

  - [x] 15.7 Implement the `admin-providers` Edge Function
    - Check the provider's secrets before enabling the provider
    - _Requirements: 10.2, 19.4_

  - [ ]* 15.8 Write property test for the minor-unit round trip
    - **Property 7: Minor-unit round trip**
    - **Validates: Requirements 10.3**

  - [ ]* 15.9 Write property test for webhook order independence
    - **Property 19: Webhook order independence**
    - **Validates: Requirements 10.6**

  - [ ]* 15.10 Write property test for capture and refund caps
    - **Property 20: Capture and refund caps**
    - **Validates: Requirements 10.7, 12.7**

  - [ ]* 15.11 Write Deno tests for the payment Edge Functions
    - Use provider fakes
    - Test known signature vectors, timeouts, duplicate and out-of-order webhooks, and unknown capture outcomes
    - _Requirements: 10.4, 10.5, 10.6, 10.7_

- [x] 16. Implement order changes and refunds
  - [x] 16.1 Port the order change engine
    - Port the `v2.22.4` order change engine, including actions, per-version quantities, `order_summary` and version increments
    - Compare the port with the pinned Medusa engine using the differential harness
    - _Requirements: 12.1_

  - [x] 16.2 Implement cancellation
    - Let the Customer cancel an Order within the cancellation window, and let Admin_Users cancel Orders
    - Release Reservations, void or refund payments, and revert Promotion usage
    - _Requirements: 12.2_

  - [x] 16.3 Implement returns
    - Let Customers request returns behind a feature flag, within the return window and with a reason
    - Let Admin_Users create returns
    - Receive returns and restock the items through the ledger
    - _Requirements: 12.3, 12.4, 12.5_

  - [x] 16.4 Implement exchanges, claims and order edits
    - Compute the difference on the server
    - Settle the difference with a new Payment_Collection or a refund
    - _Requirements: 12.6_

  - [x] 16.5 Implement admin refunds
    - Implement `api.admin_refund_payment` with refund reasons and `ext.refund_link`
    - Enforce the refund cap
    - _Requirements: 12.7, 12.8_

  - [ ]* 16.6 Write property test for return quantities
    - **Property 33: Fulfillment and return quantities**
    - **Validates: Requirements 12.4**
    - Cover the return part of the property

- [x] 17. Implement the Notification_Service
  - [x] 17.1 Create the notification tables and enqueueing
    - Create `ext.notification_delivery`, `ext.notification_rule`, `ext.notification_template` and `ext.marketing_consent`
    - Implement `internal.enqueue_notifications` to write Medusa notification rows with idempotency keys and send the `pg_net` wake-up
    - Seed the default rules and the branded templates
    - _Requirements: 15.2, 15.3, 15.4, 15.6, 15.7_

  - [x] 17.2 Implement the `notifications-send` Edge Function
    - Implement `api.service_claim_notifications` and `api.service_complete_notification`
    - Claim deliveries under leases and retry failed sends with exponential backoff
    - Mark a delivery as failed once it reaches the attempt limit
    - _Requirements: 15.3, 15.5_

  - [x] 17.3 Implement the notification providers
    - Define the Notification_Provider_Interface
    - Implement the Resend reference email adapter
    - Select the provider for each Client_Project from the Deployment_Config
    - _Requirements: 15.1_

  - [x] 17.4 Implement marketing consent and unsubscribing
    - Check marketing consent before sending marketing notifications
    - Implement the `unsubscribe` Edge Function with a confirmation page and the RFC 8058 one-click POST
    - Implement `api.service_unsubscribe`
    - _Requirements: 15.8_

  - [ ]* 17.5 Write property test for at-most-once notifications
    - **Property 34: Notifications at most once**
    - **Validates: Requirements 15.4**

- [x] 18. Implement analytics capture
  - [x] 18.1 Create the analytics event store
    - Create `ext.analytics_event` with monthly partitions
    - Implement `internal.emit_event`
    - Emit server events from the cart, checkout, payment, order change and job code
    - _Requirements: 16.1, 16.2_

  - [x] 18.2 Implement `api.store_track_events`
    - Accept only allow-listed event types and validate each payload against its schema
    - Clamp `occurred_at` and apply rate limits
    - Use pseudonymous session IDs
    - _Requirements: 16.3, 16.6_

  - [x] 18.3 Implement attribution
    - Record UTM parameters and the referrer on Carts
    - Copy the attribution to the Order when it is placed
    - _Requirements: 16.4_

  - [x] 18.4 Implement rollups and reporting
    - Create the rollup tables and implement `internal.refresh_rollups`
    - Create the reporting views and the `api.admin_report_*` functions
    - Implement `api.admin_export_events`
    - _Requirements: 16.7_

  - [x] 18.5 Implement analytics retention
    - Add the analytics retention settings
    - Manage the `ext.analytics_event` partitions in `retention_cleanup`
    - _Requirements: 16.5_

- [x] 19. Implement the extension features
  - [x] 19.1 Implement reviews
    - Implement `api.service_submit_review`, called through the Bot_Check gateway
    - Implement review moderation
    - Re-evaluate the verified-purchase status when an Order is delivered
    - Maintain `ext.product_rating_summary` and implement `api.store_list_reviews`
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [x] 19.2 Implement enquiries
    - Accept enquiries through the Bot_Check gateway
    - Notify Admin_Users of new enquiries
    - _Requirements: 17.5_

  - [x] 19.3 Implement quotations
    - Implement quotation requests and admin pricing
    - Accept a quotation under a row lock
    - Convert an accepted quotation into a Cart only once, with locked custom-price lines
    - _Requirements: 17.5, 17.6, 17.7_

  - [x] 19.4 Implement wishlists
    - Restrict each wishlist to its owner
    - Enforce the wishlist caps
    - _Requirements: 17.8_

- [x] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Implement scheduler jobs and deployment
  - [x] 21.1 Implement the job runner
    - Create `ext.job_run`
    - Register every job with pg_cron and implement `internal.reschedule_jobs`
    - Hold an advisory lock for each database job and a lease for each Edge Function job
    - Record a run as skipped when another run of the same job holds the lock or lease
    - _Requirements: 19.6, 19.8_

  - [x] 21.2 Implement the catalog and hold maintenance jobs
    - Implement the `hold_cleanup`, `price_boundary`, `catalog_reindex` and `catalog_purge` jobs
    - Send the batched purge webhook through pg_net with the token stored in Vault
    - _Requirements: 3.11, 5.16_

  - [x] 21.3 Implement the `payment_reconciliation` job
    - Select Payment_Collections that are pending or authorized past the configured age, and provider operations with an unknown outcome
    - Apply each provider result through the same function that applies verified webhooks
    - _Requirements: 19.7_

  - [x] 21.4 Implement the deployment configuration
    - Write `supabase/config-manifest.json` and implement `internal.require_secret`
    - Implement the Edge Function config loader, which fails with `missing_configuration` and names the missing value
    - Create the dedicated job secret that pg_net calls use
    - _Requirements: 19.2, 19.3, 19.4_

  - [x] 21.5 Make deployment work on a fresh project
    - Set the exposed schemas in `supabase/config.toml`
    - Create the Storage buckets and the Vault entries in migrations
    - Write a deployment test that deploys to a fresh project and passes without any manual SQL
    - _Requirements: 19.1_

  - [x] 21.6 Write the upgrade test
    - Deploy the previous release and load data into it
    - Upgrade to the current release and assert that the data is preserved
    - _Requirements: 19.5_

  - [ ]* 21.7 Write example test for overlapping job runs
    - Start a job run while another run of the same job is in progress, and assert that the second run is skipped and recorded as skipped
    - _Requirements: 19.8_

- [x] 22. Implement the Export_Rehearsal
  - [x] 22.1 Build the rehearsal pipeline
    - Write a sample-store builder that creates its data through `api` functions only
    - Dump the `medusa` schema data and load it into a freshly migrated Reference_Medusa_Installation
    - Boot Medusa v2.22.4 against the loaded data with its own admin user and publishable key
    - _Requirements: 1.12_

  - [x] 22.2 Compare the Medusa and Backend API results
    - Compare the records and totals returned by Medusa's store and admin APIs with the Backend's results
    - Treat confirmed Medusa_Issue_Register entries as expected differences
    - Run the rehearsal in CI on migration or pin changes and before each release
    - _Requirements: 1.13, 1.14_

  - [x] 22.3 Resolve the Medusa_Issue_Register candidates
    - Confirm or reject each candidate against the Medusa v2.22.4 source
    - Record the test that proves each fix in the register
    - _Requirements: 1.14_

- [x] 23. Implement the legacy Migration_Tool
  - [x] 23.1 Create the migration tables and the tool entry point
    - Create `ext.migration_map`, `ext.migration_run` and `ext.order_import`
    - Write `scripts/migrate-legacy.mjs` with `dry_run` and `apply` modes
    - _Requirements: 18.1, 18.2_

  - [x] 23.2 Map the catalog
    - Map categories, products and variants, with INR Price_Sets and inventory
    - Map media URLs and attributes
    - _Requirements: 18.1, 18.2_

  - [x] 23.3 Map customers and admin users
    - Map customers together with their Auth links
    - Map admin profiles to Admin_Users with the manager Role
    - Map addresses
    - _Requirements: 18.1, 18.3_

  - [x] 23.4 Map orders
    - Import orders, order items and payments under `app.import_mode`
    - Keep the display numbers and record each imported order in `ext.order_import`
    - Rebuild the rollups after the import
    - _Requirements: 18.1, 18.4_

  - [x] 23.5 Map the remaining legacy data
    - Map reviews, saved boards as Wishlists and coupons as Promotions
    - Map shipping methods, site content and payment events
    - _Requirements: 18.1_

  - [x] 23.6 Implement the Migration_Report and cutover gate
    - Write the Migration_Report with counts, reasons and checksums
    - Block cutover when a run fails
    - Implement `api.admin_confirm_migration`, which requires the owner Role
    - Leave the legacy tables untouched
    - _Requirements: 18.5, 18.6, 18.7, 18.8_

  - [ ]* 23.7 Write property test for Migration_Tool idempotency
    - **Property 36: Seed and migration idempotent**
    - **Validates: Requirements 18.2, 18.5**
    - Cover the migration part of the property

  - [x] 23.8 Write the migration rehearsal
    - Run the Migration_Tool on an anonymized copy of Plusmark's data in `dry_run` mode, then in `apply` mode
    - Check the Migration_Report from each run
    - _Requirements: 18.5, 18.6_

- [x] 24. Implement the security hardening checks
  - [x] 24.1 Add the client secret scan
    - Add a CI step that scans the built client bundle and every `NEXT_PUBLIC_` variable for secret patterns
    - _Requirements: 14.7_

  - [x] 24.2 Apply the Supabase project settings
    - Disable pg_graphql
    - Exclude the `medusa` and `ext` tables from the Realtime publication
    - Set the Auth settings and the statement timeouts
    - Apply these settings through `supabase/config.toml` where it supports them, and document the rest
    - _Requirements: 14.1, 14.7_

- [x] 25. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster first version.
- Each sub-task lists the requirements it covers.
- Checkpoints stop for a test run and for any questions.
- Property tests check the universal properties from the design, while example and integration tests cover specific cases.
- The license gate in 1.2 must pass before any task that ports Medusa code (6.1, 6.4, 6.5, 11.1 and 16.1).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.7"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4"] },
    { "id": 4, "tasks": ["1.5"] },
    { "id": 5, "tasks": ["1.6"] },
    { "id": 6, "tasks": ["2.1"] },
    { "id": 7, "tasks": ["2.2"] },
    { "id": 8, "tasks": ["2.3"] },
    { "id": 9, "tasks": ["2.4", "2.6"] },
    { "id": 10, "tasks": ["2.5", "2.7", "2.9"] },
    { "id": 11, "tasks": ["2.8"] },
    { "id": 12, "tasks": ["3.1"] },
    { "id": 13, "tasks": ["3.2", "3.3"] },
    { "id": 14, "tasks": ["3.4", "3.6"] },
    { "id": 15, "tasks": ["3.5"] },
    { "id": 16, "tasks": ["4.1", "5.1"] },
    { "id": 17, "tasks": ["4.2", "5.2", "5.5"] },
    { "id": 18, "tasks": ["4.3", "5.3"] },
    { "id": 19, "tasks": ["5.4", "9.1"] },
    { "id": 20, "tasks": ["5.6", "5.7", "5.8", "5.9", "5.10", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 21, "tasks": ["6.1", "6.2", "6.4", "9.6", "9.7"] },
    { "id": 22, "tasks": ["6.3", "6.5"] },
    { "id": 23, "tasks": ["6.6", "6.7"] },
    { "id": 24, "tasks": ["8.1"] },
    { "id": 25, "tasks": ["8.2"] },
    { "id": 26, "tasks": ["8.3"] },
    { "id": 27, "tasks": ["8.4", "8.5", "8.6", "8.7"] },
    { "id": 28, "tasks": ["10.1"] },
    { "id": 29, "tasks": ["10.2", "10.3"] },
    { "id": 30, "tasks": ["10.4", "10.5", "10.6", "10.7", "10.8"] },
    { "id": 31, "tasks": ["11.1", "12.1", "12.3"] },
    { "id": 32, "tasks": ["11.2", "11.3", "11.4", "12.2"] },
    { "id": 33, "tasks": ["11.5", "11.6", "11.7", "11.8", "11.9", "12.4"] },
    { "id": 34, "tasks": ["14.1"] },
    { "id": 35, "tasks": ["14.2", "14.4"] },
    { "id": 36, "tasks": ["14.3"] },
    { "id": 37, "tasks": ["14.5", "14.6", "14.7", "14.8", "14.9"] },
    { "id": 38, "tasks": ["15.1", "17.1", "17.3", "18.1", "19.1", "19.4"] },
    { "id": 39, "tasks": ["15.2", "15.7", "17.2", "18.2", "18.3", "18.4", "18.5", "19.2"] },
    { "id": 40, "tasks": ["15.3", "15.6", "17.4", "17.5", "19.3"] },
    { "id": 41, "tasks": ["15.4"] },
    { "id": 42, "tasks": ["15.5"] },
    { "id": 43, "tasks": ["15.8", "15.9", "15.10", "15.11"] },
    { "id": 44, "tasks": ["16.1"] },
    { "id": 45, "tasks": ["16.2", "16.3"] },
    { "id": 46, "tasks": ["16.4", "16.6"] },
    { "id": 47, "tasks": ["16.5"] },
    { "id": 48, "tasks": ["21.1", "21.4"] },
    { "id": 49, "tasks": ["21.2", "21.3", "21.5"] },
    { "id": 50, "tasks": ["21.6", "21.7"] },
    { "id": 51, "tasks": ["22.1", "23.1", "24.1", "24.2"] },
    { "id": 52, "tasks": ["22.2", "23.2"] },
    { "id": 53, "tasks": ["22.3", "23.3"] },
    { "id": 54, "tasks": ["23.4"] },
    { "id": 55, "tasks": ["23.5"] },
    { "id": 56, "tasks": ["23.6"] },
    { "id": 57, "tasks": ["23.7", "23.8"] }
  ]
}
```
