// Pure tests for the Migration_Report builder and the cutover gate (Requirements 18.5, 18.6). No database needed.
import test from "node:test";
import assert from "node:assert/strict";
import { ENTITIES, buildEntityReport, buildReport, evaluateCutover, renderMarkdown } from "./report.mjs";
import { parseArgs } from "./cli.mjs";

const def = (name) => ENTITIES.find((e) => e.name === name);

test("entity report: counts, skipped with reason, checksums", () => {
  const e = buildEntityReport(def("product"), [{ id: "1" }, { id: "2" }, { id: "3" }], [{ legacy_id: "1" }, { legacy_id: "3" }],
    ["product 2: slug missing"]);
  assert.equal(e.source.count, 3);
  assert.equal(e.target.count, 2);
  assert.equal(e.migrated, 2);
  assert.equal(e.skipped, 1);
  assert.equal(e.failed, 0);
  assert.deepEqual(e.skipped_records, [{ id: "2", reason: "product 2: slug missing" }]);
  assert.equal(e.mismatches.length, 0);
  assert.notEqual(e.source.md5, e.target.md5);
});

test("entity report: a missing record without reason and an unknown mapped id are mismatches", () => {
  const e = buildEntityReport(def("product"), [{ id: "1" }, { id: "2" }], [{ legacy_id: "1" }, { legacy_id: "9" }], ["note product 2: something"]);
  assert.deepEqual(e.mismatches.map((m) => m.kind).sort(), ["mapped_not_in_source", "unexplained_missing"]);
  assert.equal(e.failed, 1);
});

test("entity report: order totals are compared as sums and per order", () => {
  const ok = buildEntityReport(def("order"), [{ id: "a", amount: "10.10" }, { id: "b", amount: "5.00" }, { id: "c", amount: null }],
    [{ legacy_id: "a", amount: "10.1" }, { legacy_id: "b", amount: "5" }, { legacy_id: "c", amount: "7.00" }]);
  assert.equal(ok.mismatches.length, 0);
  assert.equal(ok.source.sum, "15.10");
  const bad = buildEntityReport(def("order"), [{ id: "a", amount: "10.00" }], [{ legacy_id: "a", amount: "10.50" }]);
  assert.deepEqual(bad.mismatches.map((m) => m.kind), ["amount_sum", "amount"]);
});

const okStep = { name: "catalog", status: "ok", counts: { products_created: 2 }, reasons: ["product 2: skipped"] };

test("report: reconciled when nothing mismatches; markdown lists steps and skipped records", () => {
  const e = buildEntityReport(def("product"), [{ id: "1" }, { id: "2" }], [{ legacy_id: "1" }], ["product 2: skipped"]);
  const r = buildReport({ runId: "mrun_1", mode: "dry_run", steps: [okStep], entities: [e] });
  assert.equal(r.reconciled, true);
  assert.match(r.source_checksum, /^[0-9a-f]{64}$/);
  const md = renderMarkdown(r);
  assert.match(md, /# Migration report mrun_1/);
  assert.match(md, /\| catalog \| ok \|/);
  assert.match(md, /product 2: skipped/);
});

test("report: not reconciled on mismatch, failed step, failure or missing entities; same source gives the same checksum", () => {
  const good = buildEntityReport(def("product"), [{ id: "1" }], [{ legacy_id: "1" }]);
  const bad = buildEntityReport(def("product"), [{ id: "1" }], []);
  assert.equal(buildReport({ mode: "apply", steps: [okStep], entities: [bad] }).reconciled, false);
  assert.equal(buildReport({ mode: "apply", steps: [{ ...okStep, status: "failed" }], entities: [good] }).reconciled, false);
  assert.equal(buildReport({ mode: "apply", steps: [okStep], entities: [good], failure: { error: "x" } }).reconciled, false);
  assert.equal(buildReport({ mode: "apply", steps: [okStep], entities: [] }).reconciled, false);
  const withTotals = buildReport({ mode: "apply", steps: [{ ...okStep, counts: { totals_mismatches: 1 } }], entities: [good] });
  assert.equal(withTotals.reconciled, false);
  const a = buildReport({ mode: "dry_run", steps: [okStep], entities: [good] });
  const b = buildReport({ mode: "apply", steps: [okStep], entities: [buildEntityReport(def("product"), [{ id: "1" }], [{ legacy_id: "1" }])] });
  assert.equal(a.source_checksum, b.source_checksum);
});

// ---- cutover gate
const rep = (over = {}) => ({ reconciled: true, committed: true, failure: null, mismatches: [], source_checksum: "abc", steps: [{ name: "catalog", status: "ok" }], ...over });
const dry = (over = {}) => ({ id: "d1", mode: "dry_run", status: "passed", started_at: "2026-01-01T00:00:00Z", report: rep({ committed: false }), ...over });
const apply = (over = {}) => ({ id: "a1", mode: "apply", status: "passed", started_at: "2026-01-02T00:00:00Z", report: rep(), ...over });
const blockedBy = (runs, re) => { const d = evaluateCutover(runs); assert.equal(d.allowed, false); assert.ok(d.reasons.some((r) => re.test(r)), d.reasons.join("; ")); };

test("gate: allows a passed, reconciled apply after a matching dry_run", () => {
  assert.deepEqual(evaluateCutover([dry(), apply()]), { allowed: true, run_id: "a1", reasons: [] });
});

test("gate: blocks with no apply run, a failed latest apply run, or a failed step", () => {
  blockedBy([dry()], /no apply run/);
  blockedBy([dry(), apply({ id: "a0", started_at: "2026-01-01T12:00:00Z" }), apply({ id: "a2", status: "failed", started_at: "2026-01-03T00:00:00Z" })], /apply run is failed/);
  blockedBy([dry(), apply({ report: rep({ steps: [{ name: "orders", status: "failed" }] }) })], /step .* failed/);
  blockedBy([dry(), apply({ status: "running" })], /is running/);
  blockedBy([dry(), apply({ report: rep({ committed: false }) })], /not committed/);
});

test("gate: blocks when the report does not reconcile", () => {
  blockedBy([dry(), apply({ report: rep({ reconciled: false }) })], /reconcile/);
  blockedBy([dry(), apply({ report: rep({ mismatches: [{ entity: "order" }] }) })], /reconcile/);
});

test("gate: needs a passed dry_run with the same source checksum that came first", () => {
  blockedBy([apply()], /no passed dry_run/);
  blockedBy([dry({ report: rep({ source_checksum: "other", committed: false }) }), apply()], /no passed dry_run/);
  blockedBy([dry({ status: "failed" }), apply()], /no passed dry_run/);
  blockedBy([dry({ started_at: "2026-01-05T00:00:00Z" }), apply()], /no passed dry_run/);
  blockedBy([dry(), apply({ report: rep({ source_checksum: null }) })], /no source checksum/);
});

test("cli: --report-dir and cutover-check parse", () => {
  const a = parseArgs(["--mode", "cutover-check", "--report-dir", "out/x"]);
  assert.equal(a.mode, "cutover-check");
  assert.equal(a.reportDir, "out/x");
  assert.ok(parseArgs(["--mode", "nope"]).error);
});
