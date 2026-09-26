import { effectivePrice, shippingFor } from "./format";
import type { NewOrderRecord, OrderStatus, PaymentMethod, PaymentStatus, ProductInput } from "./types";

/**
 * Demo catalogue + sample orders. Both stores (local JSON and Supabase) are seeded from here.
 *
 * ── Adding your own photos ──────────────────────────────────────────────
 * Drop a file into `public/images/sarees/` and list it in `images` below
 * (e.g. "/images/sarees/royal-banarasi.jpg"), then run `npm run db:reset`.
 * Or upload from Admin → Products → Edit — no code needed.
 * Sarees without a photo show a generated placeholder.
 */

export interface SeedProduct extends ProductInput {
  /** days before "now" that this product was added — drives the "Newest" sort */
  addedDaysAgo: number;
}

const p = (x: SeedProduct): SeedProduct => x;

export const SEED_PRODUCTS: SeedProduct[] = [
  p({
    name: "Nabami Night Katan Soft Silk Saree",
    slug: "nabami-night-katan-soft-silk-saree",
    description:
      "A midnight-black soft silk drape scattered with jewel-toned leaf motifs in magenta, teal and amber, finished with a deep violet border. Fluid, lightweight and lustrous — made for pandal-hopping evenings and festive dinners. Comes with a matching running blouse piece.",
    price: 6499,
    salePrice: 5499,
    category: "festive",
    fabric: "Katan Soft Silk",
    color: "Black",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 6,
    featured: true,
    active: true,
    images: ["/images/sarees/nabami-night-soft-silk.jpg"],
    addedDaysAgo: 1,
  }),
  p({
    name: "Violet Silver-Zari Banarasi Silk Saree",
    slug: "violet-silver-zari-banarasi-silk-saree",
    description:
      "A rich violet silk with a lustrous sheen, edged with a broad silver-zari border. Rose and coral floral motifs are woven through the body and gather into a richly patterned pallu. A regal choice for weddings, receptions and Puja evenings.",
    price: 11999,
    salePrice: 9999,
    category: "banarasi",
    fabric: "Banarasi Silk",
    color: "Purple",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 4,
    featured: true,
    active: true,
    images: [
      "/images/sarees/violet-silver-zari-banarasi-silk-saree.webp",
      "/images/sarees/violet-silver-zari-banarasi-silk-saree-2.webp",
      "/images/sarees/violet-silver-zari-banarasi-silk-saree-3.webp",
      "/images/sarees/violet-silver-zari-banarasi-silk-saree-4.webp",
    ],
    addedDaysAgo: 2,
  }),
  p({
    name: "Plum Paisley Jaal Banarasi Silk Saree",
    slug: "plum-paisley-jaal-banarasi-silk-saree",
    description:
      "Deep plum-magenta silk with a shimmering silver-zari jaal of paisleys and florals across the pallu, and delicate butis scattered over the body. It drapes beautifully and catches the light with every movement.",
    price: 10999,
    salePrice: 9499,
    category: "banarasi",
    fabric: "Banarasi Silk",
    color: "Plum",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 3,
    featured: true,
    active: true,
    images: [
      "/images/sarees/plum-paisley-jaal-banarasi-silk-saree.webp",
      "/images/sarees/plum-paisley-jaal-banarasi-silk-saree-2.webp",
      "/images/sarees/plum-paisley-jaal-banarasi-silk-saree-3.webp",
      "/images/sarees/plum-paisley-jaal-banarasi-silk-saree-4.webp",
    ],
    addedDaysAgo: 3,
  }),
  p({
    name: "Bottle Green Banarasi Saree with Red Paisley Pallu",
    slug: "bottle-green-banarasi-red-pallu-saree",
    description:
      "Bottle-green silk scattered with tiny gold butis, paired with a contrasting deep red pallu woven in gold paisleys and vines. The green-and-red pairing is a classic for weddings and pujas.",
    price: 12999,
    salePrice: null,
    category: "wedding",
    fabric: "Banarasi Silk",
    color: "Green",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 2,
    featured: true,
    active: true,
    images: [
      "/images/sarees/bottle-green-banarasi-red-pallu-saree.webp",
      "/images/sarees/bottle-green-banarasi-red-pallu-saree-2.webp",
      "/images/sarees/bottle-green-banarasi-red-pallu-saree-3.webp",
    ],
    addedDaysAgo: 4,
  }),
  p({
    name: "Lilac Tissue Silk Saree with Aqua Pallu",
    slug: "lilac-tissue-silk-saree-aqua-pallu",
    description:
      "Shimmering lilac tissue silk with a delicate woven texture, finished with a contrast pallu in aqua and orchid pink. Light, luminous and easy to drape — lovely for day weddings and festive gatherings.",
    price: 8999,
    salePrice: 7999,
    category: "wedding",
    fabric: "Tissue Silk",
    color: "Lilac",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 6,
    featured: true,
    active: true,
    images: [
      "/images/sarees/lilac-tissue-silk-saree-aqua-pallu.webp",
      "/images/sarees/lilac-tissue-silk-saree-aqua-pallu-2.webp",
      "/images/sarees/lilac-tissue-silk-saree-aqua-pallu-3.webp",
      "/images/sarees/lilac-tissue-silk-saree-aqua-pallu-4.webp",
      "/images/sarees/lilac-tissue-silk-saree-aqua-pallu-5.webp",
      "/images/sarees/lilac-tissue-silk-saree-aqua-pallu-6.webp",
    ],
    addedDaysAgo: 6,
  }),
  p({
    name: "Lilac Tussar Handloom Silk Saree",
    slug: "lilac-tussar-handloom-silk-saree",
    description:
      "Handloom tussar silk in soft lilac with woven and embroidered motifs across the body and a rich purple border with a tasselled edge. Tussar's natural texture gives it a lovely, lived-in drape.",
    price: 6999,
    salePrice: 5999,
    category: "handloom",
    fabric: "Tussar Handloom Silk",
    color: "Lilac",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 7,
    featured: true,
    active: true,
    images: [
      "/images/sarees/lilac-tussar-handloom-silk-saree.webp",
      "/images/sarees/lilac-tussar-handloom-silk-saree-2.webp",
      "/images/sarees/lilac-tussar-handloom-silk-saree-3.webp",
    ],
    addedDaysAgo: 8,
  }),
  p({
    name: "Mustard Batik Print Silk Saree",
    slug: "mustard-batik-print-silk-saree",
    description:
      "Vibrant mustard-yellow silk with bold white batik-style motifs. Cheerful and easy to style — from Puja mornings to casual celebrations.",
    price: 5499,
    salePrice: 4999,
    category: "silk",
    fabric: "Batik Silk",
    color: "Mustard",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 8,
    featured: true,
    active: true,
    images: [
      "/images/sarees/mustard-batik-print-silk-saree.webp",
      "/images/sarees/mustard-batik-print-silk-saree-2.webp",
      "/images/sarees/mustard-batik-print-silk-saree-3.webp",
    ],
    addedDaysAgo: 10,
  }),
  p({
    name: "Coral Bishnupuri Silk Saree",
    slug: "coral-bishnupuri-silk-saree",
    description:
      "Coral-pink silk in the Bishnupuri style, with a broad gold border and a striking pallu of lime-green and marigold stripes with woven motifs. Bright, celebratory and unmistakably Bengali.",
    price: 8999,
    salePrice: 7999,
    category: "silk",
    fabric: "Bishnupuri Silk",
    color: "Coral",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 5,
    featured: true,
    active: true,
    images: [
      "/images/sarees/coral-bishnupuri-silk-saree.webp",
      "/images/sarees/coral-bishnupuri-silk-saree-2.webp",
    ],
    addedDaysAgo: 12,
  }),
  p({
    name: "Wine Brocade Banarasi Saree with Silver Border",
    slug: "wine-brocade-banarasi-saree",
    description:
      "A wine-coloured brocade with a fine all-over woven pattern, finished with a wide silver and copper border and a matching pallu. Formal, timeless and made to be noticed.",
    price: 8499,
    salePrice: 7499,
    category: "banarasi",
    fabric: "Banarasi Brocade",
    color: "Maroon",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 5,
    featured: false,
    active: true,
    images: ["/images/sarees/wine-brocade-banarasi-saree.webp"],
    addedDaysAgo: 14,
  }),
  p({
    name: "Olive Gold Silk Saree with Black Border",
    slug: "olive-gold-silk-saree-black-border",
    description:
      "Olive-gold silk with a deep black border and pallu woven with gold motifs, finished with tassels. Distinctive, rich and unexpectedly modern.",
    price: 10499,
    salePrice: 8999,
    category: "wedding",
    fabric: "Silk",
    color: "Olive",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 3,
    featured: false,
    active: true,
    images: [
      "/images/sarees/olive-gold-silk-saree-black-border.webp",
      "/images/sarees/olive-gold-silk-saree-black-border-2.webp",
    ],
    addedDaysAgo: 16,
  }),
  p({
    name: "Marigold Silk Saree with Sky-Blue Border",
    slug: "marigold-silk-saree-sky-blue-border",
    description:
      "Rich marigold silk with a sky-blue and gold border woven with figurative panels. A warm, festive colour combination that stands out beautifully.",
    price: 7499,
    salePrice: 6499,
    category: "silk",
    fabric: "Silk",
    color: "Marigold",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 4,
    featured: false,
    active: true,
    images: ["/images/sarees/marigold-silk-saree-sky-blue-border.webp"],
    addedDaysAgo: 19,
  }),
  p({
    name: "Mauve Embroidered Silk Saree",
    slug: "mauve-embroidered-silk-saree",
    description:
      "Dusty mauve silk with delicate white embroidered paisleys and florals cascading down the pallu. Soft, understated and elegant.",
    price: 3499,
    salePrice: 2999,
    category: "festive",
    fabric: "Embroidered Silk",
    color: "Mauve",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 6,
    featured: false,
    active: true,
    images: [
      "/images/sarees/mauve-embroidered-silk-saree.webp",
      "/images/sarees/mauve-embroidered-silk-saree-2.webp",
    ],
    addedDaysAgo: 22,
  }),
  p({
    name: "Crimson Puja Silk Saree",
    slug: "crimson-puja-silk-saree",
    description:
      "Rich crimson silk with a deep green-black border and pallu, from our Durga Puja collection. A bold, expressive drape for the festive season.",
    price: 6499,
    salePrice: 5499,
    category: "festive",
    fabric: "Silk",
    color: "Red",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 0,
    featured: false,
    active: true,
    images: ["/images/sarees/crimson-puja-silk-saree.webp"],
    addedDaysAgo: 25,
  }),
  p({
    name: "Golden Yellow Silk Saree with Red Border",
    slug: "golden-yellow-silk-saree-red-border",
    description:
      "Glowing golden-yellow silk with a rich red and gold woven border — a festive favourite for Sashthi and Pujo celebrations.",
    price: 4499,
    salePrice: 3799,
    category: "festive",
    fabric: "Silk",
    color: "Yellow",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 5,
    featured: false,
    active: true,
    images: ["/images/sarees/golden-yellow-silk-saree-red-border.webp"],
    addedDaysAgo: 28,
  }),
  p({
    name: "Ivory Laal Paar Silk Saree",
    slug: "ivory-laal-paar-silk-saree",
    description:
      "The classic Bengal Puja combination: ivory silk with a bright red border, made for Ashtami mornings and dhunuchi nights.",
    price: 3299,
    salePrice: 2499,
    category: "festive",
    fabric: "Silk",
    color: "Ivory",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 9,
    featured: false,
    active: true,
    images: ["/images/sarees/ivory-laal-paar-silk-saree.webp"],
    addedDaysAgo: 30,
  }),
  p({
    name: "Rose Floral Cotton Silk Saree",
    slug: "rose-floral-cotton-silk-saree",
    description:
      "A light cream saree patterned with rose-pink florals and finished with a striped pallu. Soft, breezy and easy to carry — a pretty everyday-to-festive choice.",
    price: 1999,
    salePrice: 1499,
    category: "handloom",
    fabric: "Cotton Silk",
    color: "Pink",
    sareeLength: 5.5,
    blouseIncluded: false,
    stock: 12,
    featured: false,
    active: true,
    images: ["/images/sarees/rose-floral-cotton-silk-saree.webp"],
    addedDaysAgo: 34,
  }),
];

