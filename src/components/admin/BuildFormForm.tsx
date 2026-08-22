"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { buildFormAction, type ActionState } from "@/app/admin/actions";

export function BuildFormForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(buildFormAction, {});

  return (
    <form action={formAction} className="card mb-8 space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="id" className="label">Form id</label>
          <input
            id="id" name="id" required pattern="[a-z0-9-]{3,60}"
            placeholder="spring-diagnostic-01" className="field font-mono"
          />
          <p className="mt-1.5 text-[12.5px] text-faint">Lowercase letters, digits, and hyphens.</p>
        </div>
        <div>
          <label htmlFor="title" className="label">Title</label>
          <input id="title" name="title" required placeholder="Spring Diagnostic 1" className="field" />
        </div>
        <div>
          <label htmlFor="kind" className="label">Kind</label>
          <select id="kind" name="kind" className="field" defaultValue="full">
            <option value="full">Full length</option>
            <option value="rw-only">Reading and Writing only</option>
            <option value="math-only">Math only</option>
          </select>
        </div>
        <div>
          <label htmlFor="seed" className="label">
            Seed <span className="font-normal text-faint">(optional)</span>
          </label>
          <input id="seed" name="seed" placeholder="Defaults to the form id" className="field font-mono" />
          <p className="mt-1.5 text-[12.5px] text-faint">
            The same seed and bank always produce the same form.
          </p>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-negative/10 px-3.5 py-2.5 text-[13.5px] text-negative">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <div className="rounded-lg bg-positive/10 px-3.5 py-2.5">
          <p className="text-[13.5px] font-medium text-positive">{state.success}</p>
          {state.details?.length ? (
            <ul className="mt-1.5 space-y-1 text-[12.5px] text-caution">
              {state.details.map((detail) => (
                <li key={detail}>• {detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Assembling…" : "Build form"}
    </button>
  );
}
