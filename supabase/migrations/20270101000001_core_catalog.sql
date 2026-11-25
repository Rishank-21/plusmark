-- =====================================================================
-- Plusmark backend, part 1: accounts, consent, catalog, variants, settings
-- Money is stored in INR rupees as numeric(12,2).
-- =====================================================================
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- settings
create table public.store_settings (
  id boolean primary key default true check (id),            -- singleton row
  seller_name text not null default 'Plusmark',
  seller_gstin text,
  seller_state text not null default 'Gujarat',
  seller_address text,
  seller_phone text,
  seller_email text,
  price_includes_gst boolean not null default true,           -- listed prices are GST-inclusive
  shipping_flat_inr numeric(10,2) not null default 60,
  free_shipping_over_inr numeric(10,2) default 999,
  shipping_gst_rate numeric(5,2) not null default 18,
  cod_enabled boolean not null default false,
  cod_fee_inr numeric(10,2) not null default 0,
  return_window_days int not null default 7,
  unpaid_order_expiry_minutes int not null default 60,
  low_stock_default int not null default 5,
  invoice_prefix text not null default 'PM/INV/',
  updated_at timestamptz not null default now()
);
insert into public.store_settings default values;
create trigger store_settings_updated before update on public.store_settings
  for each row execute function public.set_updated_at();

-- key/value config used by the database to reach edge functions (admin-only)
create table public.app_config (
  key text primary key,
  value text not null
);

create table public.shipping_zones (
  state text primary key,                                      -- e.g. 'Gujarat'
  fee_inr numeric(10,2) not null check (fee_inr >= 0),
  eta_min_days int,
  eta_max_days int
);

create table public.carriers (
  id text primary key,
  name text not null,
  tracking_url_template text,                                  -- use {tracking} placeholder
  active boolean not null default true
);

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  blocked boolean not null default false,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_email_idx on public.profiles (lower(email));
create index profiles_phone_idx on public.profiles (phone);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id, new.email,
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'phone'), '')
  )
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin = profile role 'admin' AND the session passed TOTP (aal2).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.role = 'admin' and not p.blocked);
$$;

-- Role / blocked can only be changed by an admin session or by the database owner.
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.blocked is distinct from old.blocked)
     and auth.uid() is not null and not public.is_admin() then
    raise exception 'not allowed to change role or blocked flag' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_columns();

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);
create trigger addresses_updated before update on public.addresses
  for each row execute function public.set_updated_at();

-- cookie / data consent (works for guests via anon_id)
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anon_id text,
  necessary boolean not null default true,
  preferences boolean not null default false,
  analytics boolean not null default false,
  marketing boolean not null default false,
  policy_version text not null default '1',
  user_agent text,
  created_at timestamptz not null default now()
);
create index consents_user_idx on public.consents (user_id, created_at desc);
create index consents_anon_idx on public.consents (anon_id, created_at desc);

create or replace function public.record_consent(
  p_anon_id text, p_preferences boolean, p_analytics boolean, p_marketing boolean,
  p_policy_version text default '1', p_user_agent text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null and coalesce(length(p_anon_id), 0) < 8 then
    raise exception 'anon_id required for guests';
  end if;
  insert into public.consents (user_id, anon_id, preferences, analytics, marketing, policy_version, user_agent)
  values (auth.uid(), p_anon_id, p_preferences, p_analytics, p_marketing, p_policy_version, left(p_user_agent, 300))
  returning id into v_id;
  if auth.uid() is not null then
    update public.profiles set marketing_opt_in = p_marketing where id = auth.uid();
  end if;
  return v_id;
end $$;

-- ---------------------------------------------------------------- catalog
create table public.categories (
  id text primary key,                                         -- slug
  parent_id text references public.categories(id) on delete cascade,
  name text not null,
  description text,
  subject text,
  image text,
  sort_order int not null default 0,
  active boolean not null default true,
  default_gst_rate numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_parent_idx on public.categories (parent_id);
create trigger categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

create table public.series (
  id text primary key,
  name text not null,
  rank int not null default 0,
  surface text,
  frame text,
  corners text,
  sizes text[] not null default '{}'
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  brand text,
  category_id text not null references public.categories(id),
  series_id text references public.series(id),
  subcategory_ids text[] not null default '{}',
  -- attributes the storefront already uses
  surface text,
  frame text,
  corners text,
  magnetic boolean not null default false,
  double_sided boolean not null default false,
  board_type text not null default 'n/a' check (board_type in ('non-magnetic','magnetic','ceramic','n/a')),
  surface_kind text not null default 'other' check (surface_kind in ('marker','chalk','pin-up','other')),
  usage text,
  blurb text,
  description text,
  features text[] not null default '{}',
  specs jsonb not null default '[]'::jsonb,                     -- [{label,value}]
  attributes jsonb not null default '{}'::jsonb,                -- any extra category-specific attributes
  customisation text,
  video_id text,
  tags text[] not null default '{}',
  -- commerce
  price_mode text not null default 'fixed' check (price_mode in ('fixed','on_request')),
  gst_rate numeric(5,2) not null default 18 check (gst_rate between 0 and 40),
  hsn_code text,
  minimum_order_quantity int not null default 1 check (minimum_order_quantity >= 1),
  bulk_suggestion_quantity int not null default 10,
  enquiry_only boolean not null default false,
  needs_data boolean not null default false,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(blurb,'') || ' ' || coalesce(description,''))
  ) stored
);
create index products_category_idx on public.products (category_id) where deleted_at is null;
create index products_series_idx on public.products (series_id);
create index products_published_idx on public.products (published, featured) where deleted_at is null;
create index products_search_idx on public.products using gin (search);
create index products_name_trgm on public.products using gin (name gin_trgm_ops);
create index products_tags_idx on public.products using gin (tags);
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  public_id text not null,                                      -- Cloudinary public id or URL
  alt text,
  width int,
  height int,
  source text not null default 'product' check (source in ('product','video-poster','industry')),
  sort_order int not null default 0
);
create index product_media_product_idx on public.product_media (product_id, sort_order);

