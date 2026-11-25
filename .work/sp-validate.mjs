import { readFileSync } from "node:fs";
import Ajv from "../tools/contracts/node_modules/ajv/dist/ajv.js";
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const sv = ajv.compile(JSON.parse(readFileSync("supabase/contracts/admin/admin_report_sales.schema.json", "utf8")));
const pv = ajv.compile(JSON.parse(readFileSync("supabase/contracts/admin/admin_report_products.schema.json", "utf8")));
for (const l of readFileSync(".work/sp-out.txt", "utf8").split("\n").filter(Boolean)) {
  const [k, j] = [l[0], l.slice(2)];
  const v = k === "S" ? sv : pv;
  console.log(k, v(JSON.parse(j)), JSON.stringify(v.errors));
}
