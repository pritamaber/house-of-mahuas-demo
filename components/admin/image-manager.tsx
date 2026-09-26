"use client";

import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Star, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/format";

const MAX_IMAGES = 10;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/**
 * Ordered list of product photos. Uploads go to /api/admin/upload, which stores them (local disk for the
 * demo, Supabase Storage when configured) and returns a URL — so the form only ever holds URL strings.
 */
export function ImageManager({
  images,
  onChange,
  error,
}: {
  images: string[];
  /** Functional updates, so overlapping uploads / removals never overwrite each other. */
  onChange: (update: (prev: string[]) => string[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [problems, setProblems] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setProblems([`You can add up to ${MAX_IMAGES} images.`]);
      return;
    }
    const batch = list.slice(0, room);
    const errs: string[] = list.length > room ? [`Only the first ${room} image(s) were added (limit ${MAX_IMAGES}).`] : [];
    setProblems([]);
    setUploading((n) => n + batch.length);

    for (const file of batch) {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
        const url = data.url;
        onChange((prev) => (prev.includes(url) ? prev : [...prev, url].slice(0, MAX_IMAGES)));
      } catch (e) {
        errs.push(`${file.name}: ${e instanceof Error ? e.message : "Upload failed"}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    setProblems(errs);
    if (inputRef.current) inputRef.current.value = "";
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(() => next);
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^(\/images\/|\/uploads\/|https:\/\/)/.test(url)) {
      setUrlError("Use a path like /images/sarees/my-saree.jpg, or an https:// link.");
      return;
    }
    if (images.includes(url)) {
      setUrlError("That image is already added.");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setUrlError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    setUrlError(null);
    setUrlDraft("");
    onChange((prev) => [...prev, url]);
  };

  return (
    <div>
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5" aria-label="Product images">
          {images.map((url, i) => (
            <li key={url} className="group relative">
              <div className={cn("relative aspect-[4/5] overflow-hidden border bg-cream", i === 0 ? "border-maroon ring-1 ring-maroon" : "border-line")}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin previews accept any URL */}
                <img src={url} alt={`Product image ${i + 1}`} className="h-full w-full object-cover object-[50%_25%]" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 bg-maroon px-1.5 py-0.5 text-[10px] tracking-wider text-ivory uppercase">
                    <Star size={10} fill="currentColor" /> Main
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove image ${i + 1}`}
                  onClick={() => onChange((prev) => prev.filter((u) => u !== url))}
                  className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center bg-ink/75 text-ivory transition-colors hover:bg-danger"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, i - 1)} className="grid h-7 w-7 place-items-center border border-line bg-white hover:border-maroon disabled:opacity-30">
                  <ArrowLeft size={13} />
                </button>
                {i > 0 && (
                  <button type="button" onClick={() => move(i, 0)} className="text-[11px] text-muted underline underline-offset-2 hover:text-maroon">
                    Make main
                  </button>
                )}
                <button type="button" aria-label="Move later" disabled={i === images.length - 1} onClick={() => move(i, i + 1)} className="grid h-7 w-7 place-items-center border border-line bg-white hover:border-maroon disabled:opacity-30">
                  <ArrowRight size={13} />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <li key={`up-${i}`} className="grid aspect-[4/5] place-items-center border border-dashed border-line bg-cream" aria-label="Uploading">
              <LoaderCircle className="animate-spin text-maroon" size={22} />
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mt-4 flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center transition-colors",
          dragging ? "border-maroon bg-maroon-soft" : "border-[#d3c3a8] bg-ivory",
          images.length === 0 && uploading === 0 && "mt-0 py-12",
        )}
      >
        <ImagePlus size={26} strokeWidth={1.4} className="text-maroon" />
        <p className="text-[14.5px]">
          Drag photos here or{" "}
          <button type="button" onClick={() => inputRef.current?.click()} className="font-medium text-maroon underline underline-offset-4">
            browse your device
          </button>
        </p>
        <p className="text-[12.5px] text-muted">JPG, PNG or WebP · up to 12 MB each · the first photo is the main one</p>
        <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => e.target.files && void uploadFiles(e.target.files)} />
      </div>

      {(problems.length > 0 || error) && (
        <ul className="mt-3 space-y-1 text-[13px] text-danger" role="alert">
          {error && <li>{error}</li>}
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        <label htmlFor="image-url" className="label">
          Or add by path / link
        </label>
        <div className="flex gap-2">
          <input
            id="image-url"
            value={urlDraft}
            onChange={(e) => {
              setUrlDraft(e.target.value);
              setUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="/images/sarees/my-saree.jpg"
            className="field h-11 text-[14px]"
          />
          <button type="button" onClick={addUrl} className="btn btn-outline btn-sm h-11 shrink-0">
            Add
          </button>
        </div>
        {urlError && <p className="field-error">{urlError}</p>}
        <p className="mt-2 text-[12px] text-muted">
          Already copied a photo into <code className="bg-cream px-1">public/images/sarees/</code>? Add it here by path.
        </p>
      </div>
    </div>
  );
}
