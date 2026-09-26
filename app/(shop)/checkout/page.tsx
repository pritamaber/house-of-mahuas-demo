import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="container-page pt-8 pb-8 lg:pt-12">
      <h1 className="mb-8 text-[40px] leading-none sm:text-[54px] lg:mb-12">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
