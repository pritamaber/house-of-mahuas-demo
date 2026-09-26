export const SITE = {
  name: "House of Mahua's",
  tagline: "Weaves of Tradition, Worn with Pride",
  description:
    "Curated Banarasi, Kanjivaram, Tussar, Jamdani and handloom sarees for weddings, festivals and everyday celebrations. Delivered across India.",
  currency: "INR",
  // Set these in .env.local — see .env.example
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
} as const;

export const SHIPPING = {
  fee: 99,
  freeAbove: 2000,
} as const;

export const CATEGORIES = [
  { key: "wedding", label: "Wedding Sarees", short: "Wedding", blurb: "Bridal drapes and heirloom weaves" },
  { key: "silk", label: "Silk Sarees", short: "Silk", blurb: "Tussar, Baluchari and Murshidabad silks" },
  { key: "banarasi", label: "Banarasi Sarees", short: "Banarasi", blurb: "Zari-rich weaves from Varanasi" },
  { key: "handloom", label: "Handloom Sarees", short: "Handloom", blurb: "Breathable cotton, linen and jamdani" },
  { key: "festive", label: "Festive Sarees", short: "Festive", blurb: "Light, lustrous drapes for celebrations" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export const ORDER_STATUSES = ["New", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
export const PAYMENT_METHODS = ["COD", "Online"] as const;
export const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"] as const;

export const FABRIC_SUGGESTIONS = [
  "Banarasi Silk",
  "Kanjivaram Silk",
  "Katan Soft Silk",
  "Tussar Silk",
  "Chanderi Silk",
  "Baluchari Silk",
  "Murshidabad Silk",
  "Organza",
  "Georgette",
  "Pure Linen",
  "Handloom Cotton",
  "Jamdani Cotton",
  "Cotton Silk",
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

/** wa.me link. Without a configured number, WhatsApp lets the visitor pick a chat. */
export function whatsappLink(message?: string): string {
  const base = SITE.whatsappNumber ? `https://wa.me/${SITE.whatsappNumber}` : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
