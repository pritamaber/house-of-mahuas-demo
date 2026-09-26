import { cn } from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const ORDER_STYLES: Record<OrderStatus, string> = {
  New: "bg-maroon-soft text-maroon ring-maroon/25",
  Confirmed: "bg-[#e6eefb] text-[#1f4d9a] ring-[#1f4d9a]/25",
  Processing: "bg-[#fdf1d6] text-[#8a5a00] ring-[#8a5a00]/25",
  Shipped: "bg-[#efe6fa] text-[#5b2a86] ring-[#5b2a86]/25",
  Delivered: "bg-[#e3f2e8] text-success ring-success/25",
  Cancelled: "bg-[#efe9e6] text-[#7a6a62] ring-[#7a6a62]/25",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  Paid: "bg-[#e3f2e8] text-success ring-success/25",
  Pending: "bg-[#fdf1d6] text-[#8a5a00] ring-[#8a5a00]/25",
  Failed: "bg-danger/10 text-danger ring-danger/25",
  Refunded: "bg-[#efe9e6] text-[#7a6a62] ring-[#7a6a62]/25",
};

const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-inset whitespace-nowrap";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn(base, ORDER_STYLES[status] ?? ORDER_STYLES.New)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={cn(base, PAYMENT_STYLES[status] ?? PAYMENT_STYLES.Pending)}>{status}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        base,
        active ? "bg-[#e3f2e8] text-success ring-success/25" : "bg-[#efe9e6] text-[#7a6a62] ring-[#7a6a62]/25",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
