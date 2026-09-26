"use client";

import { Menu, MessageCircle, Search, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SHIPPING, SITE, whatsappLink } from "@/lib/config";
import { cn, formatINR } from "@/lib/format";
import { useCart } from "./cart-provider";
import { SearchDialog } from "./search-dialog";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/sarees", label: "Sarees" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/collections", label: "Collections" },
];

const MORE = [
  { href: "/about", label: "About Us" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/contact", label: "Contact" },
];

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-3" aria-label={`${SITE.name} — home`}>
      <Image
        src="/logo.png"
        alt=""
        width={96}
        height={96}
        className="h-10 w-10 rounded-full ring-1 ring-maroon/20 lg:h-12 lg:w-12"
      />
      <span className="leading-none whitespace-nowrap">
        <span className="block font-display text-[20px] font-semibold tracking-[0.02em] text-maroon lg:text-[25px]">
          House of Mahua&apos;s
        </span>
        <span className="mt-1 hidden text-[9px] tracking-[0.32em] text-gold uppercase sm:block">Weaves of Tradition</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="bg-maroon px-4 py-2 text-center text-[10.5px] tracking-[0.2em] text-ivory/95 uppercase sm:text-[11px]">
        Free shipping on orders of {formatINR(SHIPPING.freeAbove)} &amp; above
        <span className="hidden sm:inline"> &nbsp;·&nbsp; Pan-India delivery &nbsp;·&nbsp; Cash on delivery available</span>
      </div>

      <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-2 lg:h-[78px]">
          <button
            type="button"
            className="-ml-2 grid h-10 w-10 place-items-center lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="mr-auto lg:mr-0 lg:flex-1">
            <Brand />
          </div>

          <nav className="hidden items-center justify-center gap-7 whitespace-nowrap lg:flex xl:gap-10" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative py-2 text-[12.5px] tracking-[0.2em] uppercase transition-colors",
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-maroon after:transition-transform after:duration-300 hover:text-maroon hover:after:scale-x-100",
                  isActive(item.href) ? "text-maroon after:scale-x-100" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 lg:flex-1 lg:justify-end">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center transition-colors hover:text-maroon"
            >
              <Search size={21} />
            </button>
            <Link
              href="/cart"
              aria-label={`Cart, ${ready ? count : 0} item${count === 1 ? "" : "s"}`}
              className="relative grid h-10 w-10 place-items-center transition-colors hover:text-maroon"
            >
              <ShoppingBag size={21} />
              {ready && count > 0 && (
                <span className="absolute top-0.5 right-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-maroon px-1 text-[10px] leading-none font-medium text-ivory">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={closeSearch} />

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="animate-fade-in absolute inset-0 cursor-default bg-ink/45"
          />
          <div className="animate-slide-left relative flex h-full w-[86%] max-w-sm flex-col bg-ivory shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Brand onClick={() => setMenuOpen(false)} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="-mr-2 grid h-10 w-10 place-items-center"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block border-b border-line/70 py-4 font-display text-[28px] leading-none",
                        isActive(item.href) ? "text-maroon" : "text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] tracking-[0.12em] text-muted uppercase">
                {MORE.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setMenuOpen(false)} className="hover:text-maroon">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-line p-6">
              <a
                href={whatsappLink("Hi! I'd like help choosing a saree.")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-block"
              >
                <MessageCircle size={17} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
