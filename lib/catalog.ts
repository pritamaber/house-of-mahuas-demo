import { CATEGORIES } from "./config";
import { effectivePrice } from "./format";
import type { Product } from "./types";

export const SORT_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "newest", label: "Newest" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export const PRICE_BUCKETS = [
  { key: "under-2500", label: "Under ₹2,500", min: 0, max: 2499 },
  { key: "2500-5000", label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { key: "5000-8000", label: "₹5,000 – ₹8,000", min: 5001, max: 8000 },
  { key: "above-8000", label: "Above ₹8,000", min: 8001, max: Infinity },
] as const;

export interface CatalogFilters {
  q: string;
  category: string[];
  color: string[];
  fabric: string[];
  price: string;
  inStock: boolean;
  sort: SortKey;
}

type RawParams = Record<string, string | string[] | undefined>;

function list(v: string | string[] | undefined): string[] {
  const raw = Array.isArray(v) ? v.join(",") : (v ?? "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export function parseFilters(sp: RawParams): CatalogFilters {
  const sort = first(sp.sort) as SortKey;
  const price = first(sp.price);
  return {
    q: first(sp.q).trim(),
    category: list(sp.category),
    color: list(sp.color),
    fabric: list(sp.fabric),
    price: PRICE_BUCKETS.some((b) => b.key === price) ? price : "",
    inStock: first(sp.availability) === "in-stock",
    sort: SORT_OPTIONS.some((o) => o.key === sort) ? sort : "featured",
  };
}

const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "price-desc":
      return arr.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case "newest":
      return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    default:
      return arr.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || +new Date(b.createdAt) - +new Date(a.createdAt),
      );
  }
}

export function applyFilters(products: Product[], f: CatalogFilters): Product[] {
  const bucket = PRICE_BUCKETS.find((b) => b.key === f.price);
  const q = f.q.toLowerCase();
  const out = products.filter((p) => {
    if (f.category.length && !f.category.some((c) => eq(c, p.category))) return false;
    if (f.color.length && !f.color.some((c) => eq(c, p.color))) return false;
    if (f.fabric.length && !f.fabric.some((c) => eq(c, p.fabric))) return false;
    if (f.inStock && p.stock <= 0) return false;
    if (bucket) {
      const price = effectivePrice(p);
      if (price < bucket.min || price > bucket.max) return false;
    }
    if (q) {
      const hay = `${p.name} ${p.fabric} ${p.color} ${p.category} ${p.description}`.toLowerCase();
      if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
    }
    return true;
  });
  return sortProducts(out, f.sort);
}

export interface Facets {
  categories: { key: string; label: string; count: number }[];
  colors: { name: string; count: number }[];
  fabrics: { name: string; count: number }[];
}

function tally(values: string[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const v of values) if (v) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

export function buildFacets(products: Product[]): Facets {
  const known = new Set<string>(CATEGORIES.map((c) => c.key));
  const categories = CATEGORIES.map((c) => ({
    key: c.key as string,
    label: c.short as string,
    count: products.filter((p) => p.category === c.key).length,
  }));
  // Categories that exist on products but not in the fixed list (e.g. imported data)
  for (const p of products) {
    if (!known.has(p.category)) {
      known.add(p.category);
      categories.push({ key: p.category, label: p.category, count: products.filter((x) => x.category === p.category).length });
    }
  }
  return {
    categories: categories.filter((c) => c.count > 0),
    colors: tally(products.map((p) => p.color)),
    fabrics: tally(products.map((p) => p.fabric)),
  };
}

/** Similar sarees: same category first, then same fabric/colour, then anything else. */
export function similarProducts(product: Product, all: Product[], limit = 4): Product[] {
  const others = all.filter((p) => p.id !== product.id && p.active);
  const score = (p: Product) =>
    (p.category === product.category ? 4 : 0) +
    (p.fabric === product.fabric ? 2 : 0) +
    (p.color === product.color ? 1 : 0) +
    (p.stock > 0 ? 0.5 : 0);
  return others.sort((a, b) => score(b) - score(a) || +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, limit);
}

export function washCareFor(fabric: string): string {
  const f = fabric.toLowerCase();
  if (/silk|banarasi|kanjivaram|tussar|baluchari|chanderi|katan/.test(f))
    return "Dry clean only. Store folded in a muslin cloth and air it out every few months. Avoid direct perfume or deodorant contact with the zari.";
  if (/organza|georgette/.test(f))
    return "Dry clean recommended. If hand washing, use cold water with a mild detergent, do not wring, and dry in shade.";
  if (/linen|cotton|tant|jamdani/.test(f))
    return "Gentle hand wash in cold water with a mild detergent for the first few washes. Dry in shade and iron on medium heat while slightly damp.";
  return "Dry clean recommended. Store folded in a cool, dry place.";
}
