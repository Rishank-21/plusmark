// Migration_Report and cutover gate for scripts/migrate-legacy.mjs (Requirements 18.5, 18.6).
// Pure functions (buildEntityReport, buildReport, renderMarkdown, evaluateCutover) plus collectEntityData, which reads the
// legacy source and, through ext.migration_map, the target. Nothing here writes to the legacy tables.
import { createHash } from "node:crypto";

const md5 = (s) => createHash("md5").update(s).digest("hex");
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const toCents = (v) => Math.round(Number(v) * 100);
const fmt = (cents) => (cents / 100).toFixed(2);
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Entities compared between source and target. `map` is the ext.migration_map entity; `kinds` are the prefixes the steps use in
// their reasons ("<kind> <id>: why"). `amount` (optional) names the compared amount: source SQL column and target SQL.
export const ENTITIES = [
  { name: "category", table: "public.categories", map: "category", kinds: ["category"], source: "select id::text id, null::text amount from public.categories" },
  { name: "product", table: "public.products", map: "product", kinds: ["product"], source: "select id::text id, null::text amount from public.products" },
  { name: "variant", table: "public.product_variants", map: "variant", kinds: ["variant"], source: "select id::text id, null::text amount from public.product_variants" },
  {
    name: "stock", table: "public.product_variants", map: "inventory_item", kinds: ["variant", "inventory"], amountLabel: "stock units",
    source: "select id::text id, stock::text amount from public.product_variants where track_inventory is true and stock is not null",
    target: `select m.legacy_id, (select sum(l.stocked_quantity)::text from medusa.inventory_level l
                                  where l.inventory_item_id = m.new_id and l.deleted_at is null) amount
               from ext.migration_map m where m.entity = 'inventory_item'`,
    units: true,
  },
  { name: "customer", table: "public.profiles", map: "customer", kinds: ["customer", "profile"], source: "select id::text id, null::text amount from public.profiles where role is distinct from 'admin'" },
  { name: "customer_address", table: "public.addresses", map: "customer_address", kinds: ["address"], source: "select id::text id, null::text amount from public.addresses" },
  { name: "admin_user", table: "public.profiles", map: "admin_user", kinds: ["admin"], source: "select id::text id, null::text amount from public.profiles where role = 'admin'" },
  {
    name: "order", table: "public.orders", map: "order", kinds: ["order"], amountLabel: "order totals (INR)",
    source: "select id::text id, total::text amount from public.orders",
    target: `select m.legacy_id, (internal.order_totals(m.new_id) ->> 'total') amount from ext.migration_map m where m.entity = 'order'`,
  },
  { name: "review", table: "public.product_reviews", map: "review", kinds: ["review"], source: "select id::text id, null::text amount from public.product_reviews" },
  { name: "saved_board", table: "public.saved_boards", map: "wishlist_item", kinds: ["saved_board"], source: "select (user_id::text || ':' || product_id::text) id, null::text amount from public.saved_boards" },
  { name: "coupon", table: "public.coupons", map: "coupon", kinds: ["coupon"], source: "select id::text id, null::text amount from public.coupons" },
  { name: "shipping_method", table: "public.shipping_methods", map: "shipping_option", kinds: ["shipping_method"], source: "select id::text id, null::text amount from public.shipping_methods" },
];

// ids: array of strings; amounts: Map id -> amount text or null. Count, sum (cents or null) and md5 over the sorted ids.
function summarize(ids, amounts, useAmounts) {
  const sorted = [...ids].sort();
  let sum = null;
  if (useAmounts) sum = sorted.reduce((a, id) => (amounts.get(id) == null ? a : a + toCents(amounts.get(id))), 0);
  return { count: sorted.length, sum: sum == null ? null : fmt(sum), md5: md5(sorted.join("\n")) };
}

