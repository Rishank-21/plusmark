// Flat shipping option + PIN serviceability for India, through the Admin API as the owner (aal2).
import { API, ANON, ownerAal2, http, psql } from './lib.mjs';
const s = await ownerAal2();
const h = { apikey: ANON, authorization: `Bearer ${s.access_token}`, 'content-profile': 'api' };
const rpc = (fn, body) => http('POST', `${API}/rest/v1/rpc/${fn}`, { headers: h, body });
if (!psql(`select id from medusa.shipping_option where name='Standard delivery' and deleted_at is null`)) {
  const o = await rpc('admin_upsert_shipping_option', { p_shipping_option: {
    name: 'Standard delivery', price_type: 'flat', service_zone_id: 'serzo_e2e_local', shipping_profile_id: 'sp_e2e_default',
    provider_id: 'manual_manual', type: { label: 'Standard', code: 'standard' },
    prices: [{ currency_code: 'inr', amount: 49 }],
  } });
  console.log('shipping option', o.status, JSON.stringify(o.json).slice(0, 300));
}
const r = await rpc('admin_upsert_serviceability_rules', { p_country_code: 'in', p_rules: [
  { country_code: 'in', kind: 'range', postal_from: '110001', postal_to: '110099', deliverable: true, cod_available: true, eta_min_days: 2, eta_max_days: 4, priority: 10 },
  { country_code: 'in', kind: 'range', postal_from: '400001', postal_to: '400099', deliverable: true, cod_available: true, eta_min_days: 2, eta_max_days: 5, priority: 10 },
] });
console.log('serviceability', r.status, JSON.stringify(r.json).slice(0, 300));
const p = await http('POST', `${API}/rest/v1/rpc/store_check_postal_code`, { headers: { apikey: ANON, 'content-profile': 'api' }, body: { p_country_code: 'in', p_postal_code: '110001' } });
console.log('postal 110001', JSON.stringify(p.json));
