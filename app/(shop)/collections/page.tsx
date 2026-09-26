import type { Metadata } from "next";
import Link from "next/link";
import { CollectionCard, representativeFor } from "@/components/shop/collection-card";
import { CATEGORIES } from "@/lib/config";
import { getShopProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const products = await getShopProducts();
  const collections = CATEGORIES.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.key).length,
    product: representativeFor(products, c.key),
  })).filter((c) => c.count > 0);

  return (
    <div className="container-page pt-8 pb-8 lg:pt-12">
      <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] text-muted uppercase">
        <Link href="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Collections</span>
      </nav>
      <div className="mt-4 mb-10 lg:mb-14">
        <p className="eyebrow">Shop by occasion</p>
        <h1 className="mt-3 text-[40px] leading-none sm:text-[54px]">Collections</h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Every weave has its moment. Start with the occasion, and let the drape follow.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {collections.map((c) => (
          <CollectionCard
            key={c.key}
            categoryKey={c.key}
            label={c.label}
            blurb={c.blurb}
            count={c.count}
            product={c.product}
          />
        ))}
      </div>
    </div>
  );
}
