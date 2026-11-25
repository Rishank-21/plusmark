begin;
-- Fixture data for the admin contract test. Runs inside one transaction that the runner rolls back.
-- Admin user 1 is an aal2 owner; every api.admin_* function is called as that user.
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-4000-8000-0000000c0001', 'contract-owner@example.invalid'),
  ('00000000-0000-4000-8000-0000000c0002', 'contract-invitee@example.invalid'),
  ('00000000-0000-4000-8000-0000000c0003', 'contract-buyer@example.invalid');
INSERT INTO medusa."user" (id, email) VALUES ('user_ct_1', 'contract-owner@example.invalid');
INSERT INTO ext.admin_user_link (auth_user_id, user_id, status) VALUES ('00000000-0000-4000-8000-0000000c0001', 'user_ct_1', 'active');
INSERT INTO ext.admin_user_role (auth_user_id, role_id) SELECT '00000000-0000-4000-8000-0000000c0001', id FROM ext.role WHERE name = 'owner';
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000c0001","aal":"aal2"}', true);

INSERT INTO medusa.currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name)
  VALUES ('usd', '$', '$', 2, 0, '{"value":"0","precision":20}', 'US Dollar') ON CONFLICT DO NOTHING;
INSERT INTO medusa.payment_provider (id, is_enabled) VALUES ('pp_razorpay_razorpay', true), ('pp_cod_cod', true) ON CONFLICT DO NOTHING;
INSERT INTO medusa.region (id, name, currency_code, automatic_taxes) VALUES ('reg_ct1', 'CT', 'usd', false);
INSERT INTO medusa.sales_channel (id, name) VALUES ('sc_ct1', 'CT');
INSERT INTO medusa.stock_location (id, name) VALUES ('sloc_ct1', 'A');
INSERT INTO medusa.sales_channel_stock_location (id, sales_channel_id, stock_location_id) VALUES ('scsl_ct1', 'sc_ct1', 'sloc_ct1');
INSERT INTO medusa.product (id, title, handle, status) VALUES ('prod_ct1', 'CT', 'ct-prod', 'published');
INSERT INTO medusa.product_variant (id, title, product_id, manage_inventory, allow_backorder) VALUES
  ('variant_ct_a', 'A', 'prod_ct1', false, false), ('variant_ct_b', 'B', 'prod_ct1', false, false),
  ('variant_ct_inv', 'Inv', 'prod_ct1', true, false);
INSERT INTO medusa.product_sales_channel (id, product_id, sales_channel_id) VALUES ('psc_ct1', 'prod_ct1', 'sc_ct1');
INSERT INTO medusa.price_set (id) VALUES ('pset_ct_a'), ('pset_ct_b');
INSERT INTO medusa.product_variant_price_set (id, variant_id, price_set_id) VALUES
  ('pvps_ct_a', 'variant_ct_a', 'pset_ct_a'), ('pvps_ct_b', 'variant_ct_b', 'pset_ct_b');
INSERT INTO medusa.price (id, price_set_id, currency_code, raw_amount, amount) VALUES
  ('price_ct_a', 'pset_ct_a', 'usd', '{"value":"10","precision":20}', 10), ('price_ct_b', 'pset_ct_b', 'usd', '{"value":"7","precision":20}', 7);
INSERT INTO ext.store_setting (key, value, version) VALUES ('store.default_sales_channel_id', '"sc_ct1"', 1)
  ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO ext.store_setting (key, value, version) VALUES ('feature.quotations', 'true', 1), ('feature.enquiries', 'true', 1), ('feature.reviews', 'true', 1)
  ON CONFLICT (key) DO UPDATE SET value = excluded.value;

-- Inventory.
INSERT INTO medusa.inventory_item (id, sku) VALUES ('iitem_ct1', 'CT1');
INSERT INTO medusa.product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity) VALUES ('pvii_ct1', 'variant_ct_inv', 'iitem_ct1', 1);
INSERT INTO medusa.inventory_level (id, inventory_item_id, location_id, stocked_quantity, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity)
  VALUES ('ilev_ct1', 'iitem_ct1', 'sloc_ct1', 20, '{"value":"20","precision":20}', '{"value":"0","precision":20}', '{"value":"0","precision":20}');

