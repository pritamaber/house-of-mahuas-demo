import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./store";

/**
 * Product image storage.
 *  - Local demo: files go to ./data/uploads and are served by app/uploads/[...file]/route.ts
 *  - Supabase configured: files go to the public Storage bucket and the public URL is returned
 * Callers only ever deal in URL strings, so switching backends needs no other change.
 */

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

function supabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function storeImage(data: Buffer, ext = "webp", contentType = "image/webp"): Promise<string> {
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  if (supabaseConfigured()) {
    const client = supabase();
    const { error } = await client.storage.from(BUCKET).upload(name, data, { contentType, upsert: false });
    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
    return client.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), data);
  return `/uploads/${name}`;
}

/** Deletes an image we uploaded. Never touches files you placed in /public yourself. Best-effort. */
export async function removeStoredImage(url: string): Promise<void> {
  try {
    if (url.startsWith("/uploads/")) {
      const file = path.basename(url);
      await fs.rm(path.join(UPLOAD_DIR, file), { force: true });
      return;
    }
    if (supabaseConfigured()) {
      const marker = `/storage/v1/object/public/${BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx >= 0) await supabase().storage.from(BUCKET).remove([decodeURIComponent(url.slice(idx + marker.length))]);
    }
  } catch {
    // orphaned files are harmless
  }
}

export function isManagedUpload(url: string): boolean {
  return url.startsWith("/uploads/") || url.includes(`/storage/v1/object/public/${BUCKET}/`);
}
