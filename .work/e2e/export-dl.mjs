// Owner downloads a ready export: admin_export_download, then each part from the private admin-exports bucket.
import { API, ANON, ownerAal2, http } from './lib.mjs';
const s = await ownerAal2();
const h = { apikey: ANON, authorization: `Bearer ${s.access_token}`, 'content-profile': 'api' };
const d = await http('POST', `${API}/rest/v1/rpc/admin_export_download`, { headers: h, body: { p_export_id: process.argv[2] } });
console.log('download rpc', d.status, 'parts', d.json?.parts?.length, 'rows', d.json?.row_count);
for (const p of d.json?.parts ?? []) {
  const f = await fetch(`${API}/storage/v1/object/authenticated/${d.json.bucket}/${p.path}`, { headers: { apikey: ANON, authorization: `Bearer ${s.access_token}` } });
  const t = await f.text();
  console.log('storage GET', f.status, t.length, 'bytes; lines', t.trim().split(/\r?\n/).length, '; header:', t.split(/\r?\n/)[0].slice(0, 160));
}