-- Customers.
INSERT INTO medusa.customer (id, email, has_account) VALUES ('cus_ct1', 'buyer@example.invalid', true);
INSERT INTO medusa.customer_group (id, name) VALUES ('cusgroup_ct1', 'CT group');

-- Orders. ct1: fulfilled 2 of 2, paid and captured 20 (returns, claims, exchanges, refunds, cod).
-- ct2: unfulfilled, paid 20 (fulfillment, edit). ct3: unfulfilled, unpaid (cancel). ct4: fulfilled, delivered (return receive).
INSERT INTO medusa."order" (id, display_id, email, currency_code, sales_channel_id, region_id, customer_id)
  SELECT 'order_ct' || i, 990100 + i, 'o' || i || '@example.invalid', 'usd', 'sc_ct1', 'reg_ct1', 'cus_ct1' FROM generate_series(1, 5) i;
INSERT INTO medusa.order_line_item (id, title, variant_id, product_id, unit_price, raw_unit_price)
  SELECT 'oli_ct' || i, 'Item', CASE WHEN i = 2 THEN 'variant_ct_inv' ELSE 'variant_ct_a' END, 'prod_ct1', 10, '{"value":"10","precision":20}' FROM generate_series(1, 5) i;
INSERT INTO medusa.order_item (id, order_id, version, item_id, quantity, raw_quantity, fulfilled_quantity, raw_fulfilled_quantity,
                               shipped_quantity, raw_shipped_quantity, return_requested_quantity, return_received_quantity,
                               return_dismissed_quantity, written_off_quantity)
  SELECT 'oi_ct' || i, 'order_ct' || i, 1, 'oli_ct' || i, 2, '{"value":"2","precision":20}', f, jsonb_build_object('value', f::text, 'precision', 20),
         f, jsonb_build_object('value', f::text, 'precision', 20), 0, 0, 0, 0
    FROM (SELECT i, CASE WHEN i IN (2, 3) THEN 0 ELSE 2 END AS f FROM generate_series(1, 5) i) s;
INSERT INTO medusa.payment_collection (id, currency_code, amount, raw_amount, status, authorized_amount, raw_authorized_amount)
  SELECT 'paycol_ct' || i, 'usd', 20, '{"value":"20","precision":20}', 'completed', 20, '{"value":"20","precision":20}' FROM unnest(array[1,2,4,5]) i;
INSERT INTO medusa.payment_session (id, currency_code, amount, raw_amount, provider_id, data, status, payment_collection_id)
  SELECT 'payses_ct' || i, 'usd', 20, '{"value":"20","precision":20}', 'pp_razorpay_razorpay', jsonb_build_object('provider_ref', 'order_x' || i), 'authorized', 'paycol_ct' || i FROM unnest(array[1,2,4,5]) i;
INSERT INTO medusa.payment (id, amount, raw_amount, currency_code, provider_id, data, payment_collection_id, payment_session_id)
  SELECT 'pay_ct' || i, 20, '{"value":"20","precision":20}', 'usd', 'pp_razorpay_razorpay', jsonb_build_object('provider_ref', 'order_x' || i, 'payment_ref', 'pay_x' || i), 'paycol_ct' || i, 'payses_ct' || i FROM unnest(array[1,2,4,5]) i;
INSERT INTO medusa.capture (id, amount, raw_amount, payment_id) SELECT 'capt_ct' || i, 20, '{"value":"20","precision":20}', 'pay_ct' || i FROM unnest(array[1,2,4,5]) i;
INSERT INTO medusa.order_payment_collection (id, order_id, payment_collection_id) SELECT 'opc_ct' || i, 'order_ct' || i, 'paycol_ct' || i FROM unnest(array[1,2,4,5]) i;
INSERT INTO medusa.fulfillment (id, location_id, shipped_at, delivered_at) VALUES
  ('ful_ct1', 'sloc_ct1', now(), now()), ('ful_ct4', 'sloc_ct1', now() - interval '1 day', now()), ('ful_ct5', 'sloc_ct1', now(), now());
