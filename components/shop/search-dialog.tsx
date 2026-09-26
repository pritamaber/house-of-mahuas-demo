"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SUGGESTIONS = ["Banarasi", "Kanjivaram", "Silk", "Jamdani", "Cotton", "Wedding", "Organza"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const go = (q: string) => {
    const term = q.trim();
    onClose();
    router.push(term ? `/sarees?q=${encodeURIComponent(term)}` : "/sarees");
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search sarees">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-ink/40 backdrop-blur-[2px]"
      />
      <div className="animate-fade-in relative bg-ivory shadow-xl">
        <div className="container-page py-6 lg:py-9">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(query);
            }}
            className="flex items-center gap-3 border-b border-ink/70 pb-3"
          >
            <Search size={22} className="shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees, fabrics, colours…"
              aria-label="Search sarees"
              className="min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted/60 lg:text-3xl"
            />
            <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-muted hover:text-ink">
              <X size={22} />
            </button>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] tracking-[0.2em] text-muted uppercase">Popular</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => go(s)}
                className="rounded-full border border-line bg-white px-4 py-1.5 text-sm transition-colors hover:border-maroon hover:text-maroon"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
