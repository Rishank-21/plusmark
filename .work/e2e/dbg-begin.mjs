import { API, SERVICE, http } from './lib.mjs';
import fs from 'node:fs';
const c = JSON.parse(JSON.parse(fs.readFileSync('out-cod.json', 'utf8')).cart);
const h = { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-profile': 'api' };
const g = await http('POST', `${API}/rest/v1/rpc/service_cart_is_guest`, { headers: h, body: { p_cart_id: c.id } });
console.log('is_guest', g.status, JSON.stringify(g.json));
const b = await http('POST', `${API}/rest/v1/rpc/service_begin_payment`, { headers: h, body: { p_cart_id: c.id, p_cart_token: c.token, p_auth_user_id: null, p_provider: process.argv[2] ?? 'cod' } });
console.log('begin', b.status, JSON.stringify(b.json).slice(0, 600));