INSERT INTO medusa.order_fulfillment (id, order_id, fulfillment_id) VALUES
  ('ordful_ct1', 'order_ct1', 'ful_ct1'), ('ordful_ct4', 'order_ct4', 'ful_ct4'), ('ordful_ct5', 'order_ct5', 'ful_ct5');
-- A shipped-but-undelivered fulfillment on order_ct2 is created through admin_create_fulfillment inside the cases.
SELECT internal.claim_order_stock('order_ct2');

-- Reviews, enquiries, quotations, migration run.
INSERT INTO ext.migration_run (id, mode, status, started_at, finished_at, report) VALUES
  ('mrun_ct1', 'apply', 'passed', now() - interval '2 hours', now() - interval '2 hours',
   '{"reconciled":true,"committed":true,"failure":null,"mismatches":[],"source_checksum":"abc","steps":[{"name":"catalog","status":"ok"}]}')
  ON CONFLICT DO NOTHING;

-- Store, countries, shipping zone, COD orders, migration dry run.
INSERT INTO medusa.store (id, name) VALUES ('store_ct1', 'CT store') ON CONFLICT DO NOTHING;
INSERT INTO medusa.region_country (iso_2, iso_3, num_code, name, display_name) VALUES ('in', 'ind', '356', 'INDIA', 'India') ON CONFLICT DO NOTHING;
INSERT INTO medusa.fulfillment_set (id, name, type) VALUES ('fuset_ct1', 'CT', 'shipping');
INSERT INTO medusa.service_zone (id, name, fulfillment_set_id) VALUES ('serzo_ct1', 'Z1', 'fuset_ct1');
INSERT INTO medusa.shipping_profile (id, name, type) VALUES ('sp_ct1', 'P1', 'default');
CREATE FUNCTION pg_temp.mkcod(p_n int, p_email text, p_amount numeric) RETURNS void LANGUAGE plpgsql AS $f$
BEGIN
  INSERT INTO medusa.order_address (id, phone) VALUES ('ordaddr_ct' || p_n, NULL);
  INSERT INTO medusa."order" (id, currency_code, customer_id, email, shipping_address_id)
    VALUES ('order_ct' || p_n, 'usd', NULL, p_email, 'ordaddr_ct' || p_n);
  INSERT INTO medusa.payment_collection (id, currency_code, amount, raw_amount, status, authorized_amount, raw_authorized_amount)
    VALUES ('paycol_ct' || p_n, 'usd', p_amount, jsonb_build_object('value', p_amount::text, 'precision', 20), 'authorized', p_amount,
            jsonb_build_object('value', p_amount::text, 'precision', 20));
  INSERT INTO medusa.payment_session (id, currency_code, amount, raw_amount, provider_id, data, status, payment_collection_id)
    VALUES ('payses_ct' || p_n, 'usd', p_amount, jsonb_build_object('value', p_amount::text, 'precision', 20), 'pp_cod_cod', '{}', 'authorized', 'paycol_ct' || p_n);
  INSERT INTO medusa.payment (id, amount, raw_amount, currency_code, provider_id, data, payment_collection_id, payment_session_id)
    VALUES ('pay_ct' || p_n, p_amount, jsonb_build_object('value', p_amount::text, 'precision', 20), 'usd', 'pp_cod_cod', '{}', 'paycol_ct' || p_n, 'payses_ct' || p_n);
  INSERT INTO medusa.order_payment_collection (order_id, payment_collection_id, id) VALUES ('order_ct' || p_n, 'paycol_ct' || p_n, 'ordpc_ct' || p_n);
