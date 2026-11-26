-- =====================================================================
-- Part 8: email worker support (claim rows safely, retry schedule)
-- =====================================================================

-- Atomically take up to p_limit pending emails (safe with several workers).
create or replace function public.claim_emails(p_limit int default 20)
returns setof public.email_outbox language sql security definer set search_path = public as $$
  update public.email_outbox e
     set status = 'sending', attempts = attempts + 1
   where e.id in (
     select id from public.email_outbox
      where status = 'pending' and attempts < 5 and next_attempt_at <= now()
      order by created_at
      limit least(greatest(p_limit, 1), 50)
      for update skip locked)
  returning e.*;
$$;

create or replace function public.finish_email(
  p_id uuid, p_ok boolean, p_provider_id text default null, p_error text default null, p_skip boolean default false)
returns void language sql security definer set search_path = public as $$
  update public.email_outbox set
    status = case when p_skip then 'skipped' when p_ok then 'sent'
                  when attempts >= 5 then 'failed' else 'pending' end,
    next_attempt_at = case when p_ok then next_attempt_at else now() + make_interval(mins => attempts * 2) end,
    provider_id = coalesce(p_provider_id, provider_id),
    error = left(p_error, 500),
    sent_at = case when p_ok then now() else sent_at end
  where id = p_id;
$$;

-- Same wake-up used by the insert trigger; also run on a schedule so failures retry.
create or replace function public.kick_email_worker()
returns void language plpgsql security definer set search_path = public as $$
declare v_url text; v_secret text;
begin
  select value into v_url from public.app_config where key = 'edge_base_url';
  select value into v_secret from public.app_config where key = 'job_secret';
  if v_url is not null and v_secret is not null and to_regnamespace('net') is not null
     and public._rate_ok('email-kick', 1, 3) then
    perform net.http_post(
      url := v_url || '/process-emails',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-job-secret', v_secret),
      body := '{}'::jsonb);
  end if;
end $$;

revoke all on function public.claim_emails(int) from public, anon, authenticated;
revoke all on function public.finish_email(uuid, boolean, text, text, boolean) from public, anon, authenticated;
revoke all on function public.kick_email_worker() from public, anon, authenticated;
grant execute on function public.claim_emails(int) to service_role;
grant execute on function public.finish_email(uuid, boolean, text, text, boolean) to service_role;
grant execute on function public.kick_email_worker() to service_role;

do $$
begin
  perform cron.schedule('plusmark-email-kick', '* * * * *', 'select public.kick_email_worker()');
exception when others then raise notice 'pg_cron unavailable: %', sqlerrm;
end $$;

-- admin can re-queue a failed email from the dashboard
create or replace function public.admin_retry_email(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  update public.email_outbox set status = 'pending', attempts = 0, next_attempt_at = now(), error = null where id = p_id and status in ('failed','skipped');
  perform public.kick_email_worker();
end $$;
revoke execute on function public.admin_retry_email(uuid) from public, anon;
grant execute on function public.admin_retry_email(uuid) to authenticated, service_role;
