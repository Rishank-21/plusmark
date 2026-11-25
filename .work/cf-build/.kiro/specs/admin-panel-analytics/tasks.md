# Implementation Plan: Admin Panel, Reports and Analytics

## Overview

The Admin_App and this spec's backend additions are built in dependency order: tooling, backend foundations, PII protection, invitations, the Admin_App shell, the export pipeline, the operations screens, the import pipeline, the analytics data layer, customers, KPIs and Reports, promotions, GST, forecasting, Alerts, Scheduled_Reports and the cutover. Each task group leaves working, tested code that later groups build on. Spec 1's backend must be in place before this plan starts.

Implementation conventions:

- SQL is written as PL/pgSQL migrations in `supabase/migrations`, ordered after spec 1's migrations, and follows spec 1's function conventions.
- Every new table is an `ext` table with RLS enabled and no policy, and no migration changes a Medusa_Parity_Table.
- Every new `api.admin_*` function starts with spec 1's Permission check, which calls `internal.require_admin_session` first, and has a JSON Schema for its response in `supabase/contracts/admin/`. A function that changes data writes its Audit_Log entry in the same transaction.
- Every new admin write takes `p_idempotency_key`, and every save of an editable record takes `p_expected_version`.
- Every new recurring task is a pg_cron job that uses spec 1's job runner and writes `ext.job_run` records.
- Edge Functions are written in TypeScript on Deno in `supabase/functions`, log only error codes, request IDs and Masked_Values, and are tested with `deno test`.
- The Admin_App lives in `apps/admin/` as a static Next.js export.
- Database tests use pgTAP (`supabase test db`). Property and integration tests use Vitest with fast-check (`vitest --run`) against the local stack from `supabase start`. Browser tests use Playwright with axe-core.
- Every suite runs in single-run mode, never in watch mode.

## Tasks

- [x] 1. Set up the Admin_App workspace and test tooling
  - [x] 1.1 Create the Admin_App workspace
    - Create `apps/admin/` as a Next.js 15 App Router app with its own `package.json` and lockfile, excluded from the root build, lint and `tsconfig.json`
    - Configure `output: 'export'`, `trailingSlash: true` and `images.unoptimized: true`, with no route handlers, middleware, server actions or Pages Functions
    - Read only the Supabase project URL and public key from build-time environment variables
    - Add `@supabase/auth-js`, `@supabase/postgrest-js` and TanStack Query, and load `@supabase/storage-js` only on the import and export screens
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Set up the test tooling
    - Add Vitest with fast-check to `apps/admin/`, and add `@supabase/postgrest-js` to spec 1's `tests/` workspace next to `pg`
    - Add Playwright with axe-core for browser tests at 320, 768 and 1280 px wide, in English and Hindi
    - Extend spec 1's CI workflow with the Admin_App build and test suites, all in single-run mode
    - _Requirements: 3.1, 3.4_

  - [x] 1.3 Set up the response contracts
    - Create `supabase/contracts/admin/` with one JSON Schema per `api.admin_*` response, and generate the Admin_App's TypeScript response types from the schemas in the build
    - Add a contract test that calls each `api.admin_*` function with fixture data, checks the response against its schema and fails for a function without a schema
    - _Requirements: 25.1_

- [x] 2. Build the backend foundations
  - [x] 2.1 Add the Permissions, settings and spec 1 columns
    - Add `pii:reveal`, `reports:export`, `alerts:manage`, `gst:read` and `enquiry:manage` to the Permission list, with their default System_Role grants
    - Add this spec's setting definitions to `ext.setting_definition`, each with its default and allowed range, so that an out-of-range save returns the allowed range
    - Add the columns that Data Models lists for spec 1 tables
    - _Requirements: 1.31, 2.21, 5.28, 6.21, 7.15, 8.13, 9.26, 11.15, 12.11, 12.24, 25.3, 25.7_

  - [x] 2.2 Implement the session check
    - Create `ext.admin_mfa_factor` and implement `internal.require_admin_session(p_sensitive)` with the KD-4 checks in order, recording a Security_Event for `factor_not_allowed`
    - Call the session check first from spec 1's `internal.require_permission`, with the Sensitive_Action flag set by each Sensitive_Action function
    - Extend `api.admin_me` to return the saved language and the Store_Settings that the shell needs
    - _Requirements: 1.8, 1.15, 1.16, 1.17, 2.3, 4.5_

  - [x] 2.3 Implement idempotency and versions for admin writes
    - Implement `internal.admin_idempotency_begin(scope, key, fingerprint)` with `pg_try_advisory_xact_lock` on the key, returning `idempotency_in_progress`, the stored response or `idempotency_conflict`
    - Ignore admin idempotency records older than the key retention period, and delete them in the cleanup job
    - Implement the version helper, which returns `updated_at` as an opaque `version` and raises `edit_conflict` on a mismatch
    - Extend the spec 1 admin write functions that this spec's screens call with `p_expected_version` and `p_idempotency_key`
    - _Requirements: 3.13, 3.14, 3.15, 3.16, 6.36, 25.9_

  - [x] 2.4 Implement the list pattern and Saved_Views
    - Implement the keyset paging helper on (sort key, ID) with the List_Page_Size and server-side filter validation
    - Create `ext.saved_view` and implement `api.admin_saved_views_list`, `api.admin_saved_view_save` and `api.admin_saved_view_delete` with the name, limit, sharing and creator rules
    - _Requirements: 8.11, 8.12, 13.22, 19.2, 19.5, 19.6, 19.8_

  - [x] 2.5 Implement the report timeout
    - Implement `internal.pre_request()` and set it as the `authenticator` role's `pgrst.db_pre_request`
    - Set `statement_timeout` to the configured report query timeout for `admin_report_*` and export-page functions only, keeping spec 1's role timeouts for every other request
    - _Requirements: 24.11_

  - [x] 2.6 Write the foundation security checks
    - Write pgTAP tests that every new table has RLS enabled and grants nothing to `anon` or `authenticated`, and that every new table that admin functions change has spec 1's `internal.audit_row` trigger
    - Write a pgTAP test that every `api.admin_*` function calls `internal.require_admin_session` before anything else
    - Run spec 1's Parity_Check in CI with this spec's migrations applied
    - _Requirements: 25.2, 25.3, 25.4, 25.6_

  - [ ]* 2.7 Write property test for session checks
    - **Property 1: Session checks**
    - **Validates: Requirements 1.8, 1.15, 1.16, 1.17, 2.3**

  - [ ]* 2.8 Write property test for idempotent admin writes
    - **Property 11: Idempotent admin writes**
    - **Validates: Requirements 3.13, 3.14, 3.15, 3.16, 11.14**

- [x] 3. Implement PII masking, reveal and contact search
  - [x] 3.1 Implement masking and the PII registry
    - Create `ext.pii_field`, register every PII column of the `medusa` and `ext` tables, and implement `internal.mask_value(kind, value)` with the masking rules and the masked share
    - Implement the JSON builder helpers that mask registered columns in every admin read
    - Mask PII_Fields in error envelopes and in `ext.error_log` entries
    - Write the pgTAP registry check that fails for an unregistered column whose name looks like personal data
    - _Requirements: 2.7, 2.8, 2.11, 2.12_

  - [x] 3.2 Implement the reveal function
    - Create `ext.pii_reveal_log` and implement `api.admin_pii_reveal(p_record_type, p_record_id)` for the record types of the design
    - Count the distinct records revealed in the last 60 minutes against the Reveal_Limit, and write the Audit_Log entry and the reveal log row before returning the values
    - Reject a reveal over the limit with `reveal_limit_exceeded` and the next allowed time, keeping the Security_Event through spec 1's inner-block pattern
    - _Requirements: 2.14, 2.18, 2.19_

  - [x] 3.3 Implement the contact search index
    - Create `ext.contact_search_index` with an HMAC-SHA-256 key in Vault, and add triggers that keep it for Customers, Orders, Enquiries and Quotations
    - Normalize email addresses to lower case and phone numbers to E.164 form with +91 as the default country code
    - Implement the search helper, which hashes the search value in the database and never writes the value to a log, and delete an Erased_Customer's rows in spec 1's erasure
    - _Requirements: 8.3, 8.4, 8.7, 10.3, 10.6_

  - [ ]* 3.4 Write property test for Masked_Value form
    - **Property 5: Masked_Value form**
    - **Validates: Requirements 2.7, 2.8, 2.11**

  - [ ]* 3.5 Write property test for the reveal limit
    - **Property 8: Reveal limit and audit**
    - **Validates: Requirements 2.14, 2.18, 2.19**

  - [ ]* 3.6 Write property test for contact search matching
    - **Property 10: Contact search matching**
    - **Validates: Requirements 8.4, 10.3**

