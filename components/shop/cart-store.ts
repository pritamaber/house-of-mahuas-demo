/**
 * The cart lives in the browser (localStorage) as a tiny external store, read with useSyncExternalStore.
 * Reads are synchronous and always current, and other tabs stay in sync through the `storage` event.
 */

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  /** current selling price (sale price if discounted) */
  price: number;
  mrp: number;
  image: string | null;
  fabric: string;
  color: string;
  quantity: number;
  /** stock at the time it was added / last synced */
  stock: number;
}

const STORAGE_KEY = "mahuas-cart-v1";
export const MAX_QTY = 10;

export const EMPTY_CART: CartLine[] = [];

const listeners = new Set<() => void>();
let memoryLines: CartLine[] = EMPTY_CART; // fallback when localStorage is unavailable (private mode, etc.)
let cachedRaw: string | null | undefined;
let cachedLines: CartLine[] = EMPTY_CART;

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY_CART;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_CART;
    return parsed.filter(
      (l): l is CartLine =>
        Boolean(l) && typeof l.productId === "string" && typeof l.price === "number" && Number.isInteger(l.quantity) && l.quantity > 0,
    );
  } catch {
    return EMPTY_CART;
  }
}

/** Stable snapshot: returns the same array reference until the stored cart actually changes. */
export function getCartSnapshot(): CartLine[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryLines;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parse(raw);
  }
  return cachedLines;
}

export function getServerCartSnapshot(): CartLine[] {
  return EMPTY_CART;
}

export function setCartLines(next: CartLine[]): void {
  memoryLines = next;
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedLines = next;
  } catch {
    cachedRaw = undefined; // force a re-read next time
  }
  listeners.forEach((l) => l());
}

export function subscribeCart(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export const subscribeNever = () => () => {};
export const trueOnClient = () => true;
export const falseOnServer = () => false;
