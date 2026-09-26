import "server-only";
import { EPHEMERAL_FS } from "../paths";
import { fileStore } from "./file-store";
import { createSupabaseStore } from "./supabase-store";
import type { Store } from "./types";

export { StoreError } from "./types";
export type { Store } from "./types";

const g = globalThis as unknown as { __mahuaSupabase?: Store };

/** Supabase credentials, if configured. Accepts SUPABASE_URL as well as the NEXT_PUBLIC_ name. */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function supabaseConfigured(): boolean {
  return supabaseEnv() !== null;
}

/** Wiping a real Supabase database from the admin UI has to be opted into. */
export function demoResetAllowed(): boolean {
  return !supabaseConfigured() || process.env.ALLOW_DEMO_RESET === "true";
}

/**
 * Non-null when data would be lost: deployed to Vercel with no database configured, so orders and
 * edits only live in one short-lived server instance.
 */
export function persistenceWarning(): string | null {
  if (EPHEMERAL_FS && !supabaseConfigured()) {
    return "This site isn't connected to a database yet, so orders, products and photos are only stored temporarily and can vanish at any time. Connect Supabase to save them permanently (see the README).";
  }
  return null;
}

/** Supabase when its env vars are set, otherwise the local JSON demo store. */
export function getStore(): Store {
  const env = supabaseEnv();
  if (env) {
    g.__mahuaSupabase ??= createSupabaseStore(env.url, env.key);
    return g.__mahuaSupabase;
  }
  return fileStore;
}
