"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkCredentials, endAdminSession, requireAdmin, startAdminSession } from "../auth";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../config";
import { slugify } from "../format";
import { changeOrderStatus } from "../services/orders";
import { demoResetAllowed, getStore, StoreError } from "../store";
import { isManagedUpload, removeStoredImage } from "../storage";
import type { OrderStatus, PaymentStatus, ProductInput } from "../types";

function refreshShop() {
  revalidatePath("/", "layout");
}

// ── Auth ────────────────────────────────────────────────────────────────

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 500)); // blunt brute-force speed bump
    return { error: "Incorrect email or password." };
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endAdminSession();
  redirect("/admin/login");
}

// ── Products ────────────────────────────────────────────────────────────

const imageUrl = z
  .string()
  .max(600)
  .refine((u) => /^(\/images\/|\/uploads\/|https:\/\/)/.test(u), "Invalid image URL");

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name").max(120),
  slug: z.string().trim().max(90),
  description: z.string().trim().max(3000),
  price: z.number({ error: "Enter the price" }).int("Use whole rupees").min(1, "Price must be at least ₹1").max(1_000_000),
  salePrice: z.number().int("Use whole rupees").min(1).max(1_000_000).nullable(),
  category: z.string().trim().min(1, "Choose a category").max(40),
  fabric: z.string().trim().min(1, "Enter the fabric").max(60),
  color: z.string().trim().min(1, "Enter the colour").max(40),
  sareeLength: z.number({ error: "Enter the length" }).min(1, "Length looks too short").max(12, "Length looks too long"),
  blouseIncluded: z.boolean(),
  stock: z.number({ error: "Enter the stock" }).int("Use a whole number").min(0).max(99_999),
  featured: z.boolean(),
  active: z.boolean(),
  images: z.array(imageUrl).max(10, "At most 10 images"),
});

export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

export async function saveProductAction(id: string | null, raw: unknown): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) return { ok: false, fieldErrors: { slug: "Enter a valid slug" } };
  if (data.salePrice != null && data.salePrice >= data.price) {
    return { ok: false, fieldErrors: { salePrice: "Sale price must be lower than the price" } };
  }

  const input: ProductInput = { ...data, slug };
  const store = getStore();
  try {
    let previousImages: string[] = [];
    let saved;
    if (id) {
      previousImages = (await store.getProduct(id))?.images.map((i) => i.url) ?? [];
      saved = await store.updateProduct(id, input);
    } else {
      saved = await store.createProduct(input);
    }
    // Clean up uploads that were removed from this product
    for (const url of previousImages) {
      if (!input.images.includes(url) && isManagedUpload(url)) await removeStoredImage(url);
    }
    refreshShop();
    return { ok: true, id: saved.id };
  } catch (err) {
    if (err instanceof StoreError && err.code === "slug_taken") {
      return { ok: false, fieldErrors: { slug: "Another product already uses this slug" } };
    }
    if (err instanceof StoreError && err.code === "not_found") {
      return { ok: false, error: "This product no longer exists." };
    }
    console.error("saveProduct failed", err);
    return { ok: false, error: "Couldn't save the product. Please try again." };
  }
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireAdmin();
  const store = getStore();
  const product = await store.getProduct(id);
  await store.deleteProduct(id);
  for (const img of product?.images ?? []) if (isManagedUpload(img.url)) await removeStoredImage(img.url);
  refreshShop();
}

export async function setProductActiveAction(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  await getStore().setProductActive(id, Boolean(active));
  refreshShop();
}

// ── Orders ──────────────────────────────────────────────────────────────

export async function updateOrderAction(
  id: string,
  patch: { orderStatus?: string; paymentStatus?: string },
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const orderStatus = (ORDER_STATUSES as readonly string[]).includes(patch.orderStatus ?? "")
    ? (patch.orderStatus as OrderStatus)
    : undefined;
  const paymentStatus = (PAYMENT_STATUSES as readonly string[]).includes(patch.paymentStatus ?? "")
    ? (patch.paymentStatus as PaymentStatus)
    : undefined;
  if (!orderStatus && !paymentStatus) return { ok: false, error: "Nothing to update." };
  const updated = await changeOrderStatus(id, { orderStatus, paymentStatus });
  if (!updated) return { ok: false, error: "Order not found." };
  refreshShop();
  return { ok: true };
}

// ── Settings ────────────────────────────────────────────────────────────

export async function resetDemoDataAction(): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!demoResetAllowed()) {
    return { ok: false, error: "Reset is disabled for a Supabase database. Set ALLOW_DEMO_RESET=true to enable it." };
  }
  await getStore().reset();
  refreshShop();
  return { ok: true };
}
