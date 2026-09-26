"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { toCartLine } from "./add-to-cart-button";
import { MAX_QTY, useCart } from "./cart-provider";
import { QuantityStepper } from "./quantity-stepper";

export function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const max = Math.min(MAX_QTY, product.stock);
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;

  const buyNow = () => {
    if (addItem(toCartLine(product), qty, { silent: true })) router.push("/checkout");
  };

  if (soldOut) {
    return (
      <div className="border border-line bg-cream p-5 text-[14.5px] text-muted">
        This saree is currently sold out. Browse{" "}
        <Link href="/sarees" className="text-maroon underline underline-offset-4">
          similar sarees
        </Link>{" "}
        or message us on WhatsApp — we may be able to source another piece.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <span className="text-[11px] tracking-[0.22em] text-muted uppercase">Quantity</span>
        <QuantityStepper value={qty} onChange={setQty} max={max} />
        {product.stock <= 5 && <span className="text-[12.5px] text-marigold">Only {product.stock} available</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => addItem(toCartLine(product), qty)} className="btn btn-outline h-[3.25rem]">
          <ShoppingBag size={16} className="-mt-px" /> Add to Cart
        </button>
        <button type="button" onClick={buyNow} className="btn btn-primary h-[3.25rem]">
          Buy Now
        </button>
      </div>
    </div>
  );
}
