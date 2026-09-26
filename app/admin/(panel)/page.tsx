import { IndianRupee, Package, ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { AdminPage, PageHeader } from "@/components/admin/page-header";
import { getAllOrders, getAllProducts } from "@/lib/data";
import { formatDateRelative, formatINR } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([getAllProducts(), getAllOrders()]);

  const active = products.filter((p) => p.active).length;
  const revenue = orders.filter((o) => o.orderStatus !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const newOrders = orders.filter((o) => o.orderStatus === "New").length;
  const lowStock = products.filter((p) => p.active && p.stock <= 3).length;

  const stats = [
    { label: "Total Products", value: products.length.toLocaleString("en-IN"), note: `${products.length - active} inactive`, icon: Package },
    { label: "Active Products", value: active.toLocaleString("en-IN"), note: lowStock ? `${lowStock} low or out of stock` : "All well stocked", icon: Sparkles },
    { label: "Orders", value: orders.length.toLocaleString("en-IN"), note: newOrders ? `${newOrders} new` : "No new orders", icon: ShoppingCart },
    { label: "Revenue", value: formatINR(revenue), note: "Excludes cancelled orders", icon: IndianRupee },
  ];

  const recent = orders.slice(0, 8);

  return (
    <AdminPage>
      <PageHeader title="Dashboard" description="A quick look at how the shop is doing." />

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <div key={label} className="border border-line bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <p className="text-[10.5px] tracking-[0.22em] text-muted uppercase">{label}</p>
              <Icon size={18} strokeWidth={1.5} className="text-gold" />
            </div>
            <p className="mt-4 font-display text-[34px] leading-none sm:text-[42px]">{value}</p>
            <p className="mt-2 text-[12.5px] text-muted">{note}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="recent-orders" className="border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 id="recent-orders" className="text-[26px] leading-none">
            Recent Orders
          </h2>
          <Link href="/admin/orders" className="text-[12px] tracking-[0.16em] text-maroon uppercase underline underline-offset-4">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-14 text-center text-[14.5px] text-muted">No orders yet. They&apos;ll appear here as customers check out.</p>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-[10.5px] tracking-[0.2em] text-muted uppercase">
                    <th className="px-6 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recent.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-cream/70">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${o.id}`} className="font-medium text-maroon hover:underline">
                          #{o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-4">{o.customerName}</td>
                      <td className="px-4 py-4 text-right tabular-nums">{formatINR(o.total)}</td>
                      <td className="px-4 py-4 text-muted">{formatDateRelative(o.createdAt)}</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={o.orderStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile list */}
            <ul className="divide-y divide-line md:hidden">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-maroon">#{o.orderNumber}</p>
                      <p className="truncate text-[14px]">{o.customerName}</p>
                      <p className="text-[12.5px] text-muted">{formatDateRelative(o.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-[15px] tabular-nums">{formatINR(o.total)}</p>
                      <OrderStatusBadge status={o.orderStatus} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AdminPage>
  );
}
