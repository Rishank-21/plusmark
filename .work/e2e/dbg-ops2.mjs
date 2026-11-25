import { API, SERVICE, http } from './lib.mjs';
const h = { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-profile': 'api' };
const r = await http('POST', `${API}/rest/v1/rpc/service_finish_provider_operation`, { headers: h, body: { p_id: 251, p_outcome: 'succeeded', p_provider_ref: 'rfnd_U1fnX24OgVdQHB', p_error: null } });
console.log(r.status, JSON.stringify(r.json).slice(0, 800));
