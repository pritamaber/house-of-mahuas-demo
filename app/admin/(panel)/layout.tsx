import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAllOrders } from "@/lib/data";
import { persistenceWarning } from "@/lib/store";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const orders = await getAllOrders();
  const newOrders = orders.filter((o) => o.orderStatus === "New").length;
  return (
    <AdminShell newOrders={newOrders} warning={persistenceWarning()}>
      {children}
    </AdminShell>
  );
}
