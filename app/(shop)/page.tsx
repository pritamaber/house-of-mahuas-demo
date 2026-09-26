import { BadgeCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CollectionCard, representativeFor } from "@/components/shop/collection-card";
import { Ornament } from "@/components/shop/icons";
import { ProductGrid } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/shop/section-heading";
import { CATEGORIES, SHIPPING, SITE } from "@/lib/config";
import { getShopProducts } from "@/lib/data";
import { formatINR } from "@/lib/format";

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Authentic Quality",
    text: "Handpicked weaves, inspected carefully and packed with care before they reach you.",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    text: `Carefully packed and delivered across India. Free shipping on orders of ${formatINR(SHIPPING.freeAbove)} & above.`,
  },
  {
    icon: ShoppingBag,
    title: "Easy Ordering",
    text: "Add to cart, share your address, done. No account needed — and cash on delivery is available.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    text: "Pay online through trusted gateways, or pay in cash when your saree arrives.",
  },
];

export default async function HomePage() {
  const products = await getShopProducts();
  const featured = products.filter((p) => p.featured);
  const newest = [...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  // Always show a full row of products even if few are flagged as featured.
  const showcase = [...featured, ...newest.filter((p) => !p.featured)].slice(0, 8);

  const collections = CATEGORIES.slice(0, 4).map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.key).length,
    product: representativeFor(products, c.key),
  }));

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-40 hidden h-[720px] w-[720px] rounded-full border border-gold/25 lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 hidden h-[560px] w-[560px] rounded-full border border-gold/15 lg:block"
        />
        <div className="container-page grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-6">
            <p className="eyebrow animate-fade-up">{SITE.tagline}</p>
            <h1 className="animate-fade-up mt-5 text-[46px] leading-[1.02] [animation-delay:120ms] sm:text-[68px] lg:text-[80px]">
              Timeless Sarees, <em className="text-maroon">Made for Every Occasion</em>
            </h1>
            <p className="animate-fade-up mt-6 max-w-md text-[16px] leading-relaxed text-muted [animation-delay:240ms] sm:text-[17px]">
              Discover our curated collection of elegant sarees for weddings, festivals and everyday celebrations.
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap gap-3 [animation-delay:360ms]">
              <Link href="/sarees" className="btn btn-primary w-full sm:w-auto">
                Shop Collection
              </Link>
              <Link href="/new-arrivals" className="btn btn-outline w-full sm:w-auto">
                New Arrivals
              </Link>
            </div>
            <ul className="animate-fade-up mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[11.5px] tracking-[0.18em] text-muted uppercase [animation-delay:480ms]">
              <li>Handpicked weaves</li>
              <li>Pan-India delivery</li>
              <li>Cash on delivery</li>
            </ul>
          </div>

          <div className="animate-fade-up relative mx-auto w-full max-w-[440px] [animation-delay:200ms] sm:max-w-[500px] lg:col-span-6 lg:max-w-[520px] lg:justify-self-end">
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 border border-gold/70 sm:translate-x-4 sm:translate-y-4" />
            <div className="relative aspect-[4/5] overflow-hidden bg-maroon-deep shadow-[0_30px_60px_-30px_rgba(69,9,26,0.55)]">
              <Image
                src="/images/hero-campaign.jpg"
                alt="A woman in a black silk saree with jewel-toned floral motifs, standing before a lit Durga Puja pandal"
                fill
                preload
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 500px, 92vw"
                quality={85}
                className="object-cover object-[50%_22%]"
              />
            </div>
            <Link
              href="/sarees?category=festive"
              className="group absolute -bottom-5 left-4 flex items-center gap-3 border border-line bg-ivory px-5 py-3.5 shadow-lg sm:left-6"
            >
              <span className="text-left">
                <span className="block text-[9.5px] tracking-[0.26em] text-gold uppercase">The Festive Edit</span>
                <span className="block font-display text-[19px] leading-tight text-ink">Puja &amp; celebration drapes</span>
              </span>
              <span className="text-maroon transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured collections ── */}
      <section className="container-page pt-20 lg:pt-28">
        <SectionHeading
          eyebrow="Shop by occasion"
          title="Featured Collections"
          description="From the wedding mandap to the Puja pandal — find the weave that suits the moment."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-6">
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
      </section>

      {/* ── Featured products ── */}
      <section className="container-page pt-20 lg:pt-28">
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Featured Sarees"
          description="Our favourite weaves this season, chosen for their craft, colour and drape."
        />
        <div className="mt-10 lg:mt-14">
          <ProductGrid products={showcase} />
        </div>
        <div className="mt-14 text-center">
          <Link href="/sarees" className="btn btn-outline">
            View all sarees
          </Link>
        </div>
      </section>

      {/* ── Tagline band ── */}
      <section className="mt-20 bg-maroon py-16 text-center text-ivory lg:mt-28 lg:py-20">
        <div className="container-page flex flex-col items-center">
          <Ornament className="h-3 w-28 text-gold" />
          <p className="mt-6 max-w-3xl font-display text-[32px] leading-[1.15] italic sm:text-[46px]">
            &ldquo;{SITE.tagline}&rdquo;
          </p>
          <p className="mt-5 text-[11px] tracking-[0.3em] text-gold-soft uppercase">{SITE.name}</p>
        </div>
      </section>

      {/* ── Why shop with us ── */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-page">
          <SectionHeading eyebrow="Our promise to you" title="Why Shop With Us" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-line bg-ivory p-7 text-center transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(42,28,23,0.35)] lg:p-8">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/50 text-maroon">
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 text-[25px] leading-none">{title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
