import Link from "next/link";
import { discountPercent, hasDiscount } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { Price } from "./price";
import { ProductImage } from "./product-image";

export function ProductCard({ product, preload = false }: { product: Product; preload?: boolean }) {
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 3;
  const href = `/product/${product.slug}`;

  return (
    <article className="group flex flex-col">
      <Link href={href} className="relative block" aria-label={product.name}>
        <ProductImage
          src={product.images[0]?.url}
          alt={product.name}
          slug={product.slug}
          color={product.color}
          fabric={product.fabric}
          name={product.name}
          preload={preload}
          className="aspect-[4/5]"
          imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
        />
        {hasDiscount(product) && !soldOut && (
          <span className="absolute top-3 left-3 bg-maroon px-2.5 py-1 text-[10.5px] font-medium tracking-[0.14em] text-ivory uppercase">
            {discountPercent(product)}% off
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-ivory/55">
            <span className="border border-ink/70 bg-ivory px-4 py-1.5 text-[11px] tracking-[0.24em] text-ink uppercase">
              Sold out
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[10.5px] tracking-[0.22em] text-muted uppercase">{product.fabric}</p>
        <h3 className="mt-1 font-display text-[19px] leading-snug lg:text-[21px]">
          <Link href={href} className="transition-colors hover:text-maroon">
            {product.name}
          </Link>
        </h3>
        <Price product={product} className="mt-2" />
        <p className="mt-1.5 h-4 text-[12px]">
          {soldOut ? (
            <span className="text-danger">Out of stock</span>
          ) : lowStock ? (
            <span className="text-marigold">Only {product.stock} left</span>
          ) : (
            <span className="text-success">In stock</span>
          )}
        </p>
        <div className="mt-auto pt-3">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, preloadFirst = 0 }: { products: Product[]; preloadFirst?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-9 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} preload={i < preloadFirst} />
      ))}
    </div>
  );
}
