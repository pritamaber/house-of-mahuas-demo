import "server-only";
import { PAYMENT_METHODS } from "../config";
import { effectivePrice, shippingFor } from "../format";
import { getStore } from "../store";
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "../types";
import { normalizePhone, validateCheckout, type CheckoutFields, type FieldErrors } from "../validation";

export interface PlaceOrderInput extends CheckoutFields {
  paymentMethod: PaymentMethod;
  items: { productId: string; slug: string; quantity: number }[];
}

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

const MAX_QTY_PER_LINE = 10;

/**
 * Validates the cart against the live catalogue, prices it on the server (client-sent prices are
 * never trusted), reserves stock, and writes the order.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const fieldErrors = validateCheckout(input);
  if (!(PAYMENT_METHODS as readonly string[]).includes(input.paymentMethod)) {
    fieldErrors.paymentMethod = "Choose a payment method";
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }

  const store = getStore();
  const products = await store.listProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  // Merge duplicate lines and resolve each to a live product.
  const wanted = new Map<string, number>();
  for (const line of input.items) {
    const product = byId.get(line.productId) ?? bySlug.get(line.slug);
    if (!product || !product.active) {
      return { ok: false, error: "An item in your cart is no longer available. Please review your cart and try again." };
    }
    const qty = Math.floor(Number(line.quantity));
    if (!Number.isFinite(qty) || qty < 1) return { ok: false, error: "Invalid quantity in your cart." };
    wanted.set(product.id, Math.min(MAX_QTY_PER_LINE, (wanted.get(product.id) ?? 0) + qty));
  }

  const lines = [...wanted.entries()].map(([id, quantity]) => {
    const product = byId.get(id)!;
    const price = effectivePrice(product);
    return { product, quantity, price, subtotal: price * quantity };
  });

  for (const l of lines) {
    if (l.product.stock <= 0) return { ok: false, error: `Sorry, "${l.product.name}" is sold out.` };
    if (l.product.stock < l.quantity) {
      return { ok: false, error: `Only ${l.product.stock} of "${l.product.name}" left in stock. Please update your cart.` };
    }
  }

  // Reserve stock line by line; undo everything if any line can't be reserved.
  const reserved: { id: string; qty: number }[] = [];
  const rollback = () => Promise.all(reserved.map((r) => store.adjustStock(r.id, r.qty)));
  for (const l of lines) {
    const ok = await store.adjustStock(l.product.id, -l.quantity);
    if (!ok) {
      await rollback();
      return { ok: false, error: `"${l.product.name}" just sold out. Please update your cart.` };
    }
    reserved.push({ id: l.product.id, qty: l.quantity });
  }

  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const shipping = shippingFor(subtotal);

  let order: Order;
  try {
    order = await store.insertOrder({
      customerName: input.customerName.trim(),
      phone: normalizePhone(input.phone),
      email: input.email.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      state: input.state,
      pincode: input.pincode.trim(),
      subtotal,
      shipping,
      total: subtotal + shipping,
      paymentMethod: input.paymentMethod,
      // Online payments aren't wired up in the demo, so both start as Pending.
      paymentStatus: "Pending",
      orderStatus: "New",
      items: lines.map((l) => ({
        productId: l.product.id,
        productName: l.product.name,
        quantity: l.quantity,
        price: l.price,
        subtotal: l.subtotal,
      })),
    });
  } catch (err) {
    await rollback();
    console.error("Failed to save order", err);
    return { ok: false, error: "We couldn't save your order. Please try again." };
  }
  return { ok: true, orderId: order.id };
}

/** Updates status fields; cancelling returns stock, un-cancelling takes it again. */
export async function changeOrderStatus(
  id: string,
  patch: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus },
): Promise<Order | null> {
  const store = getStore();
  const order = await store.getOrder(id);
  if (!order) return null;

  if (patch.orderStatus) {
    const wasCancelled = order.orderStatus === "Cancelled";
    const willCancel = patch.orderStatus === "Cancelled";
    if (wasCancelled !== willCancel) {
      const sign = willCancel ? 1 : -1;
      for (const item of order.items) {
        if (item.productId) await store.adjustStock(item.productId, sign * item.quantity);
      }
    }
  }
  return store.updateOrder(id, patch);
}
