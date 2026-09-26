import { INDIAN_STATES } from "./config";

/** Pure validators — no server-only imports, so the checkout form and the server action share them. */

export interface CheckoutFields {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type FieldErrors = Partial<Record<keyof CheckoutFields | "paymentMethod" | "items", string>>;

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  // accept +91 / 91 / 0 prefixes
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function validateCheckout(f: CheckoutFields): FieldErrors {
  const e: FieldErrors = {};
  if (f.customerName.trim().length < 2) e.customerName = "Please enter your full name";
  if (!/^[6-9]\d{9}$/.test(normalizePhone(f.phone))) e.phone = "Enter a valid 10-digit mobile number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address";
  if (f.address.trim().length < 8) e.address = "Please enter your full delivery address";
  if (f.city.trim().length < 2) e.city = "Please enter your city";
  if (!(INDIAN_STATES as readonly string[]).includes(f.state)) e.state = "Please select your state";
  if (!/^[1-9]\d{5}$/.test(f.pincode.trim())) e.pincode = "Enter a valid 6-digit PIN code";
  return e;
}