- [x] 4. Implement invitations, staff functions and factor resets
  - [x] 4.1 Implement invitation acceptance
    - Implement `api.service_invite_inspect`, which checks the token and returns the masked email and whether an Auth account exists
    - Implement the `admin-invite-accept` Edge Function, which creates a new person's Auth user through the Auth admin API
    - Extend `api.admin_accept_invite` with `p_factor_id`: check `aal2` and the verified factor, then record the `ext.admin_mfa_factor` row, the admin link with the invited Roles and the accepted invitation in one transaction
    - _Requirements: 1.7, 13.7_

  - [x] 4.2 Implement the staff functions
    - Implement `api.admin_users_list`, `api.admin_roles_list`, `api.admin_invitations_list`, `api.admin_invitation_resend` and `api.admin_invitation_revoke`
    - Make a resend issue a new link that expires after 72 hours and invalidate the earlier link, and make a revocation invalidate the link
    - Extend `api.admin_invite_user` to reject an invitation without a Role or to the email address of an existing Admin_User or pending invitation, and `api.admin_delete_role` to reject a Role in use with the counts of Admin_Users and pending invitations
    - _Requirements: 13.2, 13.3, 13.5, 13.6, 13.7, 13.14_

  - [x] 4.3 Implement the factor reset
    - Implement the `admin-mfa-reset` Edge Function for the owner Role as a Sensitive_Action, which deletes the Admin_User's TOTP factors and signs out every session through the Auth admin API
    - Implement `api.service_mfa_reset_complete`, which removes the `ext.admin_mfa_factor` rows, writes the Audit_Log entry and issues a new invitation with the same Roles
    - _Requirements: 1.28, 1.29, 1.30_

  - [x] 4.4 Write the step-up integration test
    - Sign in, verify TOTP, wait past the Re_Authentication_Window, verify again and assert that the `amr` TOTP timestamp moved forward
    - If the test fails, implement the `ext.admin_step_up` fallback of KD-4 before any Sensitive_Action screen
    - _Requirements: 1.17, 1.19_

  - [ ]* 4.5 Write property test for invitation links
    - **Property 3: Invitation links**
    - **Validates: Requirements 1.7, 13.5, 13.6, 13.7**

  - [ ]* 4.6 Write Deno tests for the invitation and reset functions
    - Test invitation acceptance for new and existing accounts and the factor reset, with fakes for the Auth admin API
    - _Requirements: 1.7, 1.28_

- [x] 5. Build the Admin_App shell
  - [x] 5.1 Implement the Admin_API client
    - Implement `callAdmin(fn, params)` as a POST RPC through `postgrest-js`, adding an Idempotency_Key to each write when the Admin_User submits it and reusing the key for every retry
    - Add the configurable request timeout (default 15 seconds), the error-envelope mapping and the request ID
    - Resend a write only after a network failure, a timeout, a 503, `idempotency_in_progress` or a completed step-up, and keep responses in an in-memory TanStack Query cache with no persistence
    - _Requirements: 3.11, 3.12, 3.13_

  - [x] 5.2 Implement sessions across tabs
    - Keep the Auth session in `localStorage` under one admin key, and share Admin_Activity pings (at most one per 15 seconds), warnings, sign-out and Session_Rejection through a `BroadcastChannel`
    - Show the idle warning with a keep-active control 60 seconds before the Idle_Timeout, and the absolute warning with the end time 10 minutes before the Absolute_Session_Limit
    - At either limit, on sign-out and on a Session_Rejection, remove the session and all Local_Admin_Data from every tab within 2 seconds, also when Supabase Auth is unreachable
    - _Requirements: 1.20, 1.21, 1.22, 1.23, 1.25, 1.26_

  - [x] 5.3 Build the sign-in, TOTP, password reset and invitation pages
    - Build the sign-in page with Turnstile, one error message for every rejected sign-in, and the not-an-Admin_User and account-disabled messages
    - Build TOTP verification on a fresh page load, with the invalid-code message, sign-out after 5 consecutive rejected codes and the no-factor message
    - Build the password reset page, and the invitation page, which reads the token from the URL fragment, removes it from the address bar, runs TOTP enrolment with a QR code and text secret and shows the invalid-invitation message
    - Show a sign-out control on every screen while a session exists
    - _Requirements: 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.24, 1.27, 13.8_

  - [x] 5.4 Implement step-up for Sensitive_Actions
    - Open the TOTP dialog before a Sensitive_Action when the last verification is older than the Re_Authentication_Window, and on a `reauth_required` rejection
    - After verification, resend the request with the same Idempotency_Key and input
    - _Requirements: 1.18, 1.19_

  - [x] 5.5 Implement navigation and layout
    - Implement the route registry with each entry's path, label key, Permission and badge source, and hide entries without the Permission
    - Show the permission message that names the missing Permission for a screen opened without it and for a denied request, keeping the input
    - Call `api.admin_me` on every navigation, so Role changes apply from the next screen
    - Below 768 px, show a top bar, a bottom bar with up to 5 permitted screens and a More menu, card lists and sticky action bars; from 768 px, show side navigation and tables, with wide tables scrolling inside their container
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3_

  - [x] 5.6 Build the shared components
    - Wrap the Radix UI dialog, dropdown menu, popover and tabs, loaded only on routes that use them, with a skip link, visible focus, 44 × 44 px targets, reduced motion and Client_Branding colours as CSS variables
    - Build the form helper with field errors from the error envelope, the unsaved-changes guard, and controls that stay disabled while a request is pending and re-enable on failure
    - Build the screen states: error boundaries, loading skeletons, the offline banner and the edit-conflict message with a reload control that keeps the input
    - Build the reveal control, which holds revealed values in component state only, drops them when the screen changes and shows the next allowed time after `reveal_limit_exceeded`
    - Build the URL filter state, which ignores an invalid value with a message and never records a searched email address or phone number, and the Saved_View menu, which opens other creators' views read-only
    - _Requirements: 2.13, 2.15, 2.16, 2.17, 2.20, 3.4, 3.5, 3.8, 3.9, 3.10, 6.35, 6.37, 8.6, 19.3, 19.4, 19.7_

  - [x] 5.7 Implement English and Hindi
    - Create `apps/admin/messages/en.json` and `hi.json`, load only the active language's catalog and fill ICU-style placeholders
    - Add the language switch to the sign-in screen, the TOTP screens and the account menu, and implement `api.admin_set_language` to save a signed-in Admin_User's choice
    - Apply the saved language, the language shown at sign-in or the Default_Admin_Language, show a missing Hindi string in English marked `lang="en"`, and translate Admin_API error codes and field names
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.19_

  - [x] 5.8 Implement the display formats
    - Format numbers and amounts with `Intl.NumberFormat` in the `en-IN` locale with Latin digits: INR with ₹ and 2 decimal places, and other currencies with their ISO code and decimal places
    - Format dates in day, month and 4-digit year order and times on a 12-hour clock with the active language's AM or PM marker, in the Store_Timezone
    - Read entered dates and times in the Store_Timezone
    - _Requirements: 4.9, 4.10, 4.11, 4.12, 4.13, 4.14, 4.15_

  - [ ]* 5.9 Write property test for display formats
    - **Property 42: Display formats**
    - **Validates: Requirements 4.9, 4.10, 4.11, 4.12, 4.13, 4.14**

  - [x] 5.10 Add the security headers and build checks
    - Write `_headers` with the CSP header (`frame-ancestors 'none'` and the `connect-src` list), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and the cache lifetimes for hashed assets and HTML
    - Write the post-build script that hashes every inline script and inserts the meta CSP first in `<head>`, allowing Turnstile only on the sign-in, invitation and password reset pages
    - Fail the build when a page lacks the meta CSP or a hash, a route's compressed initial JavaScript exceeds the budget, a Hindi string is missing or the static build holds a Secret
    - Add the lint rule that forbids `dangerouslySetInnerHTML`
    - _Requirements: 1.4, 1.5, 1.6, 3.6, 4.1, 14.30_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement the export pipeline
  - [x] 7.1 Create the export tables, bucket and policies
    - Create `ext.export_job` and the private `admin-exports` bucket
    - Create the `policy` schema with `policy.admin_export_read_allowed(name)`, and grant `authenticated` only `USAGE` on the schema and `EXECUTE` on the function
    - Add the read policy that lets only the requester read a ready export's parts while the export file lifetime lasts
    - _Requirements: 19.14_

  - [x] 7.2 Implement export creation and rendering
    - Implement the export source registry, in which each source names its read Permission, row query and column map
    - Implement `api.admin_export_create` with the Permission, unmasked-PII opt-in and Sensitive_Action checks, the 1,000,000-row limit, the export row threshold, the running export limit and the Audit_Log entry, storing a searched email address or phone number only as its hash and Masked_Value
    - Implement `internal.export_render_row` with masking, exact amounts, percentages with 4 decimal places, ISO dates and times with the Store_Timezone offset, empty cells for dashes, the leading apostrophe on formula characters and headings in the Admin_User's language
    - Implement `api.admin_export_page` for immediate exports in pages of 2,000 rows
    - _Requirements: 2.8, 2.9, 2.10, 4.17, 19.2, 19.9, 19.10, 19.12, 19.13, 19.17, 19.18, 19.19, 19.21_

  - [x] 7.3 Implement Background_Exports
    - Implement the `export-worker` Edge Function, which claims a job with a lease, renders pages of 20,000 rows through `api.service_export_render_page`, uploads each page as a part object and continues from the stored page number
    - Queue a pg_net wake-up on commit, with a pg_cron run every minute as the fallback, and mark a failed job `failed` with the reason and no parts
    - Implement `api.admin_export_download` and `api.admin_exports_list`
    - Add the cleanup endpoint and the hourly cleanup job, which delete expired parts through the Storage API and mark the jobs `expired`
    - _Requirements: 19.11, 19.14, 19.16, 25.5_

  - [x] 7.4 Build the export Web Worker
    - Join the pages or parts into one CSV file with one byte-order mark, or stream them into an XLSX file with `fflate`
    - Name each file from the Report's English name in lower case, the Reporting_Period dates, the Store_Timezone with "/" replaced by "-" and the creation time
    - _Requirements: 19.9, 19.20_

  - [x] 7.5 Build the Exports screen and the export dialog
    - Build the export dialog with the CSV or XLSX choice, the unmasked-PII option for Admin_Users who hold `pii:reveal`, and the step-up
    - Build the Exports screen with each Background_Export's progress, the ready notice with a download control, the expired message and a CSV suggestion above 200,000 rows
    - _Requirements: 2.9, 19.11, 19.15_

  - [ ]* 7.6 Write property test for export cells
    - **Property 43: Export cells**
    - **Validates: Requirements 19.18, 19.19**

  - [ ]* 7.7 Write Deno tests for `export-worker`
    - Test lease expiry, continuation from the stored page number and the removal of parts after a failure
    - _Requirements: 19.16_

