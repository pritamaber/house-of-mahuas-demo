import Link from "next/link";
import { cn } from "@/lib/format";
import { Ornament } from "./icons";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        action && align === "left" && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-3", align === "center" ? "items-center" : "items-start")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="text-[34px] leading-[1.05] sm:text-[44px] lg:text-[52px]">{title}</h2>
        {align === "center" && <Ornament className="h-3 w-24 text-gold" />}
        {description && <p className="max-w-xl text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-[12px] font-medium tracking-[0.18em] text-maroon uppercase underline underline-offset-[6px] hover:text-maroon-deep"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
