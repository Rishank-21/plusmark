/* Server-authoritative checkout: prices, discounts, GST, freight and stock are
   recomputed inside the database. The browser may describe what it wants, but
   it can no longer choose what it pays. */

alter table public.orders add column if not exists courier_name text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists tracking_url text;
alter table public.orders add column if not exists return_reason text;
alter table public.orders add column if not exists invoice_number text;

/* The previous signature trusted the browser. Remove it before replacing. */
drop function if exists public.place_order(text, text, text, numeric, jsonb, jsonb, jsonb, text, jsonb);

create or replace function public.place_order(
  p_reference text,
  p_contact_email text,
  p_payment_method text,
  p_shipping_method_id text,
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_coupon_code text,
  p_items jsonb
) returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(btrim(coalesce(p_contact_email, '')));
  v_phone text;
  v_item jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_line jsonb;
  v_slug text;
  v_label text;
  v_qty integer;
  v_variant_id uuid;
  v_price numeric;
  v_price_mode text;
  v_track boolean;
  v_available boolean;
  v_product_name text;
  v_gst_rate integer;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_gst numeric := 0;
  v_shipping numeric;
  v_ship_available boolean;
  v_total numeric;
  v_code text := upper(btrim(coalesce(p_coupon_code, '')));
  v_coupon public.coupons;
  v_status text;
  v_payment_status text := 'unpaid';
  v_order public.orders;
begin
  if v_uid is null then
    raise exception 'Sign in to place this order, or use guest checkout on this device.' using errcode = '42501';
  end if;

  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'A valid contact email is required.' using errcode = '22023';
  end if;

  v_phone := regexp_replace(coalesce(p_shipping_address ->> 'phone', ''), '\D', '', 'g');
  if right(v_phone, 10) !~ '^[6-9][0-9]{9}$' then
    raise exception 'Enter a 10-digit Indian mobile number for delivery.' using errcode = '22023';
  end if;
  if coalesce(p_shipping_address ->> 'pincode', '') !~ '^[1-9][0-9]{5}$' then
    raise exception 'Enter a valid 6-digit PIN code.' using errcode = '22023';
  end if;
  if coalesce(p_shipping_address ->> 'state', '') = '' or coalesce(p_shipping_address ->> 'city', '') = '' then
    raise exception 'A delivery city and state are required.' using errcode = '22023';
  end if;

  if p_payment_method not in ('cod_placeholder', 'razorpay', 'quotation_invoice') then
    raise exception 'Unsupported payment method.' using errcode = '22023';
  end if;
  /* No gateway is configured yet, so an online order must not pretend that a
     payment is pending. COD and invoice orders are the only live paths. */
  if p_payment_method = 'razorpay' then
    raise exception 'Online payment is not enabled yet. Choose cash on delivery.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one line.' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_slug := v_item ->> 'product_id';
    v_label := v_item ->> 'variant_label';
    v_qty := coalesce((v_item ->> 'quantity')::integer, 0);
    if v_qty < 1 or v_qty > 999 then
      raise exception 'Quantity for % must be between 1 and 999.', coalesce(v_slug, 'the item') using errcode = '22023';
    end if;

    select pv.id, pv.price_inr, pv.price_mode, pv.track_inventory, pv.available, p.name, p.gst_rate_percent
      into v_variant_id, v_price, v_price_mode, v_track, v_available, v_product_name, v_gst_rate
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where p.slug = v_slug and p.published and pv.size_label = v_label
    order by pv.sort_order, pv.created_at
    limit 1;

    if not found then
      raise exception 'The size “%” for % is no longer available. Remove it and add it again.', coalesce(v_label, ''), coalesce(v_product_name, v_slug, 'this product') using errcode = '22023';
    end if;
    if not v_available or v_price_mode <> 'fixed' or v_price is null then
      raise exception '% (%) is not available for online ordering at a published price.', v_product_name, v_label using errcode = '22023';
    end if;

    if v_track then
      update public.product_variants
         set stock = stock - v_qty
       where id = v_variant_id and stock is not null and stock >= v_qty;
      if not found then
        raise exception 'Only % left of %. Reduce the quantity to continue.', coalesce((select stock from public.product_variants where id = v_variant_id), 0), v_product_name using errcode = '22023';
      end if;
    end if;

    v_line_total := round(v_price * v_qty, 2);
    v_subtotal := v_subtotal + v_line_total;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_slug,
      'variant_id', v_variant_id,
      'name', v_product_name,
      'variant_label', v_label,
      'sku', (select sku from public.product_variants where id = v_variant_id),
      'price', v_price,
      'quantity', v_qty,
      'line_total', v_line_total,
      'gst_rate', v_gst_rate
    );
  end loop;

  if v_code <> '' then
    select * into v_coupon from public.coupons where code = v_code for update;
    if not found then
      raise exception 'Coupon % does not exist.', v_code using errcode = '22023';
    end if;
    if not v_coupon.active
       or (now() at time zone 'Asia/Kolkata')::date < v_coupon.starts_at
       or (now() at time zone 'Asia/Kolkata')::date > v_coupon.ends_at then
      raise exception 'Coupon % is not valid today.', v_code using errcode = '22023';
    end if;
    if v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then
      raise exception 'Coupon % has reached its usage limit.', v_code using errcode = '22023';
    end if;
    if v_subtotal < v_coupon.minimum_order_inr then
      raise exception 'Coupon % needs a minimum order of ₹%.', v_code, v_coupon.minimum_order_inr using errcode = '22023';
    end if;
    v_discount := round(
      least(
        case when v_coupon.kind = 'percent' then v_subtotal * v_coupon.value / 100 else v_coupon.value end,
        v_subtotal
      ),
      2
    );
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  select price_inr, available into v_shipping, v_ship_available
  from public.shipping_methods where id = p_shipping_method_id;
  if not found then
    raise exception 'Choose a dispatch method.' using errcode = '22023';
  end if;
  if not v_ship_available then
    raise exception 'That dispatch method is not available.' using errcode = '22023';
  end if;

  for v_line in select value from jsonb_array_elements(v_lines) loop
    v_gst := v_gst + (
      ((v_line ->> 'line_total')::numeric - v_discount * ((v_line ->> 'line_total')::numeric / v_subtotal))
      * (v_line ->> 'gst_rate')::numeric / 100
    );
  end loop;
  v_gst := round(v_gst);

  if v_shipping is null then
    v_total := null; /* freight is confirmed on the invoice */
  else
    v_total := round(v_subtotal - v_discount + v_gst + v_shipping, 2);
  end if;

  v_status := case when p_payment_method = 'cod_placeholder' then 'confirmed' else 'placed' end;

  insert into public.orders (
    user_id, reference, contact_email, status, payment_status, payment_method,
    total, totals, shipping_address, billing_address, coupon_code, invoice_number
  ) values (
    v_uid, p_reference, v_email, v_status, v_payment_status, p_payment_method,
    v_total,
    jsonb_build_object(
      'subtotalInr', v_subtotal,
      'discountInr', v_discount,
      'gstInr', v_gst,
      'shippingInr', v_shipping,
      'totalInr', v_total
    ),
    p_shipping_address,
    case when p_billing_address is null or p_billing_address = '{}'::jsonb then p_shipping_address else p_billing_address end,
    nullif(v_code, ''),
    'INV-' || regexp_replace(p_reference, '^PM-', '')
  ) returning * into v_order;

  insert into public.order_items (order_id, product_id, name, variant_label, sku, price, quantity)
  select
    v_order.id,
    line ->> 'product_id',
    line ->> 'name',
    line ->> 'variant_label',
    line ->> 'sku',
    (line ->> 'price')::numeric,
    (line ->> 'quantity')::integer
  from jsonb_array_elements(v_lines) as line;

  return v_order;
