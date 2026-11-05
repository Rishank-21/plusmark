begin;

/* Cloudinary is the file store; Postgres keeps only the metadata needed to
   render, reorder and delete assets. Products keep their ordered list in
   products.media (jsonb) so the storefront reads one array, while this table is
   the canonical upload registry used by admin upload/delete. */
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique check (char_length(btrim(public_id)) between 1 and 400),
  url text not null,
  resource_type text not null check (resource_type in ('image', 'video')),
  format text,
  width integer check (width is null or width >= 0),
  height integer check (height is null or height >= 0),
  bytes bigint check (bytes is null or bytes >= 0),
  duration numeric(10, 3) check (duration is null or duration >= 0),
  alt_text text not null default '',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists media_created_idx on public.media (created_at desc);
create index if not exists media_resource_idx on public.media (resource_type, created_at desc);

alter table public.media enable row level security;

/* Cloudinary URLs are public; the row is only metadata. Writes stay admin-only. */
drop policy if exists "media public read" on public.media;
create policy "media public read" on public.media
  for select to anon, authenticated
  using (true);

drop policy if exists "media admin insert" on public.media;
create policy "media admin insert" on public.media
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "media admin update" on public.media;
create policy "media admin update" on public.media
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "media admin delete" on public.media;
create policy "media admin delete" on public.media
  for delete to authenticated
  using ((select public.is_admin()));

revoke all on public.media from anon;
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;

commit;
