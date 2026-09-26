"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatINR } from "@/lib/format";
import { MAX_QTY, useCart } from "./cart-provider";
import { OrderTotals } from "./order-totals";
import { ProductImage } from "./product-image";
import { QuantityStepper } from "./quantity-stepper";

export function CartView() {
  const { lines, subtotal, ready, setQuantity, removeItem, sync } = useCart();
  const synced = useRef(false);

  // Refresh prices / stock from the server once per visit.
  useEffect(() => {
    if (ready && !synced.current) {
      synced.current = true;
      void sync();
    }
  }, [ready, sync]);

  if (!ready) {
    return <div className="min-h-[40vh]" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/50 text-maroon">
          <ShoppingBag size={30} strokeWidth={1.3} />
        </span>
        <h2 className="mt-8 text-[36px] leading-none">Your cart is empty</h2>
        <p className="mt-4 text-[15px] text-muted">Looks like you haven&apos;t chosen a saree yet. Let&apos;s find one you&apos;ll love.</p>
        <Link href="/sarees" className="btn btn-primary mt-8">
          Explore sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <ul className="divide-y divide-line border-y border-line lg:col-span-8" aria-label="Items in your cart">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-4 py-6 sm:gap-6">
            <Link href={`/product/${l.slug}`} className="w-24 shrink-0 sm:w-32">
              <ProductImage
                src={l.image}
                alt={l.name}
                slug={l.slug}
                color={l.color}
                fabric={l.fabric}
                name={l.name}
                sizes="128px"
                className="aspect-[4/5]"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] tracking-[0.22em] text-muted uppercase">
                    {l.fabric} · {l.color}
                  </p>
                  <h3 className="mt-1 font-display text-[21px] leading-snug sm:text-[24px]">
                    <Link href={`/product/${l.slug}`} className="hover:text-maroon">
                      {l.name}
                    </Link>
                  </h3>
                </div>
                <p className="shrink-0 text-[16px] font-medium">{formatINR(l.price * l.quantity)}</p>
              </div>
              <p className="mt-1 text-[13.5px] text-muted">
                {formatINR(l.price)} each
                {l.mrp > l.price && <span className="ml-2 line-through">{formatINR(l.mrp)}</span>}
              </p>

              <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <QuantityStepper
                  size="sm"
                  value={l.quantity}
                  max={Math.min(MAX_QTY, l.stock)}
                  onChange={(n) => setQuantity(l.productId, n)}
                  label={`Quantity for ${l.name}`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(l.productId)}
                  className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-danger"
                >
                  <Trash2 size={15} strokeWidth={1.6} /> Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:col-span-4" aria-label="Order summary">
        <div className="border border-line bg-white p-6 lg:sticky lg:top-28 lg:p-8">
          <h2 className="mb-6 text-[28px] leading-none">Order Summary</h2>
          <OrderTotals subtotal={subtotal} />
          <Link href="/checkout" className="btn btn-primary btn-block mt-7 h-[3.25rem]">
            Proceed to Checkout
          </Link>
          <Link href="/sarees" className="mt-4 block text-center text-[12px] tracking-[0.16em] text-muted uppercase underline underline-offset-4 hover:text-maroon">
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
