/**
 * Applies one SQL migration with the server-only database credentials.
 * Usage: node scripts/apply-migration.mjs supabase/migrations/<file>.sql
 * Never run from browser code and never commit credentials.
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const root = new URL("../", import.meta.url);
const env = {};
for (const line of fs.readFileSync(new URL(".env.local", root), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) env[match[1]] = match[2].trim();
}

const file = process.argv[2];
if (!file) throw new Error("Pass the migration path");
const sql = fs.readFileSync(path.resolve(file), "utf8");
const dbUrl = env.SUPABASE_DATABASE_URL;
const password = env.SUPABASE_DATABASE_PASSWORD;
if (!dbUrl || !password) throw new Error("Missing database credentials in .env.local");

const parsed = new URL(dbUrl.replace(password, encodeURIComponent(password)));
const client = new pg.Client({
  host: parsed.hostname,
  port: Number(parsed.port || 5432),
  user: decodeURIComponent(parsed.username || "postgres"),
  password,
  database: parsed.pathname.replace(/^\//, "") || "postgres",
  ssl: { rejectUnauthorized: false }
});

await client.connect();
try {
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`migration applied: ${file}`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
