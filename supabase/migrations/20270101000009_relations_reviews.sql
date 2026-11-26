-- =====================================================================
-- Part 9: compare / "you may also like" control, reviews with fraud protection,
--         rate limiting upkeep, guest order protections
-- =====================================================================

-- ---------------------------------------------------------------- product relations
-- kind 'compare'      = the "Compare with similar" table on a product page (admin picks)
-- kind 'also_bought'  = the "You may also like / customers also bought" strip (admin picks,
--                       then filled automatically from what other customers bought together)
create table public.product_relations (
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  kind text not null check (kind in ('compare','also_bought')),
  sort_order int not null default 0,
  primary key (product_id, related_product_id, kind),
  check (product_id <> related_product_id)
);
create index product_relations_lookup on public.product_relations (product_id, kind, sort_order);
alter table public.product_relations enable row level security;
revoke all on public.product_relations from anon, authenticated;
grant select on public.product_relations to anon, authenticated;
grant insert, update, delete on public.product_relations to authenticated;
create policy product_relations_read on public.product_relations for select
  using (public.is_admin() or exists (select 1 from public.products p where p.id = related_product_id and p.published and p.deleted_at is null));
create policy product_relations_admin on public.product_relations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.admin_set_relations(p_product_id uuid, p_kind text, p_related uuid[])
returns int language plpgsql security definer set search_path = public as $$
declare i int := 0; r uuid;
begin
  perform public.require_admin();
  if p_kind not in ('compare','also_bought') then raise exception 'kind must be compare or also_bought'; end if;
  if cardinality(coalesce(p_related, '{}')) > 12 then raise exception 'at most 12 products'; end if;
  delete from public.product_relations where product_id = p_product_id and kind = p_kind;
  foreach r in array coalesce(p_related, '{}') loop
    if r = p_product_id then continue; end if;
    insert into public.product_relations (product_id, related_product_id, kind, sort_order)
    values (p_product_id, r, p_kind, i) on conflict do nothing;
    i := i + 1;
  end loop;
  return i;
end $$;

-- Public: slugs to show for one product. Manual picks come first, then automatic fill.
create or replace function public.get_product_relations(p_slug text, p_limit int default 4)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare pid uuid; v_cat text; v_cmp jsonb; v_alb jsonb; v_lim int := least(greatest(p_limit, 1), 12);
begin
  select id, category_id into pid, v_cat from public.products where slug = p_slug and published and deleted_at is null;
  if pid is null then return jsonb_build_object('compare', '[]'::jsonb, 'also_bought', '[]'::jsonb); end if;

  select coalesce(jsonb_agg(slug order by sort_order), '[]'::jsonb) into v_cmp from (
    select p.slug, pr.sort_order from public.product_relations pr join public.products p on p.id = pr.related_product_id
     where pr.product_id = pid and pr.kind = 'compare' and p.published and p.deleted_at is null
     order by pr.sort_order limit v_lim) x;

  select coalesce(jsonb_agg(slug order by rank_key), '[]'::jsonb) into v_alb from (
    select slug, rank_key from (
      select p.slug, pr.sort_order as rank_key, 0 as src
        from public.product_relations pr join public.products p on p.id = pr.related_product_id
       where pr.product_id = pid and pr.kind = 'also_bought' and p.published and p.deleted_at is null
      union all
      select p.slug, 1000 - co.n as rank_key, 1 as src
        from (select oi2.product_id, count(distinct oi2.order_id) as n
                from public.order_items oi1 join public.order_items oi2 on oi2.order_id = oi1.order_id and oi2.product_id <> oi1.product_id
                join public.orders o on o.id = oi1.order_id and o.status not in ('cancelled','payment_pending','payment_failed','placed')
               where oi1.product_id = pid group by oi2.product_id) co
        join public.products p on p.id = co.product_id and p.published and p.deleted_at is null
      union all
      select p.slug, 2000 + p.sort_order as rank_key, 2 as src
        from public.products p where p.category_id = v_cat and p.id <> pid and p.published and p.deleted_at is null
    ) u
    group by slug, rank_key, src order by src, rank_key limit 40) y;
  -- de-duplicate while keeping order, then cut
  select coalesce(jsonb_agg(slug), '[]'::jsonb) into v_alb from (
    select slug from (select value #>> '{}' as slug, ordinality as o from jsonb_array_elements(v_alb) with ordinality) t
     group by slug order by min(o) limit v_lim) z;
  return jsonb_build_object('compare', v_cmp, 'also_bought', v_alb);
end $$;
grant execute on function public.get_product_relations(text, int) to anon, authenticated;

-- ---------------------------------------------------------------- reviews
create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  display_name text not null,
  rating int not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 10 and 2000),
  verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  fraud_score int not null default 0,
  fraud_flags text[] not null default '{}',
  text_hash text,
  ip_hash text,
  moderation_note text,
  moderated_by uuid,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index product_reviews_product_idx on public.product_reviews (product_id, status, created_at desc);
