"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore, useEffect, type ReactNode } from "react";
import { syncCartAction } from "@/lib/actions/shop";
import {
  falseOnServer,
  getCartSnapshot,
  getServerCartSnapshot,
  MAX_QTY,
  setCartLines,
  subscribeCart,
  subscribeNever,
  trueOnClient,
  type CartLine,
} from "./cart-store";

export { MAX_QTY };
export type { CartLine };

type NewLine = Omit<CartLine, "quantity">;

interface Toast {
  id: number;
  message: string;
  detail?: string;
  action?: { label: string; href: string };
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** false until the browser's saved cart has been read (i.e. during server render / hydration) */
  ready: boolean;
  /** Returns true if the item is (now) in the cart. `silent` skips the toast (used by Buy Now). */
  addItem: (line: NewLine, quantity?: number, opts?: { silent?: boolean }) => boolean;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  /** Reconcile the cart with the live catalogue (prices, stock, removed products). */
  sync: () => Promise<void>;
  notify: (message: string, detail?: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);
  const ready = useSyncExternalStore(subscribeNever, trueOnClient, falseOnServer);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastId = useRef(0);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = useCallback((message: string, detail?: string, action?: Toast["action"]) => {
    setToast({ id: ++toastId.current, message, detail, action });
  }, []);

  const addItem = useCallback(
    (line: NewLine, quantity = 1, opts?: { silent?: boolean }): boolean => {
      const current = getCartSnapshot();
      const existing = current.find((l) => l.productId === line.productId);
      const cap = Math.min(MAX_QTY, Math.max(0, line.stock));
      const have = existing?.quantity ?? 0;
      const nextQty = Math.min(cap, have + quantity);

      if (nextQty <= have) {
        // Already at the limit. For Buy Now the shopper still wants to check out, so stay quiet.
        if (!opts?.silent) {
          notify(
            cap === 0 ? "Sorry, this saree is sold out" : `Only ${cap} available`,
            cap === 0 ? undefined : "You already have the maximum in your cart.",
            { label: "View cart", href: "/cart" },
          );
        }
        return have > 0;
      }
      setCartLines(
        existing
          ? current.map((l) => (l.productId === line.productId ? { ...l, ...line, quantity: nextQty } : l))
          : [...current, { ...line, quantity: nextQty }],
      );
      if (!opts?.silent) notify("Added to your cart", line.name, { label: "View cart", href: "/cart" });
      return true;
    },
    [notify],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCartLines(
      getCartSnapshot().flatMap((l) => {
        if (l.productId !== productId) return [l];
        const q = Math.min(MAX_QTY, l.stock, Math.floor(quantity));
        return q < 1 ? [] : [{ ...l, quantity: q }];
      }),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartLines(getCartSnapshot().filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setCartLines([]), []);

  const sync = useCallback(async () => {
    const before = getCartSnapshot();
    if (!before.length) return;
    let fresh;
    try {
      fresh = await syncCartAction(before.map((l) => ({ productId: l.productId, slug: l.slug })));
    } catch {
      return; // offline or server hiccup — keep the cart as is
    }
    const byId = new Map(fresh.map((f) => [f.productId, f]));
    const bySlug = new Map(fresh.map((f) => [f.slug, f]));
    let changed = false;
    const next: CartLine[] = [];
    for (const l of getCartSnapshot()) {
      const f = byId.get(l.productId) ?? bySlug.get(l.slug);
      if (!f || f.stock <= 0) {
        changed = true;
        continue;
      }
      const quantity = Math.min(l.quantity, f.stock, MAX_QTY);
      if (quantity !== l.quantity || f.price !== l.price) changed = true;
      next.push({ ...l, ...f, quantity });
    }
    setCartLines(next);
    if (changed) notify("We updated your cart", "Some items changed price or availability.");
  }, [notify]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
      sync,
      notify,
    }),
    [lines, ready, addItem, setQuantity, removeItem, clear, sync, notify],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="animate-toast fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-sm items-start gap-3 rounded-sm border border-line bg-white p-4 shadow-[0_18px_50px_-18px_rgba(42,28,23,0.45)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:mx-0"
        >
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-maroon text-ivory">
            <Check size={14} strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">{toast.message}</p>
            {toast.detail && <p className="mt-0.5 truncate text-[13px] text-muted">{toast.detail}</p>}
            {toast.action && (
              <Link
                href={toast.action.href}
                onClick={() => setToast(null)}
                className="mt-2 inline-block text-[12px] font-medium tracking-[0.12em] text-maroon uppercase underline underline-offset-4"
              >
                {toast.action.label}
              </Link>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setToast(null)}
            className="-mr-1 -mt-1 grid h-7 w-7 place-items-center text-muted hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