- [x] 8. Implement catalog and inventory management
  - [x] 8.1 Implement the catalog admin functions
    - Implement `api.admin_products_list` and `api.admin_products_get`, and add the checks of Req 6 that spec 1's catalog and price functions lack, such as no deletion of a product with Orders or of a category with child categories
    - Implement `api.admin_products_bulk_preview` and `api.admin_products_bulk_apply` for status, percentage price change and category, rounding new prices half up, rejecting a price below zero and re-checking every version
    - Create `ext.variant_supply_profile` and save each variant's lead time, pack size and unit cost
    - Implement `api.admin_preview_token(p_product_id)` with a 10-minute HMAC-signed token, and the store function with which spec 3's preview page checks the token
    - _Requirements: 6.3, 6.5, 6.7, 6.11, 6.13, 6.29, 6.30, 6.31, 6.32, 6.34, 17.4, 22.7_

  - [x] 8.2 Build the catalog screens
    - Build the product list and the product editor for variants, options, prices per currency and Region, Price_List schedules in the Store_Timezone, tags, types, attributes and supply profiles
    - Build the category tree with drag and drop and with move controls that need no dragging, and the collection screens
    - Upload media with per-file progress through `admin-media-upload`, showing each rejected file's error while the other files continue
    - Add the deletion confirmation, the has-Orders message with an unpublish control, publish and unpublish, the storefront preview in a new tab and the bulk edit preview
    - _Requirements: 6.1, 6.2, 6.4, 6.6, 6.8, 6.9, 6.10, 6.12, 6.28, 6.33, 6.34_

  - [x] 8.3 Implement the inventory admin functions
    - Implement `api.admin_inventory_list`, `api.admin_inventory_get`, `api.admin_inventory_movements_list`, `api.admin_low_stock_list`, `api.admin_stock_claims_list` and `api.admin_stock_location_priority_set`
    - Extend `api.admin_adjust_inventory` with an Adjustment_Reason from the Store_Settings list and a note of up to 500 characters, rejecting a zero or fractional change, and stock below zero with the current stocked quantity
    - Check that the Adjustment_Reason list holds 1 to 50 reasons, and keep each movement's reason text when a reason is removed
    - _Requirements: 7.1, 7.3, 7.4, 7.6, 7.7, 7.8, 7.9, 7.10, 7.13, 7.16, 7.18_

  - [x] 8.4 Build the inventory screens
    - Show each Inventory_Item's quantities per Stock_Location, the adjustment dialog with a required reason, and the movement history newest first
    - Show the low-stock list, the holds and Reservations of each variant, and the Stock_Location_Priority editor with drag and drop and move controls
    - _Requirements: 7.1, 7.2, 7.5, 7.11, 7.12, 7.13, 7.14, 7.16, 7.17_

  - [ ]* 8.5 Write property test for concurrent stock adjustments
    - **Property 13: Concurrent stock adjustments**
    - **Validates: Requirements 7.6, 7.7, 7.8**

  - [ ]* 8.6 Write property test for bulk price rounding
    - **Property 20: Bulk price rounding**
    - **Validates: Requirements 6.29, 6.30**

