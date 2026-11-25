// Creates (or reuses) an admin account on the LOCAL stack and enrolls TOTP (authenticator app).
//   node scripts/backend/admin-bootstrap.mjs --email you@example.com --password "StrongPass#123"
// Prints the TOTP secret and writes a QR image to .work/admin-totp-qr.svg, then asks for the
// first 6 digit code to finish enrollment. Re-running with a verified factor just tells you so.
import { mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { anonClient, refuseRemote, serviceClient } from "./_lib.mjs";

refuseRemote();
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const email = args.email;
const password = args.password;
if (!email || !password || password.length < 10) {
  console.error('Usage: node scripts/backend/admin-bootstrap.mjs --email you@example.com --password "at-least-10-chars"');
  process.exit(1);
}

const svc = serviceClient();
const { data: list } = await svc.auth.admin.listUsers({ page: 1, perPage: 1000 });
let user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  const { data, error } = await svc.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: "Store Admin" },
  });
  if (error) throw error;
  user = data.user;
  console.log("Created user", email);
} else {
  await svc.auth.admin.updateUserById(user.id, { password });
  console.log("User exists, password reset to the one you gave");
}
const { error: roleErr } = await svc.from("profiles").update({ role: "admin" }).eq("id", user.id);
if (roleErr) throw roleErr;
console.log("Profile role set to admin");

const client = anonClient();
const { error: signErr } = await client.auth.signInWithPassword({ email, password });
if (signErr) throw signErr;

const { data: factors } = await client.auth.mfa.listFactors();
if (factors?.totp?.some((f) => f.status === "verified")) {
  console.log("TOTP is already enrolled for this admin. Use your authenticator app to sign in.");
  process.exit(0);
}
// remove half-finished enrollments
for (const f of factors?.all ?? []) if (f.status === "unverified") await client.auth.mfa.unenroll({ factorId: f.id });

const { data: enr, error: enrErr } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Plusmark admin" });
if (enrErr) throw enrErr;
mkdirSync(".work", { recursive: true });
writeFileSync(".work/admin-totp-qr.svg", enr.totp.qr_code);
console.log("\nAdd this account in Google Authenticator / Authy / 1Password:");
console.log("  Secret key :", enr.totp.secret);
console.log("  Or open the QR image: .work/admin-totp-qr.svg\n");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const code = (await rl.question("Enter the 6 digit code from the app: ")).trim();
rl.close();
const { data: ch, error: chErr } = await client.auth.mfa.challenge({ factorId: enr.id });
if (chErr) throw chErr;
const { error: vErr } = await client.auth.mfa.verify({ factorId: enr.id, challengeId: ch.id, code });
if (vErr) {
  console.error("Code rejected:", vErr.message, "\nRun the script again to get a fresh secret.");
  process.exit(1);
}
console.log("TOTP enrolled. This admin now needs email + password + 6 digit code.");
