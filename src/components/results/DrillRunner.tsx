"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { RichLine, RichText } from "@/components/RichText";
import { Stimulus } from "@/components/Stimulus";
import { Bar } from "@/components/ui";
import { correctAnswerLabel, isCorrect } from "@/lib/sat/grade";
import type { Question } from "@/lib/sat/types";

interface DrillQuestion {
  question: Question;
  previousAnswer: string | null;
}

export function DrillRunner({
  questions,
  backHref,
}: {
  questions: DrillQuestion[];
  backHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<string, boolean>>({});

  const item = questions[index];
  const question = item?.question;
  const correct = useMemo(
    () => (question && checked ? isCorrect(question, given) : false),
    [checked, given, question],
  );
  const answeredCount = Object.keys(outcomes).length;
  const correctCount = Object.values(outcomes).filter(Boolean).length;

  if (!question) return null;

  function check() {
    if (!given) return;
    setChecked(true);
    setOutcomes((prev) => ({ ...prev, [question.id]: isCorrect(question, given) }));
  }

  function next() {
    setChecked(false);
    setGiven(null);
    setIndex((i) => Math.min(questions.length - 1, i + 1));
  }

  const finished = answeredCount === questions.length && checked && index === questions.length - 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="card p-5 sm:p-6">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">
          Question {index + 1} of {questions.length}
        </p>

        {question.stimulus ? (
          <div className="mt-4 rounded-lg border border-line bg-paper p-4">
            <Stimulus stimulus={question.stimulus} />
          </div>
        ) : null}

        <RichText text={question.prompt} className="mt-4 text-[16px] leading-relaxed text-ink" />

        {question.answerFormat === "multiple-choice" ? (
          <ul className="mt-5 space-y-2.5">
            {question.choices?.map((choice) => {
              const selected = given === choice.id;
              const isKey = choice.id === question.correct;
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    disabled={checked}
                    onClick={() => setGiven(choice.id)}
                    className={clsx(
                      "flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition",
                      checked && isKey && "border-positive bg-positive/8",
                      checked && !isKey && selected && "border-negative bg-negative/8",
                      checked && !isKey && !selected && "border-line opacity-70",
                      !checked && selected && "border-accent bg-accent-soft",
                      !checked && !selected && "border-line hover:border-faint",
                    )}
                  >
                    <span
                      className={clsx(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[12.5px] font-bold",
                        checked && isKey && "border-positive bg-positive text-white",
                        checked && !isKey && selected && "border-negative bg-negative text-white",
                        !checked && selected && "border-accent bg-accent text-white",
                        !checked && !selected && "border-faint text-muted",
                      )}
                    >
                      {choice.id}
                    </span>
                    <span className="text-[15.5px] leading-relaxed text-ink">
                      <RichLine text={choice.text} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5">
            <label htmlFor="drill-answer" className="label">
              Your answer
            </label>
            <input
              id="drill-answer"
              value={given ?? ""}
              disabled={checked}
              onChange={(event) => setGiven(event.target.value || null)}
              onKeyDown={(event) => {
                if (event.key === "Enter") check();
              }}
              className="field max-w-xs font-mono text-[17px]"
              placeholder="e.g. 12, -3/4, or 1.75"
              autoComplete="off"
            />
          </div>
        )}

        {checked ? (
          <div className="mt-5 rounded-lg border border-line bg-paper p-4">
            <p
              className={clsx(
                "text-[14px] font-semibold",
                correct ? "text-positive" : "text-negative",
              )}
            >
              {correct ? "Correct" : `Not quite — the answer is ${correctAnswerLabel(question)}`}
            </p>
            {item.previousAnswer ? (
              <p className="mt-1 text-[13px] text-muted">
                On the test you answered <span className="font-mono">{item.previousAnswer}</span>.
              </p>
            ) : (
              <p className="mt-1 text-[13px] text-muted">You left this blank on the test.</p>
            )}
            <RichText
              text={question.explanation}
              className="mt-3 text-[14.5px] leading-relaxed text-ink"
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!checked ? (
            <button type="button" onClick={check} disabled={!given} className="btn-primary">
              Check answer
            </button>
          ) : index < questions.length - 1 ? (
            <button type="button" onClick={next} className="btn-primary">
              Next question
            </button>
          ) : (
            <Link href={backHref} className="btn-primary">
              Back to review
            </Link>
          )}
          {index > 0 ? (
            <button
              type="button"
              onClick={() => { setIndex((i) => i - 1); setChecked(false); setGiven(null); }}
              className="btn-quiet"
            >
              Previous
            </button>
          ) : null}
        </div>
      </div>

      <aside className="card h-fit p-5">
        <p className="text-[13px] font-semibold text-ink">Progress</p>
        <p className="mt-1 text-[13px] text-muted">
          {correctCount} correct of {answeredCount} retried
        </p>
        <div className="mt-3">
          <Bar value={questions.length ? answeredCount / questions.length : 0} />
        </div>
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {questions.map((q, i) => {
            const outcome = outcomes[q.question.id];
            return (
              <button
                key={q.question.id}
                type="button"
                onClick={() => { setIndex(i); setChecked(false); setGiven(null); }}
                className={clsx(
                  "flex h-8 items-center justify-center rounded-md border text-[12px] font-semibold tabular-nums transition",
                  i === index && "ring-2 ring-accent ring-offset-1 ring-offset-surface",
                  outcome === true && "border-positive bg-positive/15 text-positive",
                  outcome === false && "border-negative bg-negative/15 text-negative",
                  outcome === undefined && "border-line text-muted hover:text-ink",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        {finished ? (
          <p className="mt-4 text-[13px] text-positive">
            You have worked through every missed question.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
