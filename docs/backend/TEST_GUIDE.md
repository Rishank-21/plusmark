# Test guide (local only, your live Supabase project is not touched)

You test. Tell me for each numbered step: **worked**, or the exact message or what looked wrong.
Open PowerShell in `c:\Users\palha\plusmark`. Docker Desktop must be running.

## 0. Start everything

```powershell
npm run backend:start          # database, auth, API, Studio   (terminal 1)
npm run backend:functions      # payments, emails, invoice      (terminal 2, leave open)
npm run backend:sync-config    # once after every database reset
npm run backend:import         # loads your real storefront catalogue (boards) into the database
npm run dev                    # the website on http://localhost:3000 (terminal 3)
```

`npm run dev` uses the **local** backend because of `.env.development.local` (already created, git-ignored).
Your live project settings in `.env.local` are not used in dev.

| What | URL |
|---|---|
| Website | http://localhost:3000 |
| Admin | http://localhost:3000/admin |
| Studio (tables, SQL) | http://127.0.0.1:55323 |
| Auth emails inbox | http://127.0.0.1:55324 |

Start from clean data any time: `npm run backend:reset`, then `backend:sync-config`, then `backend:import`.

Notes before you start
* Prices on the site are **GST extra** ("+ GST"), as the product page says. Change this in Admin > Settings if you want GST-inclusive prices.
* Resend only delivers to the email you signed up with until you verify a domain. Use that address as the customer email, otherwise emails show as "failed" in Admin > Settings > Email log (that is expected).
* The import brings your 69 board products with their sizes. Prices are the storefront's demo rate card until you edit them in the admin.

## 1. Create your admin account (one time)

```powershell
npm run backend:admin -- --email admin@plusmark.test --password "Plusmark#Admin1"
```
It prints a secret key and writes `.work\admin-totp-qr.svg`. Scan that file with Google Authenticator or Authy and enter the 6 digit code.

## 2. Admin sign in with the authenticator code

1. Open http://localhost:3000/admin. You are sent to the sign in page.
2. Email and password, then Continue. A second box asks for the **6 digit code**.
3. Try opening http://localhost:3000/admin/orders now without the code: you must be sent back to the sign in page.
4. A wrong code is refused. The right code opens the dashboard.
5. A normal customer account (create one on the site) must see "not an administrator" at /admin/login.

## 3. Storefront: compare section and related products (controlled from the admin)

1. Admin > Products > open "Metallic Premium White Board" > section **Compare and suggestions**.
2. Under "Compare with similar products" add 2 or 3 other boards, reorder with the arrows, Save product.
3. Open http://localhost:3000/product/metallic-premium-white-board and scroll down. The comparison table now shows exactly those products in that order. (The page refreshes within about a minute.)
4. Remove all picks, save: the table goes back to the automatic choice.
5. "You may also like": add picks the same way. Picks come first, then products customers bought together fill the rest.

## 4. Storefront: cart, coupons, GST

1. Add a board to the cart. Cart page shows subtotal, GST and delivery from the server.
2. Apply `WELCOME10` (first order, 10 percent, max Rs 200) and `FLAT100`. A wrong code shows a clear message.
3. Admin > Coupons > New coupon: make a code for **specific people** (type their email). Try it in the cart with that email signed in or typed at checkout, and with a different email: it must refuse the other person.
4. At checkout choose a state in Gujarat, then another state: Gujarat shows CGST+SGST, other states show IGST, and the delivery charge follows Admin > Settings > "Delivery charge by state".

## 5. Guest checkout, cash on delivery

1. Cart > Checkout without signing in. Fill the form, choose Cash on delivery, Place order.
2. The confirmation shows an order number like `PM-2611-1001`. You get an email with that number.
3. Open the tracking link from the email (or Track an order with number + email). Wrong email must not show the order.

## 6. Real online payment (Razorpay test mode)

1. Checkout as a guest or signed in, choose Pay online, Pay. Razorpay opens.
2. Test card `4111 1111 1111 1111`, any future date and CVV, OTP `1234` (or UPI `success@razorpay`).
3. You land on the confirmation page, the order is `confirmed` and **paid**, an invoice number exists, you get the confirmation email.
4. Close the Razorpay window without paying: the order stays "payment pending" and shows a **Pay now** button on the order page. It is auto-cancelled and the stock returned after 60 minutes.
5. Try paying twice or reloading after paying: still one payment.
6. Customer page > order > **GST invoice (PDF)**: a proper tax invoice opens (CGST/SGST or IGST, HSN, amount in words).

## 7. Admin: orders, filters, shipping with tracking

1. Admin > Orders. Use the filters (status, payment, date range, state, coupon, guest/registered, amount, "no tracking added") and the search box (order number, email, phone, name, tracking number). **Export CSV** downloads the filtered list.
2. Open an order. Move **Confirmed to Processing** (tick "Email the customer").
3. **Shipping and tracking**: pick a courier, type the tracking number (or paste your own link), Save and mark dispatched. The order becomes Dispatched and the customer gets the shipped email with a Track button. On the customer's order page the tracking link shows.
4. Edit the shipment to "In transit", then set it to **Delivered**: the order becomes Delivered (a COD order becomes Paid).
5. Internal notes save and are never shown to the customer.

## 8. Returns and refunds

