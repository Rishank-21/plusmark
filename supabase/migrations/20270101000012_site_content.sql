-- =====================================================================
-- Part 12: small storefront content store (announcement bar, banners)
-- =====================================================================
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
drop policy if exists site_content_read on public.site_content;
drop policy if exists site_content_admin on public.site_content;
create policy site_content_read on public.site_content for select using (true);
create policy site_content_admin on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
