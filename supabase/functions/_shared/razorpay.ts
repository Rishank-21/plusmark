import { requireEnv } from "./common.ts";

const BASE = "https://api.razorpay.com/v1";

function authHeader(): string {
  return "Basic " + btoa(`${requireEnv("RAZORPAY_KEY_ID")}:${requireEnv("RAZORPAY_KEY_SECRET")}`);
}

// deno-lint-ignore no-explicit-any
async function call(path: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  // deno-lint-ignore no-explicit-any
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error?.description ?? `Razorpay ${method} ${path} failed (${res.status})`;
    const err = new Error(msg) as Error & { status?: number; code?: string };
    err.status = res.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

export const razorpay = {
  keyId: () => requireEnv("RAZORPAY_KEY_ID"),
  createOrder: (amountPaise: number, receipt: string, notes: Record<string, string>) =>
    call("/orders", "POST", { amount: amountPaise, currency: "INR", receipt: receipt.slice(0, 40), notes }),
  fetchPayment: (id: string) => call(`/payments/${encodeURIComponent(id)}`, "GET"),
  capture: (id: string, amountPaise: number) =>
    call(`/payments/${encodeURIComponent(id)}/capture`, "POST", { amount: amountPaise, currency: "INR" }),
  refund: (paymentId: string, amountPaise: number, notes: Record<string, string>) =>
    call(`/payments/${encodeURIComponent(paymentId)}/refund`, "POST", {
      amount: amountPaise,
      speed: "normal",
      notes,
    }),
};
