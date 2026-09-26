import type { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "./config";

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** MRP in whole rupees */
  price: number;
  /** Selling price when discounted, in whole rupees */
  salePrice: number | null;
  category: string;
  fabric: string;
  color: string;
  /** metres */
  sareeLength: number;
  blouseIncluded: boolean;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  images: ProductImage[];
}

/** Fields an admin can edit. `images` is the ordered list of image URLs. */
export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  category: string;
  fabric: string;
  color: string;
  sareeLength: number;
  blouseIncluded: boolean;
  stock: number;
  featured: boolean;
  active: boolean;
  images: string[];
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface NewOrderRecord {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: Omit<OrderItem, "id">[];
  /** Only used when seeding demo data. */
  orderNumber?: string;
  createdAt?: string;
}
