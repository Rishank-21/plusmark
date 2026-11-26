-- =====================================================================
-- Part 3: GST pricing, coupons, cart quote, order placement, stock
-- =====================================================================

create or replace function public._gst_split(
  p_amount numeric, p_rate numeric, p_inclusive boolean,
  out taxable numeric, out gst numeric, out total numeric)
language sql immutable as $$
  select
    case when p_inclusive then round(p_amount * 100 / (100 + p_rate), 2) else p_amount end,
    case when p_inclusive then p_amount - round(p_amount * 100 / (100 + p_rate), 2)
         else round(p_amount * p_rate / 100, 2) end,
    case when p_inclusive then p_amount else p_amount + round(p_amount * p_rate / 100, 2) end
$$;

create or replace function public._validate_address(p_addr jsonb)
returns void language plpgsql immutable as $$
begin
  if p_addr is null or jsonb_typeof(p_addr) <> 'object' then
    raise exception 'invalid_address: address is required';
  end if;
  if coalesce(trim(p_addr->>'recipientName'), '') = '' or coalesce(trim(p_addr->>'line1'), '') = ''
     or coalesce(trim(p_addr->>'city'), '') = '' or coalesce(trim(p_addr->>'state'), '') = '' then
    raise exception 'invalid_address: recipientName, line1, city and state are required';
  end if;
  if coalesce(p_addr->>'pincode', '') !~ '^[1-9][0-9]{5}$' then
    raise exception 'invalid_address: pincode must be 6 digits';
  end if;
  if regexp_replace(coalesce(p_addr->>'phone', ''), '\D', '', 'g') !~ '^(91)?[6-9][0-9]{9}$' then
    raise exception 'invalid_address: valid 10 digit Indian mobile number required';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- compute_cart: the single source of truth for prices. Internal only.
-- ---------------------------------------------------------------------
create or replace function public.compute_cart(
  p_items jsonb, p_coupon text, p_state text, p_user uuid, p_email text,
  p_payment_method text default 'razorpay')
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  s public.store_settings;
  c public.coupons;
  r record;
  v_lines jsonb := '[]'::jsonb;
  v_line jsonb;
  v_eligible boolean;
  v_sub numeric := 0;
  v_elig_sub numeric := 0;
  v_disc numeric := 0;
  v_alloc numeric;
  v_alloc_left numeric;
  v_last_idx int;
  v_idx int;
  v_a numeric;
  v_split record;
  v_ship numeric := 0;
  v_cod numeric := 0;
  v_ship_split record;
  v_cod_split record;
  v_taxable numeric := 0;
  v_gst numeric := 0;
  v_total numeric := 0;
  v_cgst numeric := 0;
  v_sgst numeric := 0;
  v_igst numeric := 0;
  v_coupon jsonb := null;
  v_coupon_msg text;
  v_free_ship boolean := false;
  v_n int := 0;
  v_used int;
  v_inclusive boolean;
  v_breakup jsonb;
