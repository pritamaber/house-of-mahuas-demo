import { Banknote, Droplets, Ruler, Scissors, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { Price } from "@/components/shop/price";
import { SectionHeading } from "@/components/shop/section-heading";
import { similarProducts, washCareFor } from "@/lib/catalog";
import { categoryLabel, SHIPPING } from "@/lib/config";
import { getShopProductBySlug, getShopProducts } from "@/lib/data";
import { formatINR, formatMetres } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);
  if (!product) return { title: "Saree not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { title: product.name, description: product.description.slice(0, 160) },
  };
}

function Availability({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-2 text-[14px] text-danger">
        <span className="h-2 w-2 rounded-full bg-danger" /> Sold out
      </span>
    );
  }
  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-2 text-[14px] text-marigold">
        <span className="h-2 w-2 rounded-full bg-marigold" /> Only {stock} left — order soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-[14px] text-success">
      <span className="h-2 w-2 rounded-full bg-success" /> In stock
    </span>
  );
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);
  if (!product) notFound();

  const all = await getShopProducts();
  const similar = similarProducts(product, all, 4);

  const specs = [
    { label: "Fabric", value: product.fabric },
    { label: "Colour", value: product.color },
    { label: "Saree length", value: formatMetres(product.sareeLength) },
    { label: "Blouse", value: product.blouseIncluded ? "Included" : "Not included" },
  ];

  const details = [
    { icon: Droplets, label: "Fabric", value: product.fabric },
    { icon: Ruler, label: "Saree length", value: `${formatMetres(product.sareeLength)}${product.blouseIncluded ? " (with blouse piece)" : ""}` },
    {
      icon: Scissors,
      label: "Blouse length",
      value: product.blouseIncluded ? "0.8 m unstitched running blouse piece" : "Not included with this saree",
    },
    { icon: Droplets, label: "Wash care", value: washCareFor(product.fabric) },
    {
      icon: Truck,
      label: "Delivery",
      value: `Dispatched within 2–3 working days and delivered across India in 5–8 days. Free shipping on orders of ${formatINR(SHIPPING.freeAbove)} & above; otherwise ${formatINR(SHIPPING.fee)}.`,
    },
  ];

  return (
    <div className="container-page pt-6 lg:pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-[12px] tracking-[0.14em] text-muted uppercase lg:mb-8">
        <Link href="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/sarees" className="hover:text-maroon">Sarees</Link>
        <span className="mx-2">/</span>
        <Link href={`/sarees?category=${product.category}`} className="hover:text-maroon">
          {categoryLabel(product.category)}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <ProductGallery product={product} />
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">{categoryLabel(product.category)}</p>
            <h1 className="mt-3 text-[36px] leading-[1.05] sm:text-[44px]">{product.name}</h1>
            <Price product={product} size="lg" className="mt-5" />

            <div className="mt-6 flex items-center border-y border-line py-3.5">
              <Availability stock={product.stock} />
            </div>

            <p className="mt-6 text-[15.5px] leading-[1.75] text-ink/80">{product.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-[10.5px] tracking-[0.22em] text-muted uppercase">{s.label}</dt>
                  <dd className="mt-1 text-[15px]">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <ProductPurchase product={product} />
            </div>

            <ul className="mt-8 space-y-2.5 border-t border-line pt-6 text-[13.5px] text-muted">
              <li className="flex items-center gap-3">
                <Truck size={17} className="text-maroon" strokeWidth={1.6} />
                Free shipping on orders of {formatINR(SHIPPING.freeAbove)} &amp; above
              </li>
              <li className="flex items-center gap-3">
                <Banknote size={17} className="text-maroon" strokeWidth={1.6} />
                Cash on delivery available
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Product details ── */}
      <section className="mt-20 lg:mt-28" aria-labelledby="details-heading">
        <h2 id="details-heading" className="text-[34px] leading-none sm:text-[42px]">
          Product Details
        </h2>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {details.map((d) => (
            <div key={d.label} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">
              <dt className="flex items-center gap-3 text-[11.5px] tracking-[0.2em] text-muted uppercase">
                <d.icon size={16} strokeWidth={1.5} className="text-gold" />
                {d.label}
              </dt>
              <dd className="max-w-3xl text-[15px] leading-relaxed text-ink/85">{d.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Similar ── */}
      {similar.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <SectionHeading eyebrow="You may also like" title="Similar Sarees" />
          <div className="mt-10 lg:mt-14">
            <ProductGrid products={similar} />
          </div>
        </section>
      )}
    </div>
  );
}
