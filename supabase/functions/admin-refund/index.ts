// Admin pressed "Process refund" on a pending refund row. Requires an admin session that passed TOTP.
import { adminClient, callerClient, json, preflight } from "../_shared/common.ts";
import { razorpay } from "../_shared/razorpay.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  try {
    const { data: isAdmin } = await callerClient(req).rpc("is_admin");
    if (isAdmin !== true) return json(req, { error: "forbidden" }, 403);

    const { refund_id } = await req.json().catch(() => ({}));
    if (!/^[0-9a-f-]{36}$/i.test(String(refund_id ?? ""))) return json(req, { error: "bad_refund_id" }, 400);

    const db = adminClient();
    const { data: refund } = await db.from("refunds").select("*").eq("id", refund_id).maybeSingle();
    if (!refund) return json(req, { error: "not_found" }, 404);
    if (refund.status === "processed") return json(req, { ok: true, already: true });

    const { data: pay } = await db.from("payments").select("*").eq("id", refund.payment_id).maybeSingle();
    if (!pay || pay.provider !== "razorpay" || !pay.provider_payment_id) {
      return json(req, { error: "not_a_razorpay_payment", message: "Use 'mark refund done' for COD/bank refunds" }, 400);
    }

    try {
      const r = await razorpay.refund(pay.provider_payment_id, Math.round(Number(refund.amount_inr) * 100), {
        refund_id: refund.id,
        order_id: refund.order_id,
      });
      const { error } = await db.rpc("complete_refund", {
        p_refund_id: refund.id, p_provider_refund_id: r.id, p_ok: true, p_error: null,
      });
      if (error) throw error;
      return json(req, { ok: true, razorpay_refund_id: r.id, status: r.status });
    } catch (e) {
      await db.rpc("complete_refund", {
        p_refund_id: refund.id, p_provider_refund_id: null, p_ok: false, p_error: (e as Error).message,
      });
      return json(req, { ok: false, error: "refund_failed", message: (e as Error).message }, 502);
    }
  } catch (e) {
    console.error("admin-refund", e);
    return json(req, { error: "internal", message: (e as Error).message }, 500);
  }
});
