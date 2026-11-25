# Test guide (local, nothing touches your live Supabase project)

You do these steps first. When you are done, tell me what worked and what did not. I will then run
the full automated test and fix problems.

Open PowerShell in `c:\Users\palha\plusmark`. Docker Desktop must be running.

## 0. Start everything (3 terminals)

```powershell
# Terminal 1: database, auth, API, Studio
npm run backend:start
# Terminal 2: payment and email functions (leave running)
npm run backend:functions
# Terminal 3: your tests. First, one time after every database reset:
npm run backend:sync-config
```

| What | URL |
|---|---|
| API | http://127.0.0.1:55321 |
| Studio (tables, SQL) | http://127.0.0.1:55323 |
| Auth emails inbox (signup / reset mails) | http://127.0.0.1:55324 |

Razorpay test keys and the Resend key are read from `supabase/functions/.env.local`.
While your Resend domain is unverified, Resend only delivers to the email you registered with, so
use that address as the customer email below.

Clean data any time: `npm run backend:reset`, then `npm run backend:sync-config` again.

Paste this helper once in the terminal:

```powershell
function sb { node scripts/backend/cli.mjs @args }
```
`sb rpc <function>` calls a database function, `sb table <name>` reads a table, `sb fn <name>` calls
an edge function. JSON is piped in with a trailing `-`.

## 1. Products, attributes and variants

1. Studio > Table editor > `products`: 6 products (bottle, tawa, notebook, gel pens, container set, custom diaries).
2. `product_variants`: the bottle has 9 variants (3 sizes x 3 colours) priced 349 / 449 / 549 by size.
   The notebook has 9 (3 covers x 3 rulings). Gel pens have 3 pack sizes with their own prices.
3. As a guest:
   ```powershell
   sb table product_listing --select "slug,name,min_price_inr,max_price_inr,in_stock,cover_image"
   ```
   The diaries show no price (enquiry only).
4. A guest must not see private data. Both of these must return `[]` or an error:
   ```powershell
   sb table orders
   sb table coupons
   ```

## 2. Admin account with TOTP

```powershell
npm run backend:admin -- --email admin@plusmark.test --password "Plusmark#Admin1"
```
It prints a secret key and writes `.work\admin-totp-qr.svg`. Open that file, scan it with Google
Authenticator or Authy (or type the secret in), then enter the 6 digit code.

Check the lock:
```powershell
$A = @('--email','admin@plusmark.test','--password','Plusmark#Admin1')
sb rpc admin_dashboard @A              # password only: must say TOTP verification required
sb rpc admin_dashboard @A --code 123456   # use the current code from your app: must return numbers
```
Codes last 30 seconds. Use a fresh code in every admin command below.

## 3. Product create / edit / delete (admin)

Create a product with Size, Colour and a custom option, then generate every combination:

```powershell
'{ "slug":"steel-lunch-box","name":"Steel Lunch Box","category_id":"kitchen","gst_rate":18,"hsn_code":"7323","published":false,
   "blurb":"3 compartment lunch box",
   "options":[
     {"name":"Size","kind":"size","values":["Small","Large"]},
     {"name":"Color","kind":"color","values":[{"value":"Silver","swatch_hex":"#c0c0c0"},{"value":"Blue","swatch_hex":"#1d4ed8"}]},
     {"name":"Lid","kind":"custom","values":["Plain","Printed"]}
   ]}' | sb rpc admin_upsert_product @A --code 123456 -
```
Copy the returned id:
```powershell
$p = "<paste id>"
"{`"p_product_id`":`"$p`",`"p_base_price_inr`":299,`"p_price_by_value`":{`"Size`":{`"Small`":299,`"Large`":399}},`"p_stock`":20}" | sb rpc admin_generate_variants @A --code 123456 -
```
Expect `8` (2 x 2 x 2). In Studio > `product_variants`, Small variants cost 299 and Large 399.
Publish and edit, then archive and restore:
```powershell
"{`"id`":`"$p`",`"published`":true,`"blurb`":`"Updated blurb`"}" | sb rpc admin_upsert_product @A --code 123456 -
"{`"p_product_id`":`"$p`"}" | sb rpc admin_delete_product @A --code 123456 -
"{`"p_product_id`":`"$p`"}" | sb rpc admin_restore_product @A --code 123456 -
```
While archived, the product must not appear in `product_listing` for a guest.

Stock (pick a variant id in Studio):
```powershell
'{"p_variant_id":"<variant id>","p_delta":10,"p_reason":"purchase","p_note":"new batch"}' | sb rpc admin_adjust_stock @A --code 123456 -
```
`inventory_movements` must show the entry.

## 4. Prices, GST and coupons (as a guest)

```powershell
$v = (sb table product_variants --select id --filter "sku=eq.CONT-SET-3" | ConvertFrom-Json)[0].id
"{`"p_items`":[{`"variant_id`":`"$v`",`"quantity`":2}],`"p_state`":`"Gujarat`"}" | sb rpc quote_cart -
```
Container set costs Rs 499 with 18% GST included. Check for 2 pieces to Gujarat (the seller's state):
subtotal 998, shipping 40, `cgst` = `sgst`, `igst` 0.
* State `Maharashtra`: `igst` is filled, `cgst`/`sgst` are 0, shipping 60.
* 3 pieces (1497): shipping becomes 0 (free above 999).

Coupons: add `"p_coupon":"CODE"` to the call.
* `FLAT100`: needs Rs 999 or more (use 3 pieces), takes Rs 100 off.
* `WELCOME10`: first orders only, 10%, max Rs 200, minimum Rs 499.
* `FREESHIP`: removes shipping.
* `VIP20`: "not available for your account" for a guest. Works with `"p_email":"vip@example.com"`.
* `STATIONERY15`: nothing on kitchen items, 15% on stationery items.
* A wrong code gives a clear message and the cart still prices.

## 5. A real online payment (Razorpay test mode)

Place the order (use the email you registered on Resend):
```powershell
$order = @"
{"p_items":[{"variant_id":"$v","quantity":1}],"p_email":"YOUR_RESEND_EMAIL","p_phone":"9876543210","p_customer_name":"Test Buyer",
 "p_shipping_address":{"recipientName":"Test Buyer","phone":"9876543210","line1":"12 Test Street","city":"Ahmedabad","state":"Gujarat","pincode":"380001"},
 "p_payment_method":"razorpay"}
