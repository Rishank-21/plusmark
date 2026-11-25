import { API, SERVICE, http } from './lib.mjs';
const h = { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-profile': 'api' };
for (const [fn, b] of [['service_claim_payment_incident', {}], ['service_list_provider_operations', { p_status: 'pending', p_older_than_seconds: 0, p_limit: 25 }], ['service_list_provider_operations', { p_status: 'unknown', p_older_than_seconds: 60, p_limit: 25 }]]) {
  const r = await http('POST', `${API}/rest/v1/rpc/${fn}`, { headers: h, body: b });
  console.log(fn, r.status, JSON.stringify(r.json).slice(0, 400));
}
