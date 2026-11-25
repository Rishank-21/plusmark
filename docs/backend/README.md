# Plusmark backend (Supabase)

Everything lives in `supabase/`: SQL migrations (schema, security, business logic), edge functions
(Razorpay, email), and `seed.sql` (local sample data). The old backend is archived in
`supabase/_old_migrations/` and is not used.

## What is where

| Need | Where |
|---|---|
| Accounts, phone, email, addresses | `profiles`, `addresses` |
| Cookie / data consent | `consents`, RPC `record_consent` |
| Admin login with TOTP | Supabase Auth MFA. `is_admin()` is true only for role `admin` AND a session verified with the 6 digit code (aal2) |
| Products, attributes, specs | `products` (+ `attributes` JSON for anything extra), `product_media`, `categories`, `series` |
| Size / colour / custom variants | `product_options` + `product_option_values` define the axes; `product_variants` holds each combination with its own price, stock, SKU |
| Create / edit / delete product | RPC `admin_upsert_product(json)`, `admin_generate_variants`, `admin_delete_product`, `admin_restore_product` |
| Inventory | `product_variants.stock`, `inventory_movements` (full log), RPC `admin_adjust_stock` |
| GST pricing | `compute_cart` (server is the only source of truth). CGST+SGST inside seller state, IGST outside. Prices inclusive or exclusive of GST via `store_settings.price_includes_gst` |
| Price a cart | RPC `quote_cart(items, coupon, state, email, payment_method)` |
| Place an order (guest or customer) | RPC `place_order(...)` |
| Real payments | Edge functions `create-payment`, `verify-payment`, `razorpay-webhook` |
| Order management | RPCs `admin_list_orders` (filters), `admin_get_order`, `admin_update_order_status`, `admin_set_order_notes` |
| Self shipping + tracking | `shipments`, `carriers`, RPC `admin_set_shipment` (carrier, tracking number, link). Customers see it in `track_order` and by email |
| Returns | RPC `request_return` (customer), `admin_decide_return` (approve / reject / schedule_pickup / receive / refund / close) |
| Refunds | `refunds`, edge function `admin-refund` (Razorpay), RPC `admin_mark_refund_done` (COD / bank) |
| Payment records | `payments`, `payment_events`, RPC `admin_record_payment` (COD / bank) |
| Offers and codes | `coupons` (percent / flat / free_shipping; everyone, specific people, or new customers; per category / product), `coupon_recipients`, `coupon_redemptions` |
| Emails | `email_outbox` queue + edge function `process-emails` (Resend) |
| Reports | RPCs `report_*` and `admin_dashboard` |
| Customers | RPC `admin_list_customers`, `admin_set_customer_blocked` |

## Order statuses
`placed`, `payment_pending`, `payment_failed`, `confirmed`, `processing`, `dispatched`, `delivered`,
`cancelled`, `return_requested`, `refund_processing`, `refunded`. These match the storefront types.
Payment status: `unpaid`, `pending`, `paid`, `failed`, `partially_refunded`, `refunded`.

## How the storefront should call it

Browser (anon key, never the service role key):

1. Catalogue: `from('product_listing').select('*')`, plus `product_media`, `product_options(*, product_option_values(*))`, `product_variants`.
2. Cart total: `rpc('quote_cart', { p_items: [{variant_id, quantity}], p_coupon, p_state })`.
3. Checkout: `rpc('place_order', {...})` returns `order_id`, `order_number`, `guest_token`.
4. Online payment: call function `create-payment` with `order_id` (+ `guest_token` for guests), open Razorpay Checkout with the returned values, then call `verify-payment` with the three Razorpay fields.
5. Tracking page: `rpc('track_order', { p_order_number, p_email })`.
6. Returns / cancel: `rpc('request_return', ...)`, `rpc('cancel_own_order', ...)`.

Admin app (session must be TOTP verified): everything named `admin_*` / `report_*`, direct table
access for categories, products, coupons, carriers and settings (RLS allows only admins), and the
`admin-refund` function.

## Money rules worth knowing
* Amounts are rupees with 2 decimals. Razorpay amounts are paise = `round(total * 100)`.
* Stock is reserved when the order is placed and returned when it is cancelled or payment times out
  (default 60 minutes, `store_settings.unpaid_order_expiry_minutes`, checked every 10 minutes).
* A coupon use is counted at order placement and released if the order is cancelled.
* Paid orders that get cancelled automatically get a pending refund row for the full amount.
* If a payment arrives after the unpaid order expired, the stock is re-taken. If it is gone, the
  order is flagged `needs_attention` and the admin gets an email.

## Not built here
* Admin web screens and storefront wiring (the frontend still uses dummy data).
* Rate limiting / captcha for guest checkout (add Cloudflare Turnstile or Supabase CAPTCHA before launch).
* Automatic courier tracking sync (you update status by hand, as planned).
* GST invoice PDF (the data is complete: invoice number, HSN, rates, CGST/SGST/IGST per order).
