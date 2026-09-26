import "server-only";
import { cache } from "react";
import { getStore } from "./store";

/** Per-request cached readers, so a layout and a page asking for products only hit the store once. */

export const getAllProducts = cache(() => getStore().listProducts());

/** Products visible on the storefront. */
export const getShopProducts = cache(async () => (await getAllProducts()).filter((p) => p.active));

export async function getShopProductBySlug(slug: string) {
  return (await getShopProducts()).find((p) => p.slug === slug) ?? null;
}

export const getAllOrders = cache(() => getStore().listOrders());
