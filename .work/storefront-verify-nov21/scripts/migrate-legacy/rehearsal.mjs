#!/usr/bin/env node
// Migration rehearsal (task 23.8, Requirements 18.5 and 18.6). Needs Docker. See docs/migration-rehearsal.md.
//
//   node scripts/migrate-legacy/rehearsal.mjs [--scale 1] [--seed N] [--out DIR]
//   node scripts/migrate-legacy/rehearsal.mjs --anonymize-from LEGACY_DATABASE_URL [--salt-env REHEARSAL_SALT] [--out DIR]
//
// 1. Starts a scratch Supabase Postgres container (scripts/migrate-legacy/testdb.mjs) with every supabase/migrations file applied.
//    The legacy tables (migrations 20261105120000..20261106130000) and the new schemas live in that one database.
// 2. Fills the legacy tables with either
//      - a seeded SYNTHETIC dataset (default; scale 1 = 300 products, ~900 variants, 3000 customers, 6000 orders, e-mails like
//        user12@example.invalid), or
//      - an ANONYMIZED copy of a real legacy database (--anonymize-from names the environment variable holding its connection
//        string, default LEGACY_DATABASE_URL; the source is only read, in a read-only transaction). E-mails, names, phones,
//        street lines, free text, tracking and Razorpay ids are replaced deterministically with the salt in REHEARSAL_SALT
//        (or the variable named by --salt-env; 8+ characters, keep it secret). Business content (catalog, coupons, shipping,
//        site content, media) is copied as is. The run aborts if an original e-mail or phone survives in the output.
// 3. Runs scripts/migrate-legacy.mjs in dry_run mode, then apply mode, then checks:
//      - each run exits 0 and its Migration_Report reconciles with no mismatches and no unexplained (failed) records,
//      - dry_run left no rows (every medusa/ext/auth/internal table has the same row count before and after),
//      - cutover-check is blocked after dry_run alone (exit 4) and passes (exit 0) after dry_run then apply,
//      - a second apply is idempotent (no row count changes) and still reconciles.
// 4. Prints a summary (and writes summary.json plus each run's report.json/report.md to --out, default .work/migration-rehearsal/<time>).
// The container is always removed, also on errors and Ctrl-C. Real data is never written to the repository: --out is under .work/.
// Exit codes: 0 all checks passed, 1 a check failed, 2 usage or setup error.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startScratch } from "./testdb.mjs";
import { anonymizeFrom, generateDataset, loadDataset } from "./rehearsal-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { Client } = createRequire(join(root, "package.json"))("pg");
const USAGE = "usage: node scripts/migrate-legacy/rehearsal.mjs [--scale N] [--seed N] [--out DIR] [--anonymize-from ENV_VAR] [--salt-env ENV_VAR]";

export function parseRehearsalArgs(argv) {
  const o = { scale: 1, seed: 20261114, out: null, anonymizeFrom: null, saltEnv: "REHEARSAL_SALT" };
  const map = { "--scale": "scale", "--seed": "seed", "--out": "out", "--anonymize-from": "anonymizeFrom", "--salt-env": "saltEnv" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--help" || argv[i] === "-h") return { help: true };
    if (!map[argv[i]]) return { error: `unknown argument: ${argv[i]}` };
    const v = argv[++i];
    if (v === undefined || v.startsWith("--")) return { error: `${argv[i - 1]} needs a value` };
    o[map[argv[i - 1]]] = v;
  }
  o.scale = Number(o.scale); o.seed = Number(o.seed);
  if (!(o.scale > 0 && o.scale <= 20)) return { error: "--scale must be a number from 0 to 20" };
  if (!Number.isInteger(o.seed)) return { error: "--seed must be an integer" };
  for (const k of ["anonymizeFrom", "saltEnv"]) if (o[k] && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(o[k])) return { error: `--${k === "saltEnv" ? "salt-env" : "anonymize-from"} must be an environment variable name` };
  return o;
}

