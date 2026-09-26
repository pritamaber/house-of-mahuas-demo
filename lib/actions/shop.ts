"use server";

import { revalidatePath } from "next/cache";
import { effectivePrice } from "../format";
import { placeOrder, type PlaceOrderInput, type PlaceOrderResult } from "../services/orders";
import { getStore } from "../store";

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Server Actions receive whatever the client sends, so coerce the payload before using it. */
export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const items = Array.isArray(input?.items) ? input.items : [];
  const result = await placeOrder({
    customerName: str(input?.customerName),
    phone: str(input?.phone),
    email: str(input?.email),
    address: str(input?.address),
    city: str(input?.city),
    state: str(input?.state),
    pincode: str(input?.pincode),
    paymentMethod: input?.paymentMethod === "Online" ? "Online" : "COD",
    items: items.slice(0, 30).map((i) => ({
      productId: str(i?.productId),
      slug: str(i?.slug),
      quantity: Number(i?.quantity),
    })),
  });
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export interface CartSyncItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string | null;
  fabric: string;
  color: string;
  stock: number;
}

/** Refreshes cart lines against the live catalogue (prices, stock, removed products). */
export async function syncCartAction(refs: { productId: string; slug: string }[]): Promise<CartSyncItem[]> {
  if (!Array.isArray(refs)) return [];
  const products = await getStore().listProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const out: CartSyncItem[] = [];
  for (const ref of refs.slice(0, 30)) {
    const p = byId.get(str(ref?.productId)) ?? bySlug.get(str(ref?.slug));
    if (!p || !p.active) continue;
    out.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: effectivePrice(p),
      mrp: p.price,
      image: p.images[0]?.url ?? null,
      fabric: p.fabric,
      color: p.color,
      stock: p.stock,
    });
  }
  return out;
}
