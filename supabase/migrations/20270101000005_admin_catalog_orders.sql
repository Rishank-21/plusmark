-- =====================================================================
-- Part 5: admin product management, variant generator, order search, customers
-- =====================================================================

-- ---------------------------------------------------------------- products
create or replace function public.admin_upsert_product(p jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_row public.products;
  v_merged jsonb;
  rec public.products;
  m jsonb; opt jsonb; val jsonb; var jsonb;
  v_opt_id uuid;
  v_names text[];
  v_keep uuid[] := '{}';
  v_vid uuid;
  v_existing public.product_variants;
  v_n int := 0;
  v_title text;
  v_sku text;
  v_stock int;
  v_opts jsonb;
begin
  perform public.require_admin();
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'product payload required'; end if;

  v_id := nullif(p->>'id', '')::uuid;
  if v_id is null then
    if coalesce(p->>'slug','') = '' or coalesce(p->>'name','') = '' or coalesce(p->>'category_id','') = '' then
      raise exception 'slug, name and category_id are required for a new product';
    end if;
    insert into public.products (slug, name, category_id) values (p->>'slug', p->>'name', p->>'category_id')
    returning id into v_id;
  end if;

  select * into v_row from public.products where id = v_id for update;
  if not found then raise exception 'product not found'; end if;

  v_merged := to_jsonb(v_row) || (p - 'media' - 'options' - 'variants' - 'id' - 'search' - 'created_at' - 'updated_at');
  rec := jsonb_populate_record(null::public.products, v_merged);
  update public.products set
    slug = rec.slug, name = rec.name, brand = rec.brand, category_id = rec.category_id, series_id = rec.series_id,
    subcategory_ids = coalesce(rec.subcategory_ids, '{}'), surface = rec.surface, frame = rec.frame, corners = rec.corners,
    magnetic = coalesce(rec.magnetic, false), double_sided = coalesce(rec.double_sided, false),
    board_type = coalesce(rec.board_type, 'n/a'), surface_kind = coalesce(rec.surface_kind, 'other'),
    usage = rec.usage, blurb = rec.blurb, description = rec.description,
    features = coalesce(rec.features, '{}'), specs = coalesce(rec.specs, '[]'), attributes = coalesce(rec.attributes, '{}'),
    customisation = rec.customisation, video_id = rec.video_id, tags = coalesce(rec.tags, '{}'),
    price_mode = rec.price_mode, gst_rate = rec.gst_rate, hsn_code = rec.hsn_code,
    minimum_order_quantity = rec.minimum_order_quantity, bulk_suggestion_quantity = rec.bulk_suggestion_quantity,
    enquiry_only = rec.enquiry_only, needs_data = rec.needs_data, published = rec.published,
    featured = rec.featured, sort_order = rec.sort_order, deleted_at = rec.deleted_at
  where id = v_id;

  if p ? 'media' then
    delete from public.product_media where product_id = v_id;
    v_n := 0;
    for m in select * from jsonb_array_elements(coalesce(p->'media', '[]')) loop
      insert into public.product_media (product_id, public_id, alt, width, height, source, sort_order)
      values (v_id, m->>'public_id', m->>'alt', nullif(m->>'width','')::int, nullif(m->>'height','')::int,
              coalesce(m->>'source', 'product'), v_n);
      v_n := v_n + 1;
    end loop;
  end if;

  if p ? 'options' then
    delete from public.product_options where product_id = v_id;
    v_n := 0;
    for opt in select * from jsonb_array_elements(coalesce(p->'options', '[]')) loop
      insert into public.product_options (product_id, name, kind, sort_order)
      values (v_id, trim(opt->>'name'), coalesce(opt->>'kind', 'custom'), v_n) returning id into v_opt_id;
      v_n := v_n + 1;
      for val in select * from jsonb_array_elements(coalesce(opt->'values', '[]')) loop
        insert into public.product_option_values (option_id, value, swatch_hex, width_cm, height_cm, sort_order)
        values (v_opt_id,
                trim(case when jsonb_typeof(val) = 'string' then val #>> '{}' else val->>'value' end),
                case when jsonb_typeof(val) = 'object' then nullif(val->>'swatch_hex','') end,
                case when jsonb_typeof(val) = 'object' then nullif(val->>'width_cm','')::numeric end,
                case when jsonb_typeof(val) = 'object' then nullif(val->>'height_cm','')::numeric end,
                (select count(*) from public.product_option_values where option_id = v_opt_id));
      end loop;
    end loop;
  end if;

  if p ? 'variants' then
    select coalesce(array_agg(name), '{}') into v_names from public.product_options where product_id = v_id;
    v_n := 0;
    for var in select * from jsonb_array_elements(coalesce(p->'variants', '[]')) loop
      v_n := v_n + 1;
      v_opts := coalesce(var->'options', '{}'::jsonb);
      if cardinality(v_names) > 0 then
        if (select array_agg(k order by k) from jsonb_object_keys(v_opts) k) is distinct from
           (select array_agg(n order by n) from unnest(v_names) n) then
          raise exception 'variant % must set exactly these options: %', v_n, array_to_string(v_names, ', ');
        end if;
        if exists (
          select 1 from jsonb_each_text(v_opts) kv
           where not exists (select 1 from public.product_options po join public.product_option_values pv on pv.option_id = po.id
                              where po.product_id = v_id and po.name = kv.key and pv.value = kv.value)) then
          raise exception 'variant % uses an option value that is not defined', v_n;
        end if;
      end if;
      v_title := coalesce(nullif(var->>'title',''),
        (select string_agg(value, ' / ' order by key) from jsonb_each_text(v_opts)), 'Default');
      v_sku := nullif(trim(var->>'sku'), '');
      v_vid := nullif(var->>'id','')::uuid;
      if v_vid is null and v_sku is not null then
        select id into v_vid from public.product_variants where sku = v_sku and product_id = v_id;
      end if;
      if v_vid is null then
        v_sku := coalesce(v_sku, upper(replace(v_row.slug, '-', '')) || '-' || lpad(v_n::text, 3, '0'));
        insert into public.product_variants (
          product_id, sku, title, options, price_mode, price_inr, compare_at_inr, stock, track_inventory,
          allow_backorder, low_stock_threshold, available, lead_time_days, pack_qty, weight_g, barcode, image_public_id, sort_order)
        values (v_id, v_sku, v_title, v_opts, coalesce(var->>'price_mode','fixed'),
          nullif(var->>'price_inr','')::numeric, nullif(var->>'compare_at_inr','')::numeric,
          coalesce(nullif(var->>'stock','')::int, 0), coalesce((var->>'track_inventory')::boolean, true),
          coalesce((var->>'allow_backorder')::boolean, false), nullif(var->>'low_stock_threshold','')::int,
          coalesce((var->>'available')::boolean, true), nullif(var->>'lead_time_days','')::int,
          coalesce(nullif(var->>'pack_qty','')::int, 1), nullif(var->>'weight_g','')::int, nullif(var->>'barcode',''),
          nullif(var->>'image_public_id',''), v_n)
        returning id, stock into v_vid, v_stock;
        if v_stock <> 0 then
          insert into public.inventory_movements (variant_id, delta, stock_after, reason, note, created_by)
          values (v_vid, v_stock, v_stock, 'initial', 'Created with product', auth.uid());
        end if;
      else
        select * into v_existing from public.product_variants where id = v_vid and product_id = v_id;
        if not found then raise exception 'variant % does not belong to this product', v_n; end if;
        update public.product_variants set
          sku = coalesce(v_sku, sku), title = v_title, options = v_opts,
          price_mode = coalesce(var->>'price_mode', price_mode),
          price_inr = case when var ? 'price_inr' then nullif(var->>'price_inr','')::numeric else price_inr end,
          compare_at_inr = case when var ? 'compare_at_inr' then nullif(var->>'compare_at_inr','')::numeric else compare_at_inr end,
          track_inventory = coalesce((var->>'track_inventory')::boolean, track_inventory),
          allow_backorder = coalesce((var->>'allow_backorder')::boolean, allow_backorder),
          low_stock_threshold = case when var ? 'low_stock_threshold' then nullif(var->>'low_stock_threshold','')::int else low_stock_threshold end,
          available = coalesce((var->>'available')::boolean, available),
          lead_time_days = case when var ? 'lead_time_days' then nullif(var->>'lead_time_days','')::int else lead_time_days end,
          pack_qty = coalesce(nullif(var->>'pack_qty','')::int, pack_qty),
          weight_g = case when var ? 'weight_g' then nullif(var->>'weight_g','')::int else weight_g end,
          barcode = case when var ? 'barcode' then nullif(var->>'barcode','') else barcode end,
          image_public_id = case when var ? 'image_public_id' then nullif(var->>'image_public_id','') else image_public_id end,
          sort_order = v_n
        where id = v_vid;
        if var ? 'stock' and nullif(var->>'stock','')::int is distinct from v_existing.stock then
          v_stock := nullif(var->>'stock','')::int;
          update public.product_variants set stock = v_stock where id = v_vid;
          insert into public.inventory_movements (variant_id, delta, stock_after, reason, note, created_by)
          values (v_vid, v_stock - v_existing.stock, v_stock, 'manual_adjust', 'Edited on product form', auth.uid());
        end if;
      end if;
      if var ? 'cost_inr' then
        if nullif(var->>'cost_inr','') is null then delete from public.variant_costs where variant_id = v_vid;
        else insert into public.variant_costs (variant_id, cost_inr) values (v_vid, (var->>'cost_inr')::numeric)
             on conflict (variant_id) do update set cost_inr = excluded.cost_inr; end if;
      end if;
      v_keep := v_keep || v_vid;
    end loop;

    -- variants that were removed from the form: delete, or hide if they have order history
    delete from public.product_variants pv
     where pv.product_id = v_id and pv.id <> all (v_keep)
       and not exists (select 1 from public.order_items oi where oi.variant_id = pv.id);
    update public.product_variants set available = false
     where product_id = v_id and id <> all (v_keep);
  end if;

  if (select published from public.products where id = v_id) and not exists (
        select 1 from public.product_variants where product_id = v_id and available) then
    raise exception 'a published product needs at least one available variant';
  end if;
  return v_id;
end $$;

create or replace function public.admin_delete_product(p_product_id uuid, p_hard boolean default false)
returns text language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if p_hard then
    if exists (select 1 from public.order_items where product_id = p_product_id) then
      raise exception 'product has order history; archive it instead of deleting';
    end if;
    delete from public.products where id = p_product_id;
    return 'deleted';
  end if;
  update public.products set deleted_at = now(), published = false where id = p_product_id;
  return 'archived';
end $$;

create or replace function public.admin_restore_product(p_product_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  update public.products set deleted_at = null where id = p_product_id;
end $$;

-- Build every combination of the product's options (Size x Color x any custom axis).
create or replace function public._generate_variants(
  p_product_id uuid, p_base_price_inr numeric, p_price_by_value jsonb default '{}'::jsonb,
  p_stock int default 0, p_cost_inr numeric default null)
returns int language plpgsql security definer set search_path = public as $$
declare
  pr public.products; opt record; v_combos jsonb := '[{}]'::jsonb; c jsonb; kv record;
  v_price numeric; v_sku text; v_title text; v_made int := 0; v_n int; v_max int; v_vid uuid;
begin
  select * into pr from public.products where id = p_product_id;
  if not found then raise exception 'product not found'; end if;
  if not exists (select 1 from public.product_options where product_id = p_product_id) then
    raise exception 'define at least one option first';
  end if;

  for opt in select * from public.product_options where product_id = p_product_id order by sort_order, name loop
    select coalesce(jsonb_agg(c0 || jsonb_build_object(opt.name, pv.value)), '[]'::jsonb) into v_combos
      from jsonb_array_elements(v_combos) c0
      cross join public.product_option_values pv where pv.option_id = opt.id;
  end loop;
  if jsonb_array_length(v_combos) > 500 then raise exception 'too many combinations (max 500)'; end if;

  select coalesce(max(sort_order), 0) into v_max from public.product_variants where product_id = p_product_id;
  v_n := v_max;
  for c in select * from jsonb_array_elements(v_combos) loop
    if exists (select 1 from public.product_variants where product_id = p_product_id and options = c) then continue; end if;
    v_price := p_base_price_inr;
    for kv in select key, value from jsonb_each_text(c) loop
      if p_price_by_value -> kv.key ->> kv.value is not null then
        v_price := (p_price_by_value -> kv.key ->> kv.value)::numeric;
      end if;
    end loop;
    v_title := (select string_agg(value, ' / ' order by key) from jsonb_each_text(c));
    v_n := v_n + 1;
    v_sku := upper(replace(pr.slug, '-', '')) || '-' ||
             (select string_agg(upper(left(regexp_replace(value, '[^A-Za-z0-9]', '', 'g'), 4)), '-' order by key) from jsonb_each_text(c));
    if exists (select 1 from public.product_variants where sku = v_sku) then v_sku := v_sku || '-' || v_n; end if;
    insert into public.product_variants (product_id, sku, title, options, price_inr, stock, sort_order)
    values (p_product_id, v_sku, v_title, c, v_price, coalesce(p_stock, 0), v_n) returning id into v_vid;
    if p_cost_inr is not null then insert into public.variant_costs (variant_id, cost_inr) values (v_vid, p_cost_inr); end if;
    if coalesce(p_stock, 0) <> 0 then
      insert into public.inventory_movements (variant_id, delta, stock_after, reason, note, created_by)
      values (v_vid, p_stock, p_stock, 'initial', 'Generated variant', auth.uid());
    end if;
    v_made := v_made + 1;
  end loop;
  return v_made;
end $$;

revoke all on function public._generate_variants(uuid, numeric, jsonb, int, numeric) from public, anon, authenticated;
create or replace function public.admin_generate_variants(
  p_product_id uuid, p_base_price_inr numeric, p_price_by_value jsonb default '{}'::jsonb,
  p_stock int default 0, p_cost_inr numeric default null)
returns int language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  return public._generate_variants(p_product_id, p_base_price_inr, p_price_by_value, p_stock, p_cost_inr);
end $$;
-- ---------------------------------------------------------------- orders: filter and search
create or replace function public.admin_list_orders(p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  f jsonb := coalesce(p_filters, '{}'::jsonb);
  v_status text[]; v_pstatus text[]; v_from timestamptz; v_to timestamptz;
  v_search text; v_limit int; v_offset int; v_sort text; v_dir text; v_result jsonb;
begin
  perform public.require_admin();
  v_status := case when f ? 'status' then array(select jsonb_array_elements_text(
      case when jsonb_typeof(f->'status') = 'array' then f->'status' else jsonb_build_array(f->'status') end)) end;
  v_pstatus := case when f ? 'payment_status' then array(select jsonb_array_elements_text(
      case when jsonb_typeof(f->'payment_status') = 'array' then f->'payment_status' else jsonb_build_array(f->'payment_status') end)) end;
  v_from := nullif(f->>'date_from','')::timestamptz;
  v_to := nullif(f->>'date_to','')::timestamptz;
  v_search := nullif(trim(f->>'search'), '');
  v_limit := least(greatest(coalesce(nullif(f->>'limit','')::int, 25), 1), 200);
  v_offset := greatest(coalesce(nullif(f->>'offset','')::int, 0), 0);
  v_sort := case when f->>'sort' in ('placed_at','total_inr','order_number','status') then f->>'sort' else 'placed_at' end;
  v_dir := case when lower(f->>'dir') = 'asc' then 'asc' else 'desc' end;

  with filtered as (
    select o.* from public.orders o
     where (v_status is null or o.status = any (v_status))
       and (v_pstatus is null or o.payment_status = any (v_pstatus))
       and (f->>'payment_method' is null or o.payment_method = f->>'payment_method')
       and (v_from is null or o.placed_at >= v_from)
       and (v_to is null or o.placed_at < v_to)
       and (f->>'min_total' is null or o.total_inr >= (f->>'min_total')::numeric)
       and (f->>'max_total' is null or o.total_inr <= (f->>'max_total')::numeric)
       and (f->>'state' is null or lower(o.shipping_address->>'state') = lower(f->>'state'))
       and (f->>'city' is null or lower(o.shipping_address->>'city') = lower(f->>'city'))
       and (f->>'pincode' is null or o.shipping_address->>'pincode' = f->>'pincode')
       and (f->>'coupon' is null or upper(o.coupon_code) = upper(f->>'coupon'))
       and (f->>'has_coupon' is null or ((o.coupon_id is not null) = (f->>'has_coupon')::boolean))
       and (f->>'needs_attention' is null or ((o.needs_attention is not null) = (f->>'needs_attention')::boolean))
       and (f->>'user_id' is null or o.user_id = (f->>'user_id')::uuid)
       and (f->>'customer_type' is null
            or (f->>'customer_type' = 'guest' and o.user_id is null)
            or (f->>'customer_type' = 'registered' and o.user_id is not null))
       and (f->>'shipment_status' is null or exists (select 1 from public.shipments sh where sh.order_id = o.id and sh.status = f->>'shipment_status'))
       and (f->>'no_tracking' is null or ((not exists (select 1 from public.shipments sh where sh.order_id = o.id)) = (f->>'no_tracking')::boolean))
       and (f->>'has_return' is null or ((exists (select 1 from public.returns rt where rt.order_id = o.id)) = (f->>'has_return')::boolean))
       and (f->>'product_id' is null or exists (select 1 from public.order_items oi where oi.order_id = o.id and oi.product_id = (f->>'product_id')::uuid))
       and (v_search is null
            or o.order_number ilike '%' || v_search || '%' or o.email ilike '%' || v_search || '%'
            or (regexp_replace(v_search, '\D', '', 'g') <> '' and o.phone like '%' || regexp_replace(v_search, '\D', '', 'g') || '%')
            or o.customer_name ilike '%' || v_search || '%' or o.invoice_number ilike '%' || v_search || '%'
            or exists (select 1 from public.shipments sh where sh.order_id = o.id and sh.tracking_number ilike '%' || v_search || '%')
            or exists (select 1 from public.payments pm where pm.order_id = o.id and pm.provider_payment_id = v_search))
  ), page as (
    select t.*, row_number() over (order by
        case when v_sort = 'placed_at' and v_dir = 'desc' then t.placed_at end desc,
        case when v_sort = 'placed_at' and v_dir = 'asc' then t.placed_at end asc,
        case when v_sort = 'total_inr' and v_dir = 'desc' then t.total_inr end desc,
        case when v_sort = 'total_inr' and v_dir = 'asc' then t.total_inr end asc,
        case when v_sort = 'order_number' and v_dir = 'desc' then t.order_number end desc,
        case when v_sort = 'order_number' and v_dir = 'asc' then t.order_number end asc,
        t.id) as rn
      from filtered t order by rn offset v_offset limit v_limit
  )
  select jsonb_build_object('total', (select count(*) from filtered), 'limit', v_limit, 'offset', v_offset,
    'rows', coalesce((select jsonb_agg(jsonb_build_object(
        'id', t.id, 'order_number', t.order_number, 'placed_at', t.placed_at, 'status', t.status,
        'payment_status', t.payment_status, 'payment_method', t.payment_method, 'email', t.email, 'phone', t.phone,
        'customer_name', t.customer_name, 'total_inr', t.total_inr, 'discount_inr', t.discount_inr,
        'coupon_code', t.coupon_code, 'state', t.shipping_address->>'state', 'city', t.shipping_address->>'city',
        'needs_attention', t.needs_attention, 'invoice_number', t.invoice_number, 'is_guest', t.user_id is null,
        'units', (select coalesce(sum(i.quantity), 0) from public.order_items i where i.order_id = t.id),
        'items', (select string_agg(i.name, ', ' order by i.name) from public.order_items i where i.order_id = t.id),
        'shipments', (select jsonb_agg(jsonb_build_object('carrier', sh.carrier_name, 'tracking', sh.tracking_number,
                        'url', sh.tracking_url, 'status', sh.status)) from public.shipments sh where sh.order_id = t.id))
      order by t.rn) from page t), '[]'::jsonb))
  into v_result;
  return v_result;
end $$;

-- Full order detail for the admin screen.
create or replace function public.admin_get_order(p_order_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o public.orders;
begin
  perform public.require_admin();
  select * into o from public.orders where id = p_order_id;
  if not found then return null; end if;
  return jsonb_build_object(
    'order', to_jsonb(o),
    'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.name) from public.order_items i where i.order_id = o.id), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at) from public.order_events e where e.order_id = o.id), '[]'::jsonb),
    'shipments', coalesce((select jsonb_agg(to_jsonb(sh) order by sh.created_at) from public.shipments sh where sh.order_id = o.id), '[]'::jsonb),
    'payments', coalesce((select jsonb_agg(to_jsonb(pm) - 'raw' order by pm.created_at) from public.payments pm where pm.order_id = o.id), '[]'::jsonb),
    'refunds', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at) from public.refunds r where r.order_id = o.id), '[]'::jsonb),
    'returns', coalesce((select jsonb_agg(jsonb_build_object('return', to_jsonb(rt),
        'items', (select jsonb_agg(to_jsonb(ri)) from public.return_items ri where ri.return_id = rt.id)) order by rt.created_at)
        from public.returns rt where rt.order_id = o.id), '[]'::jsonb),
    'customer', (select to_jsonb(pr) from public.profiles pr where pr.id = o.user_id));
end $$;

-- ---------------------------------------------------------------- customers
create or replace function public.admin_list_customers(
  p_search text default null, p_limit int default 25, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_rows jsonb; v_total bigint; v_s text := nullif(trim(p_search), '');
begin
  perform public.require_admin();
  select count(*) into v_total from public.profiles p
   where v_s is null or p.email ilike '%' || v_s || '%' or p.full_name ilike '%' || v_s || '%' or p.phone like '%' || v_s || '%';
  select coalesce(jsonb_agg(row_to_json(x)::jsonb), '[]'::jsonb) into v_rows from (
    select p.id, p.email, p.full_name, p.phone, p.role, p.blocked, p.marketing_opt_in, p.created_at,
           count(o.id) filter (where o.status not in ('cancelled','payment_pending','payment_failed','placed')) as orders,
           coalesce(sum(o.total_inr - o.refunded_inr) filter (where o.status not in ('cancelled','payment_pending','payment_failed','placed')), 0) as lifetime_value_inr,
           max(o.placed_at) as last_order_at
      from public.profiles p left join public.orders o on o.user_id = p.id
     where v_s is null or p.email ilike '%' || v_s || '%' or p.full_name ilike '%' || v_s || '%' or p.phone like '%' || v_s || '%'
     group by p.id order by p.created_at desc
     offset greatest(p_offset, 0) limit least(greatest(p_limit, 1), 200)) x;
  return jsonb_build_object('total', v_total, 'rows', v_rows);
end $$;

create or replace function public.admin_set_customer_blocked(p_user_id uuid, p_blocked boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  update public.profiles set blocked = p_blocked where id = p_user_id and role = 'customer';
end $$;

-- ---------------------------------------------------------------- coupons for specific people
create or replace function public.admin_set_coupon_recipients(p_coupon_id uuid, p_emails text[], p_user_ids uuid[] default '{}')
returns int language plpgsql security definer set search_path = public as $$
declare e text; u uuid; n int := 0;
begin
  perform public.require_admin();
  delete from public.coupon_recipients where coupon_id = p_coupon_id;
  foreach e in array coalesce(p_emails, '{}') loop
    if trim(e) <> '' then
      insert into public.coupon_recipients (coupon_id, email) values (p_coupon_id, lower(trim(e)));
      n := n + 1;
    end if;
  end loop;
  foreach u in array coalesce(p_user_ids, '{}') loop
    insert into public.coupon_recipients (coupon_id, user_id) values (p_coupon_id, u);
    n := n + 1;
  end loop;
  update public.coupons set audience = 'specific' where id = p_coupon_id and n > 0;
  return n;
end $$;

-- ---------------------------------------------------------------- dashboard
create or replace function public.admin_dashboard()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_today timestamptz := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
begin
  perform public.require_admin();
  return jsonb_build_object(
    'orders_today', (select count(*) from public.orders where placed_at >= v_today and status not in ('cancelled','payment_pending','payment_failed')),
    'revenue_today_inr', (select coalesce(sum(total_inr), 0) from public.orders where placed_at >= v_today and status not in ('cancelled','payment_pending','payment_failed','placed')),
    'to_ship', (select count(*) from public.orders where status in ('confirmed','processing')),
    'in_transit', (select count(*) from public.orders where status = 'dispatched'),
    'awaiting_payment', (select count(*) from public.orders where status = 'payment_pending'),
    'needs_attention', (select count(*) from public.orders where needs_attention is not null),
    'open_returns', (select count(*) from public.returns where status in ('requested','approved','pickup_scheduled','received')),
    'pending_refunds', (select count(*) from public.refunds where status in ('pending','failed')),
    'low_stock_variants', (select count(*) from public.product_variants v join public.products p on p.id = v.product_id
        where p.deleted_at is null and v.track_inventory and v.available
          and v.stock <= coalesce(v.low_stock_threshold, (select low_stock_default from public.store_settings))),
    'emails_failed', (select count(*) from public.email_outbox where status = 'failed'));
end $$;