END $f$;
SELECT pg_temp.mkcod(6, 'refused@example.invalid', 50);
SELECT pg_temp.mkcod(7, 'cash@example.invalid', 50);
INSERT INTO ext.migration_run (id, mode, status, started_at, finished_at, report) VALUES
  ('mrun_ctd', 'dry_run', 'passed', now() - interval '3 hours', now() - interval '3 hours',
   '{"reconciled":true,"mismatches":[],"source_checksum":"abc","steps":[{"name":"catalog","status":"ok"}]}')
  ON CONFLICT DO NOTHING;

select internal.is_valid_gstin('27AAPFU0939F1ZV');
insert into medusa.order_address (id, first_name, last_name, province, country_code) values ('oa_t1','Asha','Rao','Karnataka','in');
update medusa."order" set shipping_address_id='oa_t1' where id='order_ct1';
insert into medusa.order_line_item_tax_line (id, description, code, rate, raw_rate, provider_id, item_id) values
 ('tl_t1','c','CGST9',9,'{"value":"9","precision":20}','x','oli_ct1'),('tl_t2','s','SGST9',9,'{"value":"9","precision":20}','x','oli_ct1');
insert into ext.tax_head_map (tax_rate_code, tax_head) values ('CGST9','cgst'),('SGST9','sgst');
insert into ext.store_setting (key, value, version) values ('feature.gst','true',1),('gst.store_gstin','"27AAPFU0939F1ZV"',1),('store.timezone','"Asia/Kolkata"',1) on conflict (key) do update set value=excluded.value;
insert into ext.gst_profile (product_id, variant_id, hsn_code, unit_quantity_code) values ('prod_ct1', null, '6109', 'NOS');
update medusa.fulfillment set shipped_at = null where id='ful_ct1';
update medusa.fulfillment set shipped_at = now() where id='ful_ct1';
update medusa.fulfillment set shipped_at = null where id='ful_ct1';
update medusa.fulfillment set shipped_at = now() where id='ful_ct1';
select kind, number, document_date, buyer_name, buyer_type, place_of_supply_code, place_of_supply_state, supply_type, taxable_value, cgst, sgst, igst, total_value from ext.gst_document;
select line_no, hsn_code, unit_quantity_code, quantity, taxable_value, cgst, sgst, total_value, rate from ext.gst_document_line;
select * from ext.gst_counter;
select * from ext.error_log order by 1 desc limit 3;
insert into medusa.return (id, order_id, order_version, status) values ('ret_t1','order_ct1',1,'requested');
insert into medusa.return_item (id, return_id, item_id, quantity, raw_quantity) values ('ri_t1','ret_t1','oli_ct1',1,'{"value":"1","precision":20}');
insert into ext.order_event (event_type, order_id, payload) values ('order.return_requested','order_ct1','{"return_id":"ret_t1","order_change_id":"oc_x"}');
insert into ext.order_event (event_type, order_id, payload) values ('order.return_requested','order_ct1','{"return_id":"ret_t1","order_change_id":"oc_x"}');
select kind, number, reference_number, taxable_value, cgst, sgst, total_value, source_ref from ext.gst_document order by created_at, number;
update medusa.order_item set quantity=1, raw_quantity='{"value":"1","precision":20}' where id='oi_ct1';
select internal.gst_issue_note('credit_note','order_ct1','change:oc_1') is not null as edit_credit;
update medusa.order_item set quantity=3, raw_quantity='{"value":"3","precision":20}' where id='oi_ct1';
select internal.gst_issue_note('debit_note','order_ct1','change:oc_2') is not null as edit_debit;
select kind, number, taxable_value, total_value, source_ref from ext.gst_document order by created_at, number;
select api.admin_order_invoice('order_ct1') -> 'tax_invoice' ->> 'buyer_name', api.admin_order_invoice('order_ct1') ->> 'document_type', api.admin_order_invoice('order_ct4') ->> 'document_type', api.admin_order_invoice('order_ct4') ->> 'not_a_tax_invoice';
select left(api.admin_order_invoice('order_ct4')::text, 300);
update ext.gst_document set number='X';
rollback;


