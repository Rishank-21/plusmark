/* Customer reviews written on the storefront.
   A review belongs to the signed-in author and a catalogue slug. Reviews are
   public to read; only the author can create, change or remove their own row.
   There is deliberately no seeded review and no "verified purchase" flag: the
   browser-side checkout is not linked to a server order yet, so the frontend
   must not claim a purchase was verified. */

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null check (char_length(btrim(product_slug)) between 1 and 120),
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null check (char_length(btrim(author_name)) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  title text not null check (char_length(btrim(title)) between 3 and 120),
  body text not null check (char_length(btrim(body)) between 10 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_reviews_one_per_customer unique (user_id, product_slug)
);

create index if not exists product_reviews_product_idx
  on public.product_reviews (product_slug, created_at desc);

drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

alter table public.product_reviews enable row level security;

drop policy if exists "product reviews are public" on public.product_reviews;
create policy "product reviews are public" on public.product_reviews
  for select using (true);

drop policy if exists "customers insert own review" on public.product_reviews;
create policy "customers insert own review" on public.product_reviews
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "customers update own review" on public.product_reviews;
create policy "customers update own review" on public.product_reviews
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "customers delete own review" on public.product_reviews;
create policy "customers delete own review" on public.product_reviews
  for delete to authenticated
  using ((select auth.uid()) = user_id);
