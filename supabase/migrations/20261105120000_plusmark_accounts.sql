-- Plusmark Retail — customer accounts, addresses, saved boards and order history.
-- Run this whole file once in the Supabase SQL editor (or `supabase db push`)
-- before pointing the storefront at the project.

create extension if not exists "pgcrypto";

/* ------------------------------------------------------------------------- */
/* updated_at helper                                                          */
/* ------------------------------------------------------------------------- */

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

/* ------------------------------------------------------------------------- */
/* profiles                                                                   */
/* ------------------------------------------------------------------------- */

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  -- Stored as ten digits; +91 is added by the UI. Unique so one mobile maps
  -- to one account.
  phone text unique check (phone ~ '^[6-9][0-9]{9}$'),
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

/* Create the profile row when Supabase Auth creates a user. SECURITY DEFINER
   bypasses RLS for this one insert but is pinned to the public search_path. */
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

  insert into public.profiles (id, full_name, phone, marketing_opt_in)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    v_phone,
    coalesce((nullif(new.raw_user_meta_data ->> 'marketing_opt_in', ''))::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* Registration checks this before calling signUp so a taken mobile gets a
   friendly message instead of a database trigger error. */
create or replace function public.phone_in_use(p_phone text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where phone = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  );
$$;

grant execute on function public.phone_in_use(text) to anon, authenticated;

/* ------------------------------------------------------------------------- */
/* addresses                                                                  */
/* ------------------------------------------------------------------------- */

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- One default delivery address per customer.
create unique index if not exists addresses_one_default_per_user
  on public.addresses (user_id)
  where is_default;

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "addresses select own" on public.addresses;
create policy "addresses select own" on public.addresses
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "addresses insert own" on public.addresses;
create policy "addresses insert own" on public.addresses
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "addresses update own" on public.addresses;
create policy "addresses update own" on public.addresses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "addresses delete own" on public.addresses;
create policy "addresses delete own" on public.addresses
  for delete to authenticated
  using ((select auth.uid()) = user_id);

/* ------------------------------------------------------------------------- */
/* saved boards (wishlist)                                                    */
/* ------------------------------------------------------------------------- */

create table if not exists public.saved_boards (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Catalogue slug: products still live in the static catalogue.
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists saved_boards_user_idx on public.saved_boards (user_id);

alter table public.saved_boards enable row level security;

drop policy if exists "saved boards select own" on public.saved_boards;
create policy "saved boards select own" on public.saved_boards
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "saved boards insert own" on public.saved_boards;
create policy "saved boards insert own" on public.saved_boards
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "saved boards delete own" on public.saved_boards;
create policy "saved boards delete own" on public.saved_boards
  for delete to authenticated
  using ((select auth.uid()) = user_id);

/* ------------------------------------------------------------------------- */
/* orders + order items                                                       */
/* ------------------------------------------------------------------------- */

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reference text not null unique,
  contact_email text not null,
  status text not null default 'placed' check (status in (
    'placed', 'payment_pending', 'payment_failed', 'confirmed', 'processing',
    'dispatched', 'delivered', 'cancelled', 'return_requested',
    'refund_processing', 'refunded'
  )),
  payment_status text not null default 'unpaid' check (payment_status in (
    'unpaid', 'pending', 'paid', 'failed', 'refunded'
  )),
  payment_method text not null default 'razorpay' check (payment_method in (
    'razorpay', 'cod_placeholder', 'quotation_invoice'
  )),
  total numeric(12, 2),
  totals jsonb not null default '{}'::jsonb,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb not null default '{}'::jsonb,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "orders select own" on public.orders;
create policy "orders select own" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Customers can create an order record but can never change status, totals or
-- payment state afterwards; that belongs to the server/admin role.
drop policy if exists "orders insert own" on public.orders;
create policy "orders insert own" on public.orders
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  variant_label text,
  sku text,
  price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

drop policy if exists "order items select own" on public.order_items;
create policy "order items select own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );

drop policy if exists "order items insert own" on public.order_items;
create policy "order items insert own" on public.order_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );

/* No UPDATE or DELETE policy on orders/order_items: order history is
   append-only for customers. */
