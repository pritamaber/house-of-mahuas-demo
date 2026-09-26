"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrderAction } from "@/lib/actions/admin";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/config";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export function OrderStatusForm({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(orderStatus);
  const [payment, setPayment] = useState<PaymentStatus>(paymentStatus);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const dirty = status !== orderStatus || payment !== paymentStatus;

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const res = await updateOrderAction(orderId, { orderStatus: status, paymentStatus: payment });
      if (res.ok) {
        setMessage({ type: "ok", text: "Order updated." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error ?? "Couldn't update the order." });
      }
    });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="order-status" className="label">
          Order status
        </label>
        <select id="order-status" className="field" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {status === "Cancelled" && orderStatus !== "Cancelled" && (
          <p className="mt-2 text-[12.5px] text-muted">Cancelling returns the items to stock.</p>
        )}
      </div>
      <div>
        <label htmlFor="payment-status" className="label">
          Payment status
        </label>
        <select id="payment-status" className="field" value={payment} onChange={(e) => setPayment(e.target.value as PaymentStatus)}>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button type="button" onClick={save} disabled={!dirty || pending} className="btn btn-primary btn-block">
        {pending ? (
          <>
            <LoaderCircle size={16} className="animate-spin" /> Saving…
          </>
        ) : (
          "Update order"
        )}
      </button>

      {message && (
        <p className={`flex items-center gap-2 text-[13.5px] ${message.type === "ok" ? "text-success" : "text-danger"}`} role="status">
          {message.type === "ok" && <Check size={15} />} {message.text}
        </p>
      )}
    </div>
  );
}