-- Option axes (Size, Color, or any custom name) and their values.
create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  kind text not null default 'custom' check (kind in ('size','color','custom')),
  sort_order int not null default 0,
  unique (product_id, name)
);
create table public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  value text not null,
  swatch_hex text check (swatch_hex is null or swatch_hex ~ '^#[0-9a-fA-F]{6}$'),
  width_cm numeric(8,2),
  height_cm numeric(8,2),
  sort_order int not null default 0,
  unique (option_id, value)
);
create index product_options_product_idx on public.product_options (product_id);
create index product_option_values_option_idx on public.product_option_values (option_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  title text not null,                                          -- e.g. "4 x 3 ft / Red"
  options jsonb not null default '{}'::jsonb,                   -- {"Size":"4 x 3 ft","Color":"Red"}
  price_mode text not null default 'fixed' check (price_mode in ('fixed','on_request')),
  price_inr numeric(12,2) check (price_inr is null or price_inr >= 0),
  compare_at_inr numeric(12,2) check (compare_at_inr is null or compare_at_inr >= 0),
  stock int not null default 0,
  track_inventory boolean not null default true,
  allow_backorder boolean not null default false,
  low_stock_threshold int,
  available boolean not null default true,
  lead_time_days int,
  pack_qty int not null default 1 check (pack_qty >= 1),
  weight_g int,
  barcode text,
  image_public_id text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint variant_price_required check (price_mode = 'on_request' or price_inr is not null),
  constraint variant_stock_nonneg check (stock >= 0 or allow_backorder)
);
create unique index product_variants_options_key on public.product_variants (product_id, options);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);
create trigger product_variants_updated before update on public.product_variants
  for each row execute function public.set_updated_at();

-- cost price is private: only admins can read this table
create table public.variant_costs (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  cost_inr numeric(12,2) not null check (cost_inr >= 0)
);

create table public.inventory_movements (
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  delta int not null,
  stock_after int not null,
  reason text not null check (reason in
    ('initial','purchase','sale','sale_cancelled','return_restock','manual_adjust','damage','correction')),
  order_id uuid,
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index inventory_movements_variant_idx on public.inventory_movements (variant_id, created_at desc);

-- Public product listing (min/max price, stock summary, cover image).
create or replace view public.product_listing with (security_invoker = true) as
select
  p.*,
  (select min(v.price_inr) from public.product_variants v
     where v.product_id = p.id and v.available and v.price_mode = 'fixed') as min_price_inr,
  (select max(v.price_inr) from public.product_variants v
     where v.product_id = p.id and v.available and v.price_mode = 'fixed') as max_price_inr,
  exists (select 1 from public.product_variants v
     where v.product_id = p.id and v.available
       and (not v.track_inventory or v.stock > 0 or v.allow_backorder)) as in_stock,
  (select m.public_id from public.product_media m where m.product_id = p.id
     order by m.sort_order, m.id limit 1) as cover_image
from public.products p
where p.deleted_at is null;

-- ---------------------------------------------------------------- helpers
create or replace function public.require_admin()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'admin access with TOTP verification required' using errcode = '42501';
  end if;
end $$;

create or replace function public.get_public_settings()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'seller_name', seller_name, 'seller_state', seller_state,
    'price_includes_gst', price_includes_gst,
    'shipping_flat_inr', shipping_flat_inr, 'free_shipping_over_inr', free_shipping_over_inr,
    'cod_enabled', cod_enabled, 'cod_fee_inr', cod_fee_inr,
    'return_window_days', return_window_days,
    'zones', coalesce((select jsonb_agg(to_jsonb(z)) from public.shipping_zones z), '[]'::jsonb))
  from public.store_settings;
$$;
