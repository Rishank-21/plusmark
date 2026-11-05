begin;

/* Guests may only place cash-on-delivery orders. An online payment still needs
   an account so the signed callback can be tied to a signed-in customer. */
alter table public.orders alter column user_id drop not null;

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
  v_recipient text := btrim(coalesce(p_shipping_address ->> 'recipientName', ''));
  v_line1 text := btrim(coalesce(p_shipping_address ->> 'line1', ''));
  v_landmark text := btrim(coalesce(p_shipping_address ->> 'landmark', ''));
  v_city text := btrim(coalesce(p_shipping_address ->> 'city', ''));
  v_state text := btrim(coalesce(p_shipping_address ->> 'state', ''));
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
  if v_uid is null and p_payment_method <> 'cod_placeholder' then
    raise exception 'Sign in to pay online. Cash on delivery is available as a guest.' using errcode = '42501';
  end if;

  if v_email = '' or position('@' in v_email) = 0 or length(v_email) > 254 then
    raise exception 'A valid contact email is required.' using errcode = '22023';
  end if;

  if v_recipient = '' then
    raise exception 'A recipient name is required.' using errcode = '22023';
  end if;
  if length(v_recipient) > 120 then
    raise exception 'The recipient name is too long.' using errcode = '22023';
  end if;
  if v_line1 = '' then
    raise exception 'A delivery address is required.' using errcode = '22023';
  end if;
  if length(v_line1) > 200 then
    raise exception 'The delivery address is too long.' using errcode = '22023';
  end if;
  if length(v_landmark) > 120 then
    raise exception 'The landmark is too long.' using errcode = '22023';
  end if;
  if length(v_city) > 80 or length(v_state) > 60 then
    raise exception 'The city or state is too long.' using errcode = '22023';
  end if;

  v_phone := regexp_replace(coalesce(p_shipping_address ->> 'phone', ''), '\D', '', 'g');
  if right(v_phone, 10) !~ '^[6-9][0-9]{9}$' then
    raise exception 'Enter a 10-digit Indian mobile number for delivery.' using errcode = '22023';
  end if;
  if coalesce(p_shipping_address ->> 'pincode', '') !~ '^[1-9][0-9]{5}$' then
    raise exception 'Enter a valid 6-digit PIN code.' using errcode = '22023';
  end if;
  if v_state = '' or v_city = '' then
    raise exception 'A delivery city and state are required.' using errcode = '22023';
  end if;

  if p_payment_method not in ('cod_placeholder', 'razorpay', 'quotation_invoice') then
    raise exception 'Unsupported payment method.' using errcode = '22023';
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

  v_status := case
    when p_payment_method = 'cod_placeholder' then 'confirmed'
    when p_payment_method = 'razorpay' then 'payment_pending'
    else 'placed'
  end;
  if p_payment_method = 'razorpay' then
    v_payment_status := 'pending';
  end if;

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
revoke all on function public.place_order(text, text, text, text, jsonb, jsonb, text, jsonb) from authenticated;
grant execute on function public.place_order(text, text, text, text, jsonb, jsonb, text, jsonb) to anon, authenticated;

/* A guest order is readable only when the caller knows both the reference and
   the email typed on that order. Orders owned by an account are never returned
   here; they stay behind the account RLS policy. */
create or replace function public.get_guest_order(
  p_reference text,
  p_contact_email text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders;
  v_items jsonb;
begin
  select * into v_order
  from public.orders
  where user_id is null
    and upper(reference) = upper(btrim(coalesce(p_reference, '')))
    and lower(contact_email) = lower(btrim(coalesce(p_contact_email, '')))
  limit 1;

  if not found then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', name,
        'variant_label', variant_label,
        'sku', sku,
        'price', price,
        'quantity', quantity
      ) order by name
    ),
    '[]'::jsonb
  )
  into v_items
  from public.order_items
  where order_id = v_order.id;

  return jsonb_build_object('order', to_jsonb(v_order), 'items', v_items);
end;
$$;

revoke all on function public.get_guest_order(text, text) from public;
grant execute on function public.get_guest_order(text, text) to anon, authenticated;

/* Order records are only written by the server-side RPCs above, which recompute
   every price. Drop the direct insert policies so a signed-in browser cannot
   post its own totals. */
drop policy if exists "orders insert own" on public.orders;
drop policy if exists "order items insert own" on public.order_items;

commit;
