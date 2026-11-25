import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs, redact, runChecksum } from "./cli.mjs";
import { STEPS, selectSteps } from "./steps.mjs";

test("defaults to dry_run with the standard env var names", () => {
  assert.deepEqual(parseArgs([]), { mode: "dry_run", source: "LEGACY_DATABASE_URL", target: "DATABASE_URL", steps: null, reportDir: null, help: false });
});

test("parses space and = forms", () => {
  const a = parseArgs(["--mode", "apply", "--source=SRC_URL", "--target", "TGT_URL", "--steps", "catalog,orders"]);
  assert.equal(a.mode, "apply");
  assert.equal(a.source, "SRC_URL");
  assert.equal(a.target, "TGT_URL");
  assert.deepEqual(a.steps, ["catalog", "orders"]);
});

test("rejects bad input", () => {
  assert.match(parseArgs(["--mode", "wet"]).error, /--mode/);
  assert.match(parseArgs(["--bogus"]).error, /unknown/);
  assert.match(parseArgs(["--mode"]).error, /needs a value/);
  assert.match(parseArgs(["--source", "postgres://u:p@h/db"]).error, /environment variable name/);
});

test("step registry has the five steps in order", () => {
  assert.deepEqual(STEPS.map((s) => s.name), ["catalog", "customers", "admin_users", "orders", "remaining"]);
  for (const s of STEPS) assert.equal(typeof s.run, "function");
});

test("selectSteps filters and rejects unknown names", () => {
  assert.deepEqual(selectSteps(["orders", "catalog"]).map((s) => s.name), ["catalog", "orders"]);
  assert.throws(() => selectSteps(["nope"]), /unknown step/);
});

test("redact removes URLs and secret values", () => {
  assert.equal(redact("fail postgres://u:pw@host:5432/db now"), "fail <redacted-url> now");
  assert.equal(redact("password hunter22 bad", ["hunter22"]), "password <redacted> bad");
});

test("checksum is stable regardless of key order", () => {
  const a = runChecksum([{ name: "x", counts: { a: 1, b: 2 } }]);
  const b = runChecksum([{ name: "x", counts: { b: 2, a: 1 } }]);
  assert.equal(a, b);
  assert.notEqual(a, runChecksum([{ name: "x", counts: { a: 2, b: 2 } }]));
});