- [x] 9. Implement orders, fulfillment, returns and refunds
  - [x] 9.1 Implement the order admin functions
    - Implement `api.admin_orders_list` with the filters of Req 8 and keyset paging newest first, and `api.admin_orders_search` by display number, email address or phone number
    - Implement `api.admin_orders_get` with the totals breakdown, payments, fulfillments, Returns, Refundable_Amount, the actions that spec 1's state machine allows and the timeline from Audit_Log entries and order events
    - Create `ext.admin_note` and implement `api.admin_order_note_add` for notes of 1 to 2,000 characters
    - Implement `api.admin_order_invoice` with masked PII_Fields, and `api.admin_print_shipping_document(p_order_id, p_document)` for `order:fulfill`, which returns the full shipping name, address and phone with an Audit_Log entry
    - _Requirements: 8.1, 8.3, 8.4, 8.11, 8.14, 8.15, 8.16, 8.18, 8.19, 8.20, 8.22_

  - [x] 9.2 Add the fulfillment, return and refund checks
    - Add each check of Req 9 that spec 1's functions lack: fulfillment quantities under concurrent requests, `https://` tracking URLs, deliveries of shipped fulfillments only, Cash_On_Delivery cash amounts, Return quantities and resaleable items restocked at the chosen Stock_Location
    - Implement `api.admin_order_change_preview`, which returns the server-computed difference with the versions that the confirmation re-checks
    - Check each refund against the Refundable_Amount at processing time, require the Sensitive_Action check above the refund threshold, record provider rejections as failed and reject new refunds while one is pending
    - _Requirements: 9.2, 9.4, 9.11, 9.14, 9.16, 9.18, 9.19, 9.20, 9.22, 9.23, 9.24, 9.25_

  - [x] 9.3 Implement Payment_Incident resolution
    - Implement `api.admin_payment_incidents_list`, oldest first, and `api.admin_payment_incident_resolve` for a full refund or a backorder, with the Sensitive_Action check above the refund threshold
    - Reject a second resolution with `incident_already_resolved` and the first resolution's Admin_User, action and time
    - _Requirements: 9.27, 9.29, 9.30, 9.31_

  - [x] 9.4 Build the order screens
    - Build the Order list with the filters and their range checks, search that keeps the searched value out of the URL, Saved_Views and browser storage, Saved_Views and the empty state
    - Build the Order detail with Masked_Values and reveal, the timeline, notes, only the allowed actions and the edit-conflict message
    - Print the invoice with Masked_Values or revealed values, and the packing slip and shipping label with the values from `api.admin_print_shipping_document`
    - _Requirements: 8.1, 8.2, 8.5, 8.6, 8.8, 8.9, 8.10, 8.17, 8.21, 8.23, 8.24_

  - [x] 9.5 Build the fulfillment, return, refund and incident screens
    - Build fulfillment creation with the Stock_Location and quantities up to each unfulfilled quantity, shipment with carrier and tracking details, and delivery
    - Require a cash amount or a refused delivery for a Cash_On_Delivery Order, and a confirmation for an amount that differs from the amount due
    - Build Returns with resaleable flags and a Stock_Location, and exchanges, claims and order edits that show the server-computed difference before confirmation
    - Build the refund dialog with a reason and an amount up to the Refundable_Amount, and the Payment_Incident queue with its empty state
    - _Requirements: 9.1, 9.3, 9.10, 9.12, 9.13, 9.15, 9.17, 9.19, 9.21, 9.27, 9.28, 9.29, 9.32_

  - [ ]* 9.6 Write property test for order quantity and refund bounds
    - **Property 14: Order quantity and refund bounds**
    - **Validates: Requirements 9.2, 9.16, 9.22, 9.25**

  - [ ]* 9.7 Write property test for Payment_Incident resolution
    - **Property 15: Single Payment_Incident resolution**
    - **Validates: Requirements 9.31**

- [x] 10. Implement reviews, Enquiries, Quotations and badges
  - [x] 10.1 Implement the review, Enquiry and Quotation functions
    - Implement `api.admin_reviews_list`, with pending reviews oldest first, and `api.admin_reviews_moderate` for 1 to 100 reviews, all or none, with a rejection reason of 1 to 500 characters
    - Implement `api.admin_enquiries_list`, `api.admin_enquiries_get`, `api.admin_enquiry_set_status` with the allowed status changes, and `api.admin_enquiry_assign` to active Admin_Users who hold `enquiry:manage`
    - Create `ext.enquiry_reply` and implement `api.admin_enquiry_reply`, which checks the length (1 to 10,000 characters), stores the reply and sends it through the outbox to the Enquiry's email address
    - Implement `api.admin_quotations_list`, and add the price, expiry and status checks to `api.admin_price_quotation`
    - _Requirements: 14.1, 14.5, 14.6, 14.7, 14.8, 14.12, 14.14, 14.16, 14.17, 14.18, 14.20, 14.21, 14.22, 14.23, 14.24_

  - [x] 10.2 Implement the badge counts
    - Implement `api.admin_badge_counts` with the pending reviews, new Enquiries, requested Quotations and unresolved Payment_Incidents, each only for permitted screens and enabled Optional_Features
    - Refresh the badges on each navigation and at most 60 seconds after the previous refresh
    - _Requirements: 14.26, 14.27, 14.28_

  - [x] 10.3 Build the review, Enquiry and Quotation screens
    - Build the review moderation queue with single and bulk actions and the rejection reason
    - Build the Enquiry inbox with masked contact details, status changes, assignment and replies that start from an `enquiry_reply` template or an empty reply
    - Build the Quotation list by status and the pricing form with the expiry date, and show every text that Customers enter as plain text
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.9, 14.10, 14.11, 14.13, 14.15, 14.19, 14.23, 14.25, 14.29, 14.30_

- [x] 11. Implement settings, staff screens and the audit viewers
  - [x] 11.1 Implement the settings functions
    - Implement `api.admin_branding_update`, which rejects a brand colour whose Contrast_Ratio is below 4.5 and returns the ratio
    - Accept logo uploads through `admin-media-upload` with a branding target that accepts only PNG and WebP content by magic bytes, within the Logo_Size_Limit
    - Implement `api.admin_notification_template_preview`, and `api.admin_notification_test_send`, which sends only to the requesting Admin_User's own email address or phone number
    - Enable a Payment_Provider only after its Credential_Check passes, return each Secret only as configured or missing, require the Sensitive_Action check for provider settings, and write before and after values, other than Secrets, to the Audit_Log
    - _Requirements: 12.3, 12.8, 12.9, 12.10, 12.17, 12.19, 12.21, 12.23_

  - [x] 11.2 Build the settings screens
    - Build the screens for the store profile, Client_Branding with the live Contrast_Ratio rounded down to 2 decimal places, Regions, tax rates, Sales_Channels, Stock_Locations, Shipping_Options, Serviceability_Rules, Payment_Providers, Optional_Features, Rate_Limiter rules, notification rules and templates, and this spec's Store_Settings values
    - Show field errors, the edit-conflict message, the Credential_Check result, the template preview in English and Hindi with sample data, and the test-send control, which is disabled with a message when the profile lacks the contact detail
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 12.7, 12.18, 12.20, 12.22_

  - [x] 11.3 Build the staff and Role screens
    - Build the staff list with invitations, resends, revocations, Role changes, disabling and factor resets, with the step-up for Role assignments and factor resets, and the last-owner message
    - Build the Role builder with Permission descriptions in the Admin_User's language, including this spec's Permissions, and show System_Roles read-only
    - _Requirements: 13.1, 13.3, 13.4, 13.9, 13.10, 13.11, 13.12, 13.13, 13.15, 13.16, 13.17, 13.27, 25.8_

  - [x] 11.4 Implement the audit viewer functions
    - Implement `api.admin_audit_list` and `api.admin_security_events_list` with the filters of Req 13 and keyset paging on (time, ID), and `api.admin_audit_get` with masked old and new values
    - Register the Audit_Log and Security_Events export sources, which need `audit:read` and `reports:export`
    - _Requirements: 13.19, 13.20, 13.21, 13.22, 13.25, 13.26_

  - [x] 11.5 Build the audit viewers
    - Build the Audit_Log and Security_Events viewers with the filters, the date range check, the empty state, the entry detail with Masked_Values and the export with the step-up
    - _Requirements: 13.19, 13.20, 13.21, 13.23, 13.24, 13.25, 13.26_

  - [ ]* 11.6 Write property test for the active owner rule
    - **Property 4: An active owner always remains**
    - **Validates: Requirements 13.17, 13.18**

  - [ ]* 11.7 Write property test for Contrast_Ratio
    - **Property 44: Contrast_Ratio**
    - **Validates: Requirements 12.7, 12.8**

  - [ ]* 11.8 Write property test for keyset paging
    - **Property 45: Keyset paging**
    - **Validates: Requirements 8.12, 13.22**

