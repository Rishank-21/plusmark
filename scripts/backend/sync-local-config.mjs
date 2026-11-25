// Copies NOTIFICATION_JOB_SECRET from supabase/functions/.env.local into the local database,
// so the "email queued" trigger can wake the process-emails function. Local stack only.
import pg from "pg";
import { LOCAL, functionsEnv, refuseRemote } from "./_lib.mjs";

refuseRemote();
const env = functionsEnv();
const secret = env.NOTIFICATION_JOB_SECRET;
if (!secret || secret.length < 16) {
  console.error("NOTIFICATION_JOB_SECRET (16+ chars) missing in supabase/functions/.env.local");
  process.exit(1);
}
const base = process.argv[2] ?? "http://host.docker.internal:55321/functions/v1";
const c = new pg.Client({ connectionString: LOCAL.db });
await c.connect();
await c.query(
  `insert into public.app_config (key, value) values ('job_secret', $1), ('edge_base_url', $2)
   on conflict (key) do update set value = excluded.value`,
  [secret, base],
);
await c.end();
console.log("Local database now knows the email job secret and function URL:", base);