create index product_reviews_status_idx on public.product_reviews (status, created_at desc);
create index product_reviews_hash_idx on public.product_reviews (text_hash);
create index product_reviews_user_idx on public.product_reviews (user_id, created_at desc);
create trigger product_reviews_updated before update on public.product_reviews
  for each row execute function public.set_updated_at();
alter table public.product_reviews enable row level security;
revoke all on public.product_reviews from anon, authenticated;

-- the public may read published reviews, but never the author's user id or the fraud columns
grant select (id, product_id, display_name, rating, title, body, verified_purchase, created_at) on public.product_reviews to anon, authenticated;
create policy product_reviews_public on public.product_reviews for select using (status = 'published');

create or replace view public.product_rating_summary with (security_invoker = true) as
select product_id, count(*)::int as review_count, round(avg(rating)::numeric, 2) as average_rating,
       count(*) filter (where rating = 5)::int as r5, count(*) filter (where rating = 4)::int as r4,
       count(*) filter (where rating = 3)::int as r3, count(*) filter (where rating = 2)::int as r2,
       count(*) filter (where rating = 1)::int as r1
  from public.product_reviews where status = 'published' group by product_id;
revoke all on public.product_rating_summary from anon, authenticated;
grant select on public.product_rating_summary to anon, authenticated;

