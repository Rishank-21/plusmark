select n.id, n."to", n.channel, n.template, n.status, n.provider_id, n.external_id, n.created_at, d.attempts, d.next_attempt_at, d.last_error
from medusa.notification n left join ext.notification_delivery d on d.notification_id = n.id
order by n.created_at desc limit 4;
select jobname, schedule, active from cron.job where jobname ilike '%notif%' or jobname ilike '%export%' or jobname ilike '%forecast%' or jobname ilike '%reconc%';
select id, status_code, left(content::text, 200) as content, error_msg, created from net._http_response order by created desc limit 5;
