-- Task 19.3: quotations (Requirements 17.5-17.7).
BEGIN;
SELECT plan(23);
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-4000-8000-000000000c01', 'qb1@example.invalid'),
  ('00000000-0000-4000-8000-000000000c02', 'qb2@example.invalid'),
  ('00000000-0000-4000-8000-000000000c03', 'qadmin@example.invalid');
INSERT INTO medusa."user" (id, email) VALUES ('user_qt1', 'qadmin@example.invalid');
INSERT INTO ext.admin_user_link (auth_user_id, user_id, status) VALUES ('00000000-0000-4000-8000-000000000c03', 'user_qt1', 'active');
INSERT INTO ext.admin_user_role (auth_user_id, role_id)
  SELECT '00000000-0000-4000-8000-000000000c03', r.id FROM ext.role r WHERE r.name = 'owner';
INSERT INTO medusa.customer (id, email, has_account) VALUES ('cus_qt1', 'buyer@example.invalid', true), ('cus_qt2', 'other@example.invalid', true);
INSERT INTO ext.customer_auth_link (auth_user_id, customer_id) VALUES
  ('00000000-0000-4000-8000-000000000c01', 'cus_qt1'), ('00000000-0000-4000-8000-000000000c02', 'cus_qt2')
  ON CONFLICT (auth_user_id) DO UPDATE SET customer_id = excluded.customer_id;
CREATE FUNCTION pg_temp.as_user(p_n int) RETURNS void LANGUAGE sql AS $f$
  SELECT set_config('request.jwt.claims',
    jsonb_build_object('sub', '00000000-0000-4000-8000-000000000c0' || p_n, 'aal', 'aal2')::text, true) $f$;
CREATE FUNCTION pg_temp.st(j jsonb) RETURNS text LANGUAGE plpgsql AS $f$
  BEGIN RETURN coalesce(j -> 'error' ->> 'code', 'ok') || ':' || current_setting('response.status', true); END $f$;

INSERT INTO medusa.currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name)
  VALUES ('usd', '$', '$', 2, 0, '{"value":"0","precision":20}', 'US Dollar') ON CONFLICT DO NOTHING;
INSERT INTO medusa.region (id, name, currency_code, automatic_taxes) VALUES ('reg_qt1', 'QT', 'usd', false);
INSERT INTO medusa.product (id, title, handle, status) VALUES ('prod_qt1', 'QT', 'qt-prod', 'published');
INSERT INTO medusa.product_variant (id, title, product_id, manage_inventory, allow_backorder) VALUES
  ('var_qt1', 'V1', 'prod_qt1', false, false), ('var_qt2', 'V2', 'prod_qt1', false, false);
INSERT INTO medusa.sales_channel (id, name, is_disabled) VALUES ('sc_qt1', 'QT', false);
INSERT INTO medusa.product_sales_channel (id, product_id, sales_channel_id) VALUES ('psc_qt1', 'prod_qt1', 'sc_qt1');
INSERT INTO ext.store_setting (key, value, version) VALUES ('store.default_sales_channel_id', '"sc_qt1"', 1) ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO medusa.price_set (id) VALUES ('pset_qt1');
INSERT INTO medusa.product_variant_price_set (id, variant_id, price_set_id) VALUES ('pvps_qt1', 'var_qt1', 'pset_qt1');
INSERT INTO medusa.price (id, price_set_id, currency_code, raw_amount, amount) VALUES ('price_qt1', 'pset_qt1', 'usd', '{"value":"10","precision":20}', 10);
INSERT INTO ext.store_setting (key, value, version) VALUES ('feature.quotations', 'false', 1)
  ON CONFLICT (key) DO UPDATE SET value = 'false';

SELECT is(pg_temp.st(api.service_request_quotation('{"email":"buyer@example.invalid","region_id":"reg_qt1","items":[{"variant_id":"var_qt1","quantity":2}]}')),
  'feature_disabled:403', 'disabled feature rejects requests');
UPDATE ext.store_setting SET value = 'true' WHERE key = 'feature.quotations';
SELECT is(pg_temp.st(api.service_request_quotation('{"region_id":"reg_qt1","items":[{"variant_id":"var_qt1","quantity":2}]}')),
  'validation_failed:400', 'a guest needs an email');
SELECT is(pg_temp.st(api.service_request_quotation('{"email":"a@example.invalid","region_id":"reg_qt1","items":[]}')),
  'validation_failed:400', 'at least one item is needed');
SELECT is(pg_temp.st(api.service_request_quotation('{"email":"a@example.invalid","region_id":"reg_qt1","items":[{"variant_id":"var_qt1","quantity":0}]}')),
  'validation_failed:400', 'a zero quantity is rejected');
SELECT is(pg_temp.st(api.service_request_quotation('{"email":"a@example.invalid","region_id":"reg_qt1","items":[{"variant_id":"var_nope","quantity":1}]}')),
  'not_found:404', 'an unknown variant is rejected');

