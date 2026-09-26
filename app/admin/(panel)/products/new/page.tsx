import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage, PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <AdminPage>
      <div>
        <Link href="/admin/products" className="text-[12px] tracking-[0.14em] text-muted uppercase hover:text-maroon">
          ← Products
        </Link>
      </div>
      <PageHeader title="Add Product" description="Create a new saree listing." />
      <ProductForm />
    </AdminPage>
  );
}
