import { http, API, ANON, envFile, psql } from '../tools/demo-data/lib.mjs';
for (let i = 0; i < 8; i++) {
  const r = await http('POST', `${API}/functions/v1/forecast-worker`, { headers: { apikey: ANON, authorization: `Bearer ${envFile.FORECAST_WORKER_JOB_SECRET}` }, body: {} });
  console.log(i, r.status, r.text.slice(0, 200));
  console.log(psql(`select status, count(*) from ext.forecast_series group by 1 order by 1`).replace(/\n/g, ' ; '));
  if (r.status === 200 && JSON.parse(r.text).claimed === 0) break;
  await new Promise((x) => setTimeout(x, 3000));
}
console.log(psql(`select count(*) from ext.forecast_point`));
