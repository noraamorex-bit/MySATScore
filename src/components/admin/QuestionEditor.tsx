"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { RichLine, RichText } from "@/components/RichText";
import { Stimulus } from "@/components/Stimulus";
import { saveQuestionAction, type ActionState } from "@/app/admin/actions";
import type { Question } from "@/lib/sat/types";

/**
 * Question editor.
 *
 * Questions are edited as JSON against the same schema the content pipeline
 * validates, with a live preview rendered by the very components the test
 * runner uses — so what is previewed is exactly what a test taker will see.
 */
export function QuestionEditor({
  initial,
  replacesId,
  heading,
}: {
  initial: Question | Record<string, unknown>;
  replacesId?: string;
  heading: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveQuestionAction, {});
  const [text, setText] = useState(() => JSON.stringify(initial, null, 2));

  const { preview, parseError } = useMemo(() => {
    try {
      return { preview: JSON.parse(text) as Question, parseError: null };
    } catch (error) {
      return { preview: null, parseError: (error as Error).message };
    }
  }, [text]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={formAction} className="space-y-4">
        <div>
          <h2 className="text-[18px] font-semibold text-ink">{heading}</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
            Inline math goes between <code>$…$</code>; a literal dollar sign is <code>\$</code>.
            Emphasis uses <code>*asterisks*</code>.
          </p>
        </div>

        {replacesId ? <input type="hidden" name="replacesId" value={replacesId} /> : null}

        <div>
          <label htmlFor="payload" className="label">Question JSON</label>
          <textarea
            id="payload"
            name="payload"
            value={text}
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
            rows={26}
            className="field h-[520px] resize-y font-mono text-[12.5px] leading-relaxed"
          />
        </div>

        <div>
          <label htmlFor="note" className="label">
            Change note <span className="font-normal text-faint">(optional)</span>
          </label>
          <input id="note" name="note" className="field" placeholder="Why this changed" />
        </div>

        {parseError ? (
          <p className="rounded-lg bg-caution/10 px-3.5 py-2.5 text-[13.5px] text-caution">
            JSON is not parseable yet: {parseError}
          </p>
        ) : null}

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

        <SaveButton
          disabled={Boolean(parseError)}
          label={replacesId ? "Save replacement" : "Save question"}
        />
      </form>

      <div className="lg:sticky lg:top-20 lg:h-fit">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-faint">Preview</p>
        {preview ? (
          <QuestionPreview question={preview} />
        ) : (
          <div className="card px-5 py-10 text-center text-[14px] text-muted">
            Fix the JSON to see a preview.
          </div>
        )}
      </div>
    </div>
  );
}

function SaveButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={disabled || pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export function QuestionPreview({ question }: { question: Question }) {
  return (
    <div className="card p-5">
      <p className="mb-3 flex flex-wrap gap-x-2 gap-y-1 text-[11.5px] text-faint">
        <span className="font-mono">{question.id ?? "(no id)"}</span>
        <span>· {question.subject}</span>
        <span>· {question.domain}</span>
        <span>· {question.difficulty}</span>
        {question.calculator ? <span>· calculator {question.calculator}</span> : null}
      </p>

      {question.stimulus ? (
        <div className="mb-5 rounded-lg border border-line bg-paper p-4">
          <Stimulus stimulus={question.stimulus} />
        </div>
      ) : null}

      {question.prompt ? (
        <RichText text={question.prompt} className="text-[16px] leading-relaxed text-ink" />
      ) : null}

      {question.answerFormat === "student-response" ? (
        <div className="mt-4 rounded-lg border border-line px-3.5 py-2.5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">
            Student response
          </p>
          <p className="mt-1 font-mono text-[15px] text-ink">{question.correct}</p>
          {question.acceptedAnswers?.length ? (
            <p className="mt-1 text-[12.5px] text-muted">
              Also accepted:{" "}
              {question.acceptedAnswers.filter((a) => a !== question.correct).join(", ") || "—"}
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {question.choices?.map((choice) => (
            <li
              key={choice.id}
              className={clsx(
                "flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-[14.5px]",
                choice.id === question.correct ? "border-positive bg-positive/8" : "border-line",
              )}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-faint text-[11px] font-bold text-muted">
                {choice.id}
              </span>
              <span className="text-ink">
                <RichLine text={choice.text ?? ""} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {question.explanation ? (
        <div className="mt-5 rounded-lg bg-paper p-4">
          <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-faint">
            Explanation
          </p>
          <RichText text={question.explanation} className="text-[14px] leading-relaxed text-ink" />
        </div>
      ) : null}

      {question.skills?.length ? (
        <p className="mt-3 text-[12px] text-faint">Skills: {question.skills.join(", ")}</p>
      ) : null}
    </div>
  );
}
