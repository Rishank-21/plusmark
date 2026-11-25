// Step registry. Each step module exports `name` and `run(ctx)` returning { counts, reasons }.
// ctx: { mode, source, target, log, mapId }. `source` and `target` are pg clients inside open transactions.
import * as catalog from "./steps/catalog.mjs";
import * as customers from "./steps/customers.mjs";
import * as adminUsers from "./steps/admin-users.mjs";
import * as orders from "./steps/orders.mjs";
import * as remaining from "./steps/remaining.mjs";

// Order matters: orders refer to catalog and customers.
export const STEPS = [catalog, customers, adminUsers, orders, remaining];

export function selectSteps(names, registry = STEPS) {
  if (!names) return registry;
  const known = registry.map((s) => s.name);
  const unknown = names.filter((n) => !known.includes(n));
  if (unknown.length) throw new Error(`unknown step: ${unknown.join(", ")} (known: ${known.join(", ")})`);
  return registry.filter((s) => names.includes(s.name));
}
