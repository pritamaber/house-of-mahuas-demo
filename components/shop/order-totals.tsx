import { SHIPPING } from "@/lib/config";
import { cn, formatINR, shippingFor } from "@/lib/format";

export function OrderTotals({ subtotal, className }: { subtotal: number; className?: string }) {
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const remaining = SHIPPING.freeAbove - subtotal;

  return (
    <div className={className}>
      {subtotal > 0 && remaining > 0 && (
        <div className="mb-5">
          <p className="text-[13px] text-ink/80">
            Add <strong className="font-medium text-maroon">{formatINR(remaining)}</strong> more for free shipping
          </p>
          <div className="mt-2 h-1 overflow-hidden bg-sand" role="progressbar" aria-valuemin={0} aria-valuemax={SHIPPING.freeAbove} aria-valuenow={subtotal}>
            <div className="h-full bg-gold transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / SHIPPING.freeAbove) * 100)}%` }} />
          </div>
        </div>
      )}
      {subtotal >= SHIPPING.freeAbove && (
        <p className="mb-5 text-[13px] text-success">You&apos;ve unlocked free shipping.</p>
      )}
      <dl className="space-y-3 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatINR(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className={cn(shipping === 0 && subtotal > 0 && "text-success")}>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <dt className="text-[12px] tracking-[0.2em] uppercase">Total</dt>
          <dd className="font-display text-[30px] leading-none">{formatINR(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
