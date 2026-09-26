"use client";

import { ShoppingBag } from "lucide-react";
import { effectivePrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-provider";

export function toCartLine(product: Product) {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: effectivePrice(product),
    mrp: product.price,
    image: product.images[0]?.url ?? null,
    fabric: product.fabric,
    color: product.color,
    stock: product.stock,
  };
}

export function AddToCartButton({ product, className = "" }: { product: Product; className?: string }) {
  const { addItem } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => addItem(toCartLine(product), 1)}
      className={`btn btn-outline btn-sm btn-block ${className}`}
    >
      {soldOut ? (
        "Sold out"
      ) : (
        <>
          <ShoppingBag size={15} className="-mt-px" /> Add to Cart
        </>
      )}
    </button>
  );
}
