import { NextResponse } from "next/server";
import { requestUser } from "@/lib/server/request-auth";
import {
  captureRazorpayPayment,
  fetchRazorpayPayment,
  razorpayConfig,
  RazorpayError,
  verifyPaymentSignature
} from "@/lib/server/razorpay";
import { serverSupabase } from "@/lib/server/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  orderId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export async function POST(request: Request) {
  const config = razorpayConfig();
  if (!config.enabled) {
    return NextResponse.json({ error: "Online payment is not configured on this deployment." }, { status: 503 });
  }

  const user = await requestUser(request);
  if (!user) return NextResponse.json({ error: "Sign in to confirm this payment." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Body | null;
  const orderId = body?.orderId?.trim();
  const razorpayOrderId = body?.razorpay_order_id?.trim() ?? "";
  const paymentId = body?.razorpay_payment_id?.trim() ?? "";
  const signature = body?.razorpay_signature?.trim() ?? "";
  if (!orderId || !razorpayOrderId || !paymentId || !signature) {
    return NextResponse.json({ error: "The payment reference is incomplete." }, { status: 400 });
  }

  const db = serverSupabase();
  const { data: order, error } = await db
    .from("orders")
    .select("id, user_id, reference, total, payment_status, payment_method, razorpay_order_id")
    .eq("id", orderId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "The order could not be read." }, { status: 500 });
  if (!order || order.user_id !== user.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.payment_method !== "razorpay") {
    return NextResponse.json({ error: "This order is not an online payment order." }, { status: 409 });
  }
  if (order.razorpay_order_id !== razorpayOrderId) {
    return NextResponse.json({ error: "The payment does not belong to this order." }, { status: 400 });
  }
  if (!verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId: paymentId, signature }, config)) {
    return NextResponse.json({ error: "The payment signature could not be verified." }, { status: 400 });
  }

  try {
    let payment = await fetchRazorpayPayment(paymentId, config);
    const expectedAmount = Math.round(Number(order.total ?? 0) * 100);
    if (payment.order_id !== razorpayOrderId) {
      return NextResponse.json({ error: "The payment does not belong to this order." }, { status: 400 });
    }
    if (payment.currency !== "INR" || payment.amount !== expectedAmount) {
      return NextResponse.json({ error: "The paid amount does not match the order total." }, { status: 409 });
    }
    if (payment.status === "authorized" && !payment.captured) {
      payment = await captureRazorpayPayment(
        paymentId,
        { amountPaise: expectedAmount, currency: "INR" },
        config
      );
    }
    if (payment.status !== "captured" && !payment.captured) {
      return NextResponse.json(
        { error: "The payment is not captured yet. If money was debited, it will be confirmed by the webhook." },
        { status: 409 }
      );
    }
  } catch (reason) {
    const status = reason instanceof RazorpayError ? reason.status : 502;
    return NextResponse.json(
      { error: reason instanceof Error ? reason.message : "Razorpay could not confirm the payment." },
      { status }
    );
  }

  const { data: confirmed, error: confirmError } = await db.rpc("confirm_razorpay_payment", {
    p_order_id: order.id,
    p_razorpay_order_id: razorpayOrderId,
    p_payment_id: paymentId,
    p_signature: signature
  });

  if (confirmError) {
    return NextResponse.json({ error: "The payment was verified but the order could not be updated." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    reference: confirmed?.reference ?? order.reference,
    paymentStatus: confirmed?.payment_status ?? "paid"
  });
}
