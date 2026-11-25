import { rpc, owner, psql } from '../tools/demo-data/lib.mjs';
const o = await owner();
const recip = psql(`select id from auth.users where email = 'admin@plusmark.local'`);
const r = await rpc('admin_scheduled_report_save', { p_report: 'sales', p_frequency: 'weekly', p_local_time: '08:00', p_recipients: [recip], p_weekday: 1, p_month_day: null, p_include_csv: true, p_filters: { demo: true }, p_id: null, p_expected_version: null, p_idempotency_key: 'demo-sched-weekly-sales-2' }, o, { soft: true });
console.log(JSON.stringify(r).slice(0, 800));
