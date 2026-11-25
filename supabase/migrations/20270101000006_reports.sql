-- =====================================================================
-- Part 6: reports (admin + TOTP only). All return jsonb arrays.
-- "Sale" = an order that is not cancelled / unpaid / failed.
-- Dates are interpreted in IST for grouping.
-- =====================================================================

create or replace function public._rep_range(p_from timestamptz, p_to timestamptz,
  out f timestamptz, out t timestamptz)
language sql stable as $$
  select coalesce(p_from, now() - interval '30 days'), coalesce(p_to, now())
$$;

create or replace function public.report_sales(
  p_from timestamptz default null, p_to timestamptz default null, p_group text default 'day')
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record; v_unit text;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  v_unit := case when p_group in ('day','week','month') then p_group else 'day' end;
  return coalesce((select jsonb_agg(to_jsonb(x) order by x.period) from (
    select to_char(date_trunc(v_unit, o.placed_at at time zone 'Asia/Kolkata'), 'YYYY-MM-DD') as period,
           count(*) as orders,
           sum((select coalesce(sum(i.quantity), 0) from public.order_items i where i.order_id = o.id)) as units,
           round(sum(o.subtotal_inr), 2) as gross_inr,
           round(sum(o.discount_inr), 2) as discounts_inr,
           round(sum(o.shipping_inr), 2) as shipping_inr,
           round(sum(o.taxable_inr), 2) as taxable_inr,
           round(sum(o.gst_inr), 2) as gst_inr,
           round(sum(o.total_inr), 2) as total_inr,
           round(sum(o.refunded_inr), 2) as refunded_inr,
           round(sum(o.total_inr - o.refunded_inr), 2) as net_inr,
           round(avg(o.total_inr), 2) as avg_order_value_inr
      from public.orders o
     where o.placed_at >= r.f and o.placed_at < r.t
       and o.status not in ('cancelled','payment_pending','payment_failed','placed')
     group by 1) x), '[]'::jsonb);
end $$;

create or replace function public.report_top_products(
  p_from timestamptz default null, p_to timestamptz default null, p_limit int default 20, p_by text default 'revenue')
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select i.product_id, max(i.name) as name, sum(i.quantity) as units,
           round(sum(i.line_total_inr), 2) as revenue_inr, count(distinct i.order_id) as orders,
           sum(i.returned_qty) as returned_units
      from public.order_items i join public.orders o on o.id = i.order_id
     where o.placed_at >= r.f and o.placed_at < r.t
       and o.status not in ('cancelled','payment_pending','payment_failed','placed')
     group by i.product_id
     order by case when p_by = 'units' then sum(i.quantity) else sum(i.line_total_inr) end desc
     limit least(greatest(p_limit, 1), 200)) x), '[]'::jsonb);
end $$;

create or replace function public.report_category_sales(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select coalesce(p.category_id, 'deleted') as category_id, sum(i.quantity) as units,
           round(sum(i.line_total_inr), 2) as revenue_inr, count(distinct i.order_id) as orders
      from public.order_items i join public.orders o on o.id = i.order_id
      left join public.products p on p.id = i.product_id
     where o.placed_at >= r.f and o.placed_at < r.t
       and o.status not in ('cancelled','payment_pending','payment_failed','placed')
     group by 1 order by sum(i.line_total_inr) desc) x), '[]'::jsonb);
end $$;

-- Which sizes / colours / custom options sell.
create or replace function public.report_variant_options(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select kv.key as option_name, kv.value as option_value, sum(i.quantity) as units,
           round(sum(i.line_total_inr), 2) as revenue_inr
      from public.order_items i join public.orders o on o.id = i.order_id,
           lateral jsonb_each_text(i.options) kv
     where o.placed_at >= r.f and o.placed_at < r.t
       and o.status not in ('cancelled','payment_pending','payment_failed','placed')
     group by 1, 2 order by 1, sum(i.quantity) desc) x), '[]'::jsonb);
end $$;