begin
  select * into s from public.store_settings;
  v_inclusive := s.price_includes_gst;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_cart', 'message', 'Cart is empty');
  end if;
  if jsonb_array_length(p_items) > 100 then
    return jsonb_build_object('ok', false, 'error', 'too_many_lines', 'message', 'Too many lines');
  end if;

  -- coupon pre-checks that do not depend on the lines
  if coalesce(trim(p_coupon), '') <> '' then
    select * into c from public.coupons where upper(code) = upper(trim(p_coupon));
    if not found or not c.active then v_coupon_msg := 'This code is not valid';
    elsif c.starts_at > now() then v_coupon_msg := 'This code is not active yet';
    elsif c.ends_at is not null and c.ends_at < now() then v_coupon_msg := 'This code has expired';
    elsif c.usage_limit is not null and c.used_count >= c.usage_limit then
      v_coupon_msg := 'This code has been fully redeemed';
    elsif c.audience = 'specific' and not exists (
        select 1 from public.coupon_recipients cr where cr.coupon_id = c.id
          and ((p_user is not null and cr.user_id = p_user)
            or (coalesce(p_email,'') <> '' and lower(cr.email) = lower(p_email)))) then
      v_coupon_msg := 'This code is not available for your account';
    elsif c.audience = 'new_customers' and exists (
        select 1 from public.orders o
         where o.status not in ('cancelled','payment_pending','payment_failed','placed')
           and ((p_user is not null and o.user_id = p_user)
             or (coalesce(p_email,'') <> '' and lower(o.email) = lower(p_email)))) then
      v_coupon_msg := 'This code is only for first orders';
    elsif c.per_user_limit is not null and (p_user is not null or coalesce(p_email,'') <> '') then
      select count(*) into v_used from public.coupon_redemptions cr
       where cr.coupon_id = c.id and not cr.voided
         and ((p_user is not null and cr.user_id = p_user)
           or (p_user is null and lower(cr.email) = lower(p_email)));
      if v_used >= c.per_user_limit then v_coupon_msg := 'You have already used this code'; end if;
    end if;
    if v_coupon_msg is not null then c := null; end if;
  end if;

  -- lines
  for r in
    select coalesce(nullif(e->>'variant_id','')::uuid,
                    (select pv.id from public.product_variants pv where pv.external_ref = e->>'ref'),
                    (select pv.id from public.product_variants pv where pv.sku = e->>'sku')) as vid,
           nullif(trim(left(coalesce(e->>'colour', ''), 40)), '') as colour,
           sum(coalesce(nullif(e->>'quantity','')::int, 0)) as qty
      from jsonb_array_elements(p_items) e group by 1, 2 order by 1, 2
  loop
    if r.vid is null then
      return jsonb_build_object('ok', false, 'error', 'variant_not_found', 'message', 'An item in your cart is no longer available');
    end if;
    if r.qty < 1 or r.qty > 999 then
      return jsonb_build_object('ok', false, 'error', 'bad_quantity', 'message', 'Quantity must be 1 to 999', 'variant_id', r.vid);
    end if;
    declare
      v public.product_variants;
      p public.products;
    begin
      select * into v from public.product_variants where id = r.vid;
      if not found then
        return jsonb_build_object('ok', false, 'error', 'variant_not_found', 'message', 'An item is no longer available', 'variant_id', r.vid);
      end if;
      select * into p from public.products where id = v.product_id and deleted_at is null and published;
      if not found or not v.available or p.enquiry_only or v.price_mode = 'on_request' or v.price_inr is null then
        return jsonb_build_object('ok', false, 'error', 'unavailable', 'message', coalesce(p.name, 'An item') || ' is not available to buy online', 'variant_id', r.vid);
      end if;
      if r.qty < p.minimum_order_quantity then
        return jsonb_build_object('ok', false, 'error', 'below_minimum', 'message', p.name || ' needs at least ' || p.minimum_order_quantity, 'variant_id', r.vid);
      end if;
      if v.track_inventory and not v.allow_backorder and v.stock < r.qty then
        return jsonb_build_object('ok', false, 'error', 'insufficient_stock',
          'message', 'Only ' || greatest(v.stock,0) || ' left of ' || p.name || ' (' || v.title || ')',
          'variant_id', r.vid, 'available', greatest(v.stock,0));
      end if;

      v_eligible := c.id is not null
        and (cardinality(c.category_ids) = 0 or p.category_id = any (c.category_ids) or p.subcategory_ids && c.category_ids)
        and (cardinality(c.product_ids) = 0 or p.id = any (c.product_ids));

      v_line := jsonb_build_object(
        'variant_id', v.id, 'product_id', p.id, 'name', p.name, 'slug', p.slug,
        'category_id', p.category_id, 'variant_label', v.title || coalesce(' · ' || r.colour, ''),
        'options', v.options || case when r.colour is not null then jsonb_build_object('Colour', r.colour) else '{}'::jsonb end,
        'sku', v.sku, 'hsn_code', p.hsn_code,
        'image', coalesce(v.image_public_id, (select m.public_id from public.product_media m where m.product_id = p.id order by m.sort_order limit 1)),
        'quantity', r.qty, 'unit_price', v.price_inr,
        'line_amount', round(v.price_inr * r.qty, 2),
        'gst_rate', p.gst_rate, 'eligible', v_eligible);
      v_lines := v_lines || v_line;
      v_sub := v_sub + round(v.price_inr * r.qty, 2);
      if v_eligible then v_elig_sub := v_elig_sub + round(v.price_inr * r.qty, 2); end if;
      v_n := v_n + 1;
    end;
  end loop;

  -- coupon discount
  if c.id is not null then
    if v_elig_sub <= 0 then
      v_coupon_msg := 'This code does not apply to the items in your cart'; c := null;
    elsif v_elig_sub < c.min_order_inr then
      v_coupon_msg := 'Add items worth Rs ' || (c.min_order_inr - v_elig_sub) || ' more to use this code'; c := null;
    end if;
  end if;
  if c.id is not null then
    if c.kind = 'percent' then v_disc := round(v_elig_sub * c.value / 100, 2);
    elsif c.kind = 'flat' then v_disc := c.value;
    else v_disc := 0; v_free_ship := true; end if;
    if c.max_discount_inr is not null then v_disc := least(v_disc, c.max_discount_inr); end if;
    v_disc := least(v_disc, v_elig_sub);
  end if;

  -- allocate discount to eligible lines, compute GST per line
  v_alloc_left := v_disc;
  v_last_idx := -1;
  for v_idx in 0 .. v_n - 1 loop
    if (v_lines->v_idx->>'eligible')::boolean then v_last_idx := v_idx; end if;
  end loop;
  for v_idx in 0 .. v_n - 1 loop
    v_line := v_lines->v_idx;
    v_alloc := 0;
    if (v_line->>'eligible')::boolean and v_disc > 0 then
      if v_idx = v_last_idx then v_alloc := v_alloc_left;
      else v_alloc := round(v_disc * (v_line->>'line_amount')::numeric / v_elig_sub, 2);
      end if;
      v_alloc_left := v_alloc_left - v_alloc;
    end if;
    v_a := (v_line->>'line_amount')::numeric - v_alloc;
    select * into v_split from public._gst_split(v_a, (v_line->>'gst_rate')::numeric, v_inclusive);
    v_line := v_line || jsonb_build_object(
      'discount', v_alloc, 'taxable', v_split.taxable, 'gst', v_split.gst, 'line_total', v_split.total);
    v_lines := jsonb_set(v_lines, array[v_idx::text], v_line);
    v_taxable := v_taxable + v_split.taxable;
    v_gst := v_gst + v_split.gst;
    v_total := v_total + v_split.total;
  end loop;

  -- shipping
  if v_free_ship or (s.free_shipping_over_inr is not null and (v_sub - v_disc) >= s.free_shipping_over_inr) then
    v_ship := 0;
  else
    select z.fee_inr into v_ship from public.shipping_zones z where lower(z.state) = lower(coalesce(p_state, ''));
    v_ship := coalesce(v_ship, s.shipping_flat_inr);
  end if;
  select * into v_ship_split from public._gst_split(v_ship, s.shipping_gst_rate, v_inclusive);
  v_taxable := v_taxable + v_ship_split.taxable;
  v_gst := v_gst + v_ship_split.gst;
  v_total := v_total + v_ship_split.total;

  if p_payment_method = 'cod' then v_cod := s.cod_fee_inr; end if;
  select * into v_cod_split from public._gst_split(v_cod, s.shipping_gst_rate, v_inclusive);
  v_taxable := v_taxable + v_cod_split.taxable;
  v_gst := v_gst + v_cod_split.gst;
  v_total := v_total + v_cod_split.total;

  if lower(coalesce(p_state, '')) = lower(s.seller_state) then
    v_cgst := round(v_gst / 2, 2); v_sgst := v_gst - v_cgst;
  else
    v_igst := v_gst;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('rate', rate, 'taxable', t, 'gst', g) order by rate), '[]'::jsonb)
    into v_breakup
    from (select (l->>'gst_rate')::numeric as rate, sum((l->>'taxable')::numeric) as t, sum((l->>'gst')::numeric) as g
            from jsonb_array_elements(v_lines) l group by 1) b;

  if c.id is not null then
    v_coupon := jsonb_build_object('id', c.id, 'code', c.code, 'applied', true, 'kind', c.kind,
                                   'discount', v_disc, 'free_shipping', v_free_ship);
  elsif v_coupon_msg is not null then
    v_coupon := jsonb_build_object('code', upper(trim(p_coupon)), 'applied', false, 'message', v_coupon_msg);
  end if;

  return jsonb_build_object(
    'ok', true, 'lines', v_lines, 'coupon', v_coupon,
    'subtotal', v_sub, 'discount', v_disc,
    'shipping', v_ship_split.total, 'shipping_net', v_ship_split.taxable,
    'cod_fee', coalesce(v_cod_split.total, 0), 'cod_fee_net', coalesce(v_cod_split.taxable, 0),
    'taxable', v_taxable, 'cgst', v_cgst, 'sgst', v_sgst, 'igst', v_igst, 'gst', v_gst,
    'total', v_total, 'total_paise', round(v_total * 100)::bigint,
    'prices_include_gst', v_inclusive, 'gst_breakup', v_breakup);