// ── Sample orders ────────────────────────────────────────────────────────

export interface SeedOrder {
  orderNumber: string;
  hoursAgo: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  lines: { slug: string; quantity: number }[];
}

export const SEED_ORDERS: SeedOrder[] = [
  {
    orderNumber: "ORD-1024",
    hoursAgo: 2,
    customerName: "Priya Sharma",
    phone: "9876543210",
    email: "priya.sharma@example.com",
    address: "Flat 4B, Sunrise Apartments, 12 Lake Road, Ballygunge",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700019",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    orderStatus: "New",
    lines: [{ slug: "mustard-batik-print-silk-saree", quantity: 1 }],
  },
  {
    orderNumber: "ORD-1023",
    hoursAgo: 5,
    customerName: "Ananya Das",
    phone: "9876543211",
    email: "ananya.das@example.com",
    address: "House 18, Sundarpur Path, Zoo Road",
    city: "Guwahati",
    state: "Assam",
    pincode: "781005",
    paymentMethod: "Online",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    lines: [{ slug: "ivory-laal-paar-silk-saree", quantity: 1 }],
  },
  {
    orderNumber: "ORD-1022",
    hoursAgo: 28,
    customerName: "Ritika Banerjee",
    phone: "9876543212",
    email: "ritika.banerjee@example.com",
    address: "302, Prestige Meadows, Whitefield Main Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560066",
    paymentMethod: "Online",
    paymentStatus: "Paid",
    orderStatus: "Confirmed",
    lines: [{ slug: "violet-silver-zari-banarasi-silk-saree", quantity: 1 }],
  },
  {
    orderNumber: "ORD-1021",
    hoursAgo: 52,
    customerName: "Meenakshi Iyer",
    phone: "9876543213",
    email: "meenakshi.iyer@example.com",
    address: "27, Second Cross Street, Mylapore",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600004",
    paymentMethod: "Online",
    paymentStatus: "Paid",
    orderStatus: "Processing",
    lines: [
      { slug: "plum-paisley-jaal-banarasi-silk-saree", quantity: 1 },
      { slug: "mauve-embroidered-silk-saree", quantity: 1 },
    ],
  },
  {
    orderNumber: "ORD-1020",
    hoursAgo: 150,
    customerName: "Sneha Kulkarni",
    phone: "9876543214",
    email: "sneha.kulkarni@example.com",
    address: "B-12, Kalyani Nagar Society, Off Nagar Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411006",
    paymentMethod: "COD",
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    lines: [{ slug: "rose-floral-cotton-silk-saree", quantity: 2 }],
  },
  {
    orderNumber: "ORD-1019",
    hoursAgo: 200,
    customerName: "Farhana Sheikh",
    phone: "9876543215",
    email: "farhana.sheikh@example.com",
    address: "8-2-120, Road No. 3, Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500034",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    orderStatus: "Cancelled",
    lines: [{ slug: "rose-floral-cotton-silk-saree", quantity: 1 }],
  },
];

