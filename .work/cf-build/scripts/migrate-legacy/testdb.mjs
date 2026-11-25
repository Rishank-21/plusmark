// Shared helper for the migrate-legacy integration tests: a random-named scratch Supabase Postgres container with every
// migration applied (same image and setup as catalog.test.mjs). Needs Docker. Always remove the container with stop().
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const migDir = join(root, "supabase", "migrations");
const { Client } = createRequire(join(root, "package.json"))("pg");
const IMAGE = "public.ecr.aws/supabase/postgres:15.8.1.069";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function startScratch(prefix) {
  const name = `${prefix}-${randomBytes(4).toString("hex")}`;
  const docker = (argv) => spawnSync("docker", argv, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const psql = (extra) => docker(["exec", "-e", "PGPASSWORD=pw", name, "psql", "-U", "supabase_admin", "-h", "localhost", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q", ...extra]);
  let admin;
  const stop = async () => {
    await admin?.end().catch(() => {});
    spawnSync("docker", ["rm", "-f", "-v", name], { stdio: "ignore" });
  };
  try {
    let r = docker(["run", "-d", "--name", name, "-p", "127.0.0.1::5432", "-e", "POSTGRES_PASSWORD=pw", IMAGE]);
    assert.equal(r.status, 0, r.stderr);
    for (let i = 0; ; i++) {
      const t = psql(["-At", "-c", "select 1"]);
      if (t.status === 0 && t.stdout.trim() === "1") break;
      assert.ok(i < 60, "Postgres not ready");
      await sleep(2000);
    }
    await sleep(3000);
    r = docker(["cp", migDir, `${name}:/tmp/m`]);
    assert.equal(r.status, 0, r.stderr);
    r = psql(["-c", "alter table storage.buckets add column if not exists public boolean default false, add column if not exists file_size_limit bigint, add column if not exists allowed_mime_types text[]; alter table auth.users add column if not exists email_confirmed_at timestamptz, add column if not exists raw_user_meta_data jsonb"]);
    assert.equal(r.status, 0, r.stderr);
    for (const f of readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort()) {
      r = psql(["-f", `/tmp/m/${f}`]);
      assert.equal(r.status, 0, `${f}: ${r.stderr}`);
    }
    const port = docker(["port", name, "5432/tcp"]).stdout.trim().split("\n")[0].split(":").pop();
    admin = new Client({ host: "127.0.0.1", port: Number(port), user: "supabase_admin", password: "pw", database: "postgres" });
    await admin.connect();
  } catch (e) {
    await stop();
    throw e;
  }
  // Runs a step the way scripts/migrate-legacy.mjs does: separate source and target clients in open transactions.
  async function runStep(step, mode) {
    const mk = async () => { const c = new Client(admin.connectionParameters); await c.connect(); return c; };
    const source = await mk(), target = await mk();
    try {
      await target.query("begin");
      await source.query("begin transaction isolation level repeatable read read only");
      const out = await step.run({ mode, source, target, log: () => {} });
      await target.query(mode === "apply" ? "commit" : "rollback");
      await source.query("rollback");
      return out;
    } catch (e) {
      await target.query("rollback").catch(() => {});
      throw e;
    } finally {
      await source.end(); await target.end();
    }
  }
  const one = async (sql, params = []) => (await admin.query(sql, params)).rows[0];
  return { admin, stop, runStep, one };
}