-- Submit or edit your own review. Only customers who received the product can review it.
create or replace function public.submit_review(p_product_id uuid, p_rating int, p_title text, p_body text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid(); v_ip text := public._client_ip();
  v_item uuid; v_name text; v_full text; v_norm text; v_hash text; v_score int := 0; v_flags text[] := '{}';
  v_status text; v_recent int; v_dups int; v_letters int; v_upper int; v_id uuid; v_ip_hash text;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'login_required', 'message', 'Please sign in to write a review'); end if;
  if v_ip is not null and not public._rate_ok('review:ip:' || v_ip, 10, 3600) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Too many reviews from this network. Try again later.');
  end if;
  if not public._rate_ok('review:user:' || v_uid, 6, 86400) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'You have reached the daily review limit.');
  end if;
  if p_rating is null or p_rating not between 1 and 5 then return jsonb_build_object('ok', false, 'error', 'bad_rating', 'message', 'Rating must be 1 to 5'); end if;
  p_title := trim(coalesce(p_title, '')); p_body := trim(coalesce(p_body, ''));
  if char_length(p_title) < 3 or char_length(p_title) > 120 then return jsonb_build_object('ok', false, 'error', 'bad_title', 'message', 'Title must be 3 to 120 characters'); end if;
  if char_length(p_body) < 10 or char_length(p_body) > 2000 then return jsonb_build_object('ok', false, 'error', 'bad_body', 'message', 'Review must be 10 to 2000 characters'); end if;
  if exists (select 1 from public.profiles where id = v_uid and blocked) then
    return jsonb_build_object('ok', false, 'error', 'blocked', 'message', 'This account cannot post reviews');
  end if;

  -- must have actually received this product (and not had the whole order refunded)
  select oi.id into v_item
    from public.order_items oi join public.orders o on o.id = oi.order_id
   where o.user_id = v_uid and oi.product_id = p_product_id
     and o.status in ('delivered','return_requested','refund_processing') and o.delivered_at is not null
     and o.refunded_inr < o.total_inr
   order by o.delivered_at desc limit 1;
  if v_item is null then
    return jsonb_build_object('ok', false, 'error', 'purchase_required', 'message', 'Only customers who received this product can review it');
  end if;

  -- fraud signals
  v_norm := lower(regexp_replace(p_title || ' ' || p_body, '[^a-zA-Z0-9]+', '', 'g'));
  v_hash := md5(v_norm);
  select count(*) into v_dups from public.product_reviews where text_hash = v_hash and user_id <> v_uid;
  if v_dups > 0 then v_score := v_score + 60; v_flags := array_append(v_flags, 'duplicate_text'::text); end if;
  if p_body ~* '(https?://|www\.|\.com\b|\.in\b|@[a-z0-9._-]+\.[a-z]{2,})' then v_score := v_score + 50; v_flags := array_append(v_flags, 'contains_link'::text); end if;
  if p_body ~ '(\+?91[\s-]?)?[6-9][0-9]{9}' then v_score := v_score + 40; v_flags := array_append(v_flags, 'contains_phone'::text); end if;
  if p_body ~* '(whatsapp|telegram|call me|dm me|discount code|promo|buy now|click here)' then v_score := v_score + 40; v_flags := array_append(v_flags, 'promotional'::text); end if;
  if p_body ~ '(.)\1{6,}' then v_score := v_score + 25; v_flags := array_append(v_flags, 'repeated_chars'::text); end if;
  v_letters := char_length(regexp_replace(p_body, '[^A-Za-z]', '', 'g'));
  v_upper := char_length(regexp_replace(p_body, '[^A-Z]', '', 'g'));
  if v_letters >= 20 and v_upper::numeric / v_letters > 0.7 then v_score := v_score + 15; v_flags := array_append(v_flags, 'shouting'::text); end if;
  if char_length(p_body) < 25 and p_rating in (1, 5) then v_score := v_score + 10; v_flags := array_append(v_flags, 'very_short_extreme'::text); end if;
  select count(*) into v_recent from public.product_reviews where user_id = v_uid and created_at > now() - interval '24 hours' and product_id <> p_product_id;
  if v_recent >= 3 then v_score := v_score + 30; v_flags := array_append(v_flags, 'review_burst'::text); end if;
  if v_ip is not null then
    v_ip_hash := md5(v_ip || ':plusmark');
    if (select count(*) from public.product_reviews where ip_hash = v_ip_hash and user_id <> v_uid and created_at > now() - interval '24 hours') >= 3 then
      v_score := v_score + 30; v_flags := array_append(v_flags, 'shared_network_burst'::text);
    end if;
  end if;
  if exists (select 1 from public.orders o join public.order_items oi on oi.order_id = o.id
              where oi.id = v_item and oi.returned_qty >= oi.quantity) and p_rating >= 4 then
    v_score := v_score + 20; v_flags := array_append(v_flags, 'returned_but_praised'::text);
  end if;

  v_status := case when v_score >= 30 then 'pending' else 'published' end;
  select full_name into v_full from public.profiles where id = v_uid;
  v_name := coalesce(nullif(split_part(trim(coalesce(v_full, '')), ' ', 1), '') ||
              coalesce(' ' || nullif(left(split_part(trim(coalesce(v_full, '')), ' ', 2), 1), '') || '.', ''), 'Verified buyer');

  insert into public.product_reviews (product_id, user_id, order_item_id, display_name, rating, title, body,
      verified_purchase, status, fraud_score, fraud_flags, text_hash, ip_hash)
  values (p_product_id, v_uid, v_item, v_name, p_rating, p_title, p_body, true, v_status, v_score, v_flags, v_hash, v_ip_hash)
  on conflict (product_id, user_id) do update set
    rating = excluded.rating, title = excluded.title, body = excluded.body, order_item_id = excluded.order_item_id,
    status = excluded.status, fraud_score = excluded.fraud_score, fraud_flags = excluded.fraud_flags,
    text_hash = excluded.text_hash, ip_hash = excluded.ip_hash, moderation_note = null, moderated_by = null, moderated_at = null
  returning id into v_id;

  return jsonb_build_object('ok', true, 'review_id', v_id, 'status', v_status,
    'message', case when v_status = 'published' then 'Thanks. Your review is live.'
                    else 'Thanks. Your review will appear after a quick check by our team.' end);
end $$;

