import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InstagramIcon, Ornament } from "@/components/shop/icons";
import { SHIPPING, SITE, whatsappLink } from "@/lib/config";
import { formatINR } from "@/lib/format";

/*
 * Sample copy for the footer pages. Replace the wording (especially shipping times and the
 * returns policy) with your shop's real terms before going live.
 */

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[16px] leading-[1.8] text-ink/80">{children}</p>
);

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-12 mb-4 text-[30px] leading-none first:mt-0">{children}</h2>
);

const PAGES: Record<string, { title: string; intro: string; body: () => React.ReactNode }> = {
  about: {
    title: "About Us",
    intro: "Weaves of tradition, worn with pride.",
    body: () => (
      <>
        <P>
          {SITE.name} is a small saree boutique built around one idea: a saree should feel like it was chosen for you. We
          hand-pick every piece — from crisp Bengal tants and fine jamdanis to Banarasi, Kanjivaram and Baluchari silks — and
          look closely at the weave, the colour and the drape before it joins our collection.
        </P>
        <H>What we care about</H>
        <P>
          Honest fabrics, fair prices and photographs that show a saree the way it really looks. Every weave in the shop is
          something we would be happy to wear ourselves.
        </P>
        <H>Made for every occasion</H>
        <P>
          Whether it is a wedding, the nights of Durga Puja or an ordinary Tuesday that deserves a little more, there is a
          saree here for it. Not sure what to pick? Message us on WhatsApp and we will help you choose.
        </P>
      </>
    ),
  },
  contact: {
    title: "Contact",
    intro: "We’re happy to help you choose, order or track.",
    body: () => (
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={whatsappLink("Hi! I have a question about a saree.")}
          target="_blank"
          rel="noreferrer"
          className="group border border-line bg-white p-6 transition-colors hover:border-maroon"
        >
          <MessageCircle className="text-maroon" size={26} strokeWidth={1.4} />
          <h2 className="mt-5 text-[26px] leading-none">WhatsApp</h2>
          <p className="mt-2 text-[14.5px] text-muted">The fastest way to reach us — photos, sizes, styling help and order updates.</p>
          <span className="mt-4 inline-block text-[12px] tracking-[0.16em] text-maroon uppercase underline underline-offset-4">Start a chat</span>
        </a>
        <a
          href={SITE.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="group border border-line bg-white p-6 transition-colors hover:border-maroon"
        >
          <InstagramIcon className="text-[26px] text-maroon" />
          <h2 className="mt-5 text-[26px] leading-none">Instagram</h2>
          <p className="mt-2 text-[14.5px] text-muted">See new arrivals, styling ideas and behind-the-scenes from the loom.</p>
          <span className="mt-4 inline-block text-[12px] tracking-[0.16em] text-maroon uppercase underline underline-offset-4">Follow us</span>
        </a>
        {SITE.email && (
          <a href={`mailto:${SITE.email}`} className="border border-line bg-white p-6 transition-colors hover:border-maroon">
            <Mail className="text-maroon" size={26} strokeWidth={1.4} />
            <h2 className="mt-5 text-[26px] leading-none">Email</h2>
            <p className="mt-2 text-[14.5px] text-muted">{SITE.email}</p>
          </a>
        )}
        {SITE.phone && (
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="border border-line bg-white p-6 transition-colors hover:border-maroon">
            <Phone className="text-maroon" size={26} strokeWidth={1.4} />
            <h2 className="mt-5 text-[26px] leading-none">Phone</h2>
            <p className="mt-2 text-[14.5px] text-muted">{SITE.phone}</p>
          </a>
        )}
      </div>
    ),
  },
  shipping: {
    title: "Shipping",
    intro: "Carefully packed, delivered across India.",
    body: () => (
      <>
        <H>Delivery charges</H>
        <P>
          Shipping is a flat {formatINR(SHIPPING.fee)} per order. Orders of {formatINR(SHIPPING.freeAbove)} and above ship
          free anywhere in India.
        </P>
        <H>Dispatch &amp; delivery time</H>
        <P>
          Orders are usually dispatched within 2–3 working days and reach most addresses in 5–8 days. Remote pin codes can take
          a little longer. We will message you as soon as your saree ships.
        </P>
        <H>Payment on delivery</H>
        <P>Cash on delivery is available on all orders. Please keep the exact amount ready if you can.</P>
      </>
    ),
  },
  returns: {
    title: "Returns",
    intro: "If something isn’t right, we’ll make it right.",
    body: () => (
      <>
        <H>Returns &amp; exchanges</H>
        <P>
          You may request a return or exchange within 7 days of delivery if the saree is unused, unwashed and has its tags
          and packaging intact. Message us on WhatsApp with your order ID and we will guide you through it.
        </P>
        <H>Damaged or incorrect items</H>
        <P>
          If your saree arrives damaged or is not what you ordered, tell us within 48 hours of delivery with a few photos and
          we will arrange a replacement or refund.
        </P>
        <H>A note on colour</H>
        <P>
          Handwoven fabrics vary slightly from piece to piece, and colours can look a little different on different screens.
          These natural variations are part of the charm of a handloom and are not treated as defects.
        </P>
      </>
    ),
  },
};

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  return page ? { title: page.title, description: page.intro } : {};
}

export default async function InfoPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = Object.hasOwn(PAGES, slug) ? PAGES[slug] : undefined;
  if (!page) notFound();

  return (
    <div className="container-page pt-8 pb-8 lg:pt-12">
      <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] text-muted uppercase">
        <Link href="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{page.title}</span>
      </nav>
      <div className="mx-auto max-w-3xl">
        <div className="mt-8 mb-12 text-center">
          <h1 className="text-[44px] leading-none sm:text-[60px]">{page.title}</h1>
          <Ornament className="mx-auto mt-6 h-3 w-28 text-gold" />
          <p className="mt-6 font-display text-[22px] text-muted italic">{page.intro}</p>
        </div>
        {page.body()}
      </div>
    </div>
  );
}
