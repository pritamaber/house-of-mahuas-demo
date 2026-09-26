import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { buildSeedOrderRecord, SEED_ORDERS, SEED_PRODUCTS, seedTimestamps } from "../seed";
import type { NewOrderRecord, Order, OrderStatus, PaymentStatus, Product, ProductInput } from "../types";
import { StoreError, type Store } from "./types";

/**
 * Supabase-backed store. Uses the service-role key and only ever runs on the server,
 * so the tables can keep Row Level Security enabled with no public policies.
 * Schema: supabase/schema.sql
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function toProduct(r: Row): Product {
  const images = ((r.product_images ?? []) as Row[])
    .map((i) => ({ id: i.id as string, url: i.image_url as string, sortOrder: i.sort_order as number }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    price: r.price,
    salePrice: r.sale_price ?? null,
    category: r.category,
    fabric: r.fabric ?? "",
    color: r.color ?? "",
    sareeLength: Number(r.saree_length),
    blouseIncluded: r.blouse_included,
    stock: r.stock,
    featured: r.featured,
    active: r.active,
    createdAt: r.created_at,
    images,
  };
}

function toOrder(r: Row): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    phone: r.phone,
    email: r.email ?? "",
    address: r.address,
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    subtotal: r.subtotal,
    shipping: r.shipping,
    total: r.total,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    orderStatus: r.order_status,
    createdAt: r.created_at,
    items: ((r.order_items ?? []) as Row[]).map((i) => ({
      id: i.id,
      productId: i.product_id ?? null,
      productName: i.product_name,
      quantity: i.quantity,
      price: i.price,
      subtotal: i.subtotal,
    })),
  };
}

function productRow(input: ProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: input.price,
    sale_price: input.salePrice,
    category: input.category,
    fabric: input.fabric,
    color: input.color,
    saree_length: input.sareeLength,
    blouse_included: input.blouseIncluded,
    stock: input.stock,
    featured: input.featured,
    active: input.active,
  };
}

const PRODUCT_SELECT = "*, product_images(id, image_url, sort_order)";
const ORDER_SELECT = "*, order_items(*)";
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function fail(error: { message: string; code?: string } | null, context: string): never {
  if (error?.code === "23505") throw new StoreError("slug_taken");
  throw new Error(`Supabase ${context}: ${error?.message ?? "unknown error"}`);
}

export function createSupabaseStore(url: string, serviceKey: string): Store {
  const db: SupabaseClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  async function replaceImages(productId: string, urls: string[]) {
    const del = await db.from("product_images").delete().eq("product_id", productId);
    if (del.error) fail(del.error, "delete images");
    if (!urls.length) return;
    const ins = await db
      .from("product_images")
      .insert(urls.map((image_url, sort_order) => ({ product_id: productId, image_url, sort_order })));
    if (ins.error) fail(ins.error, "insert images");
  }

  async function fetchProduct(id: string): Promise<Product | null> {
    const { data, error } = await db.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
    if (error) fail(error, "get product");
    return data ? toProduct(data) : null;
  }

  async function insertOrder(rec: NewOrderRecord): Promise<Order> {
    const { items, orderNumber, createdAt, ...o } = rec;
    const row: Row = {
      customer_name: o.customerName,
      phone: o.phone,
      email: o.email,
      address: o.address,
      city: o.city,
      state: o.state,
      pincode: o.pincode,
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      payment_method: o.paymentMethod,
      payment_status: o.paymentStatus,
      order_status: o.orderStatus,
    };
    if (orderNumber) row.order_number = orderNumber; // otherwise the DB sequence assigns one
    if (createdAt) row.created_at = createdAt;

    const created = await db.from("orders").insert(row).select("*").single();
    if (created.error) fail(created.error, "insert order");

    const lines = await db.from("order_items").insert(
      items.map((i) => ({
        order_id: created.data.id,
        product_id: i.productId,
        product_name: i.productName,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal,
      })),
    );
    if (lines.error) {
      await db.from("orders").delete().eq("id", created.data.id); // don't leave a headless order behind
      fail(lines.error, "insert order items");
    }
    const full = await db.from("orders").select(ORDER_SELECT).eq("id", created.data.id).single();
    if (full.error) fail(full.error, "reload order");
    return toOrder(full.data);
  }

  return {
    kind: "supabase",

    async listProducts() {
      const { data, error } = await db.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
      if (error) fail(error, "list products");
      return (data ?? []).map(toProduct);
    },

    getProduct: fetchProduct,

    async createProduct(input) {
      const { data, error } = await db.from("products").insert(productRow(input)).select("id").single();
      if (error) fail(error, "create product");
      await replaceImages(data.id, input.images);
      return (await fetchProduct(data.id)) as Product;
    },

    async updateProduct(id, input) {
      const { data, error } = await db.from("products").update(productRow(input)).eq("id", id).select("id");
      if (error) fail(error, "update product");
      if (!data?.length) throw new StoreError("not_found");
      await replaceImages(id, input.images);
      return (await fetchProduct(id)) as Product;
    },

    async deleteProduct(id) {
      const { error } = await db.from("products").delete().eq("id", id);
      if (error) fail(error, "delete product");
    },

    async setProductActive(id, active) {
      const { error } = await db.from("products").update({ active }).eq("id", id);
      if (error) fail(error, "toggle product");
    },

    async adjustStock(id, delta) {
      // Optimistic compare-and-set so concurrent orders can't oversell.
      for (let attempt = 0; attempt < 5; attempt++) {
        const cur = await db.from("products").select("stock").eq("id", id).maybeSingle();
        if (cur.error) fail(cur.error, "read stock");
        if (!cur.data) return false;
        const next = (cur.data.stock as number) + delta;
        if (next < 0) return false;
        const upd = await db.from("products").update({ stock: next }).eq("id", id).eq("stock", cur.data.stock).select("id");
        if (upd.error) fail(upd.error, "update stock");
        if (upd.data?.length) return true;
      }
      return false;
    },

    async listOrders() {
      const { data, error } = await db.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
      if (error) fail(error, "list orders");
      return (data ?? []).map(toOrder);
    },

    async getOrder(id) {
      const { data, error } = await db.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
      if (error) fail(error, "get order");
      return data ? toOrder(data) : null;
    },

    insertOrder,

    async updateOrder(id, patch: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }) {
      const update: Row = {};
      if (patch.orderStatus) update.order_status = patch.orderStatus;
      if (patch.paymentStatus) update.payment_status = patch.paymentStatus;
      const { data, error } = await db.from("orders").update(update).eq("id", id).select("id");
      if (error) fail(error, "update order");
      if (!data?.length) return null;
      const full = await db.from("orders").select(ORDER_SELECT).eq("id", id).single();
      if (full.error) fail(full.error, "reload order");
      return toOrder(full.data);
    },

    async reset() {
      for (const table of ["order_items", "orders", "product_images", "products"]) {
        const { error } = await db.from(table).delete().neq("id", NIL_UUID);
        if (error) fail(error, `clear ${table}`);
      }
      const ts = seedTimestamps();
      const bySlug = new Map<string, Product>();
      for (const sp of SEED_PRODUCTS) {
        const { addedDaysAgo: _d, images, ...fields } = sp;
        void _d;
        const { data, error } = await db
          .from("products")
          .insert({ ...productRow({ ...fields, images }), created_at: ts.productCreatedAt(sp) })
          .select("id")
          .single();
        if (error) fail(error, "seed product");
        await replaceImages(data.id, images);
        bySlug.set(sp.slug, (await fetchProduct(data.id)) as Product);
      }
      for (const o of SEED_ORDERS) {
        await insertOrder(buildSeedOrderRecord(o, bySlug, ts.orderCreatedAt(o)));
      }
    },
  };
}
