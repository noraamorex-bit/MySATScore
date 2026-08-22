"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { importAction, type ActionState } from "@/app/admin/actions";

export function ImportForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(importAction, {});
  const [format, setFormat] = useState<"json" | "csv">("json");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="format" value={format} />
      <div className="flex gap-1.5" role="group" aria-label="Import format">
        {(["json", "csv"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFormat(option)}
            aria-pressed={format === option}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-[13.5px] font-semibold uppercase tracking-wide transition",
              format === option
                ? "border-accent bg-accent text-white"
                : "border-line text-muted hover:text-ink",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="payload" className="label">
          Paste {format.toUpperCase()}
        </label>
        <textarea
          id="payload"
          name="payload"
          rows={20}
          spellCheck={false}
          className="field h-[420px] resize-y font-mono text-[12.5px] leading-relaxed"
          placeholder={
            format === "json"
              ? '[\n  {\n    "id": "import-0001",\n    "subject": "math",\n    ...\n  }\n]'
              : "id,subject,domain,subdomain,skills,difficulty,prompt,..."
          }
        />
      </div>

      {state.error ? (
        <div role="alert" className="rounded-lg bg-negative/10 px-3.5 py-2.5">
          <p className="text-[13.5px] font-medium text-negative">{state.error}</p>
          <Details items={state.details} tone="negative" />
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-lg bg-positive/10 px-3.5 py-2.5">
          <p className="text-[13.5px] font-medium text-positive">{state.success}</p>
          <Details items={state.details} tone="caution" />
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function Details({ items, tone }: { items?: string[]; tone: "negative" | "caution" }) {
  if (!items?.length) return null;
  return (
    <ul className={clsx("mt-1.5 space-y-1 text-[12.5px]", tone === "negative" ? "text-negative/90" : "text-caution")}>
      {items.map((item) => (
        <li key={item}>• {item}</li>
      ))}
    </ul>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Importing…" : "Import questions"}
    </button>
  );
}