"@
$order | sb rpc place_order -
```
Copy `order_id` and `guest_token` from the result, then run `node scripts/backend/pay-server.mjs` and
open `http://localhost:4010/?order=<order_id>&token=<guest_token>`. Razorpay Checkout opens. Pay with
test card `4111 1111 1111 1111` (any future date, any CVV, OTP `1234`) or test UPI `success@razorpay`.

Expect on the page `{"ok":true,"order_number":"PM-..."}`. Then check:
* `orders`: status `confirmed`, payment_status `paid`, `invoice_number` set.
* `payments`: one row `captured`. `inventory_movements`: a `sale` row, stock down by 1.
* Your inbox: "Order PM-xxxx confirmed" with items, CGST/SGST, total and the order number.
* Failure: close Checkout without paying. The order stays `payment_pending` and is cancelled with
  the stock returned after 60 minutes (you can force it: Studio SQL `select expire_unpaid_orders();`
  after setting `unpaid_order_expiry_minutes` to 0 in `store_settings`).

The webhook (`razorpay-webhook`) is needed on the live site only. See the end of this guide.

## 6. Cash on delivery order, shipping with tracking, status updates

Place the same order with `"p_payment_method":"cod"`. Status is `confirmed` at once (COD is on in the
seed with a Rs 40 fee). Then, as admin:
```powershell
'{"p_filters":{"status":["confirmed"],"search":"Test Buyer"}}' | sb rpc admin_list_orders @A --code 123456 -
```
Filters you can combine: `status`, `payment_status`, `payment_method`, `date_from`, `date_to`,
`min_total`, `max_total`, `state`, `city`, `pincode`, `coupon`, `has_coupon`, `needs_attention`,
`customer_type` (guest / registered), `shipment_status`, `no_tracking`, `has_return`, `product_id`,
`search` (order number, email, phone, name, invoice, tracking number), `sort`, `dir`, `limit`, `offset`.

Pack, then ship with your own courier details:
```powershell
$o = "<order_id>"
"{`"p_order_id`":`"$o`",`"p_status`":`"processing`"}" | sb rpc admin_update_order_status @A --code 123456 -
"{`"p_order_id`":`"$o`",`"p_carrier_id`":`"delhivery`",`"p_tracking_number`":`"DL123456789`",`"p_eta_from`":`"2026-12-01`",`"p_eta_to`":`"2026-12-03`"}" | sb rpc admin_set_shipment @A --code 123456 -
```
Expect: order `dispatched`, a shipment with a Delhivery tracking link, and a "on its way" email with the
tracking button. For a courier not in the list use `"p_carrier_id":"other","p_carrier_name":"My Courier","p_tracking_url":"https://..."`.

What the customer sees (guest, with email):
```powershell
'{"p_order_number":"PM-xxxx-xxxx","p_email":"YOUR_RESEND_EMAIL"}' | sb rpc track_order -
```
(wrong email must return `not_found`). Mark delivered by setting the shipment status to `delivered`
(call `admin_set_shipment` again with `"p_shipment_id":"<id>","p_status":"delivered"`). The order
becomes `delivered`, and a COD order becomes `paid`.

