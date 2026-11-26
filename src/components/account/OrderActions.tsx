"use client";

import { useState } from "react";
import { CreditCard, FileText, RefreshCw, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { startRazorpayCheckout } from "@/lib/payments/razorpay-checkout";
import { cancelOwnOrder, getOrderByReference, openInvoicePdf, requestOrderReturn } from "@/lib/supabase/account";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";
import type { Order, OrderStatus } from "@/types";

const CANCELLABLE: OrderStatus[] = ["placed", "payment_pending", "payment_failed", "confirmed"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function message(reason: unknown, fallback: string) {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}

export function OrderActions({ order, onUpdated }: { order: Order; onUpdated: () => void }) {
  const session = useSession();
  const toast = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"cancel" | "return" | "pay" | "status" | null>(null);

  const storedOnServer = UUID.test(order.id);
  const canCancel = CANCELLABLE.includes(order.status);
  const canReturn = order.status === "delivered";
  const canPay =
    storedOnServer && order.paymentMethod === "razorpay" && (order.paymentStatus === "pending" || order.paymentStatus === "failed") && order.status !== "cancelled";
  const canCheckStatus = storedOnServer && order.paymentMethod === "razorpay" && order.paymentStatus === "pending" && order.status !== "cancelled";

  if (!canCancel && !canReturn && !canPay && !order.invoiceNumber) return null;

  const checkStatus = async () => {
    setBusy("status");
    try {
      const fresh = await getOrderByReference(order.reference, order.email);
      if (fresh) {
        onUpdated();
        if (fresh.paymentStatus === "paid") toast.push(`Payment confirmed for ${fresh.reference}.`, "success");
        else if (fresh.paymentStatus === "failed") toast.push("Payment failed — you can retry payment now.", "error");
        else toast.push("Payment is still pending gateway confirmation.", "info");
      } else {
        toast.push("Order status could not be verified right now.", "error");
      }
    } catch (error) {
      toast.push(message(error, "Could not check payment status."), "error");
    } finally {
      setBusy(null);
    }
  };

  const pay = async () => {
    setBusy("pay");
    try {
      const outcome = await startRazorpayCheckout({
        orderId: order.id,
        onPaid: (result) => {
          toast.push(`Payment confirmed for ${result.reference}.`, "success");
          onUpdated();
        }
      });
      if (outcome === "dismissed") {
        toast.push("Payment was closed before it completed. The order is still payment pending.", "error");
      }
    } catch (error) {
      toast.push(message(error, "The payment could not be completed."), "error");
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    setBusy("cancel");
    try {
      if (storedOnServer) {
        await cancelOwnOrder(order.id);
      } else {
        session.updateOrderStatus(order.id, "cancelled");
      }
      toast.push(storedOnServer ? `${order.reference} is cancelled and any reserved stock is released.` : `${order.reference} is cancelled.`);
      onUpdated();
    } catch (error) {
      toast.push(message(error, "The order could not be cancelled."), "error");
    } finally {
      setBusy(null);
    }
  };

  const submitReturn = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setReasonError("Describe the problem in at least 10 characters.");
      return;
    }
    setBusy("return");
    try {
      await requestOrderReturn(order.id, trimmed);
      toast.push("Return request received. The team will review it and contact you.");
      setReturnOpen(false);
      setReason("");
      onUpdated();
    } catch (error) {
      setReasonError(message(error, "The return request could not be submitted."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {order.invoiceNumber && (
        <Button
          variant="secondary"
          size="sm"
          className="h-10 rounded-lg"
          onClick={() =>
            void openInvoicePdf(order).catch((error) => toast.push(message(error, "The invoice could not be opened."), "error"))
          }
        >
          <FileText className="size-4" aria-hidden />
          GST invoice (PDF)
        </Button>
      )}
      {canPay && (
        <Button size="sm" className="h-10 rounded-md" loading={busy === "pay"} disabled={busy !== null} onClick={() => void pay()}>
          <CreditCard className="size-4" aria-hidden />
          {order.paymentStatus === "failed" ? "Retry payment" : "Pay now"}
        </Button>
      )}
      {canCheckStatus && (
        <Button variant="secondary" size="sm" className="h-10 rounded-md" loading={busy === "status"} disabled={busy !== null} onClick={() => void checkStatus()}>
          <RefreshCw className="size-4" aria-hidden />
          Check payment status
        </Button>
      )}
      {canCancel && (
        <Button variant="secondary" size="sm" className="h-10 rounded-lg" disabled={busy !== null} onClick={() => setConfirmCancel(true)}>
          <XCircle className="size-4" aria-hidden />
          Cancel order
        </Button>
      )}
      {canReturn && (
        <Button
          variant="secondary"
          size="sm"
          className="h-10 rounded-lg"
          disabled={busy !== null}
          onClick={() => {
            setReasonError(null);
            setReturnOpen(true);
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Request a return
        </Button>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => void cancel()}
        title={`Cancel ${order.reference}?`}
        body={
          storedOnServer
            ? "The order will be cancelled and any stock it reserved will be released. This cannot be undone from your account."
            : "This order exists only in this browser. Cancelling marks it cancelled on this device."
        }
        confirmLabel="Cancel order"
        destructive
      />

      <Modal
        open={returnOpen}
        onClose={() => {
          if (busy !== "return") setReturnOpen(false);
        }}
        title="Request a return"
        description={`Tell us what went wrong with ${order.reference}. Photographs can be shared with the team once they respond.`}
        footer={
          <>
            <Button variant="secondary" size="md" disabled={busy === "return"} onClick={() => setReturnOpen(false)}>
              Keep order
            </Button>
            <Button size="md" loading={busy === "return"} onClick={() => void submitReturn()}>
              Submit request
            </Button>
          </>
        }
      >
        <TextArea
          label="What is the problem?"
          required
          rows={5}
          maxLength={500}
          placeholder="For example: the board arrived with a cracked corner; the printed grid does not match the order."
          value={reason}
          error={reasonError}
          hint="10–500 characters. The team will confirm the refund or replacement before anything is shipped back."
          onChange={(event) => {
            setReason(event.target.value);
            setReasonError(null);
          }}
        />
      </Modal>
    </div>
  );
}
