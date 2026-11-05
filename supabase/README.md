# Supabase setup — Plusmark Retail

## 1. Create the project

1. Create a project at <https://supabase.com/dashboard> (region: Mumbai `ap-south-1` for India).
2. Copy **Project URL** and **anon / publishable key** from *Project Settings → API*.
   Newer projects show a `sb_publishable_…` key; that is the one that goes in
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Database URLs, passwords and
   `sb_secret_…` keys stay server-side and must never carry a `NEXT_PUBLIC_` prefix.
3. Put them in `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-or-publishable-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3003
```

Optional flags:

```
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=on          # shows Google sign-in
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key>   # shows the captcha widget
NEXT_PUBLIC_B2B_SITE_URL=https://plusmarkboards.com
```

No `service_role` key is used anywhere in this app. Do not add one under a
`NEXT_PUBLIC_` name.

## 2. Run the migration

Option A — SQL editor: open **SQL Editor → New query**, paste
`supabase/migrations/20261105120000_plusmark_accounts.sql`, click **Run**, then
repeat with `supabase/migrations/20261105130000_plusmark_product_reviews.sql`.

Option B — Supabase CLI:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

The account migration creates `profiles`, `addresses`, `saved_boards`, `orders`,
`order_items`, the new-user trigger, `set_updated_at` triggers, indexes and RLS
policies (`select/insert/update/delete` limited to `auth.uid()`; orders are
select + insert only for customers). The review migration creates
`product_reviews`: anyone may read reviews, while only a signed-in customer may
insert, update or delete their own row (one review per customer per product).
Reviews carry no verified-purchase flag because checkout is not yet linked to a
server-side order.

## 3. Auth settings (dashboard)

- **Authentication → Providers → Email**: enabled. Confirm email **ON**.
- **Authentication → URL Configuration**:
  - Site URL: `http://localhost:3003` in development, your production URL later.
  - Redirect URLs: `http://localhost:3003/auth/callback`, plus
    `https://<your-domain>/auth/callback`.
- **Authentication → Providers → Google** (optional): enable, add client ID and
  secret, then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=on`.
- **Authentication → Emails**: the default SMTP is rate limited and not for
  production. Configure custom SMTP before launch. Verify the signup
  confirmation template points to `{{ .ConfirmationURL }}` and that the reset
  template uses `{{ .ConfirmationURL }}` as well.
- **CAPTCHA** (optional): enable Cloudflare Turnstile under *Auth → Attack
  Protection*, then set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

## 4. Generate types

```bash
npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/database.types.ts
```

## 5. Verify RLS

Run as two signed-in users in the app (or with the SQL editor using a user JWT):

```sql
-- As user A (auth.uid() = A) these must return zero rows for B's data:
select * from public.addresses where user_id = '<user-B-uuid>';
update public.orders set status = 'delivered' where user_id = '<user-B-uuid>'; -- 0 rows
```

Anonymous requests (`anon` key, no session) get zero rows from every table
except `product_reviews`, where public read is intentional; anonymous writes are
still rejected.
