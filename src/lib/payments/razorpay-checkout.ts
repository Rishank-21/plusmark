import { callBackendFunction, guestTokenFor } from "@/lib/supabase/account";

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: { description?: string; reason?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

interface CreatedPayment {
  key_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  order_number: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
}
interface VerifiedPayment {
  ok: boolean;
  order_number: string;
  /** Kept so existing callers can read the order number as `reference`. */
  reference: string;
}
let scriptPromise: Promise<void> | null = null;

function loadCheckout(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Payments open in the browser only."));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("The Razorpay checkout script could not be loaded. Check the connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

async function post<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { status, data } = await callBackendFunction<T & { message?: string; error?: string }>(name, body);
  if (status >= 400) {
    throw new Error(data?.message ?? data?.error ?? "The payment request was rejected.");
  }
  return data as T;
}
export type PaymentResult = "paid" | "dismissed";

/**
 * Opens the gateway's hosted checkout. The browser never sees the key secret and
 * never marks the order paid: the verify endpoint checks the HMAC and the payment
 * amount before the database moves the order out of payment_pending.
 */
export async function startRazorpayCheckout(input: {
  orderId: string;
  onPaid: (result: VerifiedPayment) => void;
}): Promise<PaymentResult> {
  const guestToken = guestTokenFor(input.orderId);
  const created = await post<CreatedPayment>("create-payment", { order_id: input.orderId, guest_token: guestToken });
  await loadCheckout();

  return new Promise<PaymentResult>((resolve, reject) => {
    let settled = false;
    const finish = (outcome: PaymentResult) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      fail(new Error("The Razorpay checkout could not start."));
      return;
    }

    const checkout = new Razorpay({
      key: created.key_id,
      amount: created.amount,
      currency: created.currency,
      name: created.name,
      description: created.description,
      order_id: created.razorpay_order_id,
      prefill: created.prefill,
      theme: { color: "#17324F" },
      modal: {
        ondismiss: () => finish("dismissed")
      },
      handler: (response: RazorpayHandlerResponse) => {
        void (async () => {
          try {
            const verified = await post<VerifiedPayment>("verify-payment", {
              order_id: input.orderId,
              guest_token: guestToken,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            input.onPaid({ ...verified, reference: verified.order_number });
            finish("paid");
          } catch (reason) {
            fail(reason instanceof Error ? reason : new Error("The payment could not be verified."));
          }
        })();
      }
    });

    checkout.on("payment.failed", (response) => {
      fail(
        new Error(
          response?.error?.description ??
            "The payment attempt failed. Nothing was confirmed; you can retry from the order page."
        )
      );
    });

    checkout.open();
  });
}
