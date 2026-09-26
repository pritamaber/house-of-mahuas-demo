"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProductAction, setProductActiveAction } from "@/lib/actions/admin";
import { cn } from "@/lib/format";
import { ConfirmDialog } from "./confirm-dialog";

export function ProductRowActions({
  id,
  name,
  slug,
  active,
  compact = false,
}: {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const toggle = () =>
    startTransition(async () => {
      await setProductActiveAction(id, !active);
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      await deleteProductAction(id);
      setConfirming(false);
      router.refresh();
    });

  // Labelled buttons in the mobile cards; icon-only (with tooltips) in the dense desktop table.
  const btn = cn(
    "inline-flex items-center justify-center gap-1.5 border border-line bg-white text-[12.5px] transition-colors hover:border-maroon hover:text-maroon disabled:opacity-50",
    compact ? "px-3 py-1.5" : "h-9 w-9",
  );
  const label = (text: string) => (compact ? text : <span className="sr-only">{text}</span>);

  return (
    <>
      <div className={cn("flex items-center gap-2", compact ? "flex-wrap" : "justify-end")}>
        <Link href={`/admin/products/${id}/edit`} className={btn} aria-label={`Edit ${name}`} title="Edit">
          <Pencil size={15} /> {label("Edit")}
        </Link>
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={btn}
          aria-label={`${active ? "Deactivate" : "Activate"} ${name}`}
          title={active ? "Deactivate (hide from store)" : "Activate (show in store)"}
        >
          {active ? <EyeOff size={15} /> : <Eye size={15} />}
          {label(active ? "Deactivate" : "Activate")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          className={cn(btn, "hover:border-danger hover:text-danger")}
          aria-label={`Delete ${name}`}
          title="Delete"
        >
          <Trash2 size={15} /> {label("Delete")}
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        danger
        busy={pending}
        title="Delete this saree?"
        confirmLabel="Delete"
        message={
          <>
            <strong className="font-medium text-ink">{name}</strong> will be removed from the store permanently. Past orders that
            include it keep their history. To hide it without deleting, use <em>Deactivate</em> instead.
            <span className="mt-2 block text-[12.5px]">/product/{slug}</span>
          </>
        }
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
