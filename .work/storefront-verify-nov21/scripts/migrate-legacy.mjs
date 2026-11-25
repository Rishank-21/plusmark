#!/usr/bin/env node
// Legacy Plusmark -> Medusa/Extension schema migration (Requirements 18.1, 18.2).
//
//   node scripts/migrate-legacy.mjs [--mode dry_run|apply] [--source ENV_VAR] [--target ENV_VAR] [--steps a,b]
//
// --source / --target name the environment variables holding the connection strings
// (defaults LEGACY_DATABASE_URL and DATABASE_URL). Connection strings are never logged.
// dry_run runs every step inside a transaction that is rolled back; apply commits only if every step succeeds.
// The run itself is logged into ext.migration_run through a separate autocommit connection, so a rolled-back
// dry_run still leaves its report.
// A run writes its Migration_Report as report.json and report.md to --report-dir (default ./.work/migration-reports/<run id>/) and into
// ext.migration_run.report. A count or checksum mismatch marks the run failed, and an apply run then rolls back.
// --mode cutover-check reads ext.migration_run only (--source is not needed) and exits 4 when cutover is blocked.
// Exit codes: 0 ok, 1 a step failed, 2 usage or configuration error, 3 connection error, 4 cutover blocked.
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXIT, parseArgs, redact, runChecksum } from "./migrate-legacy/cli.mjs";
import { STEPS, selectSteps } from "./migrate-legacy/steps.mjs";
import { buildReport, collectEntityData, evaluateCutover, renderMarkdown } from "./migrate-legacy/report.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const USAGE = "usage: node scripts/migrate-legacy.mjs [--mode dry_run|apply|cutover-check] [--source ENV_VAR] [--target ENV_VAR] [--steps a,b] [--report-dir DIR]";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.error) return die(EXIT.usage, `${args.error}\n${USAGE}`);
  if (args.help) { console.log(USAGE); return EXIT.ok; }

  const sourceUrl = process.env[args.source];
  const targetUrl = process.env[args.target];
  if (!sourceUrl && args.mode !== "cutover-check") return die(EXIT.usage, `environment variable ${args.source} is not set`);
  if (!targetUrl) return die(EXIT.usage, `environment variable ${args.target} is not set`);
  const secrets = [sourceUrl, targetUrl];
  if (args.mode === "cutover-check") return cutoverCheck(targetUrl, secrets);
  let steps;
  try { steps = selectSteps(args.steps, STEPS); } catch (e) { return die(EXIT.usage, e.message); }

  let Client;
  try {
    ({ Client } = createRequire(join(root, "package.json"))("pg"));
  } catch {
    return die(EXIT.usage, "the `pg` package is missing; run `npm install`");
  }

  const logDb = new Client({ connectionString: targetUrl });
  const target = new Client({ connectionString: targetUrl });
  const source = new Client({ connectionString: sourceUrl });
  const opened = [];
  try {
    for (const c of [logDb, target, source]) { await c.connect(); opened.push(c); }
  } catch (e) {
    await Promise.all(opened.map((c) => c.end().catch(() => {})));
    return die(EXIT.connection, `connection failed: ${redact(e.message, secrets)}`);
  }

  const started = Date.now();
  const results = [];
  let runId;
  let failure = null;
  try {
    runId = (await logDb.query("insert into ext.migration_run (mode) values ($1) returning id", [args.mode])).rows[0].id;
    console.log(`run ${runId} mode=${args.mode}`);
    await target.query("begin");
    await source.query("begin transaction isolation level repeatable read read only");
    for (const step of steps) {
      const started = Date.now();
      try {
        const out = await step.run({ mode: args.mode, source, target, log: (m) => console.log(`[${step.name}] ${redact(m, secrets)}`) });
        results.push({ name: step.name, status: "ok", counts: out?.counts ?? {}, reasons: out?.reasons ?? [], ms: Date.now() - started });
      } catch (e) {
        failure = { step: step.name, error: redact(e.message, secrets) };
        results.push({ name: step.name, status: "failed", counts: {}, reasons: [failure.error], ms: Date.now() - started });
      }
      console.log(`step ${step.name}: ${results.at(-1).status} ${JSON.stringify(results.at(-1).counts)}`);
      await logDb.query("update ext.migration_run set report = $2::jsonb where id = $1", [runId, JSON.stringify({ steps: results })]);
      if (failure) break;
    }
    // Migration_Report: compare source and target (through ext.migration_map) before the transaction ends.
    let entities = [], unavailable = [];
    if (!failure) {
      try {
        ({ entities, unavailable } = await collectEntityData({ source, target, reasons: results.flatMap((r) => r.reasons ?? []) }));
      } catch (e) {
        failure = { step: "report", error: redact(e.message, secrets) };
      }
    }
    const startedAt = new Date(started).toISOString();
    let report = buildReport({ runId, mode: args.mode, startedAt, steps: results, entities, unavailable, committed: false, failure });
    if (!failure && !report.reconciled) {
      failure = { step: "report", error: `${report.mismatches.length} count or checksum mismatch(es); see the Migration_Report` };
    }
    const commit = args.mode === "apply" && !failure;
    await target.query(commit ? "commit" : "rollback");
    await source.query("rollback");
    report = buildReport({ runId, mode: args.mode, startedAt, finishedAt: new Date().toISOString(), steps: results, entities, unavailable, committed: commit, failure });
    const checksum = runChecksum(results);
    await logDb.query(
      "update ext.migration_run set status = $2, finished_at = now(), counts = $3::jsonb, checksum = $4, report = $5::jsonb where id = $1",
      [runId, failure ? "failed" : "passed", JSON.stringify(Object.fromEntries(results.map((r) => [r.name, r.counts]))), checksum, JSON.stringify(report)],
    );
    const dir = args.reportDir ? resolve(args.reportDir) : join(process.cwd(), ".work", "migration-reports", runId);
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "report.json"), `${redact(JSON.stringify(report, null, 2), secrets)}\n`);
      writeFileSync(join(dir, "report.md"), redact(renderMarkdown(report), secrets));
      console.log(`report written to ${dir}`);
    } catch (e) {
      console.error(`could not write the report files: ${redact(e.message, secrets)}`);
    }
    console.log(`${failure ? "FAILED" : "passed"} checksum=${checksum} ${commit ? "committed" : "rolled back"}${failure?.step === "report" ? ` (${failure.error})` : ""}`);
    return failure ? EXIT.stepFailed : EXIT.ok;
  } catch (e) {
    await target.query("rollback").catch(() => {});
    if (runId) {
      await logDb.query("update ext.migration_run set status = 'failed', finished_at = now(), report = $2::jsonb where id = $1",
        [runId, JSON.stringify({ steps: results, failure: { error: redact(e.message, secrets) } })]).catch(() => {});
    }
    return die(EXIT.stepFailed, `run failed: ${redact(e.message, secrets)}`);
  } finally {
    await Promise.all([logDb, target, source].map((c) => c.end().catch(() => {})));
  }
}

