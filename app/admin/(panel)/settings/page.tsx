import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import { AdminPage, PageHeader } from "@/components/admin/page-header";
import { ResetDemoButton } from "@/components/admin/reset-demo-button";
import { requireAdmin, usingDemoCredentials } from "@/lib/auth";
import { SHIPPING, SITE } from "@/lib/config";
import { formatINR } from "@/lib/format";
import { demoResetAllowed, getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Settings" };

function Row({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
      <dt className="text-[10.5px] tracking-[0.22em] text-muted uppercase sm:pt-1">{label}</dt>
      <dd className="text-[15px]">
        {value}
        {hint && <p className="mt-1 text-[12.5px] text-muted">{hint}</p>}
      </dd>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-5 sm:p-7">
      <h2 className="text-[26px] leading-none">{title}</h2>
      {description && <p className="mt-2 text-[13.5px] text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = getStore().kind === "supabase";
  const demoCreds = usingDemoCredentials();

  return (
    <AdminPage>
      <PageHeader title="Settings" description="Store details and how this demo is wired up." />

      {demoCreds && (
        <div className="flex items-start gap-3 border border-marigold/40 bg-[#fdf1d6] p-4 text-[14px] text-[#6b4700]" role="note">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            You&apos;re using the built-in demo login. Before sharing this site, set <code className="bg-white/60 px-1">ADMIN_EMAIL</code>,{" "}
            <code className="bg-white/60 px-1">ADMIN_PASSWORD</code> and <code className="bg-white/60 px-1">ADMIN_SECRET</code> in <code className="bg-white/60 px-1">.env.local</code>.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Store" description="Edit these in lib/config.ts or .env.local.">
          <dl className="divide-y divide-line">
            <Row label="Store name" value={SITE.name} />
            <Row label="Tagline" value={SITE.tagline} />
            <Row label="Shipping" value={`${formatINR(SHIPPING.fee)} flat`} hint={`Free on orders of ${formatINR(SHIPPING.freeAbove)} and above`} />
            <Row
              label="WhatsApp"
              value={SITE.whatsappNumber ? `+${SITE.whatsappNumber}` : <span className="text-marigold">Not set</span>}
              hint={SITE.whatsappNumber ? undefined : "Set NEXT_PUBLIC_WHATSAPP_NUMBER (e.g. 919876543210) so the WhatsApp buttons open your chat."}
            />
            <Row label="Instagram" value={SITE.instagramUrl} hint="Set NEXT_PUBLIC_INSTAGRAM_URL to your profile link." />
          </dl>
        </Card>

        <Card title="Data & storage">
          <dl className="divide-y divide-line">
            <Row
              label="Database"
              value={supabase ? "Supabase (Postgres)" : "Local demo database"}
              hint={supabase ? undefined : "Saved to data/db.json. Add your Supabase keys to .env.local to switch — see the README."}
            />
            <Row
              label="Image storage"
              value={supabase ? "Supabase Storage" : "Local disk"}
              hint={supabase ? undefined : "Uploads are saved to data/uploads and served from /uploads."}
            />
            <Row label="Payments" value="Not connected" hint="Online payment is a placeholder. Razorpay is planned." />
          </dl>
        </Card>
      </div>

      <Card title="Demo tools">
        <p className="mb-5 max-w-2xl text-[14.5px] text-muted">
          Testing made a mess? Restore the original 15 sample sarees and 6 sample orders. Anything you added or changed is removed.
        </p>
        {demoResetAllowed() ? (
          <ResetDemoButton />
        ) : (
          <p className="text-[13.5px] text-muted">Reset is disabled while connected to Supabase. Set ALLOW_DEMO_RESET=true to enable it.</p>
        )}
      </Card>
    </AdminPage>
  );
}
