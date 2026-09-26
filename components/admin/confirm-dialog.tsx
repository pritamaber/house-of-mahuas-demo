"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useRef } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <button type="button" aria-label="Cancel" onClick={onCancel} disabled={busy} className="animate-fade-in absolute inset-0 cursor-default bg-ink/50" />
      <div className="animate-toast relative w-full max-w-md border border-line bg-ivory p-7 shadow-2xl">
        <h2 id="confirm-title" className="text-[28px] leading-none">
          {title}
        </h2>
        <div className="mt-4 text-[15px] leading-relaxed text-muted">{message}</div>
        <div className="mt-7 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={`btn btn-sm ${danger ? "btn-danger" : "btn-primary"}`}>
            {busy && <LoaderCircle size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
