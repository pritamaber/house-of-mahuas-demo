@AGENTS.md

# House of Mahua's — saree store demo

Next.js 16 (App Router) + TypeScript + Tailwind 4. Read `README.md` for setup, features and the Supabase switch.
Next 16 differs from older versions — check `node_modules/next/dist/docs/` before using framework APIs.

## Conventions
- **One data interface.** All persistence goes through `lib/store` (`Store`). `file-store.ts` (local `data/db.json`,
  default) and `supabase-store.ts` (used when Supabase env vars exist) must stay behaviourally identical. Never import
  a store implementation directly from pages/components — use `getStore()` or the cached readers in `lib/data.ts`.
- **Never trust client prices.** Checkout re-prices from the store in `lib/services/orders.ts`.
- **Every admin page, server action and admin route handler calls `requireAdmin()`** (`lib/auth.ts`).
- Files with `"use server"` may only export async functions.
- Storefront is `force-dynamic` (`app/(shop)/layout.tsx`) so admin edits show immediately.
- Money is whole rupees (integers). Format with `formatINR`.
- Brand: House of Mahua's — maroon `#6d0f27`, gold, ivory; Cormorant Garamond + Jost. Design tokens live in `app/globals.css`.
- Placeholder art (`components/shop/saree-art.tsx`) renders whenever a product has no photo.

## Commands
`npm run dev` · `npm run typecheck` · `npm run lint` · `npm run build` · `npm run db:reset` (re-seed sample data)
