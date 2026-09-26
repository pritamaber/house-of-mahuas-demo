"use client";

import { ExternalLink, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/admin";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ newOrders, onNavigate }: { newOrders: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="flex h-full flex-col bg-maroon-deep text-ivory">
      <div className="flex items-center gap-3 px-6 py-6">
        <Image src="/logo.png" alt="" width={80} height={80} className="h-10 w-10 rounded-full ring-1 ring-gold/40" />
        <div className="leading-none">
          <p className="font-display text-[18px] whitespace-nowrap">House of Mahua&apos;s</p>
          <p className="mt-1 text-[9.5px] tracking-[0.28em] text-gold uppercase">Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2" aria-label="Admin">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-[14px] transition-colors",
                    active ? "bg-ivory/12 text-ivory" : "text-ivory/65 hover:bg-ivory/8 hover:text-ivory",
                  )}
                >
                  <Icon size={18} strokeWidth={1.6} className={active ? "text-gold" : ""} />
                  <span className="flex-1">{label}</span>
                  {label === "Orders" && newOrders > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-medium text-maroon-deep" title={`${newOrders} new`}>
                      {newOrders}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-ivory/10 px-3 py-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-ivory/65 transition-colors hover:bg-ivory/8 hover:text-ivory">
          <ExternalLink size={18} strokeWidth={1.6} /> View store
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[14px] text-ivory/65 transition-colors hover:bg-ivory/8 hover:text-ivory">
            <LogOut size={18} strokeWidth={1.6} /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ newOrders, children }: { newOrders: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh lg:block" aria-label="Sidebar">
        <SidebarContent newOrders={newOrders} />
      </aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-maroon-deep px-3 text-ivory lg:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center">
          <Menu size={22} />
        </button>
        <p className="font-display text-[19px] whitespace-nowrap">
          House of Mahua&apos;s
          <span className="ml-2 font-sans text-[9.5px] tracking-[0.28em] text-gold uppercase">Admin</span>
        </p>
        {newOrders > 0 && (
          <Link href="/admin/orders?status=New" className="ml-auto rounded-full bg-gold px-3 py-1 text-[11.5px] font-medium text-maroon-deep">
            {newOrders} new
          </Link>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="animate-fade-in absolute inset-0 bg-ink/50" />
          <div className="animate-slide-left relative h-full w-[78%] max-w-[16rem] shadow-2xl">
            <SidebarContent newOrders={newOrders} onNavigate={() => setOpen(false)} />
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute top-4 right-3 grid h-9 w-9 place-items-center text-ivory/80">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0 bg-cream/60">{children}</div>
    </div>
  );
}
