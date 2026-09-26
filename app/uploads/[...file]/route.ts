import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

/** Serves images uploaded through the admin panel when running without Supabase Storage. */
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...file]">) {
  const { file } = await ctx.params;
  const name = path.basename(file.join("/")); // basename blocks ../ traversal
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type || !/^[\w.-]+$/.test(name)) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        // filenames are unique per upload, so they can be cached forever
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
