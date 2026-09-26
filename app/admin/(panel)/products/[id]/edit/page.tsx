import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPage, PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const product = await getStore().getProduct(id);
  if (!product) notFound();

  return (
    <AdminPage>
      <div>
        <Link href="/admin/products" className="text-[12px] tracking-[0.14em] text-muted uppercase hover:text-maroon">
          ← Products
        </Link>
      </div>
      <PageHeader title="Edit Product" description={product.name} />
      {/* key: re-mount with fresh state if the same route is revisited after a save */}
      <ProductForm key={product.id + product.images.map((i) => i.id).join()} product={product} />
    </AdminPage>
  );
}
