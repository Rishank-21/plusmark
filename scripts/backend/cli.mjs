// Tiny console for the LOCAL backend: call any database function, read tables, call edge functions.
//
//   (pass JSON as the 3rd argument, or pipe it in and use - :  '{...}' | node scripts/backend/cli.mjs rpc quote_cart -)
//   node scripts/backend/cli.mjs rpc quote_cart '{"p_items":[{"variant_id":"<uuid>","quantity":2}],"p_state":"Gujarat"}'
//   node scripts/backend/cli.mjs table products --select "slug,name,published" --limit 5
//   node scripts/backend/cli.mjs patch profiles '{"phone":"9876543210"}' --filter "id=eq.<uuid>" --email ... --password ...`n//   node scripts/backend/cli.mjs fn create-payment '{"order_id":"<uuid>","guest_token":"<token>"}'
//
// Sign in (needed for customer or admin calls):
//   --email a@b.com --password "..."            customer
//   --email a@b.com --password "..." --code 123456   admin (6 digit code from the authenticator app)
// Without --email you act as a guest (anon key).
import { anonClient, LOCAL, refuseRemote, totp } from "./_lib.mjs";

refuseRemote();
const argv = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i];
  else pos.push(argv[i]);
}
const [cmd, name, jsonArg] = pos;
if (!cmd || !name) {
  console.error("Usage: cli.mjs <rpc|table|fn> <name> [json] [--email --password --code --select --limit --order]");
  process.exit(1);
}

const client = anonClient();
let accessToken = LOCAL.anon;
if (flags.email) {
  const { data, error } = await client.auth.signInWithPassword({ email: flags.email, password: flags.password });
  if (error) { console.error("Sign in failed:", error.message); process.exit(1); }
  accessToken = data.session.access_token;
  const code = flags.code ?? (process.env.ADMIN_TOTP_SECRET ? totp(process.env.ADMIN_TOTP_SECRET) : null);
  if (code) {
    const { data: f } = await client.auth.mfa.listFactors();
    const factor = f?.totp?.find((x) => x.status === "verified");
    if (!factor) { console.error("No verified TOTP factor. Run: npm run backend:admin"); process.exit(1); }
    const ch = await client.auth.mfa.challenge({ factorId: factor.id });
    if (ch.error) { console.error(ch.error.message); process.exit(1); }
    const v = await client.auth.mfa.verify({ factorId: factor.id, challengeId: ch.data.id, code });
    if (v.error) { console.error("TOTP rejected:", v.error.message); process.exit(1); }
    accessToken = v.data.access_token;
  }
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '');
}
const params = jsonArg === '-' ? JSON.parse(await readStdin()) : jsonArg ? JSON.parse(jsonArg) : {};
const headers = { apikey: LOCAL.anon, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

async function show(res) {
  const text = await res.text();
  let out = text;
  try { out = JSON.stringify(JSON.parse(text), null, 2); } catch { /* plain text */ }
  console.log(res.ok ? out : `HTTP ${res.status}\n${out}`);
}

if (cmd === "rpc") {
  await show(await fetch(`${LOCAL.url}/rest/v1/rpc/${name}`, { method: "POST", headers, body: JSON.stringify(params) }));
} else if (cmd === "table") {
  const q = new URLSearchParams({ select: flags.select ?? "*", limit: flags.limit ?? "20" });
  if (flags.order) q.set("order", flags.order);
  for (const f of (flags.filter ?? "").split(",").filter(Boolean)) {
    const [k, ...v] = f.split("=");
    q.set(k, v.join("="));
  }
  await show(await fetch(`${LOCAL.url}/rest/v1/${name}?${q}`, { headers }));
} else if (cmd === "patch") {
  const q = new URLSearchParams();
  for (const f of (flags.filter ?? "").split(",").filter(Boolean)) {
    const [k, ...v] = f.split("=");
    q.set(k, v.join("="));
  }
  if (![...q.keys()].length) { console.error("patch needs --filter col=eq.value"); process.exit(1); }
  await show(await fetch(`${LOCAL.url}/rest/v1/${name}?${q}`, {
    method: "PATCH", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(params) }));
} else if (cmd === "fn") {
  await show(await fetch(`${LOCAL.url}/functions/v1/${name}`, { method: "POST", headers, body: JSON.stringify(params) }));
} else {
  console.error("Unknown command", cmd);
  process.exit(1);
}
