import { cases } from "../tools/contracts/cases.mjs";
import { runCases } from "../tools/contracts/run-cases.mjs";
const i = cases.findIndex((x) => x.fn === "admin_settings_reference");
cases.splice(i + 1, 0, { fn: "dbg", sql: "select (select jsonb_agg(detail) from ext.error_log where source='api.admin_settings_reference')" });
const r = await runCases();
console.log(JSON.stringify((r.results || r).filter((a) => a.fn === "dbg")).slice(0, 2000));
