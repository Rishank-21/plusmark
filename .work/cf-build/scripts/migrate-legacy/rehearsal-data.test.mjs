// Unit tests for the rehearsal data helpers (no Docker). Run: node --test scripts/migrate-legacy/rehearsal-data.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { TABLES, anonymizeFrom, assertNoLeak, generateDataset, makeAnonymizer } from "./rehearsal-data.mjs";
import { parseRehearsalArgs } from "./rehearsal.mjs";

test("the synthetic dataset is reproducible, sized, and only uses invalid example addresses", () => {
  const a = generateDataset({ seed: 7, scale: 0.1 }), b = generateDataset({ seed: 7, scale: 0.1 });
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.orders.map((o) => o.reference), generateDataset({ seed: 8, scale: 0.1 }).orders.map((o) => o.reference));
  assert.equal(a.orders.length, 600);
  assert.ok(a.orders.some((o) => o.user_id === null) && a.orders.some((o) => o.status === "cancelled") && a.orders.some((o) => o.status === "refunded"));
  const emails = JSON.stringify(a).match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g) ?? [];
  assert.ok(emails.length > 0 && emails.every((e) => e.endsWith("@example.invalid")));
  for (const [k] of TABLES) assert.ok(a[k].length > 0, k);
  const ref = new Set(a.orders.map((o) => o.reference));
  assert.equal(ref.size, a.orders.length);
});

test("the anonymizer is deterministic per salt, consistent across tables, and replaces PII", () => {
  const A = makeAnonymizer("salt-one-123"), B = makeAnonymizer("salt-two-456");
  assert.equal(A.fake.email(" Jane@Corp.com "), A.fake.email("jane@corp.com"));
  assert.notEqual(A.fake.email("jane@corp.com"), B.fake.email("jane@corp.com"));
  assert.match(A.fake.email("jane@corp.com"), /^user-[0-9a-f]{12}@example\.invalid$/);
  assert.match(A.fake.phone("9876543210"), /^[6-9][0-9]{9}$/);
  assert.equal(A.fake.phone("9876543210"), A.fake.phone("9876543210"));
  assert.equal(A.fake.phone("+919876543210"), `+91${A.fake.phone("9876543210")}`);
  assert.notEqual(A.fake.phone("9876543211"), A.fake.phone("9876543210"));
  assert.equal(A.fake.id("pay_AbCdEf123456"), A.fake.id("pay_AbCdEf123456"));
  assert.match(A.fake.id("pay_AbCdEf123456"), /^pay_[0-9a-f]{14}$/);
  assert.throws(() => makeAnonymizer("short"));
  const order = A.transform("orders", { contact_email: "jane@corp.com", shipping_address: { recipientName: "Jane Roe", line1: "12 Real St", city: "Pune", pincode: "411001", phone: "9876543210" },
    billing_address: {}, razorpay_order_id: "order_Xy12345678", razorpay_payment_id: null, razorpay_signature: "abc", tracking_number: "T1", tracking_url: null, return_reason: "Call me on 9876543210", total: "10.00" });
  const text = JSON.stringify(order);
  for (const secret of ["jane@corp.com", "Jane Roe", "12 Real St", "9876543210", "order_Xy12345678", "Call me"]) assert.ok(!text.includes(secret), secret);
  assert.equal(order.shipping_address.city, "Pune");
  assert.equal(order.total, "10.00");
});

test("payment payloads are scrubbed by key and by shape, and the leak check catches survivors", () => {
  const A = makeAnonymizer("salt-one-123");
  const p = A.transform("payment_events", { event_id: "evt_Q1w2e3r4t5", payload: { payload: { payment: { entity: { id: "pay_Q1w2e3r4t5", email: "a@b.co", contact: "+919876543210", notes: { who: "me" }, vpa: "me@upi", amount: 100 } } } } });
  const text = JSON.stringify(p);
  assert.ok(!/a@b\.co|9876543210|me@upi|"who"/.test(text));
  assert.equal(p.payload.payload.payment.entity.amount, 100);
  assert.throws(() => assertNoLeak(new Set(["a@b.co"]), new Set(), [{ x: "mail A@B.co now" }]));
  assert.throws(() => assertNoLeak(new Set(), new Set(["9876543210"]), [{ x: "call 9876543210" }]));
  assert.doesNotThrow(() => assertNoLeak(new Set(["a@b.co"]), new Set(["9876543210"]), [{ x: "user-1@example.invalid 19876543210" }]));
});

test("anonymizeFrom reads every table in a read-only transaction and returns scrubbed rows", async () => {
  const D = generateDataset({ seed: 3, scale: 0.02 });
  const byTable = Object.fromEntries(TABLES.map(([k, t]) => [t, k]));
  const log = [];
  const client = { async query(sql) {
    log.push(sql);
    const m = /from (\S+) t$/.exec(sql);
    const key = /auth\.users/.test(sql) ? "auth_users" : m && byTable[m[1]];
    return { rows: key ? D[key].map((r) => ({ r })) : [] };
  } };
  const real = { ...D, profiles: D.profiles.map((r, i) => ({ ...r, email: `real${i}@corp.com`, phone: r.phone })) };
  const client2 = { query: async (sql) => (/^(begin|rollback)/.test(sql) ? { rows: [] } : { rows: (/auth\.users/.test(sql) ? real.auth_users : real[byTable[/from (\S+) t$/.exec(sql)?.[1]]] ?? []).map((r) => ({ r })) }) };
  const out = await anonymizeFrom(client, "salt-one-123");
  assert.match(log[0], /^begin transaction isolation level repeatable read read only/);
  assert.equal(log.at(-1), "rollback");
  assert.equal(out.orders.length, D.orders.length);
  assert.ok(out.profiles.every((r) => r.email.endsWith("@example.invalid")));
  assert.ok((await anonymizeFrom(client2, "salt-one-123")).profiles.every((r) => !r.email.includes("corp.com")));
});

test("argument parsing", () => {
  assert.equal(parseRehearsalArgs(["--scale", "0.5", "--seed", "3"]).scale, 0.5);
  assert.equal(parseRehearsalArgs(["--anonymize-from", "LEGACY_DATABASE_URL"]).anonymizeFrom, "LEGACY_DATABASE_URL");
  assert.ok(parseRehearsalArgs(["--anonymize-from", "postgres://u:p@h/db"]).error);
  assert.ok(parseRehearsalArgs(["--scale", "0"]).error);
  assert.ok(parseRehearsalArgs(["--nope"]).error);
});
