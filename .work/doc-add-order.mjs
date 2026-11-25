// Places one guest COD order the way the storefront does (anon key only): cart RPCs -> payment-initiate (cod) ->
// bot-gateway place_guest_order with the Turnstile dummy token. Run from the repo root: node .work/doc-add-order.mjs
import { execSync } from 'node:child_process';

const env = Object.fromEntries(execSync('supabase status -o env', { stdio: ['ignore', 'pipe', 'ignore'] }).toString()
  .split(/\r?\n/).map((l) => l.match(/^([A-Z_]+)="?(.*?)"?$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const API = env.API_URL, ANON = env.ANON_KEY;
const H = { 'content-type': 'application/json', apikey: ANON, authorization: `Bearer ${ANON}`, origin: 'http://localhost:4321' };
const rpc = async (fn, args) => {
  const j = await (await fetch(`${API}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { ...H, 'content-profile': 'api' }, body: JSON.stringify(args) })).json();
  if (j?.error) throw new Error(`${fn}: ${JSON.stringify(j.error)}`);
  return j;
};
const fn = async (name, body) => (await fetch(`${API}/functions/v1/${name}`, { method: 'POST', headers: H, body: JSON.stringify(body) })).json();

const regions = await rpc('store_list_regions', {});
const region = (regions.regions ?? regions)[0].id;
const product = await rpc('store_get_product', { p_handle: 'a4-clipboard' });           // a seed product
const variant = (product.product ?? product).variants[0].id;
const { cart, cart_token } = await rpc('store_create_cart', { p_region_id: region });
const c = { p_cart_id: cart.id, p_cart_token: cart_token };
await rpc('store_cart_add_item', { ...c, p_variant_id: variant, p_quantity: 1 });
await rpc('store_cart_set_email', { ...c, p_email: 'demo+manual@plusmark.test' });
await rpc('store_cart_set_addresses', { ...c, p_billing_address: null, p_shipping_address: {
  first_name: 'Manual', last_name: 'Tester', phone: '+919800000099', address_1: '1 Test Road', city: 'New Delhi',
  province: 'Delhi', postal_code: '110001', country_code: 'in' } });                       // 110001: serviceable, COD allowed
const opts = await rpc('store_cart_list_shipping_options', c);
const sm = await rpc('store_cart_set_shipping_method', { ...c, p_shipping_option_id: opts.shipping_options[0].id });
const pay = await fn('payment-initiate', { cart_id: cart.id, cart_token, provider: 'cod', challenge_token: 'XXXX.DUMMY.TOKEN.XXXX' });
if (pay?.error) throw new Error('payment-initiate: ' + JSON.stringify(pay.error));
const placed = await fn('bot-gateway', { action: 'place_guest_order', challenge_token: 'XXXX.DUMMY.TOKEN.XXXX',
  payload: { cart_id: cart.id, idempotency_key: `manual-${Date.now()}`, expected_total: sm.cart.total } });
if (placed?.error) throw new Error('place_guest_order: ' + JSON.stringify(placed.error));
console.log('order', placed.order.display_id, placed.order.id, 'total', placed.order.totals.total);