// sourceRows: [{id, amount}], targetRows: [{legacy_id, amount}], reasons: all step reasons (strings).
export function buildEntityReport(def, sourceRows, targetRows, reasons = []) {
  const useAmounts = !!def.amountLabel;
  const srcAmt = new Map(sourceRows.map((r) => [String(r.id), r.amount ?? null]));
  const tgtAmt = new Map(targetRows.map((r) => [String(r.legacy_id), r.amount ?? null]));
  const srcIds = [...srcAmt.keys()];
  const tgtIds = [...tgtAmt.keys()];
  const mismatches = [];

  const skippedRecords = [];
  const failedRecords = [];
  for (const id of srcIds) {
    if (tgtAmt.has(id)) continue;
    const re = new RegExp(`(^|\\s)${esc(id)}:`);
    const why = reasons.find((r) => !r.startsWith("note ") && re.test(r) && def.kinds.some((k) => r.startsWith(`${k} `)));
    if (why) skippedRecords.push({ id, reason: why });
    else failedRecords.push({ id, reason: "not migrated and no reason recorded" });
  }
  for (const f of failedRecords) mismatches.push({ entity: def.name, kind: "unexplained_missing", id: f.id, detail: f.reason });
  const extras = tgtIds.filter((id) => !srcAmt.has(id));
  for (const id of extras) mismatches.push({ entity: def.name, kind: "mapped_not_in_source", id, detail: "mapped legacy id is not in the source" });

  const common = srcIds.filter((id) => tgtAmt.has(id));
  if (useAmounts) {
    // compare the amounts of records present on both sides, and only when both sides have one
    const both = common.filter((id) => srcAmt.get(id) != null && tgtAmt.get(id) != null);
    const s = both.reduce((a, id) => a + toCents(srcAmt.get(id)), 0);
    const t = both.reduce((a, id) => a + toCents(tgtAmt.get(id)), 0);
    if (s !== t) mismatches.push({ entity: def.name, kind: "amount_sum", detail: `${def.amountLabel}: source ${fmt(s)} vs target ${fmt(t)} over ${both.length} records` });
    for (const id of both) {
      if (toCents(srcAmt.get(id)) !== toCents(tgtAmt.get(id))) {
        mismatches.push({ entity: def.name, kind: "amount", id, detail: `source ${fmt(toCents(srcAmt.get(id)))} vs target ${fmt(toCents(tgtAmt.get(id)))}` });
      }
    }
  }
  return {
    name: def.name,
    source: summarize(srcIds, srcAmt, useAmounts),
    target: summarize(tgtIds, tgtAmt, useAmounts),
    migrated: common.length,
    skipped: skippedRecords.length,
    failed: failedRecords.length,
    skipped_records: skippedRecords,
    failed_records: failedRecords,
    mismatches,
  };
}

// steps: [{name, status, counts, reasons, ms}]; entities: result of buildEntityReport[]; entitiesNote: why entities are missing.
export function buildReport({ runId, mode, startedAt, finishedAt, steps, entities = [], unavailable = [], committed = false, failure = null }) {
  const mismatches = [];
  for (const e of entities) mismatches.push(...e.mismatches);
  for (const s of steps) {
    const n = s.counts?.totals_mismatches;
    if (n) mismatches.push({ entity: "order", kind: "totals_mismatch", detail: `${n} order(s) whose Backend total differs from the legacy total (step ${s.name})` });
  }
  const stepsFailed = steps.some((s) => s.status !== "ok");
  const reconciled = !failure && !stepsFailed && entities.length > 0 && mismatches.length === 0;
  const sourceChecksum = entities.length
    ? sha256(JSON.stringify([...entities].sort((a, b) => a.name.localeCompare(b.name)).map((e) => ({ name: e.name, ...e.source }))))
    : null;
  return {
    run_id: runId ?? null,
    mode,
    started_at: startedAt ?? null,
    finished_at: finishedAt ?? null,
    committed,
    failure,
    reconciled,
    source_checksum: sourceChecksum,
    steps,
    entities,
    unavailable,
    mismatches,
  };
}

