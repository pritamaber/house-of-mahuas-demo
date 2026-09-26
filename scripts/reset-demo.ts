/**
 * Wipes the active database (local JSON demo store, or Supabase when its keys are set)
 * and re-seeds the sample sarees and orders from lib/seed.ts.
 *
 *   npm run db:reset
 */
import { getStore } from "../lib/store";

async function main() {
  const store = getStore();

  if (store.kind === "supabase" && process.env.ALLOW_DEMO_RESET !== "true") {
    console.error(
      "\nThis will DELETE every product and order in your Supabase project.\n" +
        "If that's what you want, re-run with ALLOW_DEMO_RESET=true set.\n",
    );
    process.exit(1);
  }

  console.log(`Resetting the ${store.kind === "supabase" ? "Supabase" : "local demo"} database…`);
  await store.reset();
  const [products, orders] = await Promise.all([store.listProducts(), store.listOrders()]);
  console.log(`Done — ${products.length} sarees and ${orders.length} orders loaded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
