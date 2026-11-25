// aal2 owner session from a script, without the password: magic link (service role) + TOTP from .work/e2e/owner-totp.json.
// Run from the repo root: node .work/doc-aal2.mjs
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const env = Object.fromEntries(execSync('supabase status -o env', { stdio: ['ignore', 'pipe', 'ignore'] }).toString()
  .split(/\r?\n/).map((l) => l.match(/^([A-Z_]+)="?(.*?)"?$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const API = env.API_URL, ANON = env.ANON_KEY, SERVICE = env.SERVICE_ROLE_KEY; // service role: local scripts only, never in an app
const post = async (path, body, headers) => (await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) })).json();

function totp(secret) { // RFC 6238: SHA1, 30 s, 6 digits; secret is base32
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = '';
  for (const c of secret.replace(/=+$/, '').toUpperCase()) bits += A.indexOf(c).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const ctr = Buffer.alloc(8); ctr.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = crypto.createHmac('sha1', key).update(ctr).digest(); const o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0');
}

// 1. aal1 session for the owner (no password needed)
const link = await post('/auth/v1/admin/generate_link', { type: 'magiclink', email: 'admin@plusmark.local' }, { apikey: SERVICE, authorization: `Bearer ${SERVICE}` });
const s1 = await post('/auth/v1/verify', { type: 'magiclink', token_hash: link.hashed_token }, { apikey: ANON });
// 2. step up to aal2 with the test TOTP factor
const f = JSON.parse(fs.readFileSync('.work/e2e/owner-totp.json', 'utf8'));
const auth1 = { apikey: ANON, authorization: `Bearer ${s1.access_token}` };
const ch = await post(`/auth/v1/factors/${f.id}/challenge`, {}, auth1);
const s2 = await post(`/auth/v1/factors/${f.id}/verify`, { challenge_id: ch.id, code: totp(f.secret) }, auth1);
// 3. call the Admin_API with the aal2 token
const me = await post('/rest/v1/rpc/admin_me', {}, { apikey: ANON, authorization: `Bearer ${s2.access_token}`, 'content-profile': 'api' });
console.log('aal2 session for', me.email, 'roles:', me.roles.map((r) => r.name).join(', '));
