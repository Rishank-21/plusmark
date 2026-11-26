-- =====================================================================
-- Part 11: data the storefront shows before checkout
-- =====================================================================

-- Coupons that anyone may use (audience = all). Targeted codes are never listed; they are checked
-- by quote_cart for the person entering them.
create or replace function public.public_coupons()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'code', c.code, 'description', coalesce(c.description, ''),
    'kind', case when c.kind = 'percent' then 'percent' else 'flat' end,
    'value', c.value, 'minimumOrderInr', c.min_order_inr, 'active', c.active,
    'startsAt', c.starts_at, 'endsAt', c.ends_at, 'usageLimit', c.usage_limit, 'usedCount', c.used_count)), '[]'::jsonb)
  from public.coupons c
  where c.active and c.audience = 'all' and c.kind in ('percent', 'flat')
    and cardinality(c.category_ids) = 0 and cardinality(c.product_ids) = 0
    and c.starts_at <= now() and (c.ends_at is null or c.ends_at > now())
    and (c.usage_limit is null or c.used_count < c.usage_limit);
$$;
grant execute on function public.public_coupons() to anon, authenticated;

create or replace function public.get_public_settings()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'seller_name', seller_name, 'seller_state', seller_state,
    'price_includes_gst', price_includes_gst,
    'shipping_flat_inr', shipping_flat_inr, 'free_shipping_over_inr', free_shipping_over_inr,
    'shipping_gst_rate', shipping_gst_rate,
    'cod_enabled', cod_enabled, 'cod_fee_inr', cod_fee_inr,
    'return_window_days', return_window_days,
    'zones', coalesce((select jsonb_agg(to_jsonb(z)) from public.shipping_zones z), '[]'::jsonb))
  from public.store_settings;
$$;

-- Customers delete their own review by its id.
create or replace function public.delete_my_review_by_id(p_review_id uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.product_reviews where id = p_review_id and user_id = auth.uid();
$$;
grant execute on function public.delete_my_review_by_id(uuid) to authenticated;

-- Product ids for slugs (the storefront identifies products by slug).
create or replace function public.product_id_for_slug(p_slug text)
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.products where slug = p_slug and published and deleted_at is null;
$$;
grant execute on function public.product_id_for_slug(text) to anon, authenticated;
