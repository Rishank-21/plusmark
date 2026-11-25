\timing on
set statement_timeout = '300s';
select pg_get_function_identity_arguments('internal.reorder_rows'::regproc);
select count(*) from medusa.product_variant where deleted_at is null;
select count(*) from medusa.order_line_item;
begin;
select internal.alert_eval_stock_out();
rollback;
