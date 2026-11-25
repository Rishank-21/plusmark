-- Adds one published product with one variant, a price, stock and declarations, through the Admin_API as the owner.
begin;
select set_config('request.jwt.claims', json_build_object('sub', (select id from auth.users where email = 'admin@plusmark.local'),
                  'role', 'authenticated', 'aal', 'aal2')::text, true);
do $$
declare
  v_pid text; v_vid text; v_item text;
  v_channel text := (select id from medusa.sales_channel where name = 'Online store' and deleted_at is null);
  v_loc text := (select id from medusa.stock_location where name = 'Main warehouse' and deleted_at is null);
begin
  v_pid := api.admin_upsert_product(jsonb_build_object('title', 'Test Mug', 'handle', 'test-mug', 'sales_channel_ids', jsonb_build_array(v_channel),
             'options', jsonb_build_array(jsonb_build_object('title', 'Size', 'values', jsonb_build_array('Standard'))),
             'thumbnail', 'https://placehold.co/800x800/png?text=Test+Mug')) ->> 'id';
  v_vid := api.admin_upsert_variant(jsonb_build_object('product_id', v_pid, 'title', 'Standard', 'sku', 'TEST-MUG-1',
             'manage_inventory', true, 'options', jsonb_build_object('Size', 'Standard'))) ->> 'id';
  perform api.admin_upsert_prices(v_vid, '[{"currency_code": "inr", "amount": 299}]');
  -- no Admin_API function creates an Inventory_Item, so insert it and its link (as supabase/seed-local.sql does)
  v_item := internal.generate_id_for('inventory_item');
  insert into medusa.inventory_item (id, sku, title, requires_shipping) values (v_item, 'TEST-MUG-1', 'Test Mug', true);
  insert into medusa.product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity)
  values ('pvitem_' || internal.generate_id_for('product_variant_inventory_item'), v_vid, v_item, 1);
  perform api.admin_adjust_inventory(v_item, v_loc, 25, 'count correction', 'manual test');
  perform api.admin_product_storefront_save(v_pid, '["Dishwasher safe"]', null,
    jsonb_build_object(v_vid, jsonb_build_object('mrp', 349, 'currency_code', 'inr', 'net_quantity', 1, 'net_quantity_unit', 'unit',
                                                 'manufacture_month', to_char(now(), 'YYYY-MM'))),
    '{"country_of_origin": "India", "manufacturer": "Test Works, Bengaluru", "consumer_care": "care@example.test"}', null, null);
  perform api.admin_set_product_status(v_pid, 'published', null, null);
  raise notice 'product % published', v_pid;
end $$;
select internal.catalog_rebuild_dirty(100) is not null as catalog_rebuilt;
commit;
