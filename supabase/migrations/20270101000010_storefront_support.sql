-- =====================================================================
-- Part 10: storefront support (saved boards, phone check, default address, list own orders)
-- =====================================================================

-- one mobile number per account
create unique index profiles_phone_unique on public.profiles (phone) where phone is not null and phone <> '';

create or replace function public.phone_in_use(p_phone text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_ip text := public._client_ip();
begin
  if v_ip is not null and not public._rate_ok('phone:ip:' || v_ip, 20, 600) then return false; end if;
  return exists (select 1 from public.profiles where phone = regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')
                    and (auth.uid() is null or id <> auth.uid()));
end $$;
grant execute on function public.phone_in_use(text) to anon, authenticated;

-- only one default shipping address per customer
create unique index addresses_one_default on public.addresses (user_id) where is_default_shipping;

-- wishlist / saved boards (product slug)
create table public.saved_boards (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.saved_boards enable row level security;
revoke all on public.saved_boards from anon, authenticated;
grant select, insert, delete on public.saved_boards to authenticated;
create policy saved_boards_own on public.saved_boards for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Customer order list in one call (orders + lines + shipments + timeline).
create or replace function public.my_orders(p_limit int default 50)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by (x->'order'->>'placed_at') desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'order', to_jsonb(o) - 'guest_token' - 'admin_notes' - 'needs_attention',
      'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.name) from public.order_items i where i.order_id = o.id), '[]'::jsonb),
      'shipments', coalesce((select jsonb_agg(to_jsonb(sh) - 'order_id' order by sh.created_at) from public.shipments sh where sh.order_id = o.id), '[]'::jsonb),
      'events', coalesce((select jsonb_agg(jsonb_build_object('at', e.created_at, 'status', e.status, 'title', e.title, 'note', e.note) order by e.created_at)
                           from public.order_events e where e.order_id = o.id and e.customer_visible), '[]'::jsonb),
      'returns', coalesce((select jsonb_agg(jsonb_build_object('id', rt.id, 'return_number', rt.return_number, 'status', rt.status,
                            'reason', rt.reason, 'refund_inr', rt.refund_inr)) from public.returns rt where rt.order_id = o.id), '[]'::jsonb)) as x
      from public.orders o where o.user_id = auth.uid()
     order by o.placed_at desc limit least(greatest(p_limit, 1), 200)) s;
$$;
grant execute on function public.my_orders(int) to authenticated;
