import { rpc, owner } from '../tools/demo-data/lib.mjs';
const o = await owner();
const period = { from: new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) };
for (const fn of ['admin_report_funnel', 'admin_report_abandoned_carts']) {
  const r = await rpc(fn, { p_period: period, p_comparison: null, p_filters: null, p_group: null, p_sort: null, p_page: null }, o);
  console.log(fn, JSON.stringify(r).slice(0, 700));
}
const d = await rpc('admin_dashboard', { p_period: period, p_comparison: null }, o);
console.log('dashboard', JSON.stringify(d).slice(0, 900));
