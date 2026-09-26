"use client";

import { useRouter } from "next/navigation";

/** A table row that navigates on click. The row's first cell should still hold a real link for keyboard/AT users. */
export function ClickableRow({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <tr
      className={`cursor-pointer ${className ?? ""}`}
      onClick={(e) => {
        // don't hijack clicks on inner links/buttons (open in new tab, etc.)
        if ((e.target as HTMLElement).closest("a,button")) return;
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
