import type { NewOrderRecord, Order, OrderStatus, PaymentStatus, Product, ProductInput } from "../types";

export class StoreError extends Error {
  constructor(
    public code: "slug_taken" | "not_found",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "StoreError";
  }
}

/**
 * Persistence boundary. The app only ever talks to this interface, so the local JSON
 * demo store and the Supabase store are interchangeable.
 */
export interface Store {
  readonly kind: "file" | "supabase";

  /** All products (active and inactive), newest first. */
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(id: string, input: ProductInput): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  setProductActive(id: string, active: boolean): Promise<void>;
  /** Adds `delta` to stock. Returns false (and changes nothing) if it would go below zero. */
  adjustStock(id: string, delta: number): Promise<boolean>;

  /** All orders, newest first. */
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  insertOrder(record: NewOrderRecord): Promise<Order>;
  updateOrder(id: string, patch: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }): Promise<Order | null>;

  /** Wipe everything and re-seed the demo catalogue and sample orders. */
  reset(): Promise<void>;
}
