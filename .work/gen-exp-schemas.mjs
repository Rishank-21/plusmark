import { writeFileSync } from "node:fs";
const d = "supabase/contracts/admin";
const nul = (t) => ({ type: [t, "null"] });
const W = (fn, properties, required) =>
  writeFileSync(`${d}/${fn}.schema.json`, JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#", $id: `admin/${fn}.schema.json`, title: fn,
    description: `Success body of api.${fn}. Errors use error-envelope.schema.json.`, type: "object", properties, required: [...required].sort(),
  }, null, 2) + "\n");
const view = {
  id: { type: "string" }, name: { type: "string" }, component: { type: "string" }, treatment_variant: { type: "string" },
  treatment_share_pct: { type: "number" }, min_change_pct: { type: "number" }, status: { type: "string" }, plan: { type: "object" },
  planned_control_sessions: nul("number"), planned_treatment_sessions: nul("number"), started_at: nul("string"), stopped_at: nul("string"),
  chosen_component_on: nul("boolean"), verdict: nul("string"), created_at: { type: "string" }, updated_at: { type: "string" }, version: { type: "string" },
};
const vreq = ["id", "name", "component", "treatment_variant", "treatment_share_pct", "min_change_pct", "status", "plan", "created_at", "updated_at", "version"];
W("admin_experiments_list", { experiments: { type: "array" }, running_count: { type: "number" }, max_running: { type: "number" }, components: { type: "array" } },
  ["experiments", "running_count", "max_running", "components"]);
for (const fn of ["admin_experiment_get", "admin_experiment_save", "admin_experiment_start"]) W(fn, view, vreq);
W("admin_experiment_stop", { ...view, component_switch: { type: "object" } }, [...vreq, "component_switch"]);
W("admin_experiment_results", { experiment: { type: "object" }, source: { type: "string" }, computed_at: nul("string"), results: { type: "object" } },
  ["experiment", "source", "results"]);
W("admin_experiment_plan", {
  component: { type: "string" }, treatment_share_pct: { type: "number" }, min_change_pct: { type: "number" }, baseline_sessions: { type: "number" },
  baseline_conversions: { type: "number" }, power: { type: "number" }, significance: { type: "number" }, reason: nul("string"), computed_at: { type: "string" },
}, ["component", "treatment_share_pct", "min_change_pct", "baseline_sessions", "baseline_conversions", "power", "significance", "computed_at"]);
