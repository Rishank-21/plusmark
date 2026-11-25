// Razorpay -> us. Source of truth for payments if the browser never returns.
// Dashboard: Settings > Webhooks, events: payment.captured, payment.failed, order.paid,
// refund.processed, refund.failed. Secret must equal RAZORPAY_WEBHOOK_SECRET.
import { adminClient, hmacHex, requireEnv, timingSafeEqual } from "../_shared/common.ts";

const ok = (b: unknown = { ok: true }, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return ok({ error: "method_not_allowed" }, 405);
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  const expected = await hmacHex(requireEnv("RAZORPAY_WEBHOOK_SECRET"), raw);
  if (!sig || !timingSafeEqual(expected, sig)) return ok({ error: "bad_signature" }, 400);

  const eventId = req.headers.get("x-razorpay-event-id") ?? `evt_${await hmacHex("id", raw)}`;
  // deno-lint-ignore no-explicit-any
  let evt: any;
  try {
    evt = JSON.parse(raw);
  } catch {
    return ok({ error: "bad_json" }, 400);
  }

  const db = adminClient();
  const { error: dupErr } = await db.from("payment_events").insert({ id: eventId, event: evt.event, payload: evt });
  if (dupErr) {
    if (dupErr.code === "23505") return ok({ ok: true, duplicate: true });
    console.error("webhook insert", dupErr);
    return ok({ error: "store_failed" }, 500);
  }

  try {
    const payment = evt.payload?.payment?.entity;
    const refund = evt.payload?.refund?.entity;

    if ((evt.event === "payment.captured" || evt.event === "order.paid") && (payment || evt.payload?.order?.entity)) {
      const p = payment ?? {};
      const rzpOrderId = p.order_id ?? evt.payload?.order?.entity?.id;
      const { data: att } = await db.from("payments").select("order_id").eq("provider_order_id", rzpOrderId).limit(1);
      const orderId = att?.[0]?.order_id ?? p.notes?.order_id;
      if (orderId && p.id) {
        const { error } = await db.rpc("confirm_payment", {
          p_order_id: orderId,
          p_provider_order_id: rzpOrderId,
          p_provider_payment_id: p.id,
          p_amount_paise: p.amount,
          p_method: p.method ?? null,
          p_signature_verified: true,
          p_raw: p,
        });
        if (error) throw error;
      }
    } else if (evt.event === "payment.failed" && payment) {
      const { data: att } = await db.from("payments").select("order_id").eq("provider_order_id", payment.order_id).limit(1);
      const orderId = att?.[0]?.order_id ?? payment.notes?.order_id;
      if (orderId) {
        const { error } = await db.rpc("record_payment_failure", {
          p_order_id: orderId,
          p_provider_order_id: payment.order_id,
          p_provider_payment_id: payment.id,
          p_error_code: payment.error_code ?? null,
          p_error_description: payment.error_description ?? "Payment failed",
          p_raw: payment,
        });
        if (error) throw error;
      }
    } else if ((evt.event === "refund.processed" || evt.event === "refund.failed") && refund) {
      const failed = evt.event === "refund.failed";
      let { data: row } = await db.from("refunds").select("id").eq("provider_refund_id", refund.id).maybeSingle();
      if (!row && refund.notes?.refund_id) {
        const r = await db.from("refunds").select("id").eq("id", refund.notes.refund_id).maybeSingle();
        row = r.data;
      }
      if (!row && !failed) {
        // refund made from the Razorpay dashboard: record it
        const { data: pay } = await db.from("payments").select("id, order_id").eq("provider_payment_id", refund.payment_id).maybeSingle();
        if (pay) {
          const ins = await db.from("refunds").insert({
            order_id: pay.order_id, payment_id: pay.id, amount_inr: refund.amount / 100,
            reason: "Refunded from Razorpay dashboard",
          }).select("id").single();
          row = ins.data;
        }
      }
      if (row) {
        const { error } = await db.rpc("complete_refund", {
          p_refund_id: row.id, p_provider_refund_id: refund.id, p_ok: !failed,
          p_error: failed ? "Razorpay reported the refund failed" : null,
        });
        if (error) throw error;
      }
    }
    await db.from("payment_events").update({ processed: true }).eq("id", eventId);
    return ok();
  } catch (e) {
    console.error("webhook handler", e);
    await db.from("payment_events").update({ error: String((e as Error).message).slice(0, 500) }).eq("id", eventId);
    await db.from("payment_events").delete().eq("id", eventId); // let Razorpay retry
    return ok({ error: "handler_failed" }, 500);
  }
});
