import { CartProvider } from "@/components/shop/cart-provider";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";

// The storefront always reflects the latest catalogue, including edits made in the admin panel.
export const dynamic = "force-dynamic";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
