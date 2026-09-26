import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/shop/product-card";
import { getShopProducts } from "@/lib/data";

export const metadata: Metadata = { title: "New Arrivals" };

export default async function NewArrivalsPage() {
  const products = await getShopProducts();
  const newest = [...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 12);

  return (
    <div className="container-page pt-8 pb-8 lg:pt-12">
      <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] text-muted uppercase">
        <Link href="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">New Arrivals</span>
      </nav>
      <div className="mt-4 mb-10 lg:mb-14">
        <p className="eyebrow">Just in</p>
        <h1 className="mt-3 text-[40px] leading-none sm:text-[54px]">New Arrivals</h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">The latest weaves to reach our shelves, freshly draped and ready to ship.</p>
      </div>
      <ProductGrid products={newest} preloadFirst={4} />
      <div className="mt-14 text-center">
        <Link href="/sarees?sort=newest" className="btn btn-outline">
          Browse everything
        </Link>
      </div>
    </div>
  );
}
