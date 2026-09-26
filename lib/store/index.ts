import "server-only";
import { fileStore } from "./file-store";
import { createSupabaseStore } from "./supabase-store";
import type { Store } from "./types";

export { StoreError } from "./types";
export type { Store } from "./types";

const g = globalThis as unknown as { __mahuaSupabase?: Store };

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Wiping a real Supabase database from the admin UI has to be opted into. */
export function demoResetAllowed(): boolean {
  return !supabaseConfigured() || process.env.ALLOW_DEMO_RESET === "true";
}

/** Supabase when its env vars are set, otherwise the local JSON demo store. */
export function getStore(): Store {
  if (supabaseConfigured()) {
    g.__mahuaSupabase ??= createSupabaseStore(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
    return g.__mahuaSupabase;
  }
  return fileStore;
}
