import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPage, PageHeader } from "@/components/admin/page-header";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { SITE } from "@/lib/config";
import { formatDateTime, formatINR } from "@/lib/format";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const order = await getStore().getOrder(id);
  if (!order) notFound();

  const waText = `Hi ${order.customerName.split(" ")[0]}, this is ${SITE.name} regarding your order ${order.orderNumber}.`;
  const waHref = `https://wa.me/91${order.phone}?text=${encodeURIComponent(waText)}`;

  return (
    <AdminPage>
      <div>
        <Link href="/admin/orders" className="text-[12px] tracking-[0.14em] text-muted uppercase hover:text-maroon">
          ← Orders
        </Link>
      </div>

      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={<OrderStatusBadge status={order.orderStatus} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="border border-line bg-white" aria-labelledby="items-heading">
            <h2 id="items-heading" className="border-b border-line px-5 py-4 text-[26px] leading-none sm:px-6">
              Products ordered
            </h2>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-[10.5px] tracking-[0.2em] text-muted uppercase">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 text-right font-medium">Quantity</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-6 py-3 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {order.items.map((i) => (
                    <tr key={i.id}>
                      <td className="px-6 py-4">
                        {i.productId ? (
                          <Link href={`/admin/products/${i.productId}/edit`} className="font-medium hover:text-maroon hover:underline">
                            {i.productName}
                          </Link>
                        ) : (
                          <span className="font-medium">{i.productName}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">{i.quantity}</td>
                      <td className="px-4 py-4 text-right tabular-nums">{formatINR(i.price)}</td>
                      <td className="px-6 py-4 text-right font-medium tabular-nums">{formatINR(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line sm:hidden">
              {order.items.map((i) => (
                <li key={i.id} className="px-5 py-4">
                  <p className="font-medium">{i.productName}</p>
                  <p className="mt-1 flex justify-between text-[13.5px] text-muted">
                    <span>
                      {i.quantity} × {formatINR(i.price)}
                    </span>
                    <span className="font-medium text-ink">{formatINR(i.subtotal)}</span>
                  </p>
                </li>
              ))}
            </ul>

            <dl className="ml-auto max-w-sm space-y-2.5 border-t border-line px-5 py-5 text-[15px] sm:px-6">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="text-[12px] tracking-[0.2em] uppercase">Total</dt>
                <dd className="font-display text-[30px] leading-none tabular-nums">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="border border-line bg-white p-5 sm:p-6" aria-labelledby="customer-heading">
            <h2 id="customer-heading" className="text-[26px] leading-none">
              Customer
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <dl className="space-y-4 text-[15px]">
                <div>
                  <dt className="text-[10.5px] tracking-[0.22em] text-muted uppercase">Name</dt>
                  <dd className="mt-1">{order.customerName}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] tracking-[0.22em] text-muted uppercase">Phone</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <a href={`tel:+91${order.phone}`} className="inline-flex items-center gap-1.5 hover:text-maroon">
                      <Phone size={14} /> +91 {order.phone}
                    </a>
                    <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] text-maroon underline underline-offset-4">
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10.5px] tracking-[0.22em] text-muted uppercase">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${order.email}`} className="inline-flex items-center gap-1.5 break-all hover:text-maroon">
                      <Mail size={14} className="shrink-0" /> {order.email}
                    </a>
                  </dd>
                </div>
              </dl>
              <div>
                <p className="text-[10.5px] tracking-[0.22em] text-muted uppercase">Delivery address</p>
                <address className="mt-1 text-[15px] leading-relaxed not-italic">
                  {order.address}
                  <br />
                  {order.city}, {order.state}
                  <br />
                  PIN {order.pincode}
                </address>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-line bg-white p-5 sm:p-6" aria-labelledby="status-heading">
            <h2 id="status-heading" className="mb-6 text-[26px] leading-none">
              Update status
            </h2>
            <OrderStatusForm orderId={order.id} orderStatus={order.orderStatus} paymentStatus={order.paymentStatus} />
          </section>

          <section className="border border-line bg-white p-5 sm:p-6" aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="text-[26px] leading-none">
              Payment
            </h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Method</dt>
                <dd>{order.paymentMethod === "COD" ? "Cash on delivery" : "Online payment"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Status</dt>
                <dd>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="text-muted">Amount</dt>
                <dd className="font-medium tabular-nums">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </AdminPage>
  );
}
