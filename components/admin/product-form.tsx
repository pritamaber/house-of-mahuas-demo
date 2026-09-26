"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProductAction } from "@/lib/actions/admin";
import { CATEGORIES, FABRIC_SUGGESTIONS } from "@/lib/config";
import { cn, slugify } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ImageManager } from "./image-manager";

const COLOR_SUGGESTIONS = ["Black", "Maroon", "Red", "Pink", "Peach", "Orange", "Mustard", "Yellow", "Gold", "Green", "Teal", "Blue", "Purple", "Ivory", "Beige", "Grey"];

interface FormState {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  category: string;
  fabric: string;
  color: string;
  sareeLength: string;
  blouseIncluded: boolean;
  stock: string;
  featured: boolean;
  active: boolean;
  images: string[];
}

function initialState(p?: Product): FormState {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    description: p?.description ?? "",
    price: p ? String(p.price) : "",
    salePrice: p?.salePrice != null ? String(p.salePrice) : "",
    category: p?.category ?? CATEGORIES[0].key,
    fabric: p?.fabric ?? "",
    color: p?.color ?? "",
    sareeLength: p ? String(p.sareeLength) : "6.3",
    blouseIncluded: p?.blouseIncluded ?? true,
    stock: p ? String(p.stock) : "1",
    featured: p?.featured ?? false,
    active: p?.active ?? true,
    images: p?.images.map((i) => i.url) ?? [],
  };
}

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (f.name.trim().length < 2) e.name = "Enter a product name";
  const price = num(f.price);
  if (!Number.isFinite(price) || price < 1) e.price = "Enter the price in rupees";
  else if (!Number.isInteger(price)) e.price = "Use whole rupees";
  if (f.salePrice.trim() !== "") {
    const sale = num(f.salePrice);
    if (!Number.isFinite(sale) || sale < 1) e.salePrice = "Enter a valid sale price";
    else if (Number.isFinite(price) && sale >= price) e.salePrice = "Sale price must be lower than the price";
  }
  const stock = num(f.stock);
  if (!Number.isInteger(stock) || stock < 0) e.stock = "Enter a whole number (0 or more)";
  const len = num(f.sareeLength);
  if (!Number.isFinite(len) || len < 1 || len > 12) e.sareeLength = "Enter the length in metres (e.g. 6.3)";
  if (!f.fabric.trim()) e.fabric = "Enter the fabric";
  if (!f.color.trim()) e.color = "Enter the colour";
  return e;
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-5 sm:p-7">
      <h2 className="text-[26px] leading-none">{title}</h2>
      {description && <p className="mt-2 text-[13.5px] text-muted">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[14.5px] font-medium">{label}</p>
        <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-maroon" : "bg-[#cfc3b2]")}
      >
        <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
      </button>
    </div>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const editing = Boolean(product);
  const [f, setF] = useState<FormState>(() => initialState(product));
  const [slugTouched, setSlugTouched] = useState(editing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };
  const text = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    set(key, e.target.value as never);
  const inv = (key: string) => (errors[key] ? { "aria-invalid": true as const } : {});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setFormError("Please fix the highlighted fields.");
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setSaving(true);
    try {
      const res = await saveProductAction(product?.id ?? null, {
        name: f.name.trim(),
        slug: slugify(f.slug || f.name),
        description: f.description.trim(),
        price: num(f.price),
        salePrice: f.salePrice.trim() === "" ? null : num(f.salePrice),
        category: f.category,
        fabric: f.fabric.trim(),
        color: f.color.trim(),
        sareeLength: num(f.sareeLength),
        blouseIncluded: f.blouseIncluded,
        stock: num(f.stock),
        featured: f.featured,
        active: f.active,
        images: f.images,
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
        return;
      }
      setErrors(res.fieldErrors ?? {});
      setFormError(res.error ?? "Please fix the highlighted fields.");
      const first = Object.keys(res.fieldErrors ?? {})[0];
      if (first) document.getElementById(first)?.focus();
    } catch {
      setFormError("Couldn't reach the server. Please try again.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card title="Basic information">
            <Field id="name" label="Product name" error={errors.name}>
              <input
                id="name"
                className="field"
                value={f.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) setF((prev) => ({ ...prev, name: e.target.value, slug: slugify(e.target.value) }));
                }}
                placeholder="e.g. Royal Banarasi Katan Silk Saree"
                {...inv("name")}
              />
            </Field>
            <Field id="slug" label="Slug" error={errors.slug} hint={`Web address: /product/${slugify(f.slug || f.name) || "…"}`}>
              <input
                id="slug"
                className="field"
                value={f.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
                onBlur={() => setF((prev) => ({ ...prev, slug: slugify(prev.slug) }))}
                placeholder="auto-generated from the name"
                {...inv("slug")}
              />
            </Field>
            <Field id="description" label="Description" error={errors.description}>
              <textarea id="description" rows={5} className="field" value={f.description} onChange={text("description")} placeholder="Describe the weave, the drape and when to wear it." />
            </Field>
          </Card>

          <Card title="Photos" description="Show the drape, the pallu and the border. Photography sells sarees — the first image is the main one.">
            <ImageManager images={f.images} onChange={(update) => setF((prev) => ({ ...prev, images: update(prev.images) }))} error={errors.images} />
          </Card>

          <Card title="Pricing & stock">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field id="price" label="Price (₹)" error={errors.price} hint="The original (MRP) price">
                <input id="price" className="field" inputMode="numeric" value={f.price} onChange={text("price")} placeholder="9999" {...inv("price")} />
              </Field>
              <Field id="salePrice" label="Sale price (₹)" error={errors.salePrice} hint="Optional — leave empty for no discount">
                <input id="salePrice" className="field" inputMode="numeric" value={f.salePrice} onChange={text("salePrice")} placeholder="8499" {...inv("salePrice")} />
              </Field>
              <Field id="stock" label="Stock quantity" error={errors.stock} hint="Pieces available">
                <input id="stock" className="field" inputMode="numeric" value={f.stock} onChange={text("stock")} {...inv("stock")} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Details">
            <Field id="category" label="Category">
              <select id="category" className="field" value={f.category} onChange={text("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
                {!CATEGORIES.some((c) => c.key === f.category) && <option value={f.category}>{f.category}</option>}
              </select>
            </Field>
            <Field id="fabric" label="Fabric" error={errors.fabric}>
              <input id="fabric" list="fabric-list" className="field" value={f.fabric} onChange={text("fabric")} placeholder="e.g. Banarasi Silk" {...inv("fabric")} />
              <datalist id="fabric-list">
                {FABRIC_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field id="color" label="Colour" error={errors.color} hint="Used for the colour filter">
              <input id="color" list="color-list" className="field" value={f.color} onChange={text("color")} placeholder="e.g. Maroon" {...inv("color")} />
              <datalist id="color-list">
                {COLOR_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field id="sareeLength" label="Saree length (metres)" error={errors.sareeLength}>
              <input id="sareeLength" className="field" inputMode="decimal" value={f.sareeLength} onChange={text("sareeLength")} {...inv("sareeLength")} />
            </Field>
            <Toggle checked={f.blouseIncluded} onChange={(v) => set("blouseIncluded", v)} label="Blouse included" description="Comes with an unstitched blouse piece" />
          </Card>

          <Card title="Visibility">
            <Toggle checked={f.active} onChange={(v) => set("active", v)} label="Active" description="Inactive sarees are hidden from the store" />
            <div className="border-t border-line" />
            <Toggle checked={f.featured} onChange={(v) => set("featured", v)} label="Featured product" description="Shown on the homepage" />
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-line bg-ivory/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-[84rem] flex-wrap items-center justify-between gap-3">
          <div className="min-h-5 text-[13.5px] text-danger" role="alert" aria-live="polite">
            {formError}
          </div>
          <div className="flex gap-3">
            {editing && product?.active && (
              <Link href={`/product/${product.slug}`} target="_blank" className="btn btn-ghost btn-sm">
                View in store
              </Link>
            )}
            <Link href="/admin/products" className="btn btn-outline btn-sm">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm min-w-36">
              {saving ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" /> Saving…
                </>
              ) : editing ? (
                "Save changes"
              ) : (
                "Create product"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
