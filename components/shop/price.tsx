import { cn, discountPercent, effectivePrice, formatINR, hasDiscount } from "@/lib/format";
import type { Product } from "@/lib/types";

export function Price({
  product,
  size = "md",
  className,
}: {
  product: Pick<Product, "price" | "salePrice">;
  size?: "md" | "lg";
  className?: string;
}) {
  const discounted = hasDiscount(product);
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5", className)}>
      <span className={cn("font-medium text-ink", size === "lg" ? "text-[26px]" : "text-[16px]")}>
        {formatINR(effectivePrice(product))}
      </span>
      {discounted && (
        <>
          <span className={cn("text-muted line-through decoration-muted/60", size === "lg" ? "text-[17px]" : "text-[13.5px]")}>
            {formatINR(product.price)}
          </span>
          <span
            className={cn(
              "font-medium tracking-wide text-maroon",
              size === "lg" ? "text-[13px] uppercase tracking-[0.14em]" : "text-[12px]",
            )}
          >
            {discountPercent(product)}% off
          </span>
        </>
      )}
    </p>
  );
}
