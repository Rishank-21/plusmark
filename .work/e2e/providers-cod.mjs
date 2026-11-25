import { API, ANON, ownerAal2, http, psql } from './lib.mjs';
const region = psql(`select id from medusa.region where name='India' and deleted_at is null limit 1`);
const s = await ownerAal2();
const r = await http('POST', `${API}/functions/v1/admin-providers`, { headers: { apikey: ANON, authorization: `Bearer ${s.access_token}`, origin: 'http://localhost:3001' }, body: { region_id: region, provider_id: 'pp_cod_cod', enabled: true } });
console.log('admin-providers', r.status, JSON.stringify(r.json).slice(0, 400));
console.log(psql(`select * from medusa.region_payment_provider where region_id='${region}'`));