-- GST return helper: by month and rate, split CGST / SGST / IGST.
create or replace function public.report_gst(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record; v_state text; v_ship_rate numeric;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  select seller_state, shipping_gst_rate into v_state, v_ship_rate from public.store_settings;
  return coalesce((select jsonb_agg(to_jsonb(x) order by x.month, x.gst_rate) from (
    select month, gst_rate,
           round(sum(taxable), 2) as taxable_inr,
           round(sum(case when intra then gst / 2 else 0 end), 2) as cgst_inr,
           round(sum(case when intra then gst / 2 else 0 end), 2) as sgst_inr,
           round(sum(case when intra then 0 else gst end), 2) as igst_inr,
           round(sum(gst), 2) as total_gst_inr
    from (
      select to_char(o.placed_at at time zone 'Asia/Kolkata', 'YYYY-MM') as month, i.gst_rate,
             i.taxable_inr as taxable, i.gst_inr as gst,
             lower(o.shipping_address->>'state') = lower(v_state) as intra
        from public.order_items i join public.orders o on o.id = i.order_id
       where o.placed_at >= r.f and o.placed_at < r.t
         and o.status not in ('cancelled','payment_pending','payment_failed','placed')
      union all
      select to_char(o.placed_at at time zone 'Asia/Kolkata', 'YYYY-MM'), v_ship_rate,
             o.taxable_inr - (select coalesce(sum(i.taxable_inr), 0) from public.order_items i where i.order_id = o.id),
             o.gst_inr - (select coalesce(sum(i.gst_inr), 0) from public.order_items i where i.order_id = o.id),
             lower(o.shipping_address->>'state') = lower(v_state)
        from public.orders o
       where o.placed_at >= r.f and o.placed_at < r.t
         and o.status not in ('cancelled','payment_pending','payment_failed','placed')
         and o.gst_inr - (select coalesce(sum(i.gst_inr), 0) from public.order_items i where i.order_id = o.id) <> 0
    ) u group by month, gst_rate) x), '[]'::jsonb);
end $$;

create or replace function public.report_payments(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return jsonb_build_object(
    'by_method_status', coalesce((select jsonb_agg(to_jsonb(x)) from (
        select pm.provider, coalesce(pm.method, 'unknown') as method, pm.status, count(*) as payments,
               round(sum(pm.amount_inr), 2) as amount_inr
          from public.payments pm where pm.created_at >= r.f and pm.created_at < r.t
         group by 1, 2, 3 order by 1, 2, 3) x), '[]'::jsonb),
    'refunds', coalesce((select jsonb_agg(to_jsonb(x)) from (
        select rf.status, count(*) as refunds, round(sum(rf.amount_inr), 2) as amount_inr
          from public.refunds rf where rf.created_at >= r.f and rf.created_at < r.t group by 1) x), '[]'::jsonb),
    'failure_rate_pct', (select round(100.0 * count(*) filter (where status = 'failed') / nullif(count(*), 0), 2)
                           from public.payments where provider = 'razorpay' and created_at >= r.f and created_at < r.t),
    'awaiting_payment', (select count(*) from public.orders where status = 'payment_pending'),
    'needs_attention', coalesce((select jsonb_agg(jsonb_build_object('order_number', order_number, 'reason', needs_attention))
                                   from public.orders where needs_attention is not null), '[]'::jsonb));
end $$;

create or replace function public.report_inventory(p_only_low boolean default false)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return coalesce((select jsonb_agg(to_jsonb(x) order by x.days_of_cover nulls last, x.product) from (
    select v.id as variant_id, p.name as product, v.title as variant, v.sku, v.stock, v.available,
           coalesce(v.low_stock_threshold, (select low_stock_default from public.store_settings)) as threshold,
           v.stock <= 0 as out_of_stock,
           v.stock <= coalesce(v.low_stock_threshold, (select low_stock_default from public.store_settings)) as low,
           round(v.stock * coalesce(vc.cost_inr, 0), 2) as stock_value_at_cost_inr,
           round(v.stock * coalesce(v.price_inr, 0), 2) as stock_value_at_price_inr,
           coalesce(s.sold_30d, 0) as sold_30d,
           case when coalesce(s.sold_30d, 0) > 0 then round(v.stock / (s.sold_30d / 30.0), 1) end as days_of_cover
      from public.product_variants v join public.products p on p.id = v.product_id and p.deleted_at is null
      left join public.variant_costs vc on vc.variant_id = v.id
      left join lateral (
        select sum(i.quantity) as sold_30d from public.order_items i join public.orders o on o.id = i.order_id
         where i.variant_id = v.id and o.placed_at >= now() - interval '30 days'
           and o.status not in ('cancelled','payment_pending','payment_failed','placed')) s on true
     where v.track_inventory
       and (not p_only_low or v.stock <= coalesce(v.low_stock_threshold, (select low_stock_default from public.store_settings)))) x), '[]'::jsonb);
end $$;

create or replace function public.report_customers(
  p_from timestamptz default null, p_to timestamptz default null, p_limit int default 25)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return jsonb_build_object(
    'top_customers', coalesce((select jsonb_agg(to_jsonb(x)) from (
      select coalesce(o.user_id::text, lower(o.email)) as customer_key, max(o.email) as email, max(o.phone) as phone,
             max(o.customer_name) as name, bool_or(o.user_id is not null) as registered, count(*) as orders,
             round(sum(o.total_inr - o.refunded_inr), 2) as spend_inr, round(avg(o.total_inr), 2) as avg_order_inr,
             max(o.placed_at) as last_order_at
        from public.orders o
       where o.placed_at >= r.f and o.placed_at < r.t and o.status not in ('cancelled','payment_pending','payment_failed','placed')
       group by 1 order by sum(o.total_inr - o.refunded_inr) desc limit least(greatest(p_limit, 1), 200)) x), '[]'::jsonb),
    'new_vs_returning', (select jsonb_build_object(
        'new_customers', count(*) filter (where first_order >= r.f),
        'returning_customers', count(*) filter (where first_order < r.f))
      from (select min(o2.placed_at) as first_order from public.orders o2
             where o2.status not in ('cancelled','payment_pending','payment_failed','placed')
               and coalesce(o2.user_id::text, lower(o2.email)) in (
                 select coalesce(o.user_id::text, lower(o.email)) from public.orders o
                  where o.placed_at >= r.f and o.placed_at < r.t and o.status not in ('cancelled','payment_pending','payment_failed','placed'))
             group by coalesce(o2.user_id::text, lower(o2.email))) c),
    'signups', (select count(*) from public.profiles where created_at >= r.f and created_at < r.t),
    'guest_order_share_pct', (select round(100.0 * count(*) filter (where user_id is null) / nullif(count(*), 0), 2)
        from public.orders where placed_at >= r.f and placed_at < r.t and status not in ('cancelled','payment_pending','payment_failed','placed')));
end $$;

create or replace function public.report_coupons(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select c.code, c.kind, c.audience, c.active, c.used_count, c.usage_limit,
           count(o.id) as orders, round(coalesce(sum(cr.discount_inr), 0), 2) as discount_given_inr,
           round(coalesce(sum(o.total_inr), 0), 2) as order_value_inr
      from public.coupons c
      left join public.coupon_redemptions cr on cr.coupon_id = c.id and not cr.voided and cr.created_at >= r.f and cr.created_at < r.t
      left join public.orders o on o.id = cr.order_id
     group by c.id order by coalesce(sum(cr.discount_inr), 0) desc) x), '[]'::jsonb);
