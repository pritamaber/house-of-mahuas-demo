import { Mail, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, SITE, whatsappLink } from "@/lib/config";
import { InstagramIcon, Ornament } from "./icons";

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = "text-[14px] text-ivory/70 transition-colors hover:text-gold-soft";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-maroon-deep text-ivory">
      <div className="container-page py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="" width={112} height={112} className="h-16 w-16 rounded-full ring-1 ring-gold/40" />
              <div>
                <p className="font-display text-3xl leading-none text-ivory">House of Mahua&apos;s</p>
                <p className="mt-2 text-[10px] tracking-[0.3em] text-gold uppercase">{SITE.tagline}</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-[14.5px] leading-relaxed text-ivory/70">
              A boutique of handpicked weaves — from Bengal&apos;s tants and jamdanis to Banarasi and Kanjivaram silks —
              chosen for the occasions that matter and the everyday moments in between.
            </p>
            <Ornament className="mt-8 h-3 w-28 text-gold/70" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-10">
            <div>
              <h3 className="mb-5 font-sans text-[11px] font-medium tracking-[0.26em] text-gold uppercase">Shop</h3>
              <ul className="space-y-3">
                <li><FooterLink href="/sarees">All Sarees</FooterLink></li>
                <li><FooterLink href="/new-arrivals">New Arrivals</FooterLink></li>
                <li><FooterLink href="/collections">Collections</FooterLink></li>
                {CATEGORIES.slice(0, 3).map((c) => (
                  <li key={c.key}>
                    <FooterLink href={`/sarees?category=${c.key}`}>{c.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-5 font-sans text-[11px] font-medium tracking-[0.26em] text-gold uppercase">Help</h3>
              <ul className="space-y-3">
                <li><FooterLink href="/about">About Us</FooterLink></li>
                <li><FooterLink href="/contact">Contact</FooterLink></li>
                <li><FooterLink href="/shipping">Shipping</FooterLink></li>
                <li><FooterLink href="/returns">Returns</FooterLink></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-5 font-sans text-[11px] font-medium tracking-[0.26em] text-gold uppercase">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={whatsappLink("Hi! I'd like help choosing a saree.")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[14px] text-ivory/70 transition-colors hover:text-gold-soft"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[14px] text-ivory/70 transition-colors hover:text-gold-soft"
                  >
                    <InstagramIcon className="text-base" /> Instagram
                  </a>
                </li>
                {SITE.email && (
                  <li>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="inline-flex items-center gap-2 text-[14px] text-ivory/70 transition-colors hover:text-gold-soft"
                    >
                      <Mail size={16} /> {SITE.email}
                    </a>
                  </li>
                )}
                {SITE.phone && (
                  <li>
                    <a
                      href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 text-[14px] text-ivory/70 transition-colors hover:text-gold-soft"
                    >
                      <Phone size={16} /> {SITE.phone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ivory/10 pt-6 text-[12px] tracking-wide text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>
            Demo storefront · Payments are not live ·{" "}
            <Link href="/admin" className="underline underline-offset-4 transition-colors hover:text-gold-soft">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
