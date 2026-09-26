import type { Metadata } from "next";
import Link from "next/link";
import { ActiveFilters, CatalogSidebar, CatalogToolbar, ClearFiltersButton } from "@/components/shop/catalog-controls";
import { ProductGrid } from "@/components/shop/product-card";
import { applyFilters, buildFacets, parseFilters } from "@/lib/catalog";
import { categoryLabel } from "@/lib/config";
import { getShopProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Sarees" };

export default async function SareesPage({ searchParams }: PageProps<"/sarees">) {
  const filters = parseFilters(await searchParams);
  const all = await getShopProducts();
  const facets = buildFacets(all);
  const results = applyFilters(all, filters);

  const title = filters.q
    ? `Results for “${filters.q}”`
    : filters.category.length === 1
      ? categoryLabel(filters.category[0])
      : "All Sarees";

  return (
    <div className="container-page pt-8 pb-8 lg:pt-12">
      <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] text-muted uppercase">
        <Link href="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Sarees</span>
      </nav>

      <div className="mt-4 mb-8 lg:mb-10">
        <h1 className="text-[40px] leading-none sm:text-[54px]">{title}</h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Handpicked weaves for weddings, festivals and every day in between.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[15.5rem_1fr] lg:gap-12">
        <CatalogSidebar facets={facets} filters={filters} />

        <section aria-label="Products">
          <CatalogToolbar facets={facets} filters={filters} total={results.length} />
          <ActiveFilters filters={filters} />

          <div className="mt-8">
            {results.length > 0 ? (
              <ProductGrid products={results} preloadFirst={4} />
            ) : (
              <div className="border border-dashed border-line px-6 py-20 text-center">
                <h2 className="text-[32px]">No sarees match your filters</h2>
                <p className="mx-auto mt-3 max-w-sm text-[15px] text-muted">
                  Try removing a filter or searching for something else — new weaves arrive often.
                </p>
                <ClearFiltersButton />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
