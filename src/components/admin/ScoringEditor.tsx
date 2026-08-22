"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { publishScoringAction, type ActionState } from "@/app/admin/actions";

export function ScoringEditor({ current }: { current: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(publishScoringAction, {});
  const [text, setText] = useState(current);

  return (
    <form action={formAction} className="card mb-8 space-y-4 p-5">
      <div>
        <label htmlFor="payload" className="label">Configuration JSON</label>
        <p className="mb-2 text-[13px] leading-relaxed text-muted">
          Give the new configuration a distinct <code>version</code> so results stay traceable.
          Anchors are <code>[rawScore, scaledScore]</code> pairs sorted by raw score; values between
          anchors are interpolated linearly.
        </p>
        <textarea
          id="payload"
          name="payload"
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          rows={22}
          className="field h-[460px] resize-y font-mono text-[12px] leading-relaxed"
        />
      </div>

      {state.error ? (
        <div role="alert" className="rounded-lg bg-negative/10 px-3.5 py-2.5">
          <p className="text-[13.5px] font-medium text-negative">{state.error}</p>
          {state.details?.length ? (
            <ul className="mt-1.5 space-y-1 text-[12.5px] text-negative/90">
              {state.details.map((detail) => (
                <li key={detail}>• {detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-positive/10 px-3.5 py-2.5 text-[13.5px] text-positive">
          {state.success}
        </p>
      ) : null}

      <div className="flex gap-2">
        <SubmitButton />
        <button type="button" onClick={() => setText(current)} className="btn-quiet">
          Reset
        </button>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Publishing…" : "Publish configuration"}
    </button>
  );
}