// Reads the recent runs and prints the gate decision; exit 4 when cutover is blocked.
async function cutoverCheck(targetUrl, secrets) {
  let Client;
  try { ({ Client } = createRequire(join(root, "package.json"))("pg")); } catch { return die(EXIT.usage, "the `pg` package is missing; run `npm install`"); }
  const db = new Client({ connectionString: targetUrl });
  try { await db.connect(); } catch (e) { return die(EXIT.connection, `connection failed: ${redact(e.message, secrets)}`); }
  try {
    const runs = (await db.query("select id, mode, status, started_at, report from ext.migration_run order by started_at desc limit 200")).rows;
    const d = evaluateCutover(runs);
    if (d.allowed) { console.log(`cutover allowed (apply run ${d.run_id})`); return EXIT.ok; }
    console.error(`cutover BLOCKED${d.run_id ? ` (apply run ${d.run_id})` : ""}:`);
    for (const r of d.reasons) console.error(`- ${r}`);
    return EXIT.cutoverBlocked;
  } catch (e) {
    return die(EXIT.stepFailed, `cutover check failed: ${redact(e.message, secrets)}`);
  } finally {
    await db.end().catch(() => {});
  }
}

function die(code, message) {
  console.error(message);
  return code;
}

main().then((code) => { process.exitCode = code; }, (e) => { console.error(`unexpected error: ${redact(e?.message ?? e)}`); process.exitCode = EXIT.stepFailed; });
