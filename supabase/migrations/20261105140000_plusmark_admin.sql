-- Plusmark Retail — administrator role, catalogue, content and operations.
-- Apply after 20261105120000_plusmark_accounts.sql and
-- 20261105130000_plusmark_product_reviews.sql.

/* ------------------------------------------------------------------------- */
/* 1. Administrator role                                                      */
/* ------------------------------------------------------------------------- */

alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('customer', 'admin'));
alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

/* SECURITY DEFINER so it can read profiles without tripping the caller's own
   row policy. Pinned search_path, stable, execute limited to signed-in users. */
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

/* A customer may edit their own profile but never grant themselves a role or
   rewrite the stored account email. SQL editor / service role can. */
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  /* SQL editor and service-role calls have no end-user JWT. SECURITY DEFINER
     makes current_user the function owner, so identity must come from the JWT. */
  if (select auth.uid()) is null then
    return new;
  end if;
  if coalesce((select auth.role()), '') = 'service_role' then
    return new;
  end if;
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an administrator can change a profile role' using errcode = '42501';
  end if;
  if new.email is distinct from old.email and not public.is_admin() then
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

/* Keep the email column filled for accounts created after this migration. */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text;
begin
  v_phone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\D', '', 'g');
  if length(v_phone) > 10 then
    v_phone := right(v_phone, 10);
  end if;
  if v_phone !~ '^[6-9][0-9]{9}$' then
    v_phone := null;
  end if;

  insert into public.profiles (id, full_name, phone, marketing_opt_in, email)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    v_phone,
    coalesce((nullif(new.raw_user_meta_data ->> 'marketing_opt_in', ''))::boolean, false),
    new.email
  )
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

/* ------------------------------------------------------------------------- */
/* 2. Catalogue tables                                                        */
/* ------------------------------------------------------------------------- */

create table if not exists public.categories (
  id text primary key,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '',
  subject text not null default '',
  image text,
  subcategories jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  category_id text not null references public.categories (id),
  series_id text,
  subcategory_ids text[] not null default '{}',
  surface text,
  frame text,
  corners text,
  magnetic boolean not null default false,
  double_sided boolean not null default false,
  usage text not null default '',
  blurb text not null default '',
  description text not null default '',
  features text[] not null default '{}',
  media jsonb not null default '[]'::jsonb,
  video_id text,
  price_mode text not null default 'on_request' check (price_mode in ('fixed', 'on_request')),
  gst_rate_percent integer not null default 12 check (gst_rate_percent in (0, 5, 12, 18, 28)),
  hsn_code text,
  bulk_suggestion_quantity integer not null default 10 check (bulk_suggestion_quantity >= 1),
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_published_idx on public.products (published);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size_label text not null check (char_length(btrim(size_label)) between 1 and 60),
  sku text not null unique check (sku ~ '^[A-Z0-9-]{6,32}$'),
  price_mode text not null default 'on_request' check (price_mode in ('fixed', 'on_request')),
  price_inr numeric(12, 2),
  stock integer check (stock is null or stock >= 0),
  track_inventory boolean not null default false,
  available boolean not null default true,
  lead_time_days integer check (lead_time_days is null or lead_time_days >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

/* ------------------------------------------------------------------------- */
/* 3. Content, coupons and shipping                                           */
/* ------------------------------------------------------------------------- */

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and char_length(code) between 3 and 32),
  description text not null default '',
  kind text not null check (kind in ('percent', 'flat')),
  value numeric(12, 2) not null check (value > 0),
  minimum_order_inr numeric(12, 2) not null default 0 check (minimum_order_inr >= 0),
  active boolean not null default true,
  starts_at date not null default current_date,
  ends_at date not null default (current_date + 90),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

create table if not exists public.shipping_methods (
  id text primary key,
  name text not null,
  description text not null default '',
  price_inr numeric(12, 2) check (price_inr is null or price_inr >= 0),
  eta_min_days integer check (eta_min_days is null or eta_min_days >= 0),
  eta_max_days integer check (eta_max_days is null or eta_max_days >= 0),
  available boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists shipping_methods_set_updated_at on public.shipping_methods;
create trigger shipping_methods_set_updated_at
  before update on public.shipping_methods
  for each row execute function public.set_updated_at();

/* ------------------------------------------------------------------------- */
/* 4. Row level security — customers keep their old access, admins get all     */
/* ------------------------------------------------------------------------- */

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.site_content enable row level security;
alter table public.coupons enable row level security;
alter table public.shipping_methods enable row level security;

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select to anon, authenticated using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select to anon, authenticated using (published);
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "variants public read" on public.product_variants;
create policy "variants public read" on public.product_variants
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.published));
drop policy if exists "variants admin write" on public.product_variants;
create policy "variants admin write" on public.product_variants
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "content public read" on public.site_content;
create policy "content public read" on public.site_content
  for select to anon, authenticated using (true);
drop policy if exists "content admin write" on public.site_content;
create policy "content admin write" on public.site_content
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

/* Checkout may read active codes so a saved coupon is redeemable; writes stay
   admin-only. */
drop policy if exists "coupons active read" on public.coupons;
create policy "coupons active read" on public.coupons
  for select to anon, authenticated
  using (active and current_date between starts_at and ends_at);
drop policy if exists "coupons admin write" on public.coupons;
create policy "coupons admin write" on public.coupons
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "shipping public read" on public.shipping_methods;
create policy "shipping public read" on public.shipping_methods
  for select to anon, authenticated using (available);
drop policy if exists "shipping admin write" on public.shipping_methods;
create policy "shipping admin write" on public.shipping_methods
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

/* Existing tables: admin policies sit beside the customer policies. */
drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read" on public.profiles
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "addresses admin all" on public.addresses;
create policy "addresses admin all" on public.addresses
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "saved boards admin all" on public.saved_boards;
create policy "saved boards admin all" on public.saved_boards
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "orders admin read" on public.orders;
create policy "orders admin read" on public.orders
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "orders admin delete" on public.orders;
create policy "orders admin delete" on public.orders
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "order items admin all" on public.order_items;
create policy "order items admin all" on public.order_items
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "reviews admin moderate" on public.product_reviews;
create policy "reviews admin moderate" on public.product_reviews
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

/* ------------------------------------------------------------------------- */
/* 5. Product media bucket                                                    */
/* ------------------------------------------------------------------------- */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plusmark-media',
  'plusmark-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "plusmark media public read" on storage.objects;
create policy "plusmark media public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'plusmark-media');

drop policy if exists "plusmark media admin insert" on storage.objects;
create policy "plusmark media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'plusmark-media' and (select public.is_admin()));

drop policy if exists "plusmark media admin update" on storage.objects;
create policy "plusmark media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'plusmark-media' and (select public.is_admin()))
  with check (bucket_id = 'plusmark-media' and (select public.is_admin()));

drop policy if exists "plusmark media admin delete" on storage.objects;
create policy "plusmark media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'plusmark-media' and (select public.is_admin()));

/* ------------------------------------------------------------------------- */
/* 6. First administrator                                                     */
/* ------------------------------------------------------------------------- */
-- 1. Create the account through /register or the Supabase dashboard.
-- 2. Run once in the SQL editor, replacing the UUID:
--      update public.profiles set role = 'admin' where id = '<USER_UUID>';
-- Nothing in the application can promote an account by itself.
