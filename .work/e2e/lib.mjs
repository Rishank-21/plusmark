// Local E2E helpers (gitignored: .work/). Reads keys from `supabase status`; never prints secrets.
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..', '..');
const st = execSync('supabase status -o env', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
export const sb = {};
for (const l of st.split(/\r?\n/)) { const m = l.match(/^([A-Z_0-9]+)="?(.*?)"?$/); if (m) sb[m[1]] = m[2]; }
export const API = sb.API_URL;
export const ANON = sb.ANON_KEY;
export const SERVICE = sb.SERVICE_ROLE_KEY;
export const envFile = Object.fromEntries(
  fs.readFileSync(path.join(root, 'supabase/functions/.env.local'), 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; }),
);
export const psql = (sql) => execSync('docker exec -i supabase_db_plusmark psql -U postgres -At -v ON_ERROR_STOP=1', { input: sql }).toString().trim();

export async function http(method, url, { headers = {}, body, raw } = {}) {
  const r = await fetch(url, { method, headers: { 'content-type': 'application/json', ...headers }, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: r.status, json, text: raw ? text : undefined };
}

// RFC 6238 TOTP (SHA1, 30 s, 6 digits)
function b32(s) { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''; for (const c of s.replace(/=+$/, '').toUpperCase()) bits += A.indexOf(c).toString(2).padStart(5, '0'); const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out); }
export function totp(secret, t = Date.now()) {
  const c = Buffer.alloc(8); c.writeBigUInt64BE(BigInt(Math.floor(t / 30000)));
  const h = crypto.createHmac('sha1', b32(secret)).update(c).digest(); const o = h[19] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1e6)).padStart(6, '0');
}

const factorFile = path.join(dir, 'owner-totp.json');

// Password-less owner session (Auth admin generate_link + verify), so the owner's password is not needed or changed.
export async function ownerAal1(email = 'admin@plusmark.local') {
  const g = await http('POST', `${API}/auth/v1/admin/generate_link`, { headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` }, body: { type: 'magiclink', email } });
  if (!g.json?.hashed_token) throw new Error('generate_link failed ' + g.status);
  const v = await http('POST', `${API}/auth/v1/verify`, { headers: { apikey: ANON }, body: { type: 'magiclink', token_hash: g.json.hashed_token } });
  if (!v.json?.access_token) throw new Error('verify failed ' + v.status + ' ' + JSON.stringify(v.json).slice(0, 200));
  return v.json;
}

export async function ownerAal2() {
  const s1 = await ownerAal1();
  const h = (t) => ({ apikey: ANON, authorization: `Bearer ${t}` });
  let f = fs.existsSync(factorFile) ? JSON.parse(fs.readFileSync(factorFile, 'utf8')) : null;
  if (!f) {
    const en = await http('POST', `${API}/auth/v1/factors`, { headers: h(s1.access_token), body: { factor_type: 'totp', friendly_name: 'e2e-' + Date.now() } });
    if (!en.json?.id) throw new Error('enrol failed ' + JSON.stringify(en.json).slice(0, 200));
    f = { id: en.json.id, secret: en.json.totp.secret };
  }
  const ch = await http('POST', `${API}/auth/v1/factors/${f.id}/challenge`, { headers: h(s1.access_token), body: {} });
  const vf = await http('POST', `${API}/auth/v1/factors/${f.id}/verify`, { headers: h(s1.access_token), body: { challenge_id: ch.json.id, code: totp(f.secret) } });
  if (!vf.json?.access_token) throw new Error('mfa verify failed ' + vf.status + ' ' + JSON.stringify(vf.json).slice(0, 200));
  if (!fs.existsSync(factorFile)) {
    fs.writeFileSync(factorFile, JSON.stringify(f));
    // Record the factor the way invitation acceptance does: a factor-reset invitation for the owner, accepted at aal2.
    const token = crypto.randomBytes(32).toString('hex');
    psql(`insert into ext.admin_invite (email, role_ids, token_hash, expires_at, reset_for)
      select 'admin@plusmark.local', array(select id from ext.role where name='owner'), encode(sha256(convert_to('${token}','utf8')),'hex'), now()+interval '1 hour', id
      from auth.users where email='admin@plusmark.local'`);
    const a = await http('POST', `${API}/rest/v1/rpc/admin_accept_invite`, { headers: { ...h(vf.json.access_token), 'content-profile': 'api' }, body: { p_token: token, p_factor_id: f.id } });
    if (a.json?.error) throw new Error('accept invite failed ' + JSON.stringify(a.json.error));
  }
  return vf.json;
}