const sh = (args, env) => new Promise((res) => {
  const p = spawn(process.execPath, args, { cwd: root, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
  let out = "", err = "";
  p.stdout.on("data", (d) => { out += d; }); p.stderr.on("data", (d) => { err += d; });
  p.on("close", (code) => res({ code, out, err }));
});

// Live row counts of every table in the schemas the migration writes to. Tables with deleted_at count only live rows (a re-run
// replaces some rows by soft-deleting the old ones). Append-only logs are left out: the migration run log, the catalog change
// events (a re-apply re-touches rows) and the job run log (pg_cron in the scratch container runs the scheduled jobs on its own).
const LOGS = new Set(["ext.migration_run", "ext.catalog_change_event", "ext.job_run"]);
async function snapshot(c) {
  const t = (await c.query(`select t.schemaname s, t.tablename t, exists (select 1 from information_schema.columns k where k.table_schema = t.schemaname and k.table_name = t.tablename and k.column_name = 'deleted_at') soft
                              from pg_tables t where t.schemaname in ('medusa', 'ext', 'auth', 'internal') order by 1, 2`)).rows;
  const out = {};
  for (const { s, t: name, soft } of t) {
    if (LOGS.has(`${s}.${name}`)) continue;
    out[`${s}.${name}`] = Number((await c.query(`select count(*) c from "${s}"."${name}"${soft ? " where deleted_at is null" : ""}`)).rows[0].c);
  }
  return out;
}
const diff = (a, b) => Object.keys({ ...a, ...b }).filter((k) => a[k] !== b[k]).map((k) => `${k}: ${a[k]} -> ${b[k]}`);

async function main() {
  const args = parseRehearsalArgs(process.argv.slice(2));
  if (args.error) { console.error(`${args.error}\n${USAGE}`); return 2; }
  if (args.help) { console.log(USAGE); return 0; }
  let salt, sourceUrl;
  if (args.anonymizeFrom) {
    sourceUrl = process.env[args.anonymizeFrom]; salt = process.env[args.saltEnv];
    if (!sourceUrl) { console.error(`environment variable ${args.anonymizeFrom} is not set`); return 2; }
    if (!salt || salt.length < 8) { console.error(`environment variable ${args.saltEnv} must hold a salt of at least 8 characters`); return 2; }
  }
  const out = resolve(args.out ?? join(root, ".work", "migration-rehearsal", new Date().toISOString().replace(/[:.]/g, "-")));
  mkdirSync(out, { recursive: true });
  const timing = {}, checks = [];
  const check = (name, ok, detail = "") => { checks.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`); };
  const lap = async (label, f) => { const t = Date.now(); try { return await f(); } finally { timing[label] = Date.now() - t; } };

  console.log(`mode: ${args.anonymizeFrom ? "anonymized copy of a real legacy database" : `synthetic dataset (seed ${args.seed}, scale ${args.scale})`}; output: ${out}`);
  let dataset;
  if (args.anonymizeFrom) {
    const src = new Client({ connectionString: sourceUrl });
    try { await src.connect(); dataset = await lap("anonymize", () => anonymizeFrom(src, salt)); }
    catch (e) { console.error(`anonymize failed: ${String(e.message).replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s'"]+/gi, "<redacted-url>")}`); return 2; }
    finally { await src.end().catch(() => {}); }
  } else {
    dataset = await lap("generate", async () => generateDataset({ seed: args.seed, scale: args.scale }));
  }

  let db;
  const cleanup = async () => { await db?.stop(); };
  process.once("SIGINT", () => { cleanup().finally(() => process.exit(130)); });
  try {
    db = await lap("scratch_start", () => startScratch("rehearsal"));
    const p = db.admin.connectionParameters;
    const url = `postgres://${p.user}:${p.password}@${p.host}:${p.port}/${p.database}`;
    const env = { LEGACY_DATABASE_URL: url, DATABASE_URL: url };
    await db.admin.query(`insert into medusa.currency (code, symbol, symbol_native, name, decimal_digits, raw_rounding)
                          values ('inr', '₹', '₹', 'Indian Rupee', 2, '{"value":"0","precision":20}') on conflict (code) do nothing`);
    await db.admin.query("insert into medusa.region (id, name, currency_code) values ('reg_in', 'India', 'inr') on conflict (id) do nothing");
    const loaded = await lap("load", () => loadDataset(db.admin, dataset));
    console.log(`legacy dataset loaded: ${Object.entries(loaded).map(([k, v]) => `${k}=${v}`).join(" ")}`);

    const before = await snapshot(db.admin);
    const run = async (label, mode) => {
      const dir = join(out, label);
      const r = await lap(label, () => sh(["scripts/migrate-legacy.mjs", "--mode", mode, "--report-dir", dir], env));
      writeFileSync(join(out, `${label}.log`), r.out + r.err);
      let report = null;
      try { report = JSON.parse(readFileSync(join(dir, "report.json"), "utf8")); } catch { /* reported below */ }
      return { ...r, report };
    };
    const verify = (label, r) => {
      const rep = r.report;
      check(`${label}: exit code 0`, r.code === 0, r.code === 0 ? "" : `exit ${r.code}: ${(r.err || r.out).trim().split("\n").slice(-3).join(" | ")}`);
      if (!rep) return check(`${label}: report written`, false);
      check(`${label}: all steps ok`, rep.steps.every((s) => s.status === "ok"), rep.steps.filter((s) => s.status !== "ok").map((s) => s.name).join(","));
      check(`${label}: report reconciled`, rep.reconciled === true, `${rep.mismatches.length} mismatch(es)`);
      const failed = rep.entities.reduce((s, e) => s + e.failed, 0);
      check(`${label}: no unexplained skips`, failed === 0, `${failed} failed, ${rep.entities.reduce((s, e) => s + e.skipped, 0)} skipped with a reason`);
      for (const m of rep.mismatches.slice(0, 10)) console.log(`  mismatch ${m.entity} ${m.kind} ${m.id ?? ""} ${m.detail}`);
    };

    const dry = await run("dry_run", "dry_run");
    verify("dry_run", dry);
    const afterDry = await snapshot(db.admin);
    check("dry_run left no rows", diff(before, afterDry).length === 0, diff(before, afterDry).slice(0, 5).join("; "));
    const blocked = await lap("cutover_after_dry_run", () => sh(["scripts/migrate-legacy.mjs", "--mode", "cutover-check"], env));
    check("cutover-check is blocked (exit 4) after dry_run only", blocked.code === 4, `exit ${blocked.code}`);

    const apply = await run("apply", "apply");
    verify("apply", apply);
    const afterApply = await snapshot(db.admin);
    const cut = await lap("cutover_after_apply", () => sh(["scripts/migrate-legacy.mjs", "--mode", "cutover-check"], env));
    check("cutover-check passes (exit 0) after dry_run then apply", cut.code === 0, `exit ${cut.code} ${(cut.out + cut.err).trim().split("\n").pop()}`);

    const again = await run("apply_again", "apply");
    verify("second apply", again);
    check("second apply is idempotent (no row changes)", diff(afterApply, await snapshot(db.admin)).length === 0, diff(afterApply, await snapshot(db.admin)).slice(0, 5).join("; "));

    // summary
    const rep = apply.report;
    console.log("\nEntity            source  migrated  skipped  failed");
    for (const e of rep?.entities ?? []) console.log(`${e.name.padEnd(16)} ${String(e.source.count).padStart(7)} ${String(e.migrated).padStart(9)} ${String(e.skipped).padStart(8)} ${String(e.failed).padStart(7)}`);
    console.log("\nStep timings (apply): " + (rep?.steps ?? []).map((s) => `${s.name} ${(s.ms / 1000).toFixed(1)}s`).join(", "));
    console.log("Timings: " + Object.entries(timing).map(([k, v]) => `${k} ${(v / 1000).toFixed(1)}s`).join(", "));
    const ok = checks.every((c) => c.ok);
    writeFileSync(join(out, "summary.json"), JSON.stringify({ ok, source: args.anonymizeFrom ? "anonymized-real" : "synthetic", seed: args.seed, scale: args.scale, loaded, timing, checks, entities: rep?.entities?.map((e) => ({ name: e.name, source: e.source.count, migrated: e.migrated, skipped: e.skipped, failed: e.failed })) }, null, 2));
    console.log(`\n${ok ? "REHEARSAL PASSED" : "REHEARSAL FAILED"} (${checks.filter((c) => c.ok).length}/${checks.length} checks)`);
    return ok ? 0 : 1;
  } catch (e) {
    console.error(`rehearsal error: ${e.stack ?? e}`);
    return 2;
  } finally {
    await cleanup();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().then((c) => { process.exitCode = c; });
