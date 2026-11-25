import { http, API, ANON, envFile, psql } from '../tools/demo-data/lib.mjs';
const p = http('POST', `${API}/functions/v1/forecast-worker`, { headers: { apikey: ANON, authorization: `Bearer ${envFile.FORECAST_WORKER_JOB_SECRET}` }, body: {} });
for (let i = 0; i < 9; i++) {
  await new Promise((x) => setTimeout(x, 1000));
  console.log(i, psql(`select pid, state, wait_event_type, wait_event, now()-query_start d, left(query,150) from pg_stat_activity where state <> 'idle' and pid <> pg_backend_pid() and query not like '%pg_stat_activity%' and datname='postgres' order by query_start`).replace(/\n/g, '\n   '));
}
console.log((await p).status);
