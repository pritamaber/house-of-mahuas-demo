import Link from "next/link";
import { Ornament } from "@/components/shop/icons";

export default function ShopNotFound() {
  return (
    <div className="container-page py-24 text-center lg:py-32">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 text-[48px] leading-none sm:text-[68px]">This drape has slipped away</h1>
      <Ornament className="mx-auto mt-7 h-3 w-28 text-gold" />
      <p className="mx-auto mt-6 max-w-md text-[16px] text-muted">
        The page you&apos;re looking for doesn&apos;t exist, or the saree may no longer be available.
      </p>
      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/sarees" className="btn btn-primary">
          Browse sarees
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