export function renderMarkdown(report) {
  const L = [];
  L.push(`# Migration report ${report.run_id ?? ""}`.trim(), "");
  L.push(`- Mode: ${report.mode}`, `- Committed: ${report.committed ? "yes" : "no"}`, `- Reconciled: ${report.reconciled ? "yes" : "NO"}`);
  L.push(`- Source checksum: ${report.source_checksum ?? "n/a"}`);
  if (report.failure) L.push(`- Failure: ${report.failure.step ? `step ${report.failure.step}: ` : ""}${report.failure.error}`);
  L.push("", "## Steps", "", "| Step | Status | Counts |", "| --- | --- | --- |");
  for (const s of report.steps) L.push(`| ${s.name} | ${s.status} | ${Object.entries(s.counts ?? {}).map(([k, v]) => `${k}=${v}`).join(", ") || "-"} |`);
  L.push("", "## Entities", "", "| Entity | Source | Migrated | Skipped | Failed | Source checksum (count / sum / md5) | Target checksum (count / sum / md5) |", "| --- | ---: | ---: | ---: | ---: | --- | --- |");
  const cs = (c) => `${c.count} / ${c.sum ?? "-"} / ${c.md5.slice(0, 12)}`;
  for (const e of report.entities) L.push(`| ${e.name} | ${e.source.count} | ${e.migrated} | ${e.skipped} | ${e.failed} | ${cs(e.source)} | ${cs(e.target)} |`);
  for (const u of report.unavailable ?? []) L.push(`| ${u.name} | - | - | - | - | ${u.reason} | - |`);
  L.push("", "## Mismatches", "");
  if (!report.mismatches.length) L.push("None.");
  for (const m of report.mismatches) L.push(`- ${m.entity} ${m.kind}${m.id ? ` ${m.id}` : ""}: ${m.detail}`);
  L.push("", "## Skipped and failed records", "");
  let any = false;
  for (const e of report.entities) for (const r of [...e.skipped_records, ...e.failed_records]) { any = true; L.push(`- ${e.name} ${r.id}: ${r.reason}`); }
  if (!any) L.push("None.");
  L.push("", "## Step reasons", "");
  let anyReason = false;
  for (const s of report.steps) for (const r of s.reasons ?? []) { anyReason = true; L.push(`- [${s.name}] ${r}`); }
  if (!anyReason) L.push("None.");
  return `${L.join("\n")}\n`;
}

// Cutover gate decision. runs: rows of ext.migration_run ({id, mode, status, started_at, report}). Returns { allowed, run_id, reasons }.
export function evaluateCutover(runs) {
  const t = (r) => new Date(r.started_at).getTime();
  const sorted = [...runs].sort((a, b) => t(b) - t(a) || String(b.id).localeCompare(String(a.id)));
  const apply = sorted.find((r) => r.mode === "apply");
  const reasons = [];
  if (!apply) return { allowed: false, run_id: null, reasons: ["no apply run exists"] };
  const rep = apply.report ?? {};
  if (apply.status !== "passed") reasons.push(`the latest apply run is ${apply.status}`);
  if (rep.committed !== true) reasons.push("the latest apply run was not committed");
  if (rep.failure) reasons.push("the latest apply run recorded a failure");
  if ((rep.steps ?? []).some((s) => s.status !== "ok")) reasons.push("a step of the latest apply run failed");
  if (rep.reconciled !== true || (rep.mismatches ?? []).length) reasons.push("the report counts or checksums do not reconcile");
  if (!rep.source_checksum) reasons.push("the latest apply run has no source checksum");
  else {
    const dry = runs.find((r) => r.mode === "dry_run" && r.status === "passed" && r.report?.source_checksum === rep.source_checksum
      && r.report?.reconciled === true && t(r) < t(apply));
    if (!dry) reasons.push("no passed dry_run with the same source checksum preceded the apply run");
  }
  return { allowed: reasons.length === 0, run_id: apply.id, reasons };
}

// Reads source and target data for every entity. Both clients are inside open transactions. An entity whose legacy table does not
// exist is listed in `unavailable` and left out of the comparison.
export async function collectEntityData({ source, target, reasons }) {
  const entities = [];
  const unavailable = [];
  for (const def of ENTITIES) {
    const reg = (await source.query("select to_regclass($1) r", [def.table])).rows[0].r;
    if (!reg) { unavailable.push({ name: def.name, reason: `source table ${def.table} not found` }); continue; }
    const sourceRows = (await source.query(def.source)).rows;
    await target.query("savepoint report_target");
    let targetRows;
    try {
      targetRows = (await target.query(def.target ?? "select legacy_id, null::text amount from ext.migration_map where entity = $1", def.target ? [] : [def.map])).rows;
      await target.query("release savepoint report_target");
    } catch (e) {
      await target.query("rollback to savepoint report_target");
      await target.query("release savepoint report_target");
      throw new Error(`report: cannot read target ${def.name}: ${String(e.message).split("\n")[0]}`);
    }
    entities.push(buildEntityReport(def, sourceRows, targetRows, reasons));
  }
  return { entities, unavailable };
}
