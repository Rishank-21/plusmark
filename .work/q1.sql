select id, email, created_at::date from medusa.customer order by created_at;
select count(*) from ext.reconciliation_run;
select min(created_at) from medusa."order";