## 7. Returns and refunds

As the customer (guest token from the order):
```powershell
$item = (sb table order_items --select id --filter "order_id=eq.$o" @A --code 123456 | ConvertFrom-Json)[0].id
"{`"p_order_id`":`"$o`",`"p_guest_token`":`"<guest_token>`",`"p_reason`":`"Item damaged`",`"p_reason_code`":`"damaged`",`"p_items`":[{`"order_item_id`":`"$item`",`"quantity`":1}]}" | sb rpc request_return -
```
Then as admin, with the returned `return_id` as `$r`: `approve`, `receive`, `refund`
(`admin_decide_return` with `p_return_id` and `p_action`). Receiving puts the stock back. Refund creates a
pending row in `refunds`.
* Razorpay order: `'{"refund_id":"<id>"}' | sb fn admin-refund @A --code 123456 -` sends the real
  test refund. Order becomes `refunded`, refund email goes out.
* COD order: `'{"p_refund_id":"<id>","p_reference":"UPI-ref"}' | sb rpc admin_mark_refund_done @A --code 123456 -`

Also try: cancel an unshipped paid order with `cancel_own_order` (stock returns, a pending refund is created), and
a return request after the 7 day window must be refused.

## 8. Reports

```powershell
sb rpc admin_dashboard @A --code 123456
'{"p_group":"day"}' | sb rpc report_sales @A --code 123456 -
sb rpc report_gst @A --code 123456
sb rpc report_top_products @A --code 123456
sb rpc report_inventory @A --code 123456
sb rpc report_payments @A --code 123456
sb rpc report_customers @A --code 123456
sb rpc report_coupons @A --code 123456
sb rpc report_returns @A --code 123456
sb rpc report_variant_options @A --code 123456
sb rpc report_cohorts @A --code 123456
sb rpc report_fulfilment @A --code 123456
```
Also `report_category_sales`, `report_geo`, `report_time_patterns`. Compare the sales and GST numbers
with the orders you placed.

## 9. Customer accounts, phone, email, cookie consent

1. Studio > Authentication > Add user (tick auto confirm), email `buyer@plusmark.test` and a password.
   `profiles` must have a row with that email. Set the phone as that user:
   ```powershell
   $B = @('--email','buyer@plusmark.test','--password','<their password>')
   $id = (sb table profiles --select id @B | ConvertFrom-Json)[0].id
   '{"full_name":"Buyer One","phone":"9876543210"}' | sb patch profiles - --filter "id=eq.$id" @B
   ```
2. Place an order while signed in (add `@B` to `place_order`) and confirm it shows with
   `sb table orders @B` for that user only. A second user must not see it.
3. A customer must not be able to make themselves admin. This must fail with "permission denied":
   ```powershell
   '{"role":"admin"}' | sb patch profiles - --filter "id=eq.$id" @B
   ```
4. Cookie consent:
   ```powershell
   '{"p_anon_id":"browser-abc-12345","p_preferences":true,"p_analytics":false,"p_marketing":false}' | sb rpc record_consent -
   ```
   A new row appears in `consents`.

## 10. Emails

Studio > `email_outbox` shows every email with status `sent` / `pending` / `failed` and the error text.
Types sent: order confirmation (with order number), payment failed, packing, shipped (with tracking
link), delivered, cancelled, return requested / approved / rejected / received, refund processed,
and two admin alerts (new order, needs attention) to `store_settings.seller_email`.
To resend a failed one: `'{"p_id":"<id>"}' | sb rpc admin_retry_email @A --code 123456 -`.

## 11. Live site setup (later, not for this local test)

1. Create the production Supabase project (or reset the old one) and run `supabase db push`.
2. Set function secrets: `supabase secrets set --env-file supabase/functions/.env.local`, then
   `supabase functions deploy`.
3. Razorpay dashboard > Webhooks: `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`,
   same secret as `RAZORPAY_WEBHOOK_SECRET`, events `payment.captured`, `payment.failed`, `order.paid`,
   `refund.processed`, `refund.failed`.
4. Supabase Auth: enable MFA TOTP, set site URL, turn on CAPTCHA, set `store_settings.seller_email`.
5. Run in SQL: `insert into app_config values ('edge_base_url','https://<ref>.supabase.co/functions/v1'),('job_secret','<same as NOTIFICATION_JOB_SECRET>')`.
6. Switch to `rzp_live_*` keys only when you are ready for real money.

## What to send me

For each section: "worked" or the exact message you saw. Anything that looked wrong even if it did
not error (a wrong total, a missing email) is just as useful.