end;
$$;

revoke all on function public.place_order(text, text, text, text, jsonb, jsonb, text, jsonb) from public;
revoke all on function public.place_order(text, text, text, text, jsonb, jsonb, text, jsonb) from anon;
grant execute on function public.place_order(text, text, text, text, jsonb, jsonb, text, jsonb) to authenticated;

/* Customer-initiated cancellation, limited to states where the works has not
   shipped. Stock reserved by the order is released atomically. */
create or replace function public.cancel_own_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders;
  v_item record;
begin
  if v_uid is null then
    raise exception 'Sign in to cancel this order.' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id and user_id = v_uid for update;
  if not found then
    raise exception 'Order not found.' using errcode = '42501';
  end if;
  if v_order.status not in ('placed', 'payment_pending', 'confirmed', 'processing') then
    raise exception 'This order can no longer be cancelled online. Contact Plusmark for help.' using errcode = '22023';
  end if;

  update public.orders set status = 'cancelled' where id = v_order.id;

  for v_item in
    select oi.product_id, oi.variant_label, oi.quantity
    from public.order_items oi where oi.order_id = v_order.id
  loop
    update public.product_variants pv
       set stock = pv.stock + v_item.quantity
      from public.products p
     where p.id = pv.product_id
       and p.slug = v_item.product_id
       and pv.size_label = v_item.variant_label
       and pv.track_inventory
       and pv.stock is not null;
  end loop;

  select * into v_order from public.orders where id = v_order.id;
  return v_order;
end;
$$;

revoke all on function public.cancel_own_order(uuid) from public;
revoke all on function public.cancel_own_order(uuid) from anon;
grant execute on function public.cancel_own_order(uuid) to authenticated;

/* Return requests are accepted only after delivery. The admin team decides the
   refund; the customer cannot move money or payment state. */
create or replace function public.request_order_return(p_order_id uuid, p_reason text)
returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders;
begin
  if v_uid is null then
    raise exception 'Sign in to request a return.' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'Describe the problem in at least 10 characters.' using errcode = '22023';
  end if;

  select * into v_order from public.orders where id = p_order_id and user_id = v_uid for update;
  if not found then
    raise exception 'Order not found.' using errcode = '42501';
  end if;
  if v_order.status <> 'delivered' then
    raise exception 'Only a delivered order can be returned.' using errcode = '22023';
  end if;
  if v_order.status = 'return_requested' then
    raise exception 'A return is already being reviewed.' using errcode = '22023';
  end if;

  update public.orders
     set status = 'return_requested',
         return_reason = left(btrim(p_reason), 500)
   where id = v_order.id
   returning * into v_order;
  return v_order;
end;
$$;

revoke all on function public.request_order_return(uuid, text) from public;
revoke all on function public.request_order_return(uuid, text) from anon;
grant execute on function public.request_order_return(uuid, text) to authenticated;
