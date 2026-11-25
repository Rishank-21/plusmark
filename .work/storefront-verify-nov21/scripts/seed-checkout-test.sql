-- Optional Razorpay test catalogue. Apply only to the store used for test checkout.
begin;
do $$
declare
  source medusa.product%rowtype;
  item_handle text;
  response jsonb;
  product_id text;
  channel_id text;
  category_id text;
begin
  perform pg_advisory_xact_lock(hashtext('plusmark-razorpay-test-products'));
  perform set_config('app.seed_run', 'on', true);
  select id into strict channel_id from medusa.sales_channel where deleted_at is null order by created_at,id limit 1;
  select id into strict category_id from medusa.product_category where handle='clipboards' and deleted_at is null;
  for source in select * from medusa.product where deleted_at is null and handle in
    (select handle from medusa.product where handle like '%clipboard%' and handle not like 'checkout-test-%' and deleted_at is null order by handle limit 2)
  loop
    item_handle := 'checkout-test-' || source.handle;
    if exists(select 1 from medusa.product where handle=item_handle and deleted_at is null) then continue; end if;
    response := api.admin_upsert_product(jsonb_build_object(
      'title','Checkout test - ' || source.title,'handle',item_handle,'description','Razorpay test purchase. No physical item will ship.',
      'discountable',false,'thumbnail',source.thumbnail,'metadata',jsonb_build_object('checkout_test',true),
      'images',case when source.thumbnail is null then '[]'::jsonb else jsonb_build_array(jsonb_build_object('url',source.thumbnail,'rank',0)) end,
      'options',jsonb_build_array(jsonb_build_object('title','Size','values',jsonb_build_array('Test unit'))),
      'category_ids',jsonb_build_array(category_id),'sales_channel_ids',jsonb_build_array(channel_id)));
    if response->>'id' is null then raise exception 'Cannot create test product: %',response; end if;
    product_id := response->>'id';
    response := api.admin_upsert_variant(jsonb_build_object('product_id',product_id,'title','Test unit','sku',upper(item_handle),
      'manage_inventory',false,'allow_backorder',true,'options',jsonb_build_object('Size','Test unit')));
    if response->>'id' is null then raise exception 'Cannot create test SKU: %',response; end if;
    response := api.admin_upsert_prices(response->>'id',jsonb_build_array(jsonb_build_object('currency_code','inr','amount',1,'min_quantity',1)));
    if response ? 'error' then raise exception 'Cannot price test SKU: %',response; end if;
    response := api.admin_set_product_status(product_id,'published');
    if response ? 'error' then raise exception 'Cannot publish test SKU: %',response; end if;
  end loop;
  if not exists(select 1 from medusa.product where handle like 'checkout-test-%' and deleted_at is null) then
    raise exception 'Seed the clipboard catalogue first';
  end if;
  perform internal.catalog_rebuild_dirty(100000);
end $$;
commit;
