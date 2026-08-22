"use client";

import clsx from "clsx";
import { useMemo } from "react";
import { RichLine, RichText } from "@/components/RichText";
import { Stimulus } from "@/components/Stimulus";
import { parseNumericResponse } from "@/lib/sat/grade";
import type { Question } from "@/lib/sat/types";

export interface QuestionPaneProps {
  question: Question;
  number: number;
  total: number;
  given: string | null;
  flagged: boolean;
  eliminated: string[];
  eliminatorOn: boolean;
  onAnswer: (value: string | null) => void;
  onToggleFlag: () => void;
  onToggleEliminated: (choiceId: string) => void;
  onToggleEliminator: () => void;
}

export function QuestionPane(props: QuestionPaneProps) {
  const { question, number, total, given, flagged } = props;
  const splitLayout = Boolean(question.stimulus) && question.stimulus?.type === "passage";

  return (
    <div
      className={clsx(
        "mx-auto grid h-full w-full max-w-[1400px] gap-0",
        splitLayout ? "lg:grid-cols-2" : "lg:grid-cols-1",
      )}
    >
      {question.stimulus ? (
        <section
          className={clsx(
            "overflow-y-auto px-5 py-6 sm:px-8",
            splitLayout ? "lg:border-r lg:border-line" : "",
          )}
          aria-label="Question context"
        >
          <div className={clsx("mx-auto", splitLayout ? "max-w-prose" : "max-w-3xl")}>
            <Stimulus stimulus={question.stimulus} />
          </div>
        </section>
      ) : null}

      <section
        className="overflow-y-auto px-5 py-6 sm:px-8"
        aria-label={`Question ${number} of ${total}`}
      >
        <div className="mx-auto max-w-2xl">
          <header className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[13px] font-bold text-paper">
              {number}
            </span>
            <button
              type="button"
              onClick={props.onToggleFlag}
              aria-pressed={flagged}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold transition",
                flagged ? "bg-caution/15 text-caution" : "text-muted hover:bg-paper hover:text-ink",
              )}
            >
              <FlagIcon filled={flagged} />
              {flagged ? "Marked for Review" : "Mark for Review"}
            </button>
            <button
              type="button"
              onClick={props.onToggleEliminator}
              aria-pressed={props.eliminatorOn}
              className={clsx(
                "ml-auto rounded-md border px-2 py-1 text-[12px] font-bold tracking-tight transition",
                props.eliminatorOn
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:text-ink",
              )}
              title="Cross out answer choices"
            >
              <span className="line-through">ABC</span>
            </button>
          </header>

          <RichText text={question.prompt} className="text-[16.5px] leading-relaxed text-ink sm:text-[17px]" />
          {question.promptSuffix ? (
            <RichText text={question.promptSuffix} className="mt-3 text-[16px] text-ink" />
          ) : null}

          {question.answerFormat === "multiple-choice" ? (
            <ChoiceList {...props} />
          ) : (
            <StudentResponse {...props} />
          )}
        </div>
      </section>
    </div>
  );
}

function ChoiceList({
  question, given, eliminated, eliminatorOn, onAnswer, onToggleEliminated,
}: QuestionPaneProps) {
  return (
    <ul className="mt-6 space-y-2.5" role="radiogroup" aria-label="Answer choices">
      {question.choices?.map((choice) => {
        const selected = given === choice.id;
        const crossed = eliminated.includes(choice.id);
        return (
          <li key={choice.id} className="flex items-center gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onAnswer(selected ? null : choice.id)}
              className={clsx(
                "flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition",
                selected
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:border-faint",
                crossed && "opacity-45",
              )}
            >
              <span
                className={clsx(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[12.5px] font-bold",
                  selected ? "border-accent bg-accent text-white" : "border-faint text-muted",
                )}
              >
                {choice.id}
              </span>
              <span
                className={clsx(
                  "text-[15.5px] leading-relaxed text-ink sm:text-[16px]",
                  crossed && "line-through",
                )}
              >
                <RichLine text={choice.text} />
              </span>
            </button>
            {eliminatorOn ? (
              <button
                type="button"
                onClick={() => onToggleEliminated(choice.id)}
                aria-label={`${crossed ? "Restore" : "Cross out"} choice ${choice.id}`}
                className={clsx(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition",
                  crossed ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-ink",
                )}
              >
                {crossed ? "↺" : <span className="line-through">{choice.id}</span>}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function StudentResponse({ given, onAnswer }: QuestionPaneProps) {
  const preview = useMemo(() => {
    if (!given) return null;
    const value = parseNumericResponse(given);
    return value === null ? "Not a valid entry" : `Reads as ${value}`;
  }, [given]);

  return (
    <div className="mt-6">
      <label htmlFor="spr-input" className="label">
        Enter your answer
      </label>
      <input
        id="spr-input"
        value={given ?? ""}
        onChange={(event) => onAnswer(event.target.value || null)}
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="e.g. 12, -3/4, or 1.75"
        className="field max-w-xs font-mono text-[18px]"
      />
      <p className="mt-2 text-[13px] text-muted">
        {preview ?? "Fractions and decimals are both accepted. Do not enter units or symbols."}
      </p>
    </div>
  );
}

function FlagIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M3.5 1.5v13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M3.5 2.5h8l-1.8 2.6L11.5 8h-8z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