1. As the customer, order page > **Request a return** (works only after delivery and inside the return window, default 7 days).
2. Admin > Returns shows it. Open the order: **Approve**, then **Received and restock** (stock goes back), then **Create refund**.
3. Admin > Payments > **Refund via Razorpay** sends the real test refund (order becomes Refunded, refund email goes out). For COD orders use **Paid manually**.
4. Cancel a paid, unshipped order as the customer: stock returns and a full refund appears under Payments waiting for you.

## 9. Admin: products, variants, inventory

1. Admin > Products > **New product**: name, category, attributes (surface, frame, magnetic and so on), photos (upload or paste a link).
2. Add options: **+ Size** (values Small, Large), **+ Colour** (Red, Blue), **+ Custom option** (for example Lid: Plain, Printed). Optionally type a price next to a value (size specific pricing).
3. Enter a base price and **Build all combinations**: every size x colour x custom combination becomes a variant with its own SKU, price and stock. Edit any row, Save product.
4. Publish it and check it in the shop. Edit it, then **Archive** from the list (it leaves the shop, order history stays) and **Restore**.
5. Admin > Inventory: add or remove stock with a reason, see low stock, open History for every movement. Place an order and watch stock drop.

## 10. Reviews and fraud protection

1. On a product you bought and received, write a review. It publishes at once.
2. Try a review with a web link, a phone number or "call me / discount code": it is held. It does not count in the star rating until you approve it.
3. A customer who never received the product cannot review it.
4. Admin > Reviews shows held reviews with the reasons (link, phone, promotional, same text as another customer, many reviews in a day, several accounts from one network). Publish or Reject.

## 11. Reports

Admin > Reports: sales by day, week and month, GST (CGST, SGST, IGST by month and rate), best sellers, categories, sizes and colours sold, payments, stock and cover, customers, coupons, returns, state and city, fulfilment speed, busy hours, customer cohorts. Each has **CSV**. Compare a few totals with the orders you placed.

## 12. Customers, accounts, consent, settings

* Admin > Customers: search, see lifetime value, block or unblock, open a customer to see orders, addresses and cookie choices.
* On the website: register, save an address with a phone number, wishlist a product, log out and in again.
* Admin > Settings: store details and GSTIN (used on invoices), COD on/off and fee, delivery charges, return window, courier tracking link patterns, and the **Email log** with "Send again" for failures.

## 13. Abuse protection

* Place many guest orders quickly from one computer: after a few the site says "too many orders from this network".
* Try more than 3 cash on delivery orders in a day with one email or phone: refused.
* A guest cannot open anyone else's order, invoice or payment with a guessed order number.

## 14. When you go live (later)

1. New Supabase project (or reset the old one), `supabase db push`.
2. `supabase secrets set --env-file supabase/functions/.env.local` then `supabase functions deploy`.
3. Razorpay > Webhooks: `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`, same secret as `RAZORPAY_WEBHOOK_SECRET`, events `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`.
4. Supabase Auth: enable MFA TOTP, set site URL and redirect URLs, turn on CAPTCHA.
5. In SQL: `insert into app_config values ('edge_base_url','https://<ref>.supabase.co/functions/v1'),('job_secret','<same as NOTIFICATION_JOB_SECRET>')`.
6. Set `REQUIRE_CAPTCHA=true` and `TURNSTILE_SECRET_KEY` for the functions so guest checkout needs the security check.
7. Use `rzp_live_*` keys only when ready for real money.

## Command line helpers (optional)

```powershell
npm run backend:cli -- rpc admin_dashboard --email admin@plusmark.test --password "Plusmark#Admin1" --code 123456
npm run backend:cli -- table product_listing --select "slug,name,min_price_inr" --limit 5
npm run backend:smoke          # the automatic backend check I used (only if you want to run it)
```

---

## Round 2: fixes for what you reported (please re-check)

Restart `npm run dev` first (and run `npm run backend:functions` again if it was stopped). The `site_content` table already exists in your local database; after any reset it comes back by itself.

R1. **Admin changes reach the website** (the big one)
* Admin > Products > open a board > change a variant price, Save. Within about 30 to 60 seconds the product page, the shop cards and the cart show the new price (the cart and checkout charge exactly that price).
* Unpublish a board: it disappears from /shop, search and its own page (404). Publish it again: it returns.
* Create a brand new product (for example the Steel Tiffin with sizes and colours), publish it. It appears in /shop and opens at /product/<its-address>. Add it to the cart and place an order.
* Add a new size (variant) to an existing board in the editor: it shows in the size picker.

R2. **No more "Demo" wording** when the backend is connected: no demo badges, no "Demo price" notes, "Order confirmed" instead of "Payment confirmed" for COD, and the guest confirmation says "Plusmark order system (guest order)".

R3. **Guest unpaid order**: open the tracking link of a payment-pending guest order. It now has **Pay now**, **Cancel** and, after delivery, **Request a return**. The Razorpay form is prefilled with +91 and the 10 digit number (use a real looking mobile number such as 9825012345; Razorpay rejects some dummy numbers).

R4. **Reviews**: a held review now says "saved and will appear after a quick check". The footer text no longer says reviews are not verified.

R5. **Checkout**: there is a **Discount code** box on the checkout page too (so email-only codes work after you type your email). The GST breakdown now lists delivery and cash on delivery GST, and says "Includes CGST + SGST" (same state) or "Includes IGST" (other states).

R6. **Admin customers**: the detail page header now matches the list (completed sales and net spend); the order list below still shows every order.

R7. The browser console 404 for `site_content` is gone.

Still as designed (not bugs): untracked made-to-order boards do not change stock on return; a return refund covers the returned items only, not delivery.
