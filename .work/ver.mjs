import { rpc, owner } from '../tools/demo-data/lib.mjs';
const o = await owner();
const period = { from: new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) };
const calls = [
  ['admin_dashboard', { p_period: period, p_comparison: null }],
  ['admin_report_sales', { p_period: period, p_interval: 'week', p_group_by: null, p_filters: null }],
  ['admin_report_customers', { p_period: period, p_comparison: null, p_filters: null, p_group: null, p_sort: null, p_page: null }],
  ['admin_forecasts', { p_options: null }],
  ['admin_reorder_list', { p_filters: null, p_cursor: null, p_page_size: 25 }],
  ['admin_low_stock_list', { p_cursor: null, p_page_size: 25 }],
  ['admin_trends', { p_options: null }],
];
for (const [fn, a] of calls) {
  const t = Date.now();
  try { const r = await rpc(fn, a, o, { soft: true }); console.log(fn, Date.now() - t, 'ms', r.ok ? JSON.stringify(r.data).length + ' bytes' : JSON.stringify(r.error).slice(0, 200)); }
  catch (e) { console.log(fn, Date.now() - t, 'ms', 'FETCH', e.message); }
}
