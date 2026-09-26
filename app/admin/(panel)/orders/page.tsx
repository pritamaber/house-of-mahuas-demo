import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClickableRow } from "@/components/admin/clickable-row";
import { AdminPage, PageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/config";
import { getAllOrders } from "@/lib/data";
import { cn, formatDateRelative, formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

function itemsSummary(o: Order) {
  const count = o.items.reduce((n, i) => n + i.quantity, 0);
  return { count, first: o.items[0]?.productName ?? "—", more: o.items.length - 1 };
}

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const rawStatus = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = (ORDER_STATUSES as readonly string[]).includes(rawStatus ?? "") ? rawStatus : "all";
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim().toLowerCase();

  const all = await getAllOrders();
  const orders = all
    .filter((o) => status === "all" || o.orderStatus === status)
    .filter((o) => !q || `${o.orderNumber} ${o.customerName} ${o.phone} ${o.email} ${o.city}`.toLowerCase().includes(q));

  const tabs = [{ key: "all", label: "All" }, ...ORDER_STATUSES.map((s) => ({ key: s, label: s }))];
  const countFor = (key: string) => (key === "all" ? all.length : all.filter((o) => o.orderStatus === key).length);
  const href = (key: string) => {
    const p = new URLSearchParams();
    if (key !== "all") p.set("status", key);
    if (q) p.set("q", q);
    const qs = p.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <AdminPage>
      <PageHeader title="Orders" description={`${all.length} orders received.`} />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter orders by status">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={href(t.key)}
              role="tab"
              aria-selected={status === t.key}
              className={cn(
                "shrink-0 border px-4 py-2 text-[13px] transition-colors",
                status === t.key ? "border-maroon bg-maroon text-ivory" : "border-line bg-white hover:border-maroon",
              )}
            >
              {t.label} <span className={status === t.key ? "text-ivory/70" : "text-muted"}>{countFor(t.key)}</span>
            </Link>
          ))}
        </div>
        <form className="relative w-full xl:w-72" role="search">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Order, name, phone…" aria-label="Search orders" className="field h-10 pl-10 text-[14px]" />
        </form>
      </div>

      <section aria-label="Order list" className="border border-line bg-white">
        {orders.length === 0 ? (
          <p className="px-6 py-16 text-center text-[14.5px] text-muted">No orders match this view.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-[10.5px] tracking-[0.2em] text-muted uppercase">
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Order ID</th>
                    <th className="px-3 py-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">Phone</th>
                    <th className="px-3 py-3 font-medium">Items</th>
                    <th className="px-3 py-3 text-right font-medium">Amount</th>
                    <th className="px-3 py-3 font-medium">Payment</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((o) => {
                    const s = itemsSummary(o);
                    return (
                      <ClickableRow key={o.id} href={`/admin/orders/${o.id}`} className="transition-colors hover:bg-cream/70">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Link href={`/admin/orders/${o.id}`} className="font-medium text-maroon hover:underline">
                            #{o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <p>{o.customerName}</p>
                          <p className="text-[12.5px] text-muted">{o.city}</p>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap tabular-nums text-muted">{o.phone}</td>
                        <td className="max-w-[12rem] px-3 py-4">
                          <p className="truncate" title={o.items.map((i) => i.productName).join(", ")}>
                            {s.first}
                          </p>
                          <p className="text-[12.5px] text-muted">
                            {s.count} {s.count === 1 ? "item" : "items"}
                            {s.more > 0 && ` · +${s.more} more`}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-right font-medium tabular-nums">{formatINR(o.total)}</td>
                        <td className="px-3 py-4">
                          <p className="mb-1 text-[12.5px] whitespace-nowrap text-muted">{o.paymentMethod === "COD" ? "COD" : "Online"}</p>
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-muted">{formatDateRelative(o.createdAt)}</td>
                        <td className="px-5 py-4">
                          <OrderStatusBadge status={o.orderStatus} />
                        </td>
                      </ClickableRow>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line xl:hidden">
              {orders.map((o) => {
                const s = itemsSummary(o);
                return (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="block px-5 py-4 transition-colors hover:bg-cream/70">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-maroon">#{o.orderNumber}</p>
                          <p className="mt-0.5 text-[15px]">{o.customerName}</p>
                          <p className="text-[12.5px] text-muted">
                            {o.phone} · {o.city}
                          </p>
                        </div>
                        <OrderStatusBadge status={o.orderStatus} />
                      </div>
                      <p className="mt-3 truncate text-[13.5px] text-muted">
                        {s.first}
                        {s.more > 0 && ` +${s.more} more`}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-medium tabular-nums">{formatINR(o.total)}</p>
                        <div className="flex items-center gap-2 text-[12.5px] text-muted">
                          {o.paymentMethod === "COD" ? "COD" : "Online"}
                          <PaymentStatusBadge status={o.paymentStatus} />
                          <span>· {formatDateRelative(o.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </AdminPage>
  );
}