- [x] 12. Implement the import pipeline
  - [x] 12.1 Create the import tables, bucket and job functions
    - Create `ext.import_job`, `ext.import_row` and `ext.import_error`, with the partial unique index that allows one applying job per kind
    - Create the private `admin-imports` bucket (25 MB limit, `text/csv`) and its insert policy through `policy.admin_import_upload_allowed(name)`
    - Implement `api.admin_import_create` with the kind's Permission and the declared size check, returning the import ID and the Storage path
    - _Requirements: 6.18, 7.20_

  - [x] 12.2 Implement the `import-dry-run` Edge Function
    - Accept only the job owner's JWT, and check the stored file's size against the configured CSV_Size_Limit
    - Stream the file, reject a file over the CSV_Row_Limit, without a required column or without data rows, and map English and Hindi headings
    - Insert the rows in chunks of 1,000 through `api.service_import_add_rows`, saving the byte offset and continuing in a new invocation before the CPU budget runs out
    - _Requirements: 4.18, 6.18, 6.19, 6.20, 7.20, 9.7, 12.13_

  - [x] 12.3 Implement the validators
    - Implement `internal.import_validate(job)` with one set-based validator for each of Catalog_CSV, Stock_CSV, Bulk_Ship_CSV and Serviceability_Rule files
    - Store each error with its row number and message key, the create and update counts and the version of each target record
    - _Requirements: 6.17, 7.21, 9.6, 12.14_

  - [x] 12.4 Implement confirmation and the apply job
    - Implement `api.admin_import_confirm`, which rejects a job with errors (`import_has_errors`), a kind that is already applying (`import_in_progress`) or a Dry_Run older than 24 hours (`dry_run_expired`)
    - Implement the apply job, run every minute, with the advisory lock per kind, a 120-second `statement_timeout`, version re-checks and the single-edit internal write functions for every row
    - Roll back every row on any failure and record the failing row and its error, and delete staged files and rows after 7 days through the cleanup endpoint
    - _Requirements: 6.23, 6.24, 6.25, 6.26, 6.27, 7.22, 7.23, 9.8, 9.9, 12.15, 12.16, 25.5_

  - [x] 12.5 Implement the column maps and the Catalog_CSV export
    - Define one column map per import kind with English and Hindi headings, shared by export and import
    - Register the `catalog` export source for the product list's filters, with the step-up
    - _Requirements: 4.18, 6.14, 6.15, 6.16_

  - [x] 12.6 Build the Imports screen
    - Upload files with `storage-js` and show the Dry_Run result with paged row errors and the create and update counts
    - Keep the confirmation disabled while the Dry_Run has errors, poll the job status, and show the failing row with the message that no row was applied
    - _Requirements: 6.17, 6.22, 6.25, 7.19, 9.5, 12.12_

  - [ ]* 12.7 Write property test for clean Dry_Runs
    - **Property 17: Imports need a clean Dry_Run**
    - **Validates: Requirements 6.23, 6.27, 7.22, 9.8, 12.15**

  - [ ]* 12.8 Write property test for Dry_Run errors
    - **Property 18: Dry_Run errors**
    - **Validates: Requirements 7.21, 9.4, 9.6, 12.14**

  - [ ]* 12.9 Write property test for the catalog round trip
    - **Property 19: Catalog round trip**
    - **Validates: Requirements 4.18, 6.16**

  - [ ]* 12.10 Write property test for Edit_Conflict
    - **Property 12: Edit_Conflict**
    - **Validates: Requirements 6.26, 6.32, 6.36, 9.20**

  - [ ]* 12.11 Write Deno tests for `import-dry-run`
    - Test the size and row limits, the heading maps, and lease expiry with continuation from the stored byte offset
    - _Requirements: 6.18, 6.19_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Build the analytics data layer
  - [x] 14.1 Create the fact tables and triggers
    - Create `ext.order_fact`, `ext.order_line_fact`, `ext.refund_fact`, `ext.fulfillment_fact` and `ext.payment_attempt_fact` with their indexes
    - Keep the facts up to date with `ext_`-prefixed statement-level triggers on the Medusa order, line item, payment, refund, fulfillment and Order_Change tables, and from spec 1's payment Analytics_Events
    - Store amounts without tax at full precision and each row's `local_day` in the Store_Timezone, and backfill the facts from existing Orders on their original placement days
    - _Requirements: 5.1, 5.2, 21.19, 24.12, 24.13_

  - [x] 14.2 Implement the rollups and dirty days
    - Create `ext.daily_payment_rollup`, `ext.daily_cart_rollup`, `ext.daily_search_term_rollup` and `ext.rollup_dirty_day`
    - Implement `internal.refresh_rollups`, run every 15 minutes for the last 3 days and every dirty day, setting `refreshed_at` on each rebuilt row
    - Insert the placement day and the refund day into `ext.rollup_dirty_day` when an Order is canceled or refunded or an Order_Change applies
    - Mask search terms that contain "@" or 7 or more digits when spec 1 ingests them, and normalize terms before they reach the rollup
    - _Requirements: 16.17, 24.7, 24.8, 25.5_

  - [x] 14.3 Implement the customer metrics job
    - Create `ext.customer_metrics` and compute it nightly per Customer and currency: first and last Order times, order count, Lifetime_Value, RFM values and scores, the RFM_Segment of the first matching rule, and Churn_Risk
    - _Requirements: 10.8, 16.6, 16.7, 16.8, 16.9, 16.10, 16.11_

  - [x] 14.4 Implement the Reconciliation_Job
    - Create `ext.reconciliation_run` and run the job daily at the reconciliation time for the previous Store_Timezone day
    - Compute each KPI per Sales_Channel and currency straight from the Medusa tables, with SQL separate from the fact path, and compare it with the rollup totals to the minor unit
    - Record each difference, mark the day dirty and rebuild the day
    - _Requirements: 24.2, 24.3, 24.5, 25.5_

  - [x] 14.5 Implement the Store_Timezone rebuild
    - Make a Store_Timezone save a Sensitive_Action that starts a batched rebuild of the facts' local days and the rollups, tracked in `ext.rebuild_state`
    - Implement the check that report functions call first, which returns `rebuild_in_progress` while the rebuild runs
    - _Requirements: 24.14, 24.15_

  - [ ]* 14.6 Write property test for Store_Timezone days
    - **Property 26: Store_Timezone days**
    - **Validates: Requirements 24.13**

  - [ ]* 14.7 Write property test for RFM scores and Churn_Risk
    - **Property 28: RFM scores, segments and Churn_Risk**
    - **Validates: Requirements 16.6, 16.7, 16.8, 16.9, 16.10**

- [x] 15. Implement customer management
  - [x] 15.1 Implement the customer admin functions
    - Implement `api.admin_customers_list`, newest first, `api.admin_customers_search` by email address or phone number, and `api.admin_customers_get` with the profile values of Req 10, the deletion status and the erased marker
    - Implement `api.admin_customer_note_add`, and `api.admin_customer_group_add` and `api.admin_customer_group_remove`, which change one membership each
    - Make `api.admin_reenable_cod` reject a Customer whose Cash_On_Delivery is enabled, and register the `customers` export source with the list's search
    - _Requirements: 10.1, 10.3, 10.8, 10.12, 10.13, 10.16, 10.17, 10.18, 10.19, 10.21, 10.24_

  - [x] 15.2 Build the customer screens
    - Build the Customer list and profile with Masked_Values and reveal, search that keeps the value out of the URL, Saved_Views and browser storage, and the empty and not-found states
    - Show the Customer's Orders newest first, notes, Customer_Group controls, the re-enable control only for disabled Cash_On_Delivery and holders of `cod:manage`, and the read-only deletion status
    - Add the Customer export with the step-up
    - _Requirements: 10.2, 10.4, 10.5, 10.7, 10.9, 10.10, 10.11, 10.14, 10.15, 10.20, 10.22, 10.23_

