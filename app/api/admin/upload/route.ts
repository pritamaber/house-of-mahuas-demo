import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdmin } from "@/lib/auth";
import { storeImage } from "@/lib/storage";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * Admin-only image upload. Phone photos are large, so each image is auto-rotated,
 * resized to fit within 1800×2400 and re-encoded as WebP before it's stored.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG or WebP image." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 12 MB." }, { status: 413 });
  }

  try {
    const optimized = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1800, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();
    const url = await storeImage(optimized, "webp", "image/webp");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Image upload failed", err);
    return NextResponse.json({ error: "That file couldn't be processed as an image." }, { status: 422 });
  }
}