// ── Helpers shared by both stores ────────────────────────────────────────

export function seedTimestamps(now = Date.now()) {
  return {
    productCreatedAt: (p: SeedProduct) => new Date(now - p.addedDaysAgo * 86_400_000).toISOString(),
    orderCreatedAt: (o: SeedOrder) => new Date(now - o.hoursAgo * 3_600_000).toISOString(),
  };
}

/** Turns a seed order into an insertable record, pricing from the given slug → product map. */
export function buildSeedOrderRecord(
  o: SeedOrder,
  productsBySlug: Map<string, { id: string; name: string; price: number; salePrice: number | null }>,
  createdAt: string,
): NewOrderRecord {
  const items = o.lines.map((line) => {
    const prod = productsBySlug.get(line.slug);
    if (!prod) throw new Error(`Seed order ${o.orderNumber} references unknown product ${line.slug}`);
    const price = effectivePrice(prod);
    return {
      productId: prod.id,
      productName: prod.name,
      quantity: line.quantity,
      price,
      subtotal: price * line.quantity,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const shipping = shippingFor(subtotal);
  return {
    customerName: o.customerName,
    phone: o.phone,
    email: o.email,
    address: o.address,
    city: o.city,
    state: o.state,
    pincode: o.pincode,
    subtotal,
    shipping,
    total: subtotal + shipping,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    items,
    orderNumber: o.orderNumber,
    createdAt,
  };
}