- [x] 16. Implement the KPI engine, Dashboard and Reports
  - [x] 16.1 Implement the KPI engine
    - Implement `internal.kpi_values(p_period, p_filters)` per currency, from rollups when every filter is a rollup dimension and from facts otherwise, with a dash for a zero divisor and 0 for no records
    - Implement `internal.comparison_period` for the previous period and the same period one year earlier, with 29 February moved to 28 February, and compute changes from unrounded values with the dash rules
    - Compute the Data_Freshness from `refreshed_at`, or from the facts' last change time
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.16, 5.17, 5.18, 5.19, 5.20, 5.21, 5.22, 5.26, 24.12_

  - [x] 16.2 Implement the Dashboard function
    - Implement `api.admin_dashboard(p_period, p_comparison)` with the KPIs, changes, Data_Freshness and stale flags, returning an error item for a KPI that fails while the other KPIs still return
    - _Requirements: 5.23, 5.26, 5.27, 5.29, 5.37_

  - [x] 16.3 Implement the sales and product Reports
    - Implement `api.admin_report_sales` and `api.admin_report_products` with the shared shape, Report_Buckets with partial flags, the groupings with "mixed" and "(none)", stored product titles, the top and bottom lists, and the refund-date and multi-category notes
    - Register both Reports as export sources
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10, 15.11, 15.12, 15.13, 15.15, 15.16, 15.17_

  - [x] 16.4 Implement the customer and marketing Reports
    - Implement `api.admin_report_customers`, `api.admin_report_funnel`, `api.admin_report_abandoned_carts`, `api.admin_report_attribution` and `api.admin_report_search_terms` with aggregate values only, and register them as export sources
    - _Requirements: 16.2, 16.3, 16.4, 16.5, 16.12, 16.13, 16.14, 16.15, 16.16, 16.17_

  - [x] 16.5 Implement the operations Reports
    - Implement `api.admin_report_inventory`, `api.admin_report_payments`, `api.admin_report_shipping` and `api.admin_report_promotions`, with nearest-rank percentiles, the backlog age bands, deleted records under their last saved name and the blocked code attempts, and register them as export sources
    - _Requirements: 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10, 17.11, 17.12, 17.14, 17.15, 17.16, 17.17_

  - [x] 16.6 Build the Dashboard screen
    - Build the in-house SVG charts (line with band, bar and sparkline), each with a table view for screen readers
    - Build the Dashboard with the period presets in the Store_Timezone (default last 30 days), the custom range check, comparisons, display rounding half up, the stale-data warning and a retry control per KPI
    - Open each KPI's Report with the Dashboard's periods
    - _Requirements: 5.13, 5.14, 5.15, 5.24, 5.25, 5.27, 5.29, 5.30, 5.36_

  - [x] 16.7 Build the Report screens
    - Build the common filter bar with the Reporting_Period, Comparison_Period, Sales_Channel, Region, currency and each Report's own filters, groupings and sort orders
    - Show the Data_Freshness, the dash and no-data states, the rebuild message and the timeout message on every Report, and open customer drill-downs as the Customer list
    - Add the Report_Export with the step-up to every Report
    - _Requirements: 15.1, 15.14, 15.18, 16.1, 16.2, 16.18, 17.1, 17.13, 17.18, 19.1, 24.9, 24.11, 24.15_

  - [x] 16.8 Build the Metric_Dictionary and data health screens
    - Write `supabase/contracts/metrics.json` with each KPI and measure's formula in English and Hindi, source data, placing date and Reports
    - Render the Metric_Dictionary, and the data health screen with the last Reconciliation_Job run or the no-run-yet message
    - _Requirements: 24.1, 24.6, 24.16, 24.17_

  - [ ]* 16.9 Write property test for KPI formulas
    - **Property 22: KPI formulas**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 24.12**

  - [ ]* 16.10 Write property test for period presets and comparisons
    - **Property 23: Period presets and comparisons**
    - **Validates: Requirements 5.14, 5.16, 5.17, 5.18, 5.19, 5.20, 5.21, 5.22**

  - [ ]* 16.11 Write property test for display rounding
    - **Property 24: Rounding for display**
    - **Validates: Requirements 5.24, 5.25, 19.18**

  - [ ]* 16.12 Write property test for rollup agreement
    - **Property 25: Rollups, facts and direct computation agree**
    - **Validates: Requirements 15.6, 24.2, 24.8, 24.12**

  - [ ]* 16.13 Write property test for Report grouping and statistics
    - **Property 27: Report grouping and statistics**
    - **Validates: Requirements 15.8, 15.10, 17.5, 17.10, 17.11, 17.12**

- [x] 17. Implement promotions management
  - [x] 17.1 Implement the promotion admin functions
    - Implement `api.admin_promotions_list` and `api.admin_promotions_get` with usage per currency from `internal.kpi_values`, budget progress and the attempts blocked in the Code_Attempt_Window
    - Implement `api.admin_promotion_codes_generate` for 1 to 10,000 codes, mapping `gen_random_bytes` bytes modulo 32 to the Code_Alphabet, inserting against the unique normalized-code index and redrawing collisions in the same transaction
    - Implement `api.admin_promotion_codes_export` through the export pipeline with the step-up, and add the checks of Req 11 that spec 1's Promotion and Campaign saves lack
    - _Requirements: 11.3, 11.4, 11.5, 11.6, 11.9, 11.10, 11.11, 11.12, 11.13, 11.16, 11.18, 11.20, 11.21, 11.22_

  - [x] 17.2 Build the promotion screens
    - Build the Promotion and Campaign editors with field errors and the edit-conflict message, code entry, batch generation, usage statistics, budget progress and the codes download
    - _Requirements: 11.1, 11.2, 11.7, 11.8, 11.14, 11.16, 11.17, 11.18, 11.19, 11.21, 11.22_

  - [ ]* 17.3 Write property test for promotion codes
    - **Property 21: Promotion codes**
    - **Validates: Requirements 11.10, 11.11, 11.12**

  - [ ]* 17.4 Write property test for all-or-nothing batches
    - **Property 16: All-or-nothing batches**
    - **Validates: Requirements 6.24, 6.31, 7.23, 9.9, 11.13, 12.16, 14.7**

- [x] 18. Implement the GST module
  - [x] 18.1 Implement the GST configuration
    - Create `ext.gst_profile`, `ext.tax_head_map` and `ext.gst_state` with the GST state codes
    - Implement `internal.is_valid_gstin` and check the store GSTIN on save, next to the filing frequency, minimum HSN_Code digits, B2C large threshold, series prefixes and template version settings
    - _Requirements: 12.6, 18.2_

  - [x] 18.2 Implement GST_Document issue
    - Create `ext.gst_counter`, `ext.gst_document` and `ext.gst_document_line`, with triggers that reject every update and delete, and register `gst_document.buyer_name` in `ext.pii_field`
    - Implement `internal.gst_issue_invoice(order_id)`, which a trigger calls on an Order's first shipment, locking the counter row, building the number and recording the buyer details, Place_Of_Supply and lines
    - Implement `internal.gst_issue_note(kind, order_id, source_id)` for Credit_Notes and Debit_Notes, with one Credit_Note for a Return and its refund
    - Make `api.admin_order_invoice` return the Tax_Invoice once it exists, and before that an order summary marked "not a tax invoice"
    - _Requirements: 8.20, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 18.10, 18.11_

  - [x] 18.3 Implement the GST_Reports
    - Implement `internal.gst_section(p_filing_period, p_section)` and `api.admin_report_gst` with the GSTR-1 sections, the HSN summary in B2B and B2C parts and the GSTR-3B summary
    - Reconcile each section with its document lines to the paisa, return the warnings, and implement `api.admin_gst_documents_list` and `api.admin_gst_document_get`
    - _Requirements: 18.1, 18.12, 18.13, 18.14, 18.15, 18.16, 18.17, 18.18_

  - [x] 18.4 Implement the GST export
    - Add the GST export source with one renderer per portal table for the recorded template version, rejecting an export on a reconciliation difference with `gst_reconciliation_failed`
    - Write B2B receiver names unmasked and no other PII_Fields, and zip one CSV file per table with the warnings summary in the export Web Worker
    - _Requirements: 18.1, 18.19, 18.21, 18.22_

  - [x] 18.5 Build the GST screens
    - Build the GST settings screens, including the HSN_Code, Unit_Quantity_Code and GST_Treatment per product and variant
    - Build the GST_Reports screen with the Filing_Period choice, the missing-settings message, the warnings and errors, and the warning confirmation before export
    - _Requirements: 12.1, 18.2, 18.3, 18.13, 18.16, 18.18, 18.20_

  - [ ]* 18.6 Write property test for the GSTIN check
    - **Property 29: GSTIN check**
    - **Validates: Requirements 12.6, 18.13**

  - [ ]* 18.7 Write property test for GST issue and numbering
    - **Property 30: GST issue and numbering**
    - **Validates: Requirements 18.4, 18.5, 18.6, 18.7**

  - [ ]* 18.8 Write property test for GST document totals
    - **Property 31: GST documents add up**
    - **Validates: Requirements 18.9, 18.10**

  - [ ]* 18.9 Write property test for immutable GST documents
    - **Property 32: GST documents never change**
    - **Validates: Requirements 18.8**

  - [ ]* 18.10 Write property test for supply type and section totals
    - **Property 33: Supply type and section totals**
    - **Validates: Requirements 18.11, 18.12, 18.14, 18.17, 18.18, 18.19**

  - [ ]* 18.11 Write the GST fixture tests
    - Check hand-computed Orders against the GST portal offline tool templates: each section's columns and totals, the B2B and B2C HSN parts, Credit_Note and Debit_Note references, and a Financial_Year change
    - _Requirements: 18.14, 18.15, 18.21_

