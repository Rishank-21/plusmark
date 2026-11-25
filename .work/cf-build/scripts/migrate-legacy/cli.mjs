// Pure helpers for scripts/migrate-legacy.mjs: argument parsing, secret redaction, run checksum.
import { createHash } from "node:crypto";

export const EXIT = { ok: 0, stepFailed: 1, usage: 2, connection: 3, cutoverBlocked: 4 };
export const MODES = ["dry_run", "apply", "cutover-check"];

// --source and --target name the environment variables that hold the connection strings, never the strings themselves.
export function parseArgs(argv) {
  const out = { mode: "dry_run", source: "LEGACY_DATABASE_URL", target: "DATABASE_URL", steps: null, reportDir: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    let [flag, inline] = argv[i].startsWith("--") && argv[i].includes("=") ? [argv[i].slice(0, argv[i].indexOf("=")), argv[i].slice(argv[i].indexOf("=") + 1)] : [argv[i], undefined];
    if (flag === "--help" || flag === "-h") { out.help = true; continue; }
    if (!["--mode", "--source", "--target", "--steps", "--report-dir"].includes(flag)) return { error: `unknown argument: ${flag}` };
    const value = inline ?? argv[++i];
    if (value === undefined || value.startsWith("--")) return { error: `${flag} needs a value` };
    if (flag === "--mode") {
      if (!MODES.includes(value)) return { error: `--mode must be one of ${MODES.join(", ")}` };
      out.mode = value;
    } else if (flag === "--report-dir") {
      out.reportDir = value;
    } else if (flag === "--steps") {
      out.steps = value.split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) return { error: `${flag} must be an environment variable name` };
      out[flag.slice(2)] = value;
    }
  }
  return out;
}

// Removes connection strings and the values of the given secrets from text that may be logged.
export function redact(text, secrets = []) {
  let s = String(text).replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s'"]+/gi, "<redacted-url>");
  for (const secret of secrets) if (secret && secret.length >= 4) s = s.split(secret).join("<redacted>");
  return s;
}

// Deterministic checksum over the step results, so an unchanged input gives an identical value on every run.
export function runChecksum(results) {
  const stable = results.map((r) => ({ name: r.name, counts: sortKeys(r.counts ?? {}) }));
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}

function sortKeys(o) {
  return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
}
