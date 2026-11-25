// Shared helpers for the local backend scripts. Local stack only.
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

export const LOCAL = {
  url: process.env.SUPABASE_LOCAL_URL ?? "http://127.0.0.1:55321",
  db: process.env.SUPABASE_LOCAL_DB ?? "postgresql://postgres:postgres@127.0.0.1:55322/postgres",
  // These are the public, well known keys of every local `supabase start` stack.
  anon:
    process.env.SUPABASE_LOCAL_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  service:
    process.env.SUPABASE_LOCAL_SERVICE_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};

export function refuseRemote() {
  if (!/127\.0\.0\.1|localhost/.test(LOCAL.url)) {
    throw new Error("These scripts only run against the local stack. Refusing: " + LOCAL.url);
  }
}

export function readEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

export const functionsEnv = () => readEnvFile("supabase/functions/.env.local");

export const serviceClient = () =>
  createClient(LOCAL.url, LOCAL.service, { auth: { persistSession: false, autoRefreshToken: false } });
export const anonClient = () =>
  createClient(LOCAL.url, LOCAL.anon, { auth: { persistSession: false, autoRefreshToken: false } });

// ---- TOTP (RFC 6238) so scripts can answer the MFA challenge for a known secret
import { createHmac } from "node:crypto";
function base32Decode(s) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of s.replace(/=+$/, "").toUpperCase()) {
    const v = alphabet.indexOf(c);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
export function totp(secret, at = Date.now()) {
  const counter = Math.floor(at / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(code % 1_000_000).padStart(6, "0");
}
