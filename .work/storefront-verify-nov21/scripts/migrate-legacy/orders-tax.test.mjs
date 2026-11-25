// Unit test for the GST allocation of the orders step. Run: node --test scripts/migrate-legacy/orders-tax.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { allocateTax } from "./steps/orders.mjs";

test("the shares add up to the legacy gst and the rates reproduce each share after rounding", () => {
  const nets = [1234567, 8901, 5000050, 3];
  const gst = Math.round((nets.reduce((a, n) => a + n, 0) * 18) / 100);
  const out = allocateTax(nets, gst);
  assert.equal(out.reduce((a, l) => a + l.tax, 0), gst);
  nets.forEach((n, i) => assert.equal(Math.round((n * out[i].rate) / 100), out[i].tax));
});

test("no gst or no taxable amount gives zero rates", () => {
  assert.deepEqual(allocateTax([1000, 2000], 0), [{ tax: 0, rate: 0 }, { tax: 0, rate: 0 }]);
  assert.deepEqual(allocateTax([0], 100), [{ tax: 0, rate: 0 }]);
});

test("a uniform 18 percent order keeps the exact rate", () => {
  const out = allocateTax([100000, 50000], 27000);
  assert.deepEqual(out.map((l) => l.rate), [18, 18]);
});
