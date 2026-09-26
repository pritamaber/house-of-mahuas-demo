import "server-only";
import os from "node:os";
import path from "node:path";

/**
 * Where the local demo store keeps its files.
 * A deployed Vercel function can only write to /tmp, which is per-instance and short-lived —
 * fine to keep the site from crashing, but NOT a place to keep real orders. Use Supabase there.
 */
export const EPHEMERAL_FS = Boolean(process.env.VERCEL);

export const DATA_DIR = EPHEMERAL_FS ? path.join(os.tmpdir(), "mahuas-demo") : path.join(process.cwd(), "data");
export const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
