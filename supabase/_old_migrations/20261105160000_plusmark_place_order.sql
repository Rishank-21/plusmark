-- Order placement as one atomic call. Runs as the signed-in customer so the
-- insert policies on orders/order_items still apply; the function only adds
-- the atomicity the browser insert sequence cannot guarantee.
create or replace function public.place_order(
  p_reference text,
  p_contact_email text,
  p_payment_method text,
  p_total numeric,
  p_totals jsonb,
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_coupon_code text,
  p_items jsonb
) returns public.orders
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one line' using errcode = '22023';
  end if;

  insert into public.orders (
    user_id, reference, contact_email, status, payment_status, payment_method,
    total, totals, shipping_address, billing_address, coupon_code
  ) values (
    v_uid, p_reference, lower(p_contact_email), 'placed', 'unpaid', p_payment_method,
    p_total, p_totals, p_shipping_address, p_billing_address, p_coupon_code
  ) returning * into v_order;

  insert into public.order_items (order_id, product_id, name, variant_label, sku, price, quantity)
  select
    v_order.id,
    item->>'product_id',
    item->>'name',
    item->>'variant_label',
    item->>'sku',
    (item->>'price')::numeric,
    (item->>'quantity')::integer
  from jsonb_array_elements(p_items) as item;

  return v_order;
end;
$$;

revoke all on function public.place_order(text, text, text, numeric, jsonb, jsonb, jsonb, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, numeric, jsonb, jsonb, jsonb, text, jsonb) to authenticated;
