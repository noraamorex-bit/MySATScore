"use client";

import { useState } from "react";
import clsx from "clsx";
import { RichLine, RichText } from "@/components/RichText";
import { Stimulus } from "@/components/Stimulus";
import type { ReviewItem } from "@/lib/analytics";
import { DOMAIN_LABELS } from "@/lib/sat/types";
import { correctAnswerLabel } from "@/lib/sat/grade";

/** Question-by-question review with expandable explanations. */
export function ReviewList({ items }: { items: ReviewItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card px-6 py-12 text-center text-[14px] text-muted">
        No questions match this filter.
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <ReviewCard key={item.question.id} item={item} />
      ))}
    </ul>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const [open, setOpen] = useState(false);
  const { question } = item;
  const status = item.skipped ? "skipped" : item.correct ? "correct" : "incorrect";

  return (
    <li className="card overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-paper"
      >
        <StatusBadge status={status} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14.5px] font-medium leading-snug text-ink">
            <RichLine text={question.prompt.split("\n")[0]} />
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
            <span className="font-semibold uppercase tracking-wide text-faint">
              {question.subject === "rw" ? "R&W" : "Math"} · Module {item.module}
            </span>
            <span>{DOMAIN_LABELS[question.domain]}</span>
            <span aria-hidden="true">·</span>
            <span>{question.subdomain}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{question.difficulty}</span>
            {item.flagged ? <span className="text-caution">· Marked for review</span> : null}
            <span aria-hidden="true">·</span>
            <span>{Math.round(item.timeSpentMs / 1000)}s</span>
          </p>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="border-t border-line px-4 py-5 sm:px-5">
          {question.stimulus ? (
            <div className="mb-5 rounded-lg border border-line bg-paper p-4">
              <Stimulus stimulus={question.stimulus} />
            </div>
          ) : null}

          <RichText text={question.prompt} className="text-[15.5px] leading-relaxed text-ink" />

          {question.answerFormat === "multiple-choice" ? (
            <ul className="mt-4 space-y-2">
              {question.choices?.map((choice) => {
                const isKey = choice.id === question.correct;
                const isGiven = choice.id === item.given;
                return (
                  <li
                    key={choice.id}
                    className={clsx(
                      "flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-[14.5px]",
                      isKey && "border-positive bg-positive/8",
                      !isKey && isGiven && "border-negative bg-negative/8",
                      !isKey && !isGiven && "border-line",
                    )}
                  >
                    <span
                      className={clsx(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                        isKey && "border-positive bg-positive text-white",
                        !isKey && isGiven && "border-negative bg-negative text-white",
                        !isKey && !isGiven && "border-faint text-muted",
                      )}
                    >
                      {choice.id}
                    </span>
                    <span className="flex-1 text-ink">
                      <RichLine text={choice.text} />
                    </span>
                    {isKey ? <Tag tone="positive">Correct</Tag> : null}
                    {!isKey && isGiven ? <Tag tone="negative">Your answer</Tag> : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-line px-3.5 py-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">
                  Your answer
                </p>
                <p className={clsx("mt-1 font-mono text-[15px]", item.correct ? "text-positive" : "text-negative")}>
                  {item.given ?? "— left blank —"}
                </p>
              </div>
              <div className="rounded-lg border border-positive/50 bg-positive/8 px-3.5 py-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-positive">
                  Correct answer
                </p>
                <p className="mt-1 font-mono text-[15px] text-ink">{correctAnswerLabel(question)}</p>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-lg bg-paper p-4">
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-faint">
              Explanation
            </p>
            <RichText text={question.explanation} className="text-[14.5px] leading-relaxed text-ink" />
            {question.distractorNotes ? (
              <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                {Object.entries(question.distractorNotes).map(([key, note]) => (
                  <li key={key} className="text-[13.5px] leading-relaxed text-muted">
                    <RichLine text={note} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-faint">
            <span>ID {question.id}</span>
            {question.skills.map((skill) => (
              <span key={skill}>· {skill}</span>
            ))}
          </p>
        </div>
      ) : null}
    </li>
  );
}

function StatusBadge({ status }: { status: "correct" | "incorrect" | "skipped" }) {
  return (
    <span
      className={clsx(
        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
        status === "correct" && "bg-positive/15 text-positive",
        status === "incorrect" && "bg-negative/15 text-negative",
        status === "skipped" && "bg-line text-muted",
      )}
      aria-label={status}
    >
      {status === "correct" ? "✓" : status === "incorrect" ? "✕" : "–"}
    </span>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone: "positive" | "negative" }) {
  return (
    <span
      className={clsx(
        "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
        tone === "positive" ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative",
      )}
    >
      {children}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={clsx("mt-1 h-4 w-4 shrink-0 text-faint transition-transform", open && "rotate-180")}
      fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