end $$;
revoke all on function public.compute_cart(jsonb, text, text, uuid, text, text) from public, anon, authenticated;

-- Public: price a cart exactly as checkout will.
create or replace function public.quote_cart(
  p_items jsonb, p_coupon text default null, p_state text default null,
  p_email text default null, p_payment_method text default 'razorpay')
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_ip text := public._client_ip();
begin
  if v_ip is not null and not public._rate_ok('quote:ip:' || v_ip, 300, 60) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Too many requests. Please slow down.');
  end if;
  return public.compute_cart(p_items, p_coupon, p_state, auth.uid(),
    coalesce(p_email, (select email from public.profiles where id = auth.uid())), p_payment_method);
end $$;

-- ---------------------------------------------------------------------
-- stock helpers (internal)
-- ---------------------------------------------------------------------
create or replace function public._order_release_stock(p_order uuid, p_reason text default 'sale_cancelled')
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders; r record; v_after int;
begin
  select * into o from public.orders where id = p_order for update;
  if not found or o.stock_released then return; end if;
  for r in select oi.variant_id, oi.quantity from public.order_items oi
            where oi.order_id = p_order and oi.variant_id is not null order by oi.variant_id loop
    update public.product_variants set stock = stock + r.quantity
     where id = r.variant_id and track_inventory returning stock into v_after;
    if found then
      insert into public.inventory_movements (variant_id, delta, stock_after, reason, order_id, note)
      values (r.variant_id, r.quantity, v_after, p_reason, p_order, 'Order ' || o.order_number);
    end if;
  end loop;
  update public.orders set stock_released = true where id = p_order;
  -- free the coupon use
  update public.coupons set used_count = greatest(used_count - 1, 0)
   where id in (select coupon_id from public.coupon_redemptions where order_id = p_order and not voided);
  update public.coupon_redemptions set voided = true where order_id = p_order and not voided;
