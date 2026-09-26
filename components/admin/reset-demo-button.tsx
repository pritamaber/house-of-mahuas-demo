"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resetDemoDataAction } from "@/lib/actions/admin";
import { ConfirmDialog } from "./confirm-dialog";

export function ResetDemoButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const run = () =>
    startTransition(async () => {
      const res = await resetDemoDataAction();
      setOpen(false);
      setResult(res.ok ? { ok: true, text: "Demo data restored." } : { ok: false, text: res.error ?? "Couldn't reset." });
      router.refresh();
    });

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        <RotateCcw size={15} /> Reset demo data
      </button>
      {result && <p className={`mt-3 text-[13.5px] ${result.ok ? "text-success" : "text-danger"}`} role="status">{result.text}</p>}
      <ConfirmDialog
        open={open}
        danger
        busy={pending}
        title="Reset demo data?"
        confirmLabel="Reset everything"
        message="This deletes every product and order (including any you added) and restores the original sample catalogue and orders. Photos you uploaded through the admin are kept on disk but unlinked."
        onConfirm={run}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
