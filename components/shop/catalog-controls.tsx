"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { PRICE_BUCKETS, SORT_OPTIONS, type CatalogFilters, type Facets } from "@/lib/catalog";
import { swatchFor } from "@/lib/colors";
import { cn } from "@/lib/format";

/** All filter state lives in the URL, so results are shareable and the back button works. */
function useFilterNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const toggleMulti = (key: string, value: string) =>
    update((p) => {
      const current = (p.get(key) ?? "").split(",").filter(Boolean);
      const next = current.some((v) => v.toLowerCase() === value.toLowerCase())
        ? current.filter((v) => v.toLowerCase() !== value.toLowerCase())
        : [...current, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });

  const setSingle = (key: string, value: string | null) =>
    update((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
    });

  const clearAll = () =>
    update((p) => {
      for (const k of ["category", "color", "fabric", "price", "availability", "q"]) p.delete(k);
    });

  return { update, toggleMulti, setSingle, clearAll, pending };
}

export function activeFilterCount(f: CatalogFilters): number {
  return f.category.length + f.color.length + f.fabric.length + (f.price ? 1 : 0) + (f.inStock ? 1 : 0);
}

const has = (list: string[], v: string) => list.some((x) => x.toLowerCase() === v.toLowerCase());

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-6 first:pt-0 last:border-b-0">
      <legend className="mb-4 float-left w-full text-[11px] font-medium tracking-[0.24em] text-ink uppercase">{title}</legend>
      <div className="clear-both space-y-3">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[14.5px] text-ink/85 hover:text-ink">
      <input type="checkbox" className="check" checked={checked} onChange={onChange} />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-[12px] text-muted">{count}</span>}
    </label>
  );
}

function FilterPanel({ facets, filters }: { facets: Facets; filters: CatalogFilters }) {
  const nav = useFilterNav();
  return (
    <div className={cn(nav.pending && "opacity-70 transition-opacity")}>
      <Group title="Category">
        {facets.categories.map((c) => (
          <CheckRow
            key={c.key}
            label={c.label}
            count={c.count}
            checked={has(filters.category, c.key)}
            onChange={() => nav.toggleMulti("category", c.key)}
          />
        ))}
      </Group>

      <Group title="Price">
        {PRICE_BUCKETS.map((b) => (
          <label key={b.key} className="flex cursor-pointer items-center gap-3 text-[14.5px] text-ink/85 hover:text-ink">
            <input
              type="radio"
              name="price"
              className="check"
              checked={filters.price === b.key}
              onChange={() => nav.setSingle("price", b.key)}
            />
            {b.label}
          </label>
        ))}
        {filters.price && (
          <button type="button" onClick={() => nav.setSingle("price", null)} className="text-[12px] text-maroon underline underline-offset-4">
            Any price
          </button>
        )}
      </Group>

      <Group title="Colour">
        <div className="flex flex-wrap gap-2.5">
          {facets.colors.map((c) => {
            const on = has(filters.color, c.name);
            return (
              <button
                key={c.name}
                type="button"
                title={`${c.name} (${c.count})`}
                aria-label={`${c.name}, ${c.count} sarees`}
                aria-pressed={on}
                onClick={() => nav.toggleMulti("color", c.name)}
                className={cn(
                  "relative h-8 w-8 rounded-full border border-black/10 transition-transform hover:scale-110",
                  on && "ring-2 ring-maroon ring-offset-2 ring-offset-ivory",
                )}
                style={{ background: swatchFor(c.name) }}
              />
            );
          })}
        </div>
        {filters.color.length > 0 && (
          <p className="text-[12.5px] text-muted">Selected: {filters.color.join(", ")}</p>
        )}
      </Group>

      <Group title="Fabric">
        {facets.fabrics.map((f) => (
          <CheckRow
            key={f.name}
            label={f.name}
            count={f.count}
            checked={has(filters.fabric, f.name)}
            onChange={() => nav.toggleMulti("fabric", f.name)}
          />
        ))}
      </Group>

      <Group title="Availability">
        <CheckRow
          label="In stock only"
          checked={filters.inStock}
          onChange={() => nav.setSingle("availability", filters.inStock ? null : "in-stock")}
        />
      </Group>
    </div>
  );
}

