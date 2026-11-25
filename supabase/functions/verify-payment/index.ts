// Called by the browser after Razorpay Checkout succeeds. Verifies the signature and
// asks Razorpay for the real payment state before marking the order paid.
import { adminClient, callerUserId, hmacHex, json, preflight, requireEnv, timingSafeEqual } from "../_shared/common.ts";
import { razorpay } from "../_shared/razorpay.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  try {
    const b = await req.json().catch(() => ({}));
    const orderId = String(b.order_id ?? "");
    const rzpOrderId = String(b.razorpay_order_id ?? "");
    const rzpPaymentId = String(b.razorpay_payment_id ?? "");
    const signature = String(b.razorpay_signature ?? "");
    const guestToken = b.guest_token ? String(b.guest_token) : null;
    if (!/^[0-9a-f-]{36}$/i.test(orderId) || !rzpOrderId || !rzpPaymentId || !signature) {
      return json(req, { error: "bad_request" }, 400);
    }

    const db = adminClient();
    const { data: order } = await db.from("orders").select("id, user_id, guest_token, order_number, total_inr")
      .eq("id", orderId).maybeSingle();
    if (!order) return json(req, { error: "not_found" }, 404);
    const uid = await callerUserId(req);
    const owns = (uid && order.user_id === uid) || (guestToken && timingSafeEqual(guestToken, order.guest_token));
    if (!owns) return json(req, { error: "not_found" }, 404);

    // the Razorpay order must be one we created for THIS order
    const { data: attempt } = await db.from("payments").select("id").eq("order_id", order.id)
      .eq("provider_order_id", rzpOrderId).limit(1);
    if (!attempt?.length) return json(req, { error: "order_mismatch" }, 400);

    const expected = await hmacHex(requireEnv("RAZORPAY_KEY_SECRET"), `${rzpOrderId}|${rzpPaymentId}`);
    if (!timingSafeEqual(expected, signature)) return json(req, { error: "bad_signature" }, 400);

    let payment = await razorpay.fetchPayment(rzpPaymentId);
    if (payment.order_id !== rzpOrderId) return json(req, { error: "order_mismatch" }, 400);
    if (payment.status === "authorized") {
      payment = await razorpay.capture(rzpPaymentId, payment.amount);
    }
    if (payment.status !== "captured") {
      return json(req, { ok: false, error: "not_captured", status: payment.status }, 402);
    }

    const { data, error } = await db.rpc("confirm_payment", {
      p_order_id: order.id,
      p_provider_order_id: rzpOrderId,
      p_provider_payment_id: rzpPaymentId,
      p_amount_paise: payment.amount,
      p_method: payment.method ?? null,
      p_signature_verified: true,
      p_raw: payment,
    });
    if (error) throw error;
    return json(req, data, data?.ok === false ? 409 : 200);
  } catch (e) {
    console.error("verify-payment", e);
    return json(req, { error: "verify_failed", message: (e as Error).message }, 502);
  }
});
