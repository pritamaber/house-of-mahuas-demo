import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The house-of-mahua ornament: thin rule, diamond, thin rule. */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M0 6h48M72 6h48" strokeWidth="0.8" />
      <path d="M60 1.5 64.5 6 60 10.5 55.5 6Z" strokeWidth="0.9" />
      <circle cx="60" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