export function CatalogSidebar({ facets, filters }: { facets: Facets; filters: CatalogFilters }) {
  const nav = useFilterNav();
  const active = activeFilterCount(filters);
  return (
    <aside className="hidden lg:block" aria-label="Filters">
      <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-4 pb-6 scrollbar-none">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[26px] leading-none">Filter</h2>
          {active > 0 && (
            <button type="button" onClick={nav.clearAll} className="text-[12px] tracking-[0.12em] text-maroon uppercase underline underline-offset-4">
              Clear all
            </button>
          )}
        </div>
        <FilterPanel facets={facets} filters={filters} />
      </div>
    </aside>
  );
}

export function CatalogToolbar({
  facets,
  filters,
  total,
}: {
  facets: Facets;
  filters: CatalogFilters;
  total: number;
}) {
  const nav = useFilterNav();
  const [sheet, setSheet] = useState(false);
  const active = activeFilterCount(filters);

  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-y border-line py-3">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="inline-flex h-10 items-center gap-2 border border-line bg-white px-4 text-[12px] tracking-[0.16em] uppercase lg:hidden"
        >
          <SlidersHorizontal size={15} />
          Filters{active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-maroon px-1 text-[10px] text-ivory">{active}</span>}
        </button>
        <p className="hidden text-[13.5px] text-muted lg:block" aria-live="polite">
          {total} {total === 1 ? "saree" : "sarees"}
        </p>
        <label className="ml-auto flex items-center gap-3">
          <span className="hidden text-[11px] tracking-[0.2em] text-muted uppercase sm:inline">Sort by</span>
          <select
            aria-label="Sort sarees"
            className="field h-10 w-auto min-w-[10.5rem] text-[13.5px]"
            value={filters.sort}
            onChange={(e) => nav.setSingle("sort", e.target.value === "featured" ? null : e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-[13px] text-muted lg:hidden" aria-live="polite">
        {total} {total === 1 ? "saree" : "sarees"}
      </p>

      {sheet && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" onClick={() => setSheet(false)} className="animate-fade-in absolute inset-0 bg-ink/45" />
          <div className="animate-slide-up absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col bg-ivory shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-[26px] leading-none">Filter</h2>
              <button type="button" aria-label="Close" onClick={() => setSheet(false)} className="-mr-2 grid h-10 w-10 place-items-center">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel facets={facets} filters={filters} />
            </div>
            <div className="flex gap-3 border-t border-line bg-ivory p-4">
              <button type="button" onClick={nav.clearAll} disabled={active === 0} className="btn btn-outline btn-sm flex-1">
                Clear all
              </button>
              <button type="button" onClick={() => setSheet(false)} className="btn btn-primary btn-sm flex-[2]">
                Show {total} {total === 1 ? "saree" : "sarees"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ActiveFilters({ filters }: { filters: CatalogFilters }) {
  const nav = useFilterNav();
  const chips: { label: string; remove: () => void }[] = [
    ...filters.category.map((v) => ({ label: v, remove: () => nav.toggleMulti("category", v) })),
    ...filters.fabric.map((v) => ({ label: v, remove: () => nav.toggleMulti("fabric", v) })),
    ...filters.color.map((v) => ({ label: v, remove: () => nav.toggleMulti("color", v) })),
  ];
  const bucket = PRICE_BUCKETS.find((b) => b.key === filters.price);
  if (bucket) chips.push({ label: bucket.label, remove: () => nav.setSingle("price", null) });
  if (filters.inStock) chips.push({ label: "In stock", remove: () => nav.setSingle("availability", null) });
  if (filters.q) chips.push({ label: `“${filters.q}”`, remove: () => nav.setSingle("q", null) });
  if (!chips.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.remove}
          className="inline-flex items-center gap-1.5 rounded-full border border-maroon/30 bg-maroon-soft px-3 py-1 text-[12.5px] text-maroon capitalize transition-colors hover:border-maroon"
        >
          {c.label}
          <X size={13} aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button type="button" onClick={nav.clearAll} className="ml-1 text-[12px] tracking-[0.12em] text-muted uppercase underline underline-offset-4 hover:text-maroon">
        Clear all
      </button>
    </div>
  );
}

export function ClearFiltersButton() {
  const nav = useFilterNav();
  return (
    <button type="button" onClick={nav.clearAll} className="btn btn-outline mt-6">
      Clear all filters
    </button>
  );
}
