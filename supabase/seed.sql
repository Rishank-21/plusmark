-- Local development seed. Runs on `supabase db reset`. Never run against production.

update public.store_settings set
  seller_name = 'Plusmark', seller_state = 'Gujarat', seller_gstin = '24ABCDE1234F1Z5',
  seller_address = 'Narolgam, Ahmedabad, Gujarat 382405', seller_phone = '9999999999',
  seller_email = 'orders@plusmark.test', cod_enabled = true, cod_fee_inr = 40;

-- Lets database triggers wake the email edge function locally.
insert into public.app_config (key, value) values
  ('edge_base_url', 'http://host.docker.internal:55321/functions/v1'),
  ('job_secret', 'local-dev-job-secret')
on conflict (key) do update set value = excluded.value;

insert into public.carriers (id, name, tracking_url_template) values
  ('delhivery', 'Delhivery', 'https://www.delhivery.com/track/package/{tracking}'),
  ('dtdc', 'DTDC', 'https://www.dtdc.in/tracking/tracking_results.asp?strCnno={tracking}'),
  ('bluedart', 'Blue Dart', 'https://www.bluedart.com/tracking?trackFor=0&trackNo={tracking}'),
  ('indiapost', 'India Post', 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx'),
  ('ecom', 'Ecom Express', 'https://ecomexpress.in/tracking/?awb_field={tracking}'),
  ('self', 'Own delivery', null),
  ('other', 'Other courier', null)
on conflict (id) do nothing;

insert into public.shipping_zones (state, fee_inr, eta_min_days, eta_max_days) values
  ('Gujarat', 40, 1, 3), ('Maharashtra', 60, 2, 5), ('Rajasthan', 60, 2, 5),
  ('Delhi', 80, 3, 6), ('Karnataka', 90, 3, 7), ('Tamil Nadu', 90, 3, 7)
on conflict (state) do nothing;

insert into public.categories (id, parent_id, name, description, subject, sort_order, default_gst_rate) values
  ('kitchen', null, 'Kitchen & Dining', 'Cookware, drinkware and everyday kitchen tools', 'kitchen item', 1, 18),
  ('home-storage', null, 'Home & Storage', 'Containers, organisers and home essentials', 'home item', 2, 18),
  ('stationery', null, 'Stationery', 'Notebooks, pens and desk essentials', 'stationery item', 3, 12),
  ('drinkware', 'kitchen', 'Drinkware', null, null, 1, 18),
  ('cookware', 'kitchen', 'Cookware', null, null, 2, 18),
  ('containers', 'home-storage', 'Containers', null, null, 1, 18),
  ('notebooks', 'stationery', 'Notebooks', null, null, 1, 12),
  ('pens', 'stationery', 'Pens & Writing', null, null, 2, 18)
on conflict (id) do nothing;

do $$
declare
  pid uuid; oid uuid; n int;
begin
  -- 1. Steel bottle: Size x Colour, size-specific prices
  insert into public.products (slug, name, brand, category_id, subcategory_ids, blurb, description, features, specs, attributes,
                               gst_rate, hsn_code, published, featured, tags)
  values ('steel-water-bottle', 'Steel Water Bottle', 'Plusmark', 'kitchen', '{drinkware}',
    'Double wall vacuum insulated bottle.', 'Keeps drinks cold for 24 hours and hot for 12 hours.',
    array['Leak proof lid','BPA free','Powder coated finish'],
    '[{"label":"Material","value":"304 stainless steel"},{"label":"Insulation","value":"Double wall vacuum"}]',
    '{"material":"Stainless steel","dishwasher_safe":false}', 18, '7323', true, true, array['bottle','insulated'])
  returning id into pid;
  insert into public.product_media (product_id, public_id, alt, sort_order) values (pid, 'plusmark/products/steel-water-bottle', 'Steel Water Bottle', 0);
  insert into public.product_options (product_id, name, kind, sort_order) values (pid, 'Size', 'size', 0) returning id into oid;
  insert into public.product_option_values (option_id, value, sort_order) values (oid, '500 ml', 0), (oid, '750 ml', 1), (oid, '1 L', 2);
  insert into public.product_options (product_id, name, kind, sort_order) values (pid, 'Color', 'color', 1) returning id into oid;
  insert into public.product_option_values (option_id, value, swatch_hex, sort_order) values
    (oid, 'Black', '#111111', 0), (oid, 'Blue', '#1d4ed8', 1), (oid, 'Red', '#dc2626', 2);
  n := public._generate_variants(pid, 349, '{"Size":{"500 ml":349,"750 ml":449,"1 L":549}}', 40, 180);

  -- 2. Non-stick tawa: Size only
  insert into public.products (slug, name, brand, category_id, subcategory_ids, blurb, features, gst_rate, hsn_code, published, tags)
  values ('non-stick-tawa', 'Non-stick Tawa', 'Plusmark', 'kitchen', '{cookware}', 'Induction friendly tawa.',
          array['Induction base','Cool touch handle'], 18, '7323', true, array['tawa','cookware'])
  returning id into pid;
  insert into public.product_media (product_id, public_id, alt, sort_order) values (pid, 'plusmark/products/non-stick-tawa', 'Non-stick Tawa', 0);
  insert into public.product_options (product_id, name, kind, sort_order) values (pid, 'Size', 'size', 0) returning id into oid;
  insert into public.product_option_values (option_id, value, width_cm, sort_order) values
    (oid, '24 cm', 24, 0), (oid, '26 cm', 26, 1), (oid, '28 cm', 28, 2);
  n := public._generate_variants(pid, 599, '{"Size":{"24 cm":599,"26 cm":699,"28 cm":799}}', 25, 320);

  -- 3. Notebook: cover colour x custom "Ruling"
  insert into public.products (slug, name, brand, category_id, subcategory_ids, blurb, gst_rate, hsn_code, published, featured, tags)
  values ('spiral-notebook', 'Spiral Notebook A5', 'Plusmark', 'stationery', '{notebooks}', '180 pages, 70 GSM paper.',
          12, '4820', true, true, array['notebook','paper'])
  returning id into pid;
  insert into public.product_media (product_id, public_id, alt, sort_order) values (pid, 'plusmark/products/spiral-notebook', 'Spiral Notebook', 0);
  insert into public.product_options (product_id, name, kind, sort_order) values (pid, 'Cover', 'color', 0) returning id into oid;
  insert into public.product_option_values (option_id, value, swatch_hex, sort_order) values
    (oid, 'Blue', '#2563eb', 0), (oid, 'Green', '#16a34a', 1), (oid, 'Black', '#111111', 2);
  insert into public.product_options (product_id, name, kind, sort_order) values (pid, 'Ruling', 'custom', 1) returning id into oid;
  insert into public.product_option_values (option_id, value, sort_order) values (oid, 'Ruled', 0), (oid, 'Plain', 1), (oid, 'Grid', 2);
  n := public._generate_variants(pid, 129, '{}', 100, 60);

  -- 4. Gel pens: custom Pack option only
  insert into public.products (slug, name, brand, category_id, subcategory_ids, blurb, gst_rate, hsn_code, published, bulk_suggestion_quantity, tags)
  values ('gel-pen-pack', 'Smooth Gel Pens', 'Plusmark', 'stationery', '{pens}', '0.5 mm tip, quick dry ink.',
          18, '9608', true, 50, array['pen'])
  returning id into pid;
  insert into public.product_media (product_id, public_id, alt, sort_order) values (pid, 'plusmark/products/gel-pen-pack', 'Gel pens', 0);
  insert into public.product_options (product_id, name, kind, sort_order) values (pid, 'Pack', 'custom', 0) returning id into oid;
  insert into public.product_option_values (option_id, value, sort_order) values (oid, 'Pack of 5', 0), (oid, 'Pack of 10', 1), (oid, 'Pack of 20', 2);
  n := public._generate_variants(pid, 99, '{"Pack":{"Pack of 5":99,"Pack of 10":179,"Pack of 20":329}}', 200, 40);
  update public.product_variants set pack_qty = case options->>'Pack' when 'Pack of 5' then 5 when 'Pack of 10' then 10 else 20 end
   where product_id = pid;

  -- 5. Container set: a single default variant, tracked stock
  insert into public.products (slug, name, brand, category_id, subcategory_ids, blurb, gst_rate, hsn_code, published, tags)
  values ('airtight-container-set', 'Airtight Container Set (3 pcs)', 'Plusmark', 'home-storage', '{containers}',
          'Stackable BPA free containers.', 18, '3924', true, array['storage'])
  returning id into pid;
  insert into public.product_media (product_id, public_id, alt, sort_order) values (pid, 'plusmark/products/airtight-container-set', 'Container set', 0);
  insert into public.product_variants (product_id, sku, title, options, price_inr, compare_at_inr, stock)
  values (pid, 'CONT-SET-3', 'Default', '{}', 499, 649, 15);
  insert into public.inventory_movements (variant_id, delta, stock_after, reason, note)
  select id, 15, 15, 'initial', 'seed' from public.product_variants where sku = 'CONT-SET-3';

  -- 6. Enquiry only product (shown, not buyable online)
  insert into public.products (slug, name, brand, category_id, blurb, gst_rate, published, enquiry_only)
  values ('custom-printed-diaries', 'Custom Printed Diaries (bulk)', 'Plusmark', 'stationery', 'Corporate diaries with your logo.', 12, true, true)
  returning id into pid;
  insert into public.product_variants (product_id, sku, title, options, price_mode, price_inr, stock)
  values (pid, 'DIARY-CUSTOM', 'Default', '{}', 'on_request', null, 0);
end $$;

-- initial stock movement log for generated variants without one
insert into public.inventory_movements (variant_id, delta, stock_after, reason, note)
select v.id, v.stock, v.stock, 'initial', 'seed' from public.product_variants v
 where v.stock > 0 and not exists (select 1 from public.inventory_movements m where m.variant_id = v.id);

insert into public.coupons (code, description, kind, value, max_discount_inr, min_order_inr, per_user_limit, audience) values
  ('WELCOME10', '10% off your first order', 'percent', 10, 200, 499, 1, 'new_customers'),
  ('FLAT100', 'Rs 100 off orders above Rs 999', 'flat', 100, null, 999, 5, 'all'),
  ('FREESHIP', 'Free shipping', 'free_shipping', 0, null, 0, 5, 'all'),
  ('VIP20', '20% off for selected customers', 'percent', 20, 500, 0, 3, 'specific'),
  ('STATIONERY15', '15% off stationery', 'percent', 15, 300, 0, 5, 'all');
update public.coupons set category_ids = '{stationery}' where code = 'STATIONERY15';
insert into public.coupon_recipients (coupon_id, email)
select id, 'vip@example.com' from public.coupons where code = 'VIP20';
