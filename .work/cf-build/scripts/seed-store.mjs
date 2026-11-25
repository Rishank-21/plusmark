// Runs the Store_Seed: node scripts/seed-store.mjs <deployment-config.json>
//
// Reads the Deployment_Config file, adds the ISO 4217 / ISO 3166 reference data from deploy/reference-data (unless the
// file carries its own `reference_data`), connects with DATABASE_URL and calls `select internal.seed_store($1)` inside one
// transaction. Any error rolls the whole run back. The owner invitation token is printed once, on success only.
//
// Uses `pg` from the tests/ workspace (npm --prefix tests install); the app's own dependencies are untouched.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fail = (msg) => {
  console.error(`seed-store FAILED: ${msg}`);
  process.exit(1);
};

const configPath = process.argv[2];
if (!configPath) fail("usage: node scripts/seed-store.mjs <deployment-config.json>");
if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set (the Postgres connection string of the target project)");

let config;
try {
  config = JSON.parse(readFileSync(resolve(configPath), "utf8"));
} catch (e) {
  fail(`cannot read ${configPath}: ${e.message}`);
}
if (config === null || typeof config !== "object" || Array.isArray(config)) fail("the config must be a JSON object");

if (!config.reference_data) {
  const ref = (f) => JSON.parse(readFileSync(join(root, "deploy", "reference-data", f), "utf8"));
  config.reference_data = { currencies: ref("currencies.json"), countries: ref("countries.json") };
}

let Client;
try {
  ({ Client } = createRequire(join(root, "tests", "package.json"))("pg"));
} catch {
  fail("the `pg` package is missing; run `npm --prefix tests install`");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query("begin");
  const { rows } = await client.query("select internal.seed_store($1::jsonb) as result", [JSON.stringify(config)]);
  await client.query("commit");
  const result = rows[0].result;
  const token = result.owner_invitation?.token;
  console.log(JSON.stringify(result, null, 2));
  if (token) console.error("\nThe owner invitation token above is shown only once; store it now.");
} catch (e) {
  try {
    await client.query("rollback");
  } catch {
    /* the connection may already be gone */
  }
  fail(e.message);
} finally {
  await client.end().catch(() => {});
}