end $$;

create or replace function public.report_returns(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return jsonb_build_object(
    'by_status', coalesce((select jsonb_agg(to_jsonb(x)) from (
        select status, count(*) as returns, round(coalesce(sum(refund_inr), 0), 2) as refund_inr
          from public.returns where created_at >= r.f and created_at < r.t group by 1) x), '[]'::jsonb),
    'by_reason', coalesce((select jsonb_agg(to_jsonb(x)) from (
        select coalesce(reason_code, 'other') as reason_code, count(*) as returns
          from public.returns where created_at >= r.f and created_at < r.t group by 1 order by 2 desc) x), '[]'::jsonb),
    'by_product', coalesce((select jsonb_agg(to_jsonb(x)) from (
        select oi.name, sum(ri.quantity) as returned_units
          from public.return_items ri join public.returns rt on rt.id = ri.return_id
          join public.order_items oi on oi.id = ri.order_item_id
         where rt.created_at >= r.f and rt.created_at < r.t group by 1 order by 2 desc limit 25) x), '[]'::jsonb),
    'return_rate_pct', (select round(100.0 * coalesce((select sum(ri.quantity) from public.return_items ri
          join public.returns rt on rt.id = ri.return_id where rt.created_at >= r.f and rt.created_at < r.t), 0)
          / nullif((select sum(i.quantity) from public.order_items i join public.orders o on o.id = i.order_id
                     where o.placed_at >= r.f and o.placed_at < r.t
                       and o.status not in ('cancelled','payment_pending','payment_failed','placed')), 0), 2)));
end $$;

create or replace function public.report_geo(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select o.shipping_address->>'state' as state, o.shipping_address->>'city' as city, count(*) as orders,
           round(sum(o.total_inr), 2) as revenue_inr
      from public.orders o where o.placed_at >= r.f and o.placed_at < r.t
       and o.status not in ('cancelled','payment_pending','payment_failed','placed')
     group by 1, 2 order by sum(o.total_inr) desc limit 200) x), '[]'::jsonb);
