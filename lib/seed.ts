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
    name: "Royal Banarasi Katan Silk Saree",
    slug: "royal-banarasi-katan-silk-saree",
    description:
      "Handwoven Banarasi katan silk in deep maroon, with an antique-gold zari border and an ornate jaal pallu. A heirloom-weight drape for weddings, receptions and family functions that will be passed down for generations.",
    price: 11999,
    salePrice: 9999,
    category: "banarasi",
    fabric: "Banarasi Silk",
    color: "Maroon",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 4,
    featured: true,
    active: true,
    images: [],
    addedDaysAgo: 4,
  }),
  p({
    name: "Pure Kanjivaram Silk Saree",
    slug: "pure-kanjivaram-silk-saree",
    description:
      "Woven in pure mulberry silk with a traditional temple border and a contrast pallu, this emerald Kanjivaram carries the deep, glowing colour the weave is known for. Rich enough for a wedding, refined enough to wear again and again.",
    price: 10999,
    salePrice: 9499,
    category: "wedding",
    fabric: "Kanjivaram Silk",
    color: "Green",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 3,
    featured: true,
    active: true,
    images: [],
    addedDaysAgo: 7,
  }),
  p({
    name: "Bengal Handloom Cotton Tant Saree",
    slug: "bengal-handloom-cotton-tant-saree",
    description:
      "The everyday classic: a crisp, breathable handloom tant in ivory with a bold red border. Light on the skin, easy to drape and easy to care for — a wardrobe staple for Bengal's warm days and Puja mornings alike.",
    price: 1499,
    salePrice: null,
    category: "handloom",
    fabric: "Handloom Cotton",
    color: "Ivory",
    sareeLength: 5.5,
    blouseIncluded: false,
    stock: 25,
    featured: false,
    active: true,
    images: [],
    addedDaysAgo: 40,
  }),
  p({
    name: "Organza Floral Saree",
    slug: "organza-floral-saree",
    description:
      "Sheer, airy organza in blush pink with soft floral embroidery running through the body and a scalloped border. Feels weightless, photographs beautifully — ideal for day weddings, engagements and festive brunches.",
    price: 3299,
    salePrice: 2799,
    category: "festive",
    fabric: "Organza",
    color: "Pink",
    sareeLength: 5.5,
    blouseIncluded: true,
    stock: 9,
    featured: true,
    active: true,
    images: [],
    addedDaysAgo: 10,
  }),
  p({
    name: "Bridal Zari Woven Wedding Saree",
    slug: "bridal-zari-woven-wedding-saree",
    description:
      "A bridal red saree woven with rich gold zari butis and a broad gold border. The pallu is heavily brocaded, giving that unmistakable wedding-day glow. Includes an unstitched blouse piece with matching border.",
    price: 9499,
    salePrice: 7999,
    category: "wedding",
    fabric: "Silk Blend",
    color: "Red",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 5,
    featured: true,
    active: true,
    images: [],
    addedDaysAgo: 14,
  }),
  p({
    name: "Pure Linen Saree with Zari Border",
    slug: "pure-linen-saree-with-zari-border",
    description:
      "Textured pure linen in a warm sand tone with a fine zari border. Structured drape, natural crispness and a quiet elegance that suits offices, gallery openings and long summer lunches.",
    price: 2499,
    salePrice: 2199,
    category: "handloom",
    fabric: "Pure Linen",
    color: "Beige",
    sareeLength: 5.5,
    blouseIncluded: false,
    stock: 12,
    featured: false,
    active: true,
    images: [],
    addedDaysAgo: 22,
  }),
  p({
    name: "Tussar Silk Kantha Stitch Saree",
    slug: "tussar-silk-kantha-stitch-saree",
    description:
      "Naturally textured tussar silk in mustard, hand-embellished with traditional kantha running stitch by artisans in Bengal. Each piece varies slightly — that irregularity is the mark of handwork.",
    price: 6999,
    salePrice: 5999,
    category: "silk",
    fabric: "Tussar Silk",
    color: "Mustard",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 4,
    featured: true,
    active: true,
    images: [],
    addedDaysAgo: 18,
  }),
  p({
    name: "Chanderi Silk Saree",
    slug: "chanderi-silk-saree",
    description:
      "Featherlight Chanderi silk-cotton in peach with a delicate gold border and tiny woven butis. The sheer, glassy texture drapes beautifully and stays comfortable through long festive days.",
    price: 3799,
    salePrice: 3299,
    category: "festive",
    fabric: "Chanderi Silk",
    color: "Peach",
    sareeLength: 5.5,
    blouseIncluded: true,
    stock: 8,
    featured: false,
    active: true,
    images: [],
    addedDaysAgo: 26,
  }),
  p({
    name: "Dhakai Jamdani Saree",
    slug: "dhakai-jamdani-saree",
    description:
      "A finely woven Dhakai-style jamdani in teal with geometric motifs woven directly into the fabric, one thread at a time. Sheer, graceful and unmistakably Bengali — a saree that rewards a second look.",
    price: 4999,
    salePrice: null,
    category: "handloom",
    fabric: "Jamdani Cotton",
    color: "Teal",
    sareeLength: 5.5,
    blouseIncluded: false,
    stock: 7,
    featured: false,
    active: true,
    images: [],
    addedDaysAgo: 30,
  }),
  p({
    name: "Baluchari Silk Saree",
    slug: "baluchari-silk-saree",
    description:
      "Baluchari silk in royal blue, with the tradition's signature narrative panels woven into the pallu in gold. A collector's weave from Bishnupur, lovingly finished with a tasselled edge.",
    price: 8999,
    salePrice: 7999,
    category: "silk",
    fabric: "Baluchari Silk",
    color: "Blue",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 3,
    featured: true,
    active: true,
    images: [],
    addedDaysAgo: 34,
  }),
  p({
    name: "Murshidabad Silk Saree",
    slug: "murshidabad-silk-saree",
    description:
      "Smooth, supple Murshidabad silk in a deep purple with a slim contrast border. Elegant, lightweight and easy to carry — an heirloom-quality weave at a friendly price.",
    price: 5499,
    salePrice: null,
    category: "silk",
    fabric: "Murshidabad Silk",
    color: "Purple",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 0,
    featured: false,
    active: true,
    images: [],
    addedDaysAgo: 45,
  }),
  p({
    name: "Haldi Yellow Banarasi Georgette Saree",
    slug: "haldi-yellow-banarasi-georgette-saree",
    description:
      "Sunshine-yellow Banarasi georgette with woven zari florals and a soft, flowing fall. Perfect for haldi ceremonies, day functions and anyone who loves colour.",
    price: 6299,
    salePrice: 5299,
    category: "banarasi",
    fabric: "Georgette",
    color: "Yellow",
    sareeLength: 5.5,
    blouseIncluded: true,
    stock: 6,
    featured: true,
    active: true,
    images: [],
    addedDaysAgo: 16,
  }),
  p({
    name: "Temple Border Bridal Kanjivaram Saree",
    slug: "temple-border-bridal-kanjivaram-saree",
    description:
      "Our most opulent piece: pure Kanjivaram silk in antique gold with a wide temple border, peacock motifs and a fully brocaded pallu. Woven to be the centrepiece of the wedding day.",
    price: 12999,
    salePrice: null,
    category: "wedding",
    fabric: "Kanjivaram Silk",
    color: "Gold",
    sareeLength: 6.3,
    blouseIncluded: true,
    stock: 2,
    featured: false,
    active: true,
    images: [],
    addedDaysAgo: 3,
  }),
  p({
    name: "Cotton Silk Ikat Saree",
    slug: "cotton-silk-ikat-saree",
    description:
      "Vibrant orange cotton-silk with a hand-tied ikat pattern and a contrast border. Soft, easy to wear and lightly lustrous — a colourful everyday-to-festive option.",
    price: 2899,
    salePrice: 2499,
    category: "handloom",
    fabric: "Cotton Silk",
    color: "Orange",
    sareeLength: 5.5,
    blouseIncluded: true,
    stock: 10,
    featured: false,
    active: true,
    images: [],
    addedDaysAgo: 20,
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
    lines: [{ slug: "dhakai-jamdani-saree", quantity: 1 }],
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
    lines: [{ slug: "cotton-silk-ikat-saree", quantity: 1 }],
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
    lines: [{ slug: "royal-banarasi-katan-silk-saree", quantity: 1 }],
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
      { slug: "pure-kanjivaram-silk-saree", quantity: 1 },
      { slug: "chanderi-silk-saree", quantity: 1 },
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
    lines: [{ slug: "bengal-handloom-cotton-tant-saree", quantity: 2 }],
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
    lines: [{ slug: "bengal-handloom-cotton-tant-saree", quantity: 1 }],
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
