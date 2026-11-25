-- =====================================================================
-- Part 7: row level security, grants, storage, scheduled jobs
-- Model: the browser only ever holds the anon/publishable key.
--  * public can read the published catalog
--  * customers can read/modify only their own rows
--  * admins (role=admin AND TOTP verified, aal2) can do everything
--  * money-moving actions are RPCs or edge functions, never direct writes
-- =====================================================================

-- keep profile email in step with auth
create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end $$;
create trigger on_auth_user_email_changed after update of email on auth.users
  for each row execute function public.handle_user_email_change();

create or replace function public._owns_order(p_order uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders o where o.id = p_order and o.user_id = auth.uid());
$$;

-- start from nothing, then grant deliberately
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

alter table public.store_settings enable row level security;
alter table public.app_config enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.carriers enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.consents enable row level security;
alter table public.categories enable row level security;
alter table public.series enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_costs enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_recipients enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.shipments enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.returns enable row level security;
alter table public.return_items enable row level security;
alter table public.refunds enable row level security;
alter table public.email_outbox enable row level security;

-- ---- public catalog reads
grant select on public.categories, public.series, public.products, public.product_media,
  public.product_options, public.product_option_values, public.product_variants,
  public.shipping_zones, public.carriers, public.product_listing to anon, authenticated;

create policy categories_read on public.categories for select using (active or public.is_admin());
create policy series_read on public.series for select using (true);
create policy shipping_zones_read on public.shipping_zones for select using (true);
create policy carriers_read on public.carriers for select using (active or public.is_admin());
create policy products_read on public.products for select
  using ((published and deleted_at is null) or public.is_admin());
create policy product_media_read on public.product_media for select
  using (exists (select 1 from public.products p where p.id = product_id and p.published and p.deleted_at is null) or public.is_admin());
create policy product_options_read on public.product_options for select
  using (exists (select 1 from public.products p where p.id = product_id and p.published and p.deleted_at is null) or public.is_admin());
create policy product_option_values_read on public.product_option_values for select
  using (exists (select 1 from public.product_options o join public.products p on p.id = o.product_id
                  where o.id = option_id and p.published and p.deleted_at is null) or public.is_admin());
create policy product_variants_read on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id and p.published and p.deleted_at is null) or public.is_admin());

-- ---- admin writes on catalog and configuration (RLS enforces is_admin)
grant select, insert, update, delete on public.categories, public.series, public.products, public.product_media,
  public.product_options, public.product_option_values, public.product_variants, public.variant_costs,
  public.shipping_zones, public.carriers, public.coupons, public.coupon_recipients to authenticated;
grant select, update on public.store_settings to authenticated;
grant select on public.inventory_movements, public.coupon_redemptions, public.payments, public.payment_events,
  public.email_outbox to authenticated;
grant update (status, error) on public.email_outbox to authenticated;

do $$
declare t text;
begin
  foreach t in array array['categories','series','products','product_media','product_options','product_option_values',
      'product_variants','variant_costs','shipping_zones','carriers','coupons','coupon_recipients']
  loop
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
                   t || '_admin_all', t);
  end loop;
  foreach t in array array['store_settings','inventory_movements','coupon_redemptions','payments','payment_events',
      'email_outbox']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (public.is_admin())', t || '_admin_read', t);
  end loop;
end $$;
create policy store_settings_admin_update on public.store_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy email_outbox_admin_update on public.email_outbox for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- profiles / addresses / consents
grant select on public.profiles to authenticated;
grant update (full_name, phone, marketing_opt_in) on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

grant select, insert, update, delete on public.addresses to authenticated;
create policy addresses_own on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy addresses_admin_read on public.addresses for select to authenticated using (public.is_admin());

grant select on public.consents to authenticated;
create policy consents_read on public.consents for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ---- orders: customers read their own, everything else goes through RPCs
grant select on public.orders, public.order_items, public.order_events, public.shipments,
  public.returns, public.return_items, public.refunds to authenticated;
create policy orders_read on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy order_items_read on public.order_items for select to authenticated
  using (public._owns_order(order_id) or public.is_admin());
create policy order_events_read on public.order_events for select to authenticated
  using ((customer_visible and public._owns_order(order_id)) or public.is_admin());
create policy shipments_read on public.shipments for select to authenticated
  using (public._owns_order(order_id) or public.is_admin());
create policy returns_read on public.returns for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy return_items_read on public.return_items for select to authenticated
  using (exists (select 1 from public.returns r where r.id = return_id and (r.user_id = auth.uid() or public.is_admin())));
create policy refunds_read on public.refunds for select to authenticated
  using (public._owns_order(order_id) or public.is_admin());

-- ---- function execute rights
-- Everything defaults to PUBLIC execute; lock down what must not be public.
revoke execute on function public.require_admin() from public, anon;
revoke execute on function public._owns_order(uuid) from public, anon;
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and (p.proname like 'admin\_%' or p.proname like 'report\_%') loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated, service_role', f.sig);
  end loop;
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname in
              ('confirm_payment','record_payment_failure','register_payment_attempt','complete_refund',
               'compute_cart','expire_unpaid_orders') loop
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

-- public RPCs are explicitly allowed for guests and customers
grant execute on function public.quote_cart(jsonb, text, text, text, text) to anon, authenticated;
grant execute on function public.place_order(jsonb, text, text, text, jsonb, jsonb, text, text, text) to anon, authenticated;
grant execute on function public.track_order(text, text, text) to anon, authenticated;
grant execute on function public.cancel_own_order(uuid, text) to anon, authenticated;
grant execute on function public.request_return(uuid, jsonb, text, text, text, text) to anon, authenticated;
grant execute on function public.record_consent(text, boolean, boolean, boolean, text, text) to anon, authenticated;
grant execute on function public.get_public_settings() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------- storage (product images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;
create policy product_media_public_read on storage.objects for select using (bucket_id = 'product-media');
create policy product_media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'product-media' and public.is_admin());
create policy product_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'product-media' and public.is_admin());
create policy product_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'product-media' and public.is_admin());

-- ---------------------------------------------------------------- scheduled jobs (best effort)
do $$
begin
  begin create extension if not exists pg_net; exception when others then raise notice 'pg_net unavailable: %', sqlerrm; end;
  begin
    create extension if not exists pg_cron;
    perform cron.schedule('plusmark-expire-unpaid', '*/10 * * * *', 'select public.expire_unpaid_orders()');
    perform cron.schedule('plusmark-email-retry', '*/5 * * * *',
      $c$update public.email_outbox set status = 'pending' where status = 'sending' and created_at < now() - interval '10 minutes'$c$);
  exception when others then raise notice 'pg_cron unavailable: %', sqlerrm; end;
end $$;
