# House of Mahua's — saree store demo

A working saree e-commerce demo: a boutique storefront for customers and an admin panel for the shop owner.
Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and — optionally — Supabase.

```bash
npm install
npm run dev        # http://localhost:3000
```

It works immediately, with no accounts or keys: it ships with 15 sample sarees and 6 sample orders, and stores
everything in a local file (`data/db.json`).

| | |
|---|---|
| Storefront | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin |
| Demo admin login | `admin@mahuas.demo` / `mahua123` (the login page has a **Fill demo login** button) |

## What's in it

**Customer:** homepage → `/sarees` (filters: category, price, colour, fabric, availability; sorting; search) →
`/product/[slug]` (gallery, quantity, Add to Cart, Buy Now, similar sarees) → `/cart` → `/checkout` (COD or a
Razorpay placeholder) → `/order/[id]` confirmation with a WhatsApp button. The cart lives in the browser; no
customer accounts.

**Admin:** dashboard (live stats + recent orders) · products (add / edit / delete / activate, multi-image upload,
reorder, choose the main photo) · orders (status tabs, search, detail page, update order & payment status, message
the customer on WhatsApp) · settings.

Shipping is ₹99, free on orders of ₹2,000 and above (`lib/config.ts`).

## Adding your saree photos

Sarees without a photo show a generated placeholder, so the store always looks complete. Three ways to add photos:

1. **Admin panel (easiest).** `/admin/products` → Edit → drag photos into the *Photos* box → Save. Photos are
   resized and converted to WebP automatically. The first photo is the main one.
2. **Copy files into the project.** Put `my-saree.jpg` in `public/images/sarees/`, then in the product's *Photos*
   box use **Add by path** → `/images/sarees/my-saree.jpg`.
3. **Change the seed data.** List the file under `images` in `lib/seed.ts`, then `npm run db:reset`.

Tips: portrait photos (4:5 or 3:4) look best; product cards crop to 4:5. Photos with text or logos baked into them
(like campaign posters) work as the homepage hero but make weaker product shots.

## Switching to Supabase

The app uses the local file until Supabase keys are present, then switches automatically — no code changes.

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste `supabase/schema.sql` → Run. (This also creates a public `product-images` storage bucket.)
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   (Settings → API). The service-role key is used **server-side only** — never expose it in client code.
4. Optional: `ALLOW_DEMO_RESET=true npm run db:reset` loads the sample sarees and orders into Supabase.
5. Restart `npm run dev`. Admin → Settings shows which backend is active.

> The Supabase code path is written against the schema above but has not been run against a live project yet —
> please give it a quick test (create a product, place an order) before relying on it.

## Before you share it

Set these in `.env.local` (see `.env.example`):

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SECRET` — otherwise the published demo login still works.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits with country code, e.g. `919876543210`) — powers every WhatsApp button.
- `NEXT_PUBLIC_INSTAGRAM_URL`, and optionally `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_CONTACT_PHONE`.
- Replace the sample copy on the About / Shipping / Returns pages (`app/(shop)/[slug]/page.tsx`) with your real terms.

## Not built (on purpose)

Customer accounts, reviews, wishlists, coupons, multi-vendor, and real payments. Online Payment records the order as
*Pending* and shows "Razorpay payment integration will be connected here." Order emails/notifications aren't sent.
Stock is a simple counter: it drops when an order is placed and returns if the order is cancelled.

## Project layout

```
app/(shop)/…          storefront pages          app/admin/…        admin (login + panel)
app/api/admin/upload  image upload endpoint     app/uploads/…      serves locally uploaded images
components/shop|admin UI                         lib/store/         file + Supabase stores (one interface)
lib/actions/          server actions             lib/services/      order placement & status logic
lib/seed.ts           demo catalogue + orders    supabase/schema.sql database schema
```

Useful commands: `npm run typecheck` · `npm run lint` · `npm run build` · `npm run db:reset` (restore sample data).
