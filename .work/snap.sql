select n.nspname || '.' || c.relname,
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', n.nspname, c.relname), false, true, '')))[1]::text::bigint as n
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where c.relkind in ('r', 'p') and not c.relispartition and n.nspname in ('medusa', 'ext', 'auth', 'public')
   and c.relname not like 'audit_log%' and c.relname not like 'security_event%' and c.relname not in ('job_run', 'idempotency_record', 'rate_limit_counter', 'rate_limit_block', 'refresh_tokens', 'sessions', 'flow_state', 'one_time_tokens', 'mfa_challenges')
 order by 1;