CREATE TEMP TABLE q1 AS SELECT api.service_request_quotation(
  '{"email":"Buyer@Example.invalid","region_id":"reg_qt1","items":[{"variant_id":"var_qt1","quantity":2},{"variant_id":"var_qt2","quantity":1}]}') AS j;
SELECT is((SELECT j ->> 'status' FROM q1), 'requested', 'a request is stored as requested');
SELECT is((SELECT count(*) FROM ext.quotation WHERE access_token_hash = (SELECT j ->> 'access_token' FROM q1)), 0::bigint, 'the raw token is not stored');
SELECT is((SELECT count(*) FROM medusa.notification WHERE trigger_type = 'quotation.requested'), 1::bigint, 'the admin is notified');

-- admin pricing
SELECT pg_temp.as_user(1);
SELECT is(pg_temp.st(api.admin_price_quotation((SELECT j ->> 'id' FROM q1), '[]', now() + interval '1 day')), 'permission_denied:403', 'quotation:manage is required');
SELECT pg_temp.as_user(3);
CREATE TEMP TABLE it AS SELECT jsonb_agg(jsonb_build_object('item_id', id, 'unit_price', CASE variant_id WHEN 'var_qt1' THEN 7.5 ELSE 3 END)) AS items
  FROM ext.quotation_item WHERE quotation_id = (SELECT j ->> 'id' FROM q1);
SELECT is(pg_temp.st(api.admin_price_quotation((SELECT j ->> 'id' FROM q1), (SELECT items FROM it), now() - interval '1 day')), 'validation_failed:400', 'a past expiry is rejected');
SELECT is(pg_temp.st(api.admin_price_quotation((SELECT j ->> 'id' FROM q1), (SELECT items FROM it), now() + interval '1 day')), 'ok:200', 'a full price list is accepted');
SELECT is(pg_temp.st(api.admin_price_quotation((SELECT j ->> 'id' FROM q1), (SELECT items FROM it), now() + interval '1 day')), 'ok:200', 'repricing a priced quotation is allowed');
SELECT is(pg_temp.st(api.admin_price_quotation((SELECT j ->> 'id' FROM q1), (SELECT jsonb_build_array(items -> 0) FROM it), now() + interval '1 day')), 'validation_failed:400', 'every item must be priced');
SELECT is((SELECT status FROM ext.quotation WHERE id = (SELECT j ->> 'id' FROM q1)), 'priced', 'the quotation is priced');

-- view
SELECT pg_temp.as_user(2);
SELECT is(pg_temp.st(api.store_get_quotation((SELECT j ->> 'id' FROM q1))), 'not_found:404', 'another customer gets not_found');
SELECT is(pg_temp.st(api.store_get_quotation((SELECT j ->> 'id' FROM q1), (SELECT j ->> 'access_token' FROM q1))), 'ok:200', 'the access token grants a view');
SELECT is(pg_temp.st(api.store_accept_quotation((SELECT j ->> 'id' FROM q1))), 'not_found:404', 'another customer cannot accept');

-- accept
SELECT pg_temp.as_user(1);
CREATE TEMP TABLE a1 AS SELECT api.store_accept_quotation((SELECT j ->> 'id' FROM q1)) AS j;
SELECT is((SELECT (j -> 'cart' ->> 'subtotal')::numeric FROM a1), 18::numeric, 'the Cart is priced at the quoted prices (2 x 7.5 + 3)');
SELECT is((SELECT count(*) FROM medusa.cart_line_item WHERE cart_id = (SELECT j -> 'cart' ->> 'id' FROM a1) AND is_custom_price), 2::bigint, 'lines are custom-price');
SELECT is(pg_temp.st(api.store_cart_update_item((SELECT j -> 'cart' ->> 'id' FROM a1), NULL, (SELECT id FROM medusa.cart_line_item WHERE cart_id = (SELECT j -> 'cart' ->> 'id' FROM a1) AND variant_id = 'var_qt1'), 5)),
  'cart_not_modifiable:409', 'a quoted line cannot change quantity');
SELECT is(pg_temp.st(api.store_accept_quotation((SELECT j ->> 'id' FROM q1))), 'quotation_unavailable:409', 'a converted quotation cannot be accepted again');
SELECT is((SELECT count(*) FROM ext.cart_state WHERE quotation_id = (SELECT j ->> 'id' FROM q1)), 1::bigint, 'only one Cart is created');

-- expiry
INSERT INTO ext.quotation (id, email_norm, region_id, currency_code, access_token_hash, status, expires_at)
  VALUES ('quot_old', 'x@example.invalid', 'reg_qt1', 'usd', 'h', 'priced', now() - interval '1 hour');
SELECT is(internal.expire_quotations(), 1, 'the job expires priced quotations past their expiry');

SELECT * FROM finish();
ROLLBACK;