end $$;
revoke all on function public._order_release_stock(uuid, text) from public, anon, authenticated;

-- Try to take stock again (payment arrived after an unpaid order expired).
create or replace function public._order_reserve_stock(p_order uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare o public.orders; r record; v_after int;
begin
  select * into o from public.orders where id = p_order for update;
  if not found or not o.stock_released then return true; end if;
  for r in select oi.variant_id, oi.quantity from public.order_items oi
            where oi.order_id = p_order and oi.variant_id is not null order by oi.variant_id loop
    update public.product_variants set stock = stock - r.quantity
     where id = r.variant_id and track_inventory and (allow_backorder or stock >= r.quantity)
     returning stock into v_after;
    if found then
      insert into public.inventory_movements (variant_id, delta, stock_after, reason, order_id, note)
      values (r.variant_id, -r.quantity, v_after, 'sale', p_order, 'Order ' || o.order_number || ' (re-reserved)');
    elsif exists (select 1 from public.product_variants where id = r.variant_id and track_inventory) then
      raise exception 'cannot_reserve';
    end if;
  end loop;
  update public.orders set stock_released = false where id = p_order;
  update public.coupon_redemptions set voided = false where order_id = p_order and voided;
  update public.coupons set used_count = used_count + 1
   where id in (select coupon_id from public.coupon_redemptions where order_id = p_order);
  return true;
exception when raise_exception then
  return false;
end $$;
revoke all on function public._order_reserve_stock(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- order timeline helper
-- ---------------------------------------------------------------------
create or replace function public._order_event(
  p_order uuid, p_status text, p_title text, p_note text default null, p_visible boolean default true)
returns void language sql security definer set search_path = public as $$
  insert into public.order_events (order_id, status, title, note, customer_visible, created_by)
  values (p_order, p_status, p_title, p_note, p_visible, auth.uid());
$$;
revoke all on function public._order_event(uuid, text, text, text, boolean) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- place_order: guests and signed-in customers
-- ---------------------------------------------------------------------
create or replace function public._place_order(
  p_uid uuid, p_ip text, p_items jsonb, p_email text, p_phone text, p_customer_name text,
  p_shipping_address jsonb, p_billing_address jsonb default null,
  p_coupon text default null, p_payment_method text default 'razorpay', p_notes text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s public.store_settings;
  v_uid uuid := p_uid;
  v_email text;
  v_phone text;
  v_bill jsonb;
  q jsonb;
  v_order public.orders;
  v_num text;
  l jsonb;
  v_after int;
  v_track boolean;
  v_status text;
  v_pay_status text;
  v_cid uuid;
begin
  select * into s from public.store_settings;
  if p_payment_method not in ('razorpay','cod') then
    return jsonb_build_object('ok', false, 'error', 'bad_payment_method', 'message', 'Unsupported payment method');
  end if;
  if p_ip is not null and not public._rate_ok('order:ip:' || p_ip, 8, 600) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Too many orders from this network. Please try again in a few minutes.');
  end if;
  if p_payment_method = 'cod' and not s.cod_enabled then
    return jsonb_build_object('ok', false, 'error', 'cod_disabled', 'message', 'Cash on delivery is not available');
  end if;

  if v_uid is not null then
    if exists (select 1 from public.profiles where id = v_uid and blocked) then
      return jsonb_build_object('ok', false, 'error', 'blocked', 'message', 'This account cannot place orders');
    end if;
    select coalesce(nullif(trim(p_email), ''), email) into v_email from public.profiles where id = v_uid;
  else
    v_email := nullif(trim(p_email), '');
  end if;
  if v_email is null or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'error', 'bad_email', 'message', 'A valid email is required');
  end if;
  v_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_phone := regexp_replace(v_phone, '^91(?=[6-9][0-9]{9}$)', '');
  if v_phone !~ '^[6-9][0-9]{9}$' then
    return jsonb_build_object('ok', false, 'error', 'bad_phone', 'message', 'A valid 10 digit mobile number is required');
  end if;

  if (select count(*) from public.orders where status = 'payment_pending' and placed_at > now() - interval '1 hour'
        and (lower(email) = lower(v_email) or phone = v_phone)) >= 4 then
    return jsonb_build_object('ok', false, 'error', 'too_many_pending', 'message', 'You have several unpaid orders. Please complete or wait for them to expire.');
  end if;
  if p_payment_method = 'cod' and (select count(*) from public.orders where payment_method = 'cod' and status = 'confirmed'
        and placed_at > now() - interval '1 day' and (lower(email) = lower(v_email) or phone = v_phone)) >= 3 then
    return jsonb_build_object('ok', false, 'error', 'cod_limit', 'message', 'Too many cash on delivery orders today. Please pay online.');
  end if;
  v_bill := coalesce(p_billing_address, p_shipping_address);
  perform public._validate_address(p_shipping_address);
  perform public._validate_address(v_bill);

  q := public.compute_cart(p_items, p_coupon, p_shipping_address->>'state', v_uid, v_email, p_payment_method);
  if not (q->>'ok')::boolean then return q; end if;
  if coalesce(trim(p_coupon), '') <> '' and not coalesce((q->'coupon'->>'applied')::boolean, false) then
    return jsonb_build_object('ok', false, 'error', 'coupon_invalid', 'message', q->'coupon'->>'message');
  end if;

  v_num := 'PM-' || to_char(now() at time zone 'Asia/Kolkata', 'YYMM') || '-' || nextval('public.order_number_seq');

  if p_payment_method = 'cod' then v_status := 'confirmed'; v_pay_status := 'unpaid';
  else v_status := 'payment_pending'; v_pay_status := 'pending'; end if;
  v_cid := nullif(q->'coupon'->>'id', '')::uuid;

  insert into public.orders (
    order_number, user_id, email, phone, customer_name, status, payment_status, payment_method,
    subtotal_inr, discount_inr, shipping_inr, cod_fee_inr, taxable_inr, cgst_inr, sgst_inr, igst_inr, gst_inr, total_inr,
    prices_include_gst, coupon_id, coupon_code, shipping_address, billing_address, notes)
  values (
    v_num, v_uid, v_email, v_phone, nullif(trim(p_customer_name), ''), v_status, v_pay_status, p_payment_method,
    (q->>'subtotal')::numeric, (q->>'discount')::numeric,
    case when (q->>'prices_include_gst')::boolean then (q->>'shipping')::numeric else (q->>'shipping_net')::numeric end,
    case when (q->>'prices_include_gst')::boolean then (q->>'cod_fee')::numeric else (q->>'cod_fee_net')::numeric end,
    (q->>'taxable')::numeric, (q->>'cgst')::numeric, (q->>'sgst')::numeric, (q->>'igst')::numeric,
    (q->>'gst')::numeric, (q->>'total')::numeric,
    (q->>'prices_include_gst')::boolean, v_cid, q->'coupon'->>'code', p_shipping_address, v_bill,
    left(p_notes, 1000))
  returning * into v_order;

  for l in select * from jsonb_array_elements(q->'lines') loop
    update public.product_variants
       set stock = case when track_inventory then stock - (l->>'quantity')::int else stock end
     where id = (l->>'variant_id')::uuid
       and (not track_inventory or allow_backorder or stock >= (l->>'quantity')::int)
    returning stock, track_inventory into v_after, v_track;
    if not found then
      raise exception 'insufficient_stock: an item just sold out' using errcode = 'P0001';
    end if;
    if v_track then
      insert into public.inventory_movements (variant_id, delta, stock_after, reason, order_id, note)
      values ((l->>'variant_id')::uuid, -(l->>'quantity')::int, v_after, 'sale', v_order.id, 'Order ' || v_num);
    end if;
    insert into public.order_items (
      order_id, product_id, variant_id, name, slug, variant_label, options, sku, hsn_code, image,
      quantity, unit_price_inr, line_amount_inr, discount_inr, taxable_inr, gst_rate, gst_inr, line_total_inr)
    values (
      v_order.id, (l->>'product_id')::uuid, (l->>'variant_id')::uuid, l->>'name', l->>'slug',
      l->>'variant_label', l->'options', l->>'sku', l->>'hsn_code', l->>'image',
      (l->>'quantity')::int, (l->>'unit_price')::numeric, (l->>'line_amount')::numeric,
      (l->>'discount')::numeric, (l->>'taxable')::numeric, (l->>'gst_rate')::numeric,
      (l->>'gst')::numeric, (l->>'line_total')::numeric);
  end loop;

  if v_cid is not null then
    insert into public.coupon_redemptions (coupon_id, order_id, user_id, email, discount_inr)
    values (v_cid, v_order.id, v_uid, v_email, (q->>'discount')::numeric);
    update public.coupons set used_count = used_count + 1 where id = v_cid;
  end if;

  perform public._order_event(v_order.id, v_status,
    case when p_payment_method = 'cod' then 'Order placed (cash on delivery)' else 'Order placed, awaiting payment' end);

  if p_payment_method = 'cod' then
    perform public._queue_order_email(v_order.id, 'order_confirmation');
    perform public._queue_admin_email(v_order.id, 'admin_new_order');
  end if;

  return jsonb_build_object('ok', true, 'order_id', v_order.id, 'order_number', v_num,
    'guest_token', v_order.guest_token, 'status', v_status, 'payment_method', p_payment_method,
    'total_inr', v_order.total_inr, 'total_paise', round(v_order.total_inr * 100)::bigint);
end $$;

revoke all on function public._place_order(uuid, text, jsonb, text, text, text, jsonb, jsonb, text, text, text) from public, anon, authenticated;

-- Cancel unpaid orders and give the stock back (called by cron / edge job).
create or replace function public.expire_unpaid_orders()
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; v_min int;
begin
  select unpaid_order_expiry_minutes into v_min from public.store_settings;
  for r in select id from public.orders
            where status in ('payment_pending','payment_failed') and payment_method = 'razorpay'
              and placed_at < now() - make_interval(mins => v_min) loop
    perform public._order_release_stock(r.id, 'sale_cancelled');
    update public.orders set status = 'cancelled', cancelled_at = now() where id = r.id;
    perform public._order_event(r.id, 'cancelled', 'Order cancelled: payment not completed in time');
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.expire_unpaid_orders() from public, anon, authenticated;
