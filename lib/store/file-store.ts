import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildSeedOrderRecord, SEED_ORDERS, SEED_PRODUCTS, seedTimestamps } from "../seed";
import type { NewOrderRecord, Order, OrderStatus, PaymentStatus, Product, ProductInput } from "../types";
import { StoreError, type Store } from "./types";

/**
 * Zero-setup demo store: one JSON file at ./data/db.json, created and seeded on first use.
 * Every read and write goes through a process-wide lock so concurrent requests can't corrupt it.
 */

interface Db {
  products: Product[];
  orders: Order[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Stored on globalThis: Next can bundle pages, actions and route handlers as separate module
// instances, and they must all queue behind the same lock.
const g = globalThis as unknown as { __mahuaDbLock?: Promise<unknown> };

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = (g.__mahuaDbLock ?? Promise.resolve()).then(fn, fn);
  g.__mahuaDbLock = run.catch(() => undefined);
  return run;
}

function buildSeedDb(): Db {
  const ts = seedTimestamps();
  const products: Product[] = SEED_PRODUCTS.map((sp) => {
    const { addedDaysAgo: _ignored, images, ...fields } = sp;
    void _ignored;
    return {
      ...fields,
      id: randomUUID(),
      createdAt: ts.productCreatedAt(sp),
      images: images.map((url, i) => ({ id: randomUUID(), url, sortOrder: i })),
    };
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const orders: Order[] = SEED_ORDERS.map((o) => materializeOrder(buildSeedOrderRecord(o, bySlug, ts.orderCreatedAt(o)), []));
  return { products, orders };
}

function nextOrderNumber(orders: Order[]): string {
  const max = orders.reduce((m, o) => {
    const n = Number(/(\d+)$/.exec(o.orderNumber)?.[1] ?? 0);
    return Math.max(m, n);
  }, 1024);
  return `ORD-${max + 1}`;
}

function materializeOrder(rec: NewOrderRecord, existing: Order[]): Order {
  const { items, orderNumber, createdAt, ...rest } = rec;
  return {
    ...rest,
    id: randomUUID(),
    orderNumber: orderNumber ?? nextOrderNumber(existing),
    createdAt: createdAt ?? new Date().toISOString(),
    items: items.map((i) => ({ ...i, id: randomUUID() })),
  };
}

async function readDb(): Promise<Db> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw) as Db;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const seeded = buildSeedDb();
    await writeDb(seeded);
    return seeded;
  }
}

async function writeDb(db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const json = JSON.stringify(db, null, 2);
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  try {
    await fs.writeFile(tmp, json, "utf8");
    await fs.rename(tmp, DB_FILE);
  } catch {
    // Windows / OneDrive can briefly lock the target file; fall back to an in-place write.
    await fs.writeFile(DB_FILE, json, "utf8");
    await fs.rm(tmp, { force: true });
  }
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) => +new Date(b.createdAt) - +new Date(a.createdAt);

function applyInput(target: Product, input: ProductInput): Product {
  const { images, ...fields } = input;
  return {
    ...target,
    ...fields,
    images: images.map((url, i) => ({ id: randomUUID(), url, sortOrder: i })),
  };
}

export const fileStore: Store = {
  kind: "file",

  listProducts: () => withLock(async () => (await readDb()).products.sort(byNewest)),

  getProduct: (id) => withLock(async () => (await readDb()).products.find((p) => p.id === id) ?? null),

  createProduct: (input) =>
    withLock(async () => {
      const db = await readDb();
      if (db.products.some((p) => p.slug === input.slug)) throw new StoreError("slug_taken");
      const product = applyInput({ id: randomUUID(), createdAt: new Date().toISOString() } as Product, input);
      db.products.push(product);
      await writeDb(db);
      return product;
    }),

  updateProduct: (id, input) =>
    withLock(async () => {
      const db = await readDb();
      const idx = db.products.findIndex((p) => p.id === id);
      if (idx < 0) throw new StoreError("not_found");
      if (db.products.some((p) => p.slug === input.slug && p.id !== id)) throw new StoreError("slug_taken");
      db.products[idx] = applyInput(db.products[idx], input);
      await writeDb(db);
      return db.products[idx];
    }),

  deleteProduct: (id) =>
    withLock(async () => {
      const db = await readDb();
      db.products = db.products.filter((p) => p.id !== id);
      // Keep order history intact; the line item just no longer links to a product.
      for (const o of db.orders) for (const i of o.items) if (i.productId === id) i.productId = null;
      await writeDb(db);
    }),

  setProductActive: (id, active) =>
    withLock(async () => {
      const db = await readDb();
      const p = db.products.find((x) => x.id === id);
      if (!p) throw new StoreError("not_found");
      p.active = active;
      await writeDb(db);
    }),

  adjustStock: (id, delta) =>
    withLock(async () => {
      const db = await readDb();
      const p = db.products.find((x) => x.id === id);
      if (!p) return false;
      if (p.stock + delta < 0) return false;
      p.stock += delta;
      await writeDb(db);
      return true;
    }),

  listOrders: () => withLock(async () => (await readDb()).orders.sort(byNewest)),

  getOrder: (id) => withLock(async () => (await readDb()).orders.find((o) => o.id === id) ?? null),

  insertOrder: (record) =>
    withLock(async () => {
      const db = await readDb();
      const order = materializeOrder(record, db.orders);
      db.orders.push(order);
      await writeDb(db);
      return order;
    }),

  updateOrder: (id, patch: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }) =>
    withLock(async () => {
      const db = await readDb();
      const o = db.orders.find((x) => x.id === id);
      if (!o) return null;
      if (patch.orderStatus) o.orderStatus = patch.orderStatus;
      if (patch.paymentStatus) o.paymentStatus = patch.paymentStatus;
      await writeDb(db);
      return o;
    }),

  reset: () =>
    withLock(async () => {
      await writeDb(buildSeedDb());
    }),
};