end $$;

-- Deep: monthly cohorts by first purchase, orders per month since joining.
create or replace function public.report_cohorts(p_months int default 12)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return coalesce((select jsonb_agg(to_jsonb(x) order by x.cohort, x.months_since) from (
    with sales as (
      select coalesce(o.user_id::text, lower(o.email)) as cust, o.placed_at at time zone 'Asia/Kolkata' as at, o.total_inr
        from public.orders o where o.status not in ('cancelled','payment_pending','payment_failed','placed')),
    first_buy as (select cust, date_trunc('month', min(at)) as cohort from sales group by cust)
    select to_char(f.cohort, 'YYYY-MM') as cohort,
           ((extract(year from age(date_trunc('month', s.at), f.cohort)) * 12) + extract(month from age(date_trunc('month', s.at), f.cohort)))::int as months_since,
           count(distinct s.cust) as active_customers, count(*) as orders, round(sum(s.total_inr), 2) as revenue_inr
      from sales s join first_buy f using (cust)
     where f.cohort >= date_trunc('month', now()) - make_interval(months => least(greatest(p_months, 1), 36))
     group by 1, 2) x), '[]'::jsonb);
end $$;

-- Deep: fulfilment speed and funnel counts.
create or replace function public.report_fulfilment(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return (select jsonb_build_object(
    'placed', count(*),
    'paid', count(*) filter (where paid_at is not null),
    'dispatched', count(*) filter (where dispatched_at is not null),
    'delivered', count(*) filter (where delivered_at is not null),
    'cancelled', count(*) filter (where status = 'cancelled'),
    'payment_abandoned', count(*) filter (where status in ('payment_pending','payment_failed') or (status = 'cancelled' and paid_at is null and payment_method = 'razorpay')),
    'avg_hours_paid_to_dispatch', round((avg(extract(epoch from dispatched_at - paid_at) / 3600) filter (where dispatched_at is not null and paid_at is not null))::numeric, 1),
    'avg_hours_dispatch_to_delivery', round((avg(extract(epoch from delivered_at - dispatched_at) / 3600) filter (where delivered_at is not null and dispatched_at is not null))::numeric, 1),
    'overdue_to_ship_over_48h', count(*) filter (where status in ('confirmed','processing') and coalesce(paid_at, placed_at) < now() - interval '48 hours'))
    from public.orders where placed_at >= r.f and placed_at < r.t);
end $$;

create or replace function public.report_time_patterns(
  p_from timestamptz default null, p_to timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record;
begin
  perform public.require_admin();
  select * into r from public._rep_range(p_from, p_to);
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select extract(isodow from o.placed_at at time zone 'Asia/Kolkata')::int as weekday_1_mon,
           extract(hour from o.placed_at at time zone 'Asia/Kolkata')::int as hour_ist,
           count(*) as orders, round(sum(o.total_inr), 2) as revenue_inr
      from public.orders o where o.placed_at >= r.f and o.placed_at < r.t
       and o.status not in ('cancelled','payment_pending','payment_failed','placed')
     group by 1, 2 order by 1, 2) x), '[]'::jsonb);
end $$;