- [x] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Implement forecasting and reorder suggestions
  - [x] 20.1 Create the forecasting tables and the run start
    - Create `ext.forecast_run`, `ext.forecast_series`, `ext.forecast_point` and `ext.special_date`
    - Implement `internal.forecast_run_start` and the job that checks every 15 minutes and starts one run per Store_Timezone day after the refresh time
    - Mark series below the minimum history "not enough data", give variants without units in the inactivity window zero Forecasts, and queue the other series
    - _Requirements: 21.4, 21.8, 21.10, 21.19, 21.20, 25.5_

  - [x] 20.2 Implement `forecast-worker`
    - Claim up to 100 queued series with `FOR UPDATE SKIP LOCKED` and a lease, and read their daily values through `api.service_forecast_inputs`
    - Implement seasonal naive, the moving average and additive Holt-Winters with a weekly season and grid search, the Backtest WAPE and the model choice with its tie order
    - Compute the Confidence_Bands and the standard deviation for day-ahead points, raising values and bounds below 0 to 0 for counts and units
    - Save each batch through `api.service_forecast_save` in one transaction, and keep a failed series' previous Forecast while recording the failure
    - _Requirements: 21.2, 21.3, 21.5, 21.6, 21.7, 21.11_

  - [x] 20.3 Implement the forecast, trend and reorder functions
    - Implement `api.admin_forecasts` with the model, WAPE, bands and Data_Freshness, `api.admin_trends` with the Trend_Window rules, and the Special_Date admin functions
    - Implement `internal.normal_quantile` with Acklam's approximation, and `api.admin_reorder_list` with the Stock_Out_Prediction, Safety_Stock, reorder quantity, order-by date, sort order, backorder flag and category and collection filters
    - Register the `reorder` export source for the Purchase_List with the step-up, and include Forecasts in the Store_Timezone rebuild
    - _Requirements: 21.1, 21.9, 21.12, 21.14, 21.16, 21.17, 21.18, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 22.12, 22.13, 22.14, 22.16, 24.14_

  - [x] 20.4 Build the forecast and reorder screens
    - Build the Forecasts and trends screen with band charts and Special_Dates marked, and the Special_Date settings
    - Build the Reorder screen with "order now", dashes, "not enough data", the filters and the Purchase_List export, and add the net sales Forecast per currency to the Dashboard
    - _Requirements: 5.34, 5.35, 21.9, 21.12, 21.13, 21.15, 21.18, 22.10, 22.11, 22.12, 22.13, 22.14, 22.15, 22.17_

  - [ ]* 20.5 Write property test for forecast model choice
    - **Property 34: Forecast model choice**
    - **Validates: Requirements 21.4, 21.5, 21.6, 21.7**

  - [ ]* 20.6 Write property test for forecast output and failures
    - **Property 35: Forecast output and failures**
    - **Validates: Requirements 21.2, 21.3, 21.8, 21.11**

  - [ ]* 20.7 Write property test for stock-out and reorder formulas
    - **Property 36: Stock-out and reorder formulas**
    - **Validates: Requirements 22.3, 22.4, 22.6, 22.7, 22.8, 22.9**

  - [ ]* 20.8 Write property test for trend lists
    - **Property 37: Trend lists**
    - **Validates: Requirements 21.14, 21.16, 21.17**

  - [ ]* 20.9 Write Deno tests for `forecast-worker`
    - Test each model against hand-computed series, and lease expiry with the reclaiming of unfinished series
    - _Requirements: 21.5, 21.11_

- [x] 21. Implement Alerts
  - [x] 21.1 Create the Alert tables and matching
    - Create `ext.alert_rule`, `ext.alert`, `ext.alert_note` and `ext.alert_delivery`, and seed the default Alert_Rules
    - Implement `internal.alert_match`, which upserts one open or acknowledged Alert per rule and Alert_Subject and applies the cooldown
    - _Requirements: 23.2, 23.3, 23.10, 23.11_

  - [x] 21.2 Implement the event, interval and forecast rules
    - Add the triggers for new Payment_Incidents, failed job runs, Webhook_Handler rows in `ext.error_log`, unmasked exports and reconciliation differences
    - Implement `internal.alert_evaluate` at the evaluation interval for low stock, payment failure, Cash_On_Delivery refusal and Security_Events, and run the stock-out and Anomaly rules after the Forecast run
    - Resolve low-stock, stock-out, Anomaly, payment failure and Cash_On_Delivery refusal Alerts automatically after 2 clear evaluations, and skip disabled rules
    - _Requirements: 20.15, 21.11, 23.6, 23.7, 23.8, 23.9, 23.18, 24.4, 25.5_

  - [x] 21.3 Implement Alert delivery and resolution
    - Deliver each Alert to the active Admin_Users who hold a recipient Role, with critical Alert emails through the outbox at once and other Alerts in digests, in per-language templates without PII_Fields
    - Implement `api.admin_alerts_list`, `api.admin_alert_acknowledge`, `api.admin_alert_resolve`, `api.admin_alert_rules_list` and `api.admin_alert_rule_save` with the note, status and Permission rules
    - Resolve a Payment_Incident Alert when its Payment_Incident is resolved
    - _Requirements: 4.16, 23.1, 23.4, 23.5, 23.12, 23.13, 23.14, 23.15, 23.16, 23.17, 23.19_

  - [x] 21.4 Build the Alert screens
    - Build the Alert list and history with filters, acknowledgment and resolution with notes, and the rule editor
    - Add the open Alerts to the Dashboard and to the badge counts
    - _Requirements: 3.2, 5.31, 5.32, 5.33, 23.12, 23.20, 23.21_

  - [ ]* 21.5 Write property test for Alert deduplication and cooldown
    - **Property 38: Alert deduplication and cooldown**
    - **Validates: Requirements 23.10, 23.11**

  - [ ]* 21.6 Write property test for Alert resolution
    - **Property 39: Alert resolution**
    - **Validates: Requirements 23.16, 23.17, 23.18, 23.19**

  - [ ]* 21.7 Write property test for unmasked exports
    - **Property 9: Unmasked exports**
    - **Validates: Requirements 2.9, 2.10, 23.3**

