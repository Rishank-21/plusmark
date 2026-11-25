// Owner operations: partial refund (+ payment-operations run), orders export create + download. Never prints secrets.
import { API, ANON, SERVICE, ownerAal2, http, psql } from './lib.mjs';
const s = await ownerAal2();
const h = { apikey: ANON, authorization: `Bearer ${s.access_token}`, 'content-profile': 'api', origin: 'http://localhost:3001' };
const rpc = (fn, body) => http('POST', `${API}/rest/v1/rpc/${fn}`, { headers: h, body });
const show = (l, r) => console.log(l, r.status, JSON.stringify(r.json).slice(0, 600));
const step = process.argv[2] ?? 'all';
if (step === 'all' || step === 'refund') {
  const pay = psql(`select p.id from medusa.payment p join medusa.payment_session ps on ps.id = p.payment_session_id
    where p.provider_id = 'pp_razorpay_razorpay' and p.captured_at is not null order by p.created_at desc limit 1`);
  const reason = psql(`select id from medusa.refund_reason where code = 'customer_care_adjustment' limit 1`);
  console.log('payment', pay);
  const r = await rpc('admin_refund_payment', { p_payment_id: pay, p_amount: Number(process.env.AMT ?? 50), p_reason_id: reason, p_note: 'E2E partial refund', p_idempotency_key: 'e2e-refund-' + Date.now() });
  show('admin_refund_payment', r);
  const ops = await http('POST', `${API}/functions/v1/payment-operations`, { headers: { authorization: `Bearer ${SERVICE}` }, body: {} });
  show('payment-operations', ops);
  console.log(psql(`select kind, status, amount, provider_ref is not null, left(coalesce(error,''),200) from ext.provider_operation order by created_at desc limit 2`));
  console.log(psql(`select id, amount, payment_id from medusa.refund where payment_id = '${pay}'`));
}
if (step === 'all' || step === 'export') {
  const c = await rpc('admin_export_create', { p_source: process.argv[3] ?? 'orders', p_filters: {}, p_format: 'csv', p_idempotency_key: 'e2e-export-' + Date.now() });
  show('admin_export_create', c);
  const id = c.json?.export?.id ?? c.json?.id ?? c.json?.export_id;
  if (id) {
    for (let i = 0; i < 20; i++) {
      const st = psql(`select status from ext.export_job where id = '${id}'`);
      if (st === 'ready' || st === 'failed') break;
      await new Promise((r) => setTimeout(r, 5000));
    }
    console.log('export job', psql(`select kind, status, row_count, part_count, coalesce(failure_reason,'') from ext.export_job where id = '${id}'`));
    if (c.json?.kind === 'immediate') { const pg = await rpc('admin_export_page', { p_export_id: id, p_page: 0 }); show('admin_export_page', pg); }
    const d = await rpc('admin_export_download', { p_export_id: id });
    show('admin_export_download', d);
    const urls = JSON.stringify(d.json).match(/https?:[^"]+/g) ?? [];
    for (const u of urls.slice(0, 2)) {
      const f = await fetch(u.replace(/\\u0026/g, '&'));
      const t = await f.text();
      console.log('download', f.status, t.length, 'bytes; first line:', t.split(/\r?\n/)[0].slice(0, 200), 'lines', t.split(/\r?\n/).length);
    }
  }
}