create or replace function public.my_review(p_product_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(r) - 'user_id' - 'fraud_score' - 'fraud_flags' - 'text_hash' - 'ip_hash'
    from public.product_reviews r where r.product_id = p_product_id and r.user_id = auth.uid();
$$;

create or replace function public.can_review(p_product_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (
    select 1 from public.order_items oi join public.orders o on o.id = oi.order_id
     where o.user_id = auth.uid() and oi.product_id = p_product_id
       and o.status in ('delivered','return_requested','refund_processing') and o.delivered_at is not null);
$$;

create or replace function public.delete_my_review(p_product_id uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.product_reviews where product_id = p_product_id and user_id = auth.uid();
$$;

create or replace function public.admin_list_reviews(
  p_status text default 'pending', p_limit int default 50, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return jsonb_build_object(
    'total', (select count(*) from public.product_reviews where p_status is null or status = p_status),
    'rows', coalesce((select jsonb_agg(to_jsonb(x)) from (
      select r.id, r.product_id, p.name as product, p.slug, r.display_name, pr.email, r.rating, r.title, r.body,
             r.verified_purchase, r.status, r.fraud_score, r.fraud_flags, r.moderation_note, r.created_at
        from public.product_reviews r join public.products p on p.id = r.product_id
        left join public.profiles pr on pr.id = r.user_id
       where p_status is null or r.status = p_status
       order by r.fraud_score desc, r.created_at desc
       offset greatest(p_offset, 0) limit least(greatest(p_limit, 1), 200)) x), '[]'::jsonb));
end $$;

create or replace function public.admin_moderate_review(p_review_id uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if p_status not in ('published','rejected','pending') then raise exception 'bad status'; end if;
  update public.product_reviews set status = p_status, moderation_note = p_note,
         moderated_by = auth.uid(), moderated_at = now() where id = p_review_id;
end $$;

-- ---------------------------------------------------------------- guest protections
-- track_order and consent are public, so they get per-network limits (stops order-number guessing).
create or replace function public.track_order(
  p_order_number text, p_email text default null, p_guest_token text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.orders; v_ip text := public._client_ip();
begin
  if v_ip is not null and not public._rate_ok('track:ip:' || v_ip, 30, 600) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  select * into o from public.orders where upper(order_number) = upper(trim(p_order_number));
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if not ((auth.uid() is not null and o.user_id = auth.uid())
       or (p_email is not null and lower(trim(p_email)) = lower(o.email))
       or (p_guest_token is not null and p_guest_token = o.guest_token)) then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true,
    'order', to_jsonb(o) - 'guest_token' - 'admin_notes' - 'needs_attention' - 'user_id',
    'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.name) from public.order_items i where i.order_id = o.id), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object('at', e.created_at, 'status', e.status, 'title', e.title, 'note', e.note) order by e.created_at)
                         from public.order_events e where e.order_id = o.id and e.customer_visible), '[]'::jsonb),
    'shipments', coalesce((select jsonb_agg(to_jsonb(sh) - 'order_id' order by sh.created_at) from public.shipments sh where sh.order_id = o.id), '[]'::jsonb),
    'returns', coalesce((select jsonb_agg(jsonb_build_object('id', rt.id, 'return_number', rt.return_number, 'status', rt.status,
                          'reason', rt.reason, 'resolution', rt.resolution, 'refund_inr', rt.refund_inr, 'created_at', rt.created_at))
                         from public.returns rt where rt.order_id = o.id), '[]'::jsonb));
end $$;

create or replace function public.record_consent(
  p_anon_id text, p_preferences boolean, p_analytics boolean, p_marketing boolean,
  p_policy_version text default '1', p_user_agent text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_ip text := public._client_ip();
begin
  if v_ip is not null and not public._rate_ok('consent:ip:' || v_ip, 60, 600) then
    raise exception 'rate_limited';
  end if;
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

-- ---------------------------------------------------------------- grants
grant execute on function public.submit_review(uuid, int, text, text) to authenticated;
grant execute on function public.my_review(uuid) to authenticated;
grant execute on function public.can_review(uuid) to anon, authenticated;
grant execute on function public.delete_my_review(uuid) to authenticated;
revoke execute on function public.admin_set_relations(uuid, text, uuid[]) from public, anon;
revoke execute on function public.admin_list_reviews(text, int, int) from public, anon;
revoke execute on function public.admin_moderate_review(uuid, text, text) from public, anon;
grant execute on function public.admin_set_relations(uuid, text, uuid[]) to authenticated, service_role;
grant execute on function public.admin_list_reviews(text, int, int) to authenticated, service_role;
grant execute on function public.admin_moderate_review(uuid, text, text) to authenticated, service_role;

-- tidy the rate limit table daily
do $$
begin
  perform cron.schedule('plusmark-rate-limit-cleanup', '17 3 * * *',
    $c$delete from public.rate_limits where window_start < now() - interval '2 days'$c$);
exception when others then raise notice 'pg_cron unavailable: %', sqlerrm;
end $$;
