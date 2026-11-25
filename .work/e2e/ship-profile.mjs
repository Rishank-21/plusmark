import { API, ANON, ownerAal2, http, psql } from './lib.mjs';
const s = await ownerAal2();
const id = psql(`select id from medusa.shipping_option where name='Standard delivery' and deleted_at is null`);
const o = await http('POST', `${API}/rest/v1/rpc/admin_upsert_shipping_option`, { headers: { apikey: ANON, authorization: `Bearer ${s.access_token}`, 'content-profile': 'api' }, body: { p_shipping_option: { id, shipping_profile_id: null } } });
console.log(o.status, JSON.stringify(o.json).slice(0, 120));
