import type { Order, OrderStatus, PaymentStatus } from "@/types";

/**
 * Presentation helpers for order state. Every label here is driven by the real
 * `OrderStatus` union in the domain model — nothing is invented, and no state
 * is ever described as a settled payment or a live consignment.
 */

export type StepState = "complete" | "current" | "upcoming" | "not_recorded" | "halted";

export interface TimelineStep {
  key: string;
  label: string;
  detail: string;
  state: StepState;
  at: string | null;
  location: string | null;
}

/** The forward fulfilment path Plusmark actually publishes. */
const FLOW: { status: OrderStatus; label: string; detail: string }[] = [
  { status: "placed", label: "Order placed", detail: "Received by the Plusmark order desk in Ahmedabad." },
  { status: "confirmed", label: "Confirmed", detail: "Specification and invoice confirmed after payment or advance." },
  { status: "processing", label: "Made and packed", detail: "Framing, surfacing and packing at the Narolgam works." },
  { status: "dispatched", label: "Dispatched", detail: "Handed to the logistics partner for surface transit." },
  { status: "delivered", label: "Delivered", detail: "Signed for at the delivery address." }
];

/** Statuses that stop or reverse the forward flow. */
const BRANCHES: Partial<Record<OrderStatus, { label: string; detail: string }>> = {
  payment_pending: {
    label: "Awaiting payment",
    detail: "The order is held until payment is received."
  },
  payment_failed: {
    label: "Payment failed",
    detail: "The payment attempt did not complete. No money was captured and the order is not confirmed."
  },
  cancelled: {
    label: "Cancelled",
    detail: "The order was cancelled. Nothing further is produced or shipped."
  },
  return_requested: {
    label: "Return requested",
    detail: "A return has been requested and is with the Plusmark team for review."
  },
  refund_processing: {
    label: "Refund processing",
    detail: "A refund has been approved and is being processed by the accounts team."
  },
  refunded: {
    label: "Refunded",
    detail: "The refund is recorded against the order."
  }
};

const FLOW_RANK: Record<OrderStatus, number> = {
  placed: 0,
  payment_pending: 0,
  payment_failed: 0,
  confirmed: 1,
  processing: 2,
  dispatched: 3,
  delivered: 4,
  cancelled: 0,
  return_requested: 4,
  refund_processing: 4,
  refunded: 4
};

export const STATUS_ICON_NAME: Record<OrderStatus, string> = {
  placed: "receipt",
  payment_pending: "clock",
  payment_failed: "alert",
  confirmed: "check",
  processing: "package",
  dispatched: "truck",
  delivered: "home",
  cancelled: "ban",
  return_requested: "return",
  refund_processing: "clock",
  refunded: "receipt"
};

/**
 * Builds the timeline strictly from what the record holds: the shipment events
 * Plusmark has actually logged, plus the order's own status. Stages with no
 * evidence are shown as "not recorded" instead of being guessed.
 */
export function buildTimeline(order: Order): TimelineStep[] {
  const events = [...(order.shipment?.events ?? [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
  const reachedRank = FLOW_RANK[order.status];
  const branch = BRANCHES[order.status];
  const isForwardFlow = FLOW.some((s) => s.status === order.status);

  const steps: TimelineStep[] = FLOW.map((stage, index) => {
    const event = [...events].reverse().find((e) => e.status === stage.status);
    const isCurrent = isForwardFlow && order.status === stage.status;
    const completeByStatus = isForwardFlow && reachedRank > index;
    const state: StepState = event
      ? isCurrent
        ? "current"
        : "complete"
      : isCurrent
        ? "current"
        : completeByStatus
          ? "complete"
          : branch
            ? stage.status === "placed"
              ? "complete"
              : "not_recorded"
            : "upcoming";

    return {
      key: stage.status,
      label: stage.label,
      detail: event?.note ?? stage.detail,
      state,
      at: event?.at ?? (stage.status === "placed" ? order.placedAt : null),
      location: event?.location ?? (stage.status === "placed" ? order.shippingAddress.city : null)
    };
  });

  // The final-mile scan is a carrier feed Plusmark has not integrated, so it is
  // shown as an explicitly unavailable stage rather than a fabricated update.
  const dispatched = steps.find((s) => s.key === "dispatched");
  if (dispatched && (dispatched.state === "complete" || dispatched.state === "current")) {
    steps.splice(4, 0, {
      key: "out_for_delivery",
      label: "Out for delivery",
      detail:
        "Not published. Final-mile scans come from the carrier's feed, which is not connected in this prototype — the last update is the dispatch scan.",
      state: "not_recorded",
      at: null,
      location: null
    });
  }

  if (branch) {
    steps.push({
      key: order.status,
      label: branch.label,
      detail: branch.detail,
      state: order.status === "payment_failed" || order.status === "cancelled" ? "halted" : "current",
      at: order.placedAt,
      location: order.shippingAddress.city
    });
  }

  return steps;
}

export function paymentWording(status: PaymentStatus): string {
  const text: Record<PaymentStatus, string> = {
    unpaid: "No payment has been taken for this order.",
    pending:
      "Awaiting payment confirmation. If money was debited, Razorpay's signed webhook will confirm it; otherwise retry from the order.",
    paid: "Recorded as paid by the store. This is the store's record, not a payment receipt.",
    failed: "The payment attempt failed. No amount was captured.",
    refunded: "A refund is recorded in demonstration data. It is not evidence of a live banking transfer."
  };
  return text[status];
}

export function paymentMethodLabel(method: Order["paymentMethod"]): string {
  const labels: Record<Order["paymentMethod"], string> = {
    razorpay: "Razorpay",
    cod_placeholder: "Cash on delivery",
    quotation_invoice: "Invoice against an agreed quotation"
  };
  return labels[method];
}

export function orderIsLiveTrackable(order: Order): boolean {
  return order.shipment !== null && (order.shipment.awb !== null || order.shipment.carrier !== null);
}

/** Money-first ordering for account history lists. */
export function sortOrdersNewestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

export const FILTERABLE_STATUSES: OrderStatus[] = [
  "placed",
  "payment_pending",
  "payment_failed",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
  "return_requested",
  "refund_processing",
  "refunded"
];

export const STATUS_GROUP: Record<OrderStatus, "open" | "moving" | "closed" | "exception"> = {
  placed: "open",
  payment_pending: "exception",
  payment_failed: "exception",
  confirmed: "open",
  processing: "moving",
  dispatched: "moving",
  delivered: "closed",
  cancelled: "exception",
  return_requested: "exception",
  refund_processing: "exception",
  refunded: "closed"
};
