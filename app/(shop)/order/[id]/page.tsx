import { Check, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ornament } from "@/components/shop/icons";
import { ProductImage } from "@/components/shop/product-image";
import { SITE, whatsappLink } from "@/lib/config";
import { getAllProducts } from "@/lib/data";
import { formatDateTime, formatINR } from "@/lib/format";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderConfirmationPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const order = await getStore().getOrder(id);
  if (!order) notFound();

  const products = new Map((await getAllProducts()).map((p) => [p.id, p]));
  const firstName = order.customerName.trim().split(/\s+/)[0];
  const waMessage = `Hi! I just placed order ${order.orderNumber} on ${SITE.name}. Could you please confirm it?`;

  return (
    <div className="container-page pt-10 pb-8 lg:pt-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="animate-fade-up mx-auto grid h-16 w-16 place-items-center rounded-full bg-maroon text-ivory">
            <Check size={30} strokeWidth={2} />
          </span>
          <h1 className="animate-fade-up mt-7 text-[40px] leading-[1.05] [animation-delay:100ms] sm:text-[56px]">
            Order Placed Successfully!
          </h1>
          <p className="animate-fade-up mt-4 text-[17px] text-muted [animation-delay:200ms]">
            Thank you for your order, {firstName}.
          </p>
          <Ornament className="mx-auto mt-6 h-3 w-28 text-gold" />
        </div>

        <div className="mt-12 border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-cream px-6 py-5 sm:px-8">
            <div>
              <p className="text-[10.5px] tracking-[0.24em] text-muted uppercase">Order ID</p>
              <p className="mt-1 font-display text-[28px] leading-none text-maroon">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10.5px] tracking-[0.24em] text-muted uppercase">Placed on</p>
              <p className="mt-1 text-[14.5px]">{formatDateTime(order.createdAt)}</p>
            </div>
          </div>

          <ul className="divide-y divide-line px-6 sm:px-8">
            {order.items.map((item) => {
              const product = item.productId ? products.get(item.productId) : undefined;
              return (
                <li key={item.id} className="flex gap-4 py-5">
                  <div className="w-16 shrink-0 sm:w-20">
                    {product ? (
                      <ProductImage
                        src={product.images[0]?.url}
                        alt=""
                        slug={product.slug}
                        color={product.color}
                        fabric={product.fabric}
                        name={product.name}
                        sizes="80px"
                        className="aspect-[4/5]"
                      />
                    ) : (
                      <div className="aspect-[4/5] bg-cream" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[20px] leading-snug">{item.productName}</p>
                    <p className="mt-1 text-[13.5px] text-muted">
                      Qty {item.quantity} × {formatINR(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[15.5px] font-medium">{formatINR(item.subtotal)}</p>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-2.5 border-t border-line px-6 py-6 text-[15px] sm:px-8">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="text-[12px] tracking-[0.2em] uppercase">Total amount</dt>
              <dd className="font-display text-[32px] leading-none">{formatINR(order.total)}</dd>
            </div>
          </dl>

          <div className="grid gap-8 border-t border-line px-6 py-7 sm:grid-cols-2 sm:px-8">
            <div>
              <h2 className="font-sans text-[10.5px] font-medium tracking-[0.24em] text-muted uppercase">Delivery address</h2>
              <address className="mt-3 text-[15px] leading-relaxed not-italic">
                <span className="font-medium">{order.customerName}</span>
                <br />
                {order.address}
                <br />
                {order.city}, {order.state} – {order.pincode}
                <br />
                <span className="text-muted">+91 {order.phone}</span>
              </address>
            </div>
            <div>
              <h2 className="font-sans text-[10.5px] font-medium tracking-[0.24em] text-muted uppercase">Payment method</h2>
              <p className="mt-3 text-[15px]">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
              <p className="mt-1 text-[13.5px] text-muted">
                {order.paymentMethod === "COD"
                  ? "Please keep the amount ready when your saree arrives."
                  : "Payment pending — Razorpay integration will be connected here."}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[14.5px] text-muted">
          We&apos;ve received your order and will confirm it shortly. Save your order ID — you can quote it on WhatsApp for any help.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/sarees" className="btn btn-primary">
            Continue Shopping
          </Link>
          <a href={whatsappLink(waMessage)} target="_blank" rel="noreferrer" className="btn btn-outline">
            <MessageCircle size={17} /> Contact on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
