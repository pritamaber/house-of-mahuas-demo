import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActiveBadge } from "@/components/admin/status-badge";
import { AdminPage, PageHeader } from "@/components/admin/page-header";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { ProductImage } from "@/components/shop/product-image";
import { categoryLabel } from "@/lib/config";
import { getAllProducts } from "@/lib/data";
import { cn, effectivePrice, formatINR, hasDiscount } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "Products" };

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "low", label: "Low / out of stock" },
] as const;

function matchesTab(p: Product, tab: string) {
  if (tab === "active") return p.active;
  if (tab === "inactive") return !p.active;
  if (tab === "low") return p.stock <= 3;
  return true;
}

function StockCell({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="font-medium text-danger">Out of stock</span>;
  if (stock <= 3) return <span className="font-medium text-marigold">{stock} left</span>;
  return <span>{stock}</span>;
}

function PriceCell({ p }: { p: Product }) {
  return (
    <div className="tabular-nums">
      <span className="font-medium">{formatINR(effectivePrice(p))}</span>
      {hasDiscount(p) && <span className="ml-2 text-[12.5px] text-muted line-through">{formatINR(p.price)}</span>}
    </div>
  );
}

function Thumb({ p, className }: { p: Product; className: string }) {
  return (
    <ProductImage
      src={p.images[0]?.url}
      alt=""
      slug={p.slug}
      color={p.color}
      fabric={p.fabric}
      name={p.name}
      sizes="64px"
      className={className}
    />
  );
}

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? "all";
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim().toLowerCase();

  const all = await getAllProducts();
  const products = all
    .filter((p) => matchesTab(p, tab))
    .filter((p) => !q || `${p.name} ${p.slug} ${p.fabric} ${p.color} ${p.category}`.toLowerCase().includes(q));

  const counts = Object.fromEntries(TABS.map((t) => [t.key, all.filter((p) => matchesTab(p, t.key)).length]));

  return (
    <AdminPage>
      <PageHeader
        title="Products"
        description={`${all.length} sarees in your catalogue.`}
        actions={
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Product
          </Link>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter products">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === "all" ? `/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}` : `/admin/products?status=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              role="tab"
              aria-selected={tab === t.key}
              className={cn(
                "shrink-0 border px-4 py-2 text-[13px] transition-colors",
                tab === t.key ? "border-maroon bg-maroon text-ivory" : "border-line bg-white hover:border-maroon",
              )}
            >
              {t.label} <span className={tab === t.key ? "text-ivory/70" : "text-muted"}>{counts[t.key]}</span>
            </Link>
          ))}
        </div>
        <form className="relative w-full lg:w-72" role="search">
          {tab !== "all" && <input type="hidden" name="status" value={tab} />}
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search products…" aria-label="Search products" className="field h-10 pl-10 text-[14px]" />
        </form>
      </div>

      <section aria-label="Product list" className="border border-line bg-white">
        {products.length === 0 ? (
          <p className="px-6 py-16 text-center text-[14.5px] text-muted">No products match this view.</p>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-[10.5px] tracking-[0.2em] text-muted uppercase">
                    <th className="w-24 px-6 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((p) => (
                    <tr key={p.id} className={cn("transition-colors hover:bg-cream/70", !p.active && "bg-cream/40")}>
                      <td className="px-6 py-3">
                        <Thumb p={p} className="aspect-[4/5] w-14" />
                      </td>
                      <td className="max-w-[22rem] px-4 py-3">
                        <Link href={`/admin/products/${p.id}/edit`} className="font-medium hover:text-maroon">
                          {p.name}
                        </Link>
                        <p className="mt-0.5 text-[12.5px] text-muted">
                          {p.fabric} · {p.color}
                          {p.featured && <span className="ml-2 rounded-sm bg-gold-soft px-1.5 py-0.5 text-[10.5px] tracking-wide text-gold uppercase">Featured</span>}
                          {p.images.length === 0 && <span className="ml-2 text-[11.5px] italic">no photo yet</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3">{categoryLabel(p.category)}</td>
                      <td className="px-4 py-3">
                        <PriceCell p={p} />
                      </td>
                      <td className="px-4 py-3">
                        <StockCell stock={p.stock} />
                      </td>
                      <td className="px-4 py-3">
                        <ActiveBadge active={p.active} />
                      </td>
                      <td className="px-6 py-3">
                        <ProductRowActions id={p.id} name={p.name} slug={p.slug} active={p.active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile / tablet cards */}
            <ul className="divide-y divide-line lg:hidden">
              {products.map((p) => (
                <li key={p.id} className={cn("flex gap-4 p-4", !p.active && "bg-cream/40")}>
                  <Link href={`/admin/products/${p.id}/edit`} className="w-20 shrink-0">
                    <Thumb p={p} className="aspect-[4/5] w-full" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="font-medium leading-snug hover:text-maroon">
                        {p.name}
                      </Link>
                      <ActiveBadge active={p.active} />
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">
                      {categoryLabel(p.category)} · {p.fabric}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-[14px]">
                      <PriceCell p={p} />
                      <span className="text-[13px]">
                        Stock: <StockCell stock={p.stock} />
                      </span>
                    </div>
                    <div className="mt-3">
                      <ProductRowActions id={p.id} name={p.name} slug={p.slug} active={p.active} compact />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AdminPage>
  );
}
