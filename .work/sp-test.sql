BEGIN;
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-4000-8000-0000000a0001','sp1@example.invalid'),('00000000-0000-4000-8000-0000000a0002','sp2@example.invalid');
INSERT INTO medusa."user" (id, email, first_name, last_name) VALUES ('user_sp_1','sp1@example.invalid','S','P'),('user_sp_2','sp2@example.invalid','S','P2');
INSERT INTO ext.admin_user_link (auth_user_id, user_id, status) VALUES ('00000000-0000-4000-8000-0000000a0001','user_sp_1','active'),('00000000-0000-4000-8000-0000000a0002','user_sp_2','active');
INSERT INTO ext.admin_user_role (auth_user_id, role_id) SELECT '00000000-0000-4000-8000-0000000a0001', id FROM ext.role WHERE name='analyst';
CREATE FUNCTION pg_temp.as_user(p int) RETURNS void LANGUAGE sql AS $f$ SELECT set_config('request.jwt.claims', jsonb_build_object('sub','00000000-0000-4000-8000-0000000a000'||p,'aal','aal2')::text, true) $f$;
INSERT INTO medusa.product (id,title,handle,status) VALUES ('prod_sp1','Old name','sp-1','published'),('prod_sp2','Unsold','sp-2','published');
INSERT INTO medusa.product_category (id,name,handle,mpath) VALUES ('pcat_sp1','Cat A','sp-cat-a','pcat_sp1'),('pcat_sp2','Cat B','sp-cat-b','pcat_sp2');
INSERT INTO medusa.product_category_product VALUES ('prod_sp1','pcat_sp1'),('prod_sp1','pcat_sp2');
INSERT INTO ext.order_fact (order_id,currency_code,status,is_sale,placed_at,local_day,units,gross_amount,discount_amount,shipping_amount,tax_amount,net_amount,total_amount)
 VALUES ('o_sp1','inr','completed',true,now(),current_date,2,200,20,10,5,180,195);
INSERT INTO ext.order_line_fact (order_id,line_item_id,product_id,currency_code,is_sale,placed_at,local_day,quantity,gross_amount,discount_amount,net_amount,tax_amount,total_amount)
 VALUES ('o_sp1','li_sp1','prod_sp1','inr',true,now(),current_date,2,200,20,180,5,185);
SELECT pg_temp.as_user(1);
SELECT jsonb_pretty(api.admin_report_sales('{"preset":"last_7_days"}','week','none')) ;
SELECT api.admin_report_sales('{"preset":"today"}','day','category')::text;
SELECT api.admin_report_sales('{"preset":"today"}','day','payment_method')::text;
SELECT api.admin_report_products('{"preset":"today"}','{"metric":"net_sales"}')::text;
SELECT api.admin_report_sales()::jsonb -> 'error';
SELECT api.admin_report_sales('{"preset":"today"}','year')::text;
SELECT api.admin_report_products(null,'{"limit":2}')::text;
SELECT pg_temp.as_user(2);
SELECT api.admin_report_sales()::text;
ROLLBACK;

