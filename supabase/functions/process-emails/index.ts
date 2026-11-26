// Sends queued emails through Resend (free tier: 3,000/month, 100/day).
// Triggered by a database trigger / cron with x-job-secret, or by an admin session.
import { adminClient, callerClient, json, preflight, requireEnv, timingSafeEqual } from "../_shared/common.ts";
import { renderEmail } from "../_shared/emailTemplates.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("NOTIFICATION_JOB_SECRET") ?? "";
  const provided = req.headers.get("x-job-secret") ?? "";
  let authorised = secret.length >= 16 && provided.length > 0 && timingSafeEqual(secret, provided);
  if (!authorised) {
    const { data } = await callerClient(req).rpc("is_admin");
    authorised = data === true;
  }
  if (!authorised) return json(req, { error: "forbidden" }, 403);

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFICATION_FROM_EMAIL") ?? "Plusmark <onboarding@resend.dev>";
  const siteUrl = (Deno.env.get("SITE_URL") ?? "http://localhost:3000").replace(/\/$/, "");
  const db = adminClient();

  const { data: settings } = await db.from("store_settings").select("return_window_days").single();
  let sent = 0, failed = 0, claimed = 0;
  const started = Date.now();

  // Keep draining the queue (up to ~100 seconds) so overlapping wake-ups are not needed.
  while (Date.now() - started < 100_000) {
  const { data: rows, error } = await db.rpc("claim_emails", { p_limit: 20 });
  if (error) return json(req, { error: "claim_failed", message: error.message }, 500);
  if (!rows?.length) break;
  claimed += rows.length;

  for (const row of rows) {
    try {
      if (!apiKey) {
        await db.rpc("finish_email", { p_id: row.id, p_ok: false, p_error: "RESEND_API_KEY is not set" });
        failed++;
        continue;
      }
      const payload = row.payload ?? {};
      payload.extra = { return_window_days: settings?.return_window_days, ...(payload.extra ?? {}) };
      const { html, text } = renderEmail(row.template, payload, siteUrl);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": row.id,
        },
        body: JSON.stringify({ from, to: [row.to_email], subject: row.subject, html, text }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        await db.rpc("finish_email", { p_id: row.id, p_ok: true, p_provider_id: body.id ?? null });
        sent++;
      } else {
        await db.rpc("finish_email", {
          p_id: row.id, p_ok: false, p_error: `Resend ${res.status}: ${body.message ?? JSON.stringify(body)}`,
        });
        failed++;
      }
    } catch (e) {
      await db.rpc("finish_email", { p_id: row.id, p_ok: false, p_error: (e as Error).message });
      failed++;
    }
    await sleep(600); // Resend free tier allows 2 requests per second
  }
  }
  return json(req, { ok: true, claimed, sent, failed });
});
