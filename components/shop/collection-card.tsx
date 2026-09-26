import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductImage } from "./product-image";

/** Picks the product that best represents a category: real photo first, then featured, then newest. */
export function representativeFor(products: Product[], categoryKey: string): Product | undefined {
  const inCat = products.filter((p) => p.category === categoryKey && p.active);
  return (
    inCat.find((p) => p.images.length > 0 && p.stock > 0) ??
    inCat.find((p) => p.featured) ??
    inCat[0] ??
    products[0]
  );
}

export function CollectionCard({
  categoryKey,
  label,
  blurb,
  count,
  product,
}: {
  categoryKey: string;
  label: string;
  blurb: string;
  count: number;
  product?: Product;
}) {
  return (
    <Link
      href={`/sarees?category=${categoryKey}`}
      className="group relative block overflow-hidden bg-cream"
      aria-label={`${label} — ${count} sarees`}
    >
      {product ? (
        <ProductImage
          src={product.images[0]?.url}
          alt=""
          slug={`${product.slug}-collection`}
          color={product.color}
          fabric={product.fabric}
          name={product.name}
          view={product.images.length ? "full" : "pallu"}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="aspect-[3/4]"
          imgClassName="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="aspect-[3/4] bg-sand" />
      )}
      {/* legibility scrim for the caption */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-ivory sm:p-6">
        <p className="text-[10px] tracking-[0.26em] text-gold-soft uppercase">{count} designs</p>
        <h3 className="mt-1.5 font-display text-[25px] leading-none sm:text-[32px]">{label}</h3>
        <p className="mt-2 hidden text-[13px] text-ivory/80 sm:block">{blurb}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase">
          Explore
          <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
