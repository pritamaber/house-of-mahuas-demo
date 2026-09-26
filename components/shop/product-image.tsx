"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";
import { SareeArt, type ArtView } from "./saree-art";

interface Props {
  /** Photo URL. When missing (or it fails to load) a generated textile illustration is shown. */
  src?: string | null;
  alt: string;
  slug: string;
  color: string;
  fabric: string;
  name?: string;
  view?: ArtView;
  sizes?: string;
  preload?: boolean;
  /** Sizing/aspect classes for the frame, e.g. "aspect-[4/5]" */
  className?: string;
  imgClassName?: string;
}

export function ProductImage({
  src,
  alt,
  slug,
  color,
  fabric,
  name,
  view = "full",
  sizes = "(min-width: 1024px) 25vw, 50vw",
  preload,
  className,
  imgClassName,
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);

  // If the image failed before React hydrated, onError never fires — catch it here.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0 && src) setFailedSrc(src);
  }, [src]);

  const showPhoto = Boolean(src) && failedSrc !== src;

  return (
    <div className={cn("relative overflow-hidden bg-cream", className)}>
      {showPhoto ? (
        <Image
          ref={ref}
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          quality={85}
          preload={preload}
          onError={() => setFailedSrc(src as string)}
          className={cn("object-cover object-[50%_25%]", imgClassName)}
        />
      ) : (
        <SareeArt
          slug={slug}
          color={color}
          fabric={fabric}
          name={name}
          view={view}
          className={cn("absolute inset-0 h-full w-full", imgClassName)}
        />
      )}
    </div>
  );
}
