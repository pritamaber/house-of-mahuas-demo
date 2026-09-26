import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { demoCredentials, isAdmin, usingDemoCredentials } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="House of Mahua's" width={112} height={112} className="mx-auto h-20 w-20 rounded-full ring-1 ring-maroon/20" />
          <h1 className="mt-6 text-[40px] leading-none">Admin sign in</h1>
          <p className="mt-3 text-[14.5px] text-muted">Manage sarees, orders and your store.</p>
        </div>
        <div className="border border-line bg-white p-7 shadow-[0_20px_50px_-30px_rgba(42,28,23,0.4)] sm:p-9">
          <LoginForm demo={usingDemoCredentials() ? demoCredentials() : null} />
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">
          <Link href="/" className="underline underline-offset-4 hover:text-maroon">
            ← Back to the store
          </Link>
        </p>
      </div>
    </main>
  );
}
