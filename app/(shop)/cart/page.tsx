import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = { title: "Your Cart" };

export default function CartPage() {
  return (
    <div className="container-page pt-8 pb-8 lg:pt-12">
      <h1 className="mb-8 text-[40px] leading-none sm:text-[54px] lg:mb-12">Shopping Cart</h1>
      <CartView />
    </div>
  );
}
