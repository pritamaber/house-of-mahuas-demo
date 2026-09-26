"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductImage } from "./product-image";
import type { ArtView } from "./saree-art";

interface Slide {
  src: string | null;
  view: ArtView;
  label: string;
}

/** Real photos when the product has them; otherwise three views of the generated textile. */
function slidesFor(product: Product): Slide[] {
  if (product.images.length) {
    return product.images.map((img, i) => ({ src: img.url, view: "full" as const, label: `Photo ${i + 1}` }));
  }
  return [
    { src: null, view: "full", label: "Full drape" },
    { src: null, view: "pallu", label: "Pallu detail" },
    { src: null, view: "border", label: "Border detail" },
  ];
}

export function ProductGallery({ product }: { product: Product }) {
  const slides = slidesFor(product);
  const [active, setActive] = useState(0);
  const current = slides[Math.min(active, slides.length - 1)];
  const artProps = { slug: product.slug, color: product.color, fabric: product.fabric, name: product.name };

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
      {slides.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none lg:w-[84px] lg:shrink-0 lg:flex-col lg:overflow-visible" role="tablist" aria-label="Product images">
          {slides.map((s, i) => (
            <button
              key={`${s.label}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={s.label}
              onClick={() => setActive(i)}
              className={cn(
                "relative w-16 shrink-0 border transition-all lg:w-full",
                i === active ? "border-maroon" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage
                src={s.src}
                alt=""
                view={s.view}
                sizes="84px"
                className="aspect-[4/5]"
                {...artProps}
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        <ProductImage
          key={`${current.src}-${current.view}`}
          src={current.src}
          alt={product.name}
          view={current.view}
          preload
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="animate-fade-in aspect-[4/5] w-full"
          {...artProps}
        />
        {product.stock <= 0 && (
          <span className="absolute top-4 left-4 border border-ink/70 bg-ivory px-3.5 py-1.5 text-[11px] tracking-[0.24em] text-ink uppercase">
            Sold out
          </span>
        )}
      </div>
    </div>
  );
}