- [x] 22. Implement Scheduled_Reports
  - [x] 22.1 Create the schedule tables and admin functions
    - Create `ext.scheduled_report`, `ext.scheduled_report_recipient` and `ext.scheduled_run`, and implement `internal.schedule_next_run` with the daylight-saving rules
    - Implement the list, save, pause, resume and delete functions with the Permission rules and the recipient and schedule limits
    - _Requirements: 20.1, 20.2, 20.3, 20.5_

  - [x] 22.2 Implement the dispatcher and emails
    - Run the dispatcher every minute: claim due schedules, insert each Scheduled_Run with `ON CONFLICT DO NOTHING`, set the Covered_Period, record paused times as skipped and catch up once within the catch-up window
    - Remove recipients who are disabled or lack `reports:read`, with the reason, and skip a run without recipients
    - Build each email from `internal.kpi_values` with the Data_Freshness, the stale-data note, the link, the unsubscribe link and a CSV attachment from the Report's export source within the size limit, sent through the outbox with the key schedule + scheduled time + recipient
    - Extend `notifications-send` to attach CSV files and skip deliveries whose schedule is no longer active, and cancel pending deliveries on pause or delete
    - _Requirements: 4.16, 20.4, 20.6, 20.7, 20.8, 20.9, 20.10, 20.11, 20.12, 20.13, 20.14, 20.15, 20.16, 20.17, 20.20, 25.5_

  - [x] 22.3 Implement unsubscribe
    - Sign each unsubscribe link with an HMAC token for the schedule and the recipient
    - Extend spec 1's `unsubscribe` Edge Function to show the confirmation page, remove the recipient on POST with the reason "unsubscribed", and show the not-valid message for an altered token or a deleted schedule
    - _Requirements: 20.18, 20.19_

  - [x] 22.4 Build the Scheduled_Reports screen
    - Build the schedule list with each schedule's Report, frequency and time, status, next scheduled time, last result, recipients and removals, and the pause, resume and delete controls
    - Build the schedule editor with the frequency, weekday or day of month, local time, CSV option and recipients chosen from active Admin_Users who hold `reports:read`
    - _Requirements: 20.2, 20.3, 20.21_

  - [ ]* 22.5 Write property test for one email per scheduled time
    - **Property 40: One email per scheduled time**
    - **Validates: Requirements 20.11, 20.14, 20.16, 20.17**

  - [ ]* 22.6 Write property test for next run times
    - **Property 41: Next run time and Covered_Period**
    - **Validates: Requirements 20.4, 20.5**

  - [ ]* 22.7 Write property test for emails without PII
    - **Property 7: Emails without PII**
    - **Validates: Requirements 20.8, 23.15**

- [x] 23. Implement the Legacy_Admin cutover
  - [x] 23.1 Implement readiness and confirmation
    - Create `ext.cutover_state` and implement `api.admin_cutover_readiness` for the owner Role, running each readiness item, including a live Credential_Check through `admin-providers`
    - Implement `api.admin_cutover_confirm` with the owner Role, the Sensitive_Action check and an Idempotency_Key, rejecting the request with the failed items and otherwise recording the confirmation with an Audit_Log entry
    - _Requirements: 25.10, 25.11, 25.12, 25.14_

  - [x] 23.2 Switch the Legacy_Admin
    - Write the migration that makes `public.is_admin()` return false once `ext.cutover_state` holds a confirmation
    - Add the public cutover-status function, and make the Legacy_Admin layout redirect every `/admin` route to the Admin_App URL from its environment, caching the status for 60 seconds
    - _Requirements: 25.13, 25.15, 25.16_

  - [x] 23.3 Build the cutover screen
    - Show each readiness item by name as passed or failed, and the confirmation with the step-up and the advice to confirm right after the Migration_Tool cutover
    - _Requirements: 25.11, 25.12, 25.14_

  - [ ]* 23.4 Write property test for the cutover
    - **Property 46: Cutover**
    - **Validates: Requirements 25.12, 25.13, 25.16**

- [x] 24. Add the cross-cutting checks
  - [x] 24.1 Write the Storage access test
    - Assert that one Admin_User cannot read or write another Admin_User's import and export objects, that a stored import file cannot be overwritten and that the parts of an expired export cannot be read
    - _Requirements: 19.14, 25.2_

  - [x] 24.2 Add Lighthouse CI
    - Measure the median Largest Contentful Paint of 5 runs on the sign-in screen and the Dashboard under Lighthouse's default mobile throttling, and fail the build above the first-load budget
    - _Requirements: 3.7_

  - [ ]* 24.3 Write property test for Permission checks
    - **Property 2: Permission checks**
    - **Validates: Requirements 2.3, 5.37, 18.1, 20.1, 22.1, 23.1, 25.10**

  - [ ]* 24.4 Write property test for PII in responses
    - **Property 6: No unmasked PII outside the allowed responses**
    - **Validates: Requirements 2.7, 2.8, 2.11, 2.12, 8.5, 8.7, 10.4, 10.6, 18.22**

  - [ ]* 24.5 Write the browser tests
    - Test sign-in with TOTP, step-up, an Order from fulfillment to refund, a stock adjustment, a CSV import, an export and an Alert acknowledgment at 320, 768 and 1280 px in English and Hindi, with no axe violation at WCAG 2.2 A or AA, 44 × 44 px targets and session end in every tab within 2 seconds
    - _Requirements: 1.25, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 24.6 Write the load test
    - Generate a store with 1,000,000 Orders over 2 years, and check the 95th percentile response time of every Report with a 2-year Reporting_Period, the rollup refresh time and the nightly Forecast run
    - _Requirements: 24.10_

- [x] 25. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster first version.
- Each sub-task lists the requirements it covers.
- Checkpoints stop for a test run and for any questions.
- Property tests check the universal properties from the design, with one test per property tagged `Feature: admin-panel-analytics, Property N: <title>`, while example and integration tests cover specific cases.
- Spec 1's backend must be complete first. Tasks that extend spec 1 functions add only the checks and parameters that spec 1 lacks.
- The step-up test in 4.4 must pass before Sensitive_Action screens ship; if it fails, the KD-4 fallback comes first.
- Every screen uses the shell components of group 5, so Permissions, masking, errors and languages behave the same on every screen.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "2.3", "2.5", "3.1", "5.8", "14.1", "21.1"] },
    { "id": 2, "tasks": ["1.3", "2.4", "2.6", "2.7", "2.8", "3.2", "3.3", "3.4", "4.1", "4.3", "5.9", "7.1", "9.2", "11.1", "12.1", "14.2", "14.3", "14.6", "18.1", "21.5", "23.1"] },
    { "id": 3, "tasks": ["3.5", "3.6", "4.2", "4.4", "4.6", "5.1", "7.2", "8.1", "8.3", "9.1", "9.3", "9.6", "10.1", "12.2", "14.4", "14.5", "14.7", "18.6", "20.1", "22.1", "23.2", "24.1"] },
    { "id": 4, "tasks": ["4.5", "5.2", "7.3", "8.5", "8.6", "9.7", "11.4", "11.6", "12.3", "12.5", "12.11", "15.1", "16.1", "16.11", "18.2", "20.2", "21.3", "23.4"] },
    { "id": 5, "tasks": ["5.3", "5.4", "5.5", "7.4", "7.7", "11.8", "12.4", "12.8", "16.2", "16.3", "16.4", "16.5", "16.9", "16.10", "17.1", "18.3", "18.7", "18.8", "18.9", "20.3", "20.5", "20.6", "20.9"] },
    { "id": 6, "tasks": ["5.6", "5.7", "7.6", "10.2", "12.7", "12.9", "12.10", "16.12", "16.13", "17.3", "17.4", "18.4", "18.10", "20.7", "20.8", "21.2", "22.2", "24.3", "24.6"] },
    { "id": 7, "tasks": ["5.10", "7.5", "8.2", "8.4", "9.4", "10.3", "11.2", "11.3", "12.6", "16.6", "16.8", "18.11", "21.6", "21.7", "22.3", "22.4", "22.5", "22.6", "22.7", "23.3", "24.4"] },
    { "id": 8, "tasks": ["9.5", "11.5", "11.7", "15.2", "17.2", "18.5", "20.4", "21.4", "24.2"] },
    { "id": 9, "tasks": ["16.7"] },
    { "id": 10, "tasks": ["24.5"] }
  ]
}
```
