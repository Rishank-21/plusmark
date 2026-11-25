-- =====================================================================
-- Part 2: coupons, orders, shipments, payments, refunds, returns, email
-- =====================================================================

-- ---------------------------------------------------------------- coupons
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text,
  kind text not null check (kind in ('percent','flat','free_shipping')),
  value numeric(10,2) not null default 0 check (value >= 0),
  max_discount_inr numeric(10,2),
  min_order_inr numeric(10,2) not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  usage_limit int,                                              -- total redemptions
  per_user_limit int default 1,
  audience text not null default 'all' check (audience in ('all','specific','new_customers')),
  category_ids text[] not null default '{}',                    -- empty = every category
  product_ids uuid[] not null default '{}',                     -- empty = every product
  active boolean not null default true,
  used_count int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupon_percent_range check (kind <> 'percent' or value between 0 and 100)
);
create unique index coupons_code_key on public.coupons (upper(code));
create trigger coupons_updated before update on public.coupons
  for each row execute function public.set_updated_at();

-- Who a 'specific' coupon is for: a user id and/or an email.
create table public.coupon_recipients (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  check (user_id is not null or email is not null)
);
create index coupon_recipients_coupon_idx on public.coupon_recipients (coupon_id);
create index coupon_recipients_email_idx on public.coupon_recipients (lower(email));
create index coupon_recipients_user_idx on public.coupon_recipients (user_id);

-- ---------------------------------------------------------------- orders
create sequence public.order_number_seq start 1001;
create sequence public.invoice_number_seq start 1;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  guest_token text not null default encode(gen_random_bytes(16), 'hex'),
  email text not null,
  phone text not null,
  customer_name text,
  status text not null default 'placed' check (status in
    ('placed','payment_pending','payment_failed','confirmed','processing','dispatched','delivered',
     'cancelled','return_requested','refund_processing','refunded')),
  payment_status text not null default 'unpaid' check (payment_status in
    ('unpaid','pending','paid','failed','partially_refunded','refunded')),
  payment_method text not null default 'razorpay' check (payment_method in ('razorpay','cod','manual')),
  currency text not null default 'INR',
  subtotal_inr numeric(12,2) not null,                         -- sum of line amounts before discount
  discount_inr numeric(12,2) not null default 0,
  shipping_inr numeric(12,2) not null default 0,
  cod_fee_inr numeric(12,2) not null default 0,
  taxable_inr numeric(12,2) not null,
  cgst_inr numeric(12,2) not null default 0,
  sgst_inr numeric(12,2) not null default 0,
  igst_inr numeric(12,2) not null default 0,
  gst_inr numeric(12,2) not null,
  total_inr numeric(12,2) not null check (total_inr >= 0),
  refunded_inr numeric(12,2) not null default 0,
  prices_include_gst boolean not null default true,
  coupon_id uuid references public.coupons(id) on delete set null,
  coupon_code text,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  notes text,
  admin_notes text,
  needs_attention text,                                         -- set when something needs a human
  invoice_number text unique,
  placed_at timestamptz not null default now(),
  paid_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  stock_released boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, placed_at desc);
create index orders_email_idx on public.orders (lower(email));
create index orders_status_idx on public.orders (status, placed_at desc);
create index orders_payment_status_idx on public.orders (payment_status);
create index orders_placed_idx on public.orders (placed_at desc);
create index orders_phone_idx on public.orders (phone);
create index orders_coupon_idx on public.orders (coupon_id);
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null,
  slug text,
  variant_label text,
  options jsonb not null default '{}'::jsonb,
  sku text not null,
  hsn_code text,
  image text,
  quantity int not null check (quantity > 0),
  unit_price_inr numeric(12,2) not null,
  line_amount_inr numeric(12,2) not null,                       -- qty * unit, before discount
  discount_inr numeric(12,2) not null default 0,
  taxable_inr numeric(12,2) not null,
  gst_rate numeric(5,2) not null,
  gst_inr numeric(12,2) not null,
  line_total_inr numeric(12,2) not null,                        -- what the customer pays for this line
  returned_qty int not null default 0
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);
create index order_items_variant_idx on public.order_items (variant_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status text,
  title text not null,
  note text,
  customer_visible boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index order_events_order_idx on public.order_events (order_id, created_at);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid,
  email text not null,
  discount_inr numeric(12,2) not null,
  voided boolean not null default false,
  created_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);
create index coupon_redemptions_user_idx on public.coupon_redemptions (coupon_id, user_id);
create index coupon_redemptions_email_idx on public.coupon_redemptions (coupon_id, lower(email));

-- ---------------------------------------------------------------- shipping (self-ship)
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  carrier_id text references public.carriers(id),
  carrier_name text,
  tracking_number text,
  tracking_url text,
  status text not null default 'pending' check (status in
    ('pending','dispatched','in_transit','out_for_delivery','delivered','failed','returned')),
  shipped_at timestamptz,
  eta_from date,
  eta_to date,
  delivered_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index shipments_order_idx on public.shipments (order_id);
create index shipments_tracking_idx on public.shipments (tracking_number);
create trigger shipments_updated before update on public.shipments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  signature_verified boolean not null default false,
  amount_inr numeric(12,2) not null,
  status text not null default 'created' check (status in
    ('created','authorized','captured','failed','refunded','partially_refunded')),
  method text,                                                  -- upi / card / netbanking / wallet / cod / bank
  error_code text,
  error_description text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index payments_provider_payment_key on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;
create index payments_order_idx on public.payments (order_id);
create index payments_provider_order_idx on public.payments (provider_order_id);
create index payments_status_idx on public.payments (status, created_at desc);
create trigger payments_updated before update on public.payments
  for each row execute function public.set_updated_at();

-- webhook idempotency
create table public.payment_events (
  id text primary key,                                          -- Razorpay event id
  event text not null,
  payload jsonb not null,
  processed boolean not null default false,
  error text,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- returns & refunds
create sequence public.return_number_seq start 101;

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique,
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'requested' check (status in
    ('requested','approved','rejected','pickup_scheduled','received','refunded','closed')),
  reason_code text,
  reason text not null,
  resolution text not null default 'refund' check (resolution in ('refund','replacement','store_credit')),
  admin_note text,
  refund_inr numeric(12,2),
  return_tracking_number text,
  return_tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index returns_order_idx on public.returns (order_id);
create index returns_status_idx on public.returns (status, created_at desc);
create trigger returns_updated before update on public.returns
  for each row execute function public.set_updated_at();

create table public.return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.returns(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  quantity int not null check (quantity > 0),
  reason text,
  restock boolean not null default true,
  restocked boolean not null default false
);
create index return_items_return_idx on public.return_items (return_id);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  return_id uuid references public.returns(id) on delete set null,
  amount_inr numeric(12,2) not null check (amount_inr > 0),
  reason text,
  status text not null default 'pending' check (status in ('pending','processed','failed')),
  provider_refund_id text unique,
  error text,
  created_by uuid,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index refunds_order_idx on public.refunds (order_id);
create index refunds_status_idx on public.refunds (status);

-- ---------------------------------------------------------------- email outbox
create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  order_id uuid references public.orders(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','skipped')),
  attempts int not null default 0,
  error text,
  provider_id text,
  dedupe_key text unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index email_outbox_status_idx on public.email_outbox (status, created_at);
create index email_outbox_order_idx on public.email_outbox (order_id);
