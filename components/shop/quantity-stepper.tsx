"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/format";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn = cn(
    "grid place-items-center text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
    size === "md" ? "h-12 w-11" : "h-9 w-9",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center border border-line bg-white", size === "md" ? "h-12" : "h-9")}
    >
      <button type="button" aria-label="Decrease quantity" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus size={size === "md" ? 16 : 14} />
      </button>
      <span
        aria-live="polite"
        className={cn("select-none text-center font-medium tabular-nums", size === "md" ? "w-10 text-[15px]" : "w-8 text-[14px]")}
      >
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={size === "md" ? 16 : 14} />
      </button>
    </div>
  );
}
