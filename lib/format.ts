import { SHIPPING } from "./config";
import type { Product } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  return inr.format(amount);
}

export function effectivePrice(p: Pick<Product, "price" | "salePrice">): number {
  return p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
}

export function hasDiscount(p: Pick<Product, "price" | "salePrice">): boolean {
  return p.salePrice != null && p.salePrice < p.price;
}

export function discountPercent(p: Pick<Product, "price" | "salePrice">): number {
  if (!hasDiscount(p)) return 0;
  return Math.round(((p.price - (p.salePrice as number)) / p.price) * 100);
}

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= SHIPPING.freeAbove ? 0 : SHIPPING.fee;
}

// Always show India time, whatever timezone the server runs in (Vercel runs in UTC).
const TZ = "Asia/Kolkata";
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
const IST_OFFSET_MS = 5.5 * 3_600_000;
const istDay = (d: Date) => Math.floor((d.getTime() + IST_OFFSET_MS) / 86_400_000);

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** "Today, 3:42 pm" / "Yesterday" / "12 Sep 2026" */
export function formatDateRelative(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const diffDays = istDay(now) - istDay(d);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return dateFmt.format(d);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${dateFmt.format(d)}, ${timeFmt.format(d).toLowerCase()}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatMetres(m: number): string {
  return `${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, "")} m`;
}
