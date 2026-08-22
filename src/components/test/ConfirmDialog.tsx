"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

/** Modal confirmation, used before any irreversible step in a test. */
export function ConfirmDialog({
  title, body, confirmLabel, cancelLabel = "Go back", destructive, busy, onConfirm, onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && onCancel) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md animate-scale-in rounded-2xl border border-line bg-raised p-6 shadow-pop">
        <h2 id="confirm-title" className="text-[18px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{body}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="btn-ghost" disabled={busy}>
              {cancelLabel}
            </button>
          ) : null}
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={clsx(destructive ? "btn-danger" : "btn-primary")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
