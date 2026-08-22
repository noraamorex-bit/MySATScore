"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { RunnerState } from "@/lib/attempts";
import { SUBJECT_LABEL } from "@/lib/sat/blueprint";
import { Timer } from "./Timer";
import { Calculator } from "./Calculator";
import { ReferenceSheet } from "./ReferenceSheet";
import { QuestionPane } from "./QuestionPane";
import { ConfirmDialog } from "./ConfirmDialog";
import { FullscreenButton } from "./FullscreenButton";

interface LocalAnswer {
  given: string | null;
  flagged: boolean;
}

export function TestRunner({ state }: { state: RunnerState }) {
  const router = useRouter();
  const { attempt, module, questions } = state;

  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>(() =>
    Object.fromEntries(questions.map((q) => [q.question.id, { given: q.given, flagged: q.flagged }])),
  );
  const [index, setIndex] = useState(0);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eliminatorOn, setEliminatorOn] = useState(false);
  const [eliminated, setEliminated] = useState<Record<string, string[]>>({});
  const [expired, setExpired] = useState(false);

  const current = questions[index];
  const questionEnteredAt = useRef<number>(Date.now());
  const pendingSpr = useRef<number | null>(null);
  const submitted = useRef(false);

  /* --------------------------------------------------------------- saving */

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      try {
        const response = await fetch(`/api/attempt/${attempt.id}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        });
        const data = (await response.json()) as { saved?: boolean; reason?: string };
        if (data.saved === false && data.reason === "module-closed") setExpired(true);
      } catch {
        // Offline or a dropped request: the local state is kept and the next
        // interaction retries. The module deadline is server-side regardless.
      }
    },
    [attempt.id],
  );

  /** Reports time spent on the question being left behind. */
  const flushTime = useCallback(
    (questionId: string) => {
      const elapsed = Date.now() - questionEnteredAt.current;
      questionEnteredAt.current = Date.now();
      if (elapsed < 400) return;
      void post({ questionId, timeSpentMs: Math.min(elapsed, 30 * 60 * 1000) });
    },
    [post],
  );

  const goTo = useCallback(
    (next: number) => {
      if (current) flushTime(current.question.id);
      setIndex(Math.max(0, Math.min(questions.length - 1, next)));
      setShowNavigator(false);
      setShowReview(false);
    },
    [current, flushTime, questions.length],
  );

  const setAnswer = useCallback(
    (value: string | null) => {
      if (!current) return;
      const questionId = current.question.id;
      setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], given: value } }));

      if (current.question.answerFormat === "student-response") {
        // Typed answers are debounced so a four-character entry is one request.
        if (pendingSpr.current) window.clearTimeout(pendingSpr.current);
        pendingSpr.current = window.setTimeout(() => {
          void post({ questionId, given: value });
        }, 450);
      } else {
        void post({ questionId, given: value });
      }
    },
    [current, post],
  );

  const toggleFlag = useCallback(() => {
    if (!current) return;
    const questionId = current.question.id;
    const next = !answers[questionId]?.flagged;
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], flagged: next } }));
    void post({ questionId, flagged: next });
  }, [answers, current, post]);

  const toggleEliminated = useCallback((choiceId: string) => {
    if (!current) return;
    const questionId = current.question.id;
    setEliminated((prev) => {
      const list = prev[questionId] ?? [];
      return {
        ...prev,
        [questionId]: list.includes(choiceId)
          ? list.filter((c) => c !== choiceId)
          : [...list, choiceId],
      };
    });
  }, [current]);

  /* ---------------------------------------------------------- submission */

  const submitModule = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    if (current) flushTime(current.question.id);
    try {
      const response = await fetch(`/api/attempt/${attempt.id}/module`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", ordinal: module.ordinal }),
      });
      const result = (await response.json()) as { attemptComplete?: boolean };
      if (result.attemptComplete) router.push(`/results/${attempt.id}`);
      else router.refresh();
    } catch {
      submitted.current = false;
      setSubmitting(false);
    }
  }, [attempt.id, current, flushTime, module.ordinal, router]);

  const onExpire = useCallback(() => {
    setExpired(true);
    void submitModule();
  }, [submitModule]);

  /* -------------------------------------------------------------- effects */

  // Warn before an accidental navigation away from a live module.
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (submitted.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Re-check the server whenever the tab comes back, so a device that slept
  // through the end of a module does not keep accepting answers.
  useEffect(() => {
    async function resync() {
      if (document.visibilityState !== "visible" || submitted.current) return;
      try {
        const response = await fetch(`/api/attempt/${attempt.id}/state`, { cache: "no-store" });
        const data = (await response.json()) as {
          finished?: boolean;
          cursor?: number;
          moduleStatus?: string;
        };
        if (data.finished) {
          submitted.current = true;
          router.push(`/results/${attempt.id}`);
        } else if (data.cursor !== module.ordinal || data.moduleStatus !== "active") {
          router.refresh();
        }
      } catch {
        // Offline; the local timer keeps running and the server reconciles later.
      }
    }
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    return () => {
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("focus", resync);
    };
  }, [attempt.id, module.ordinal, router]);

  // Keyboard shortcuts, matching what a test taker expects from the real app.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight") { event.preventDefault(); goTo(index + 1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); goTo(index - 1); }
      else if (/^[a-dA-D]$/.test(event.key) && current?.question.answerFormat === "multiple-choice") {
        event.preventDefault();
        setAnswer(event.key.toUpperCase());
      } else if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleFlag();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo, index, setAnswer, toggleFlag]);

  useEffect(() => {
    questionEnteredAt.current = Date.now();
  }, [index]);

  /* ------------------------------------------------------------- derived */

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.question.id]?.given).length,
    [answers, questions],
  );
  const isMath = module.subject === "math";
  const subjectLabel = SUBJECT_LABEL[module.subject];
  const unanswered = questions.length - answeredCount;
  const flaggedCount = questions.filter((q) => answers[q.question.id]?.flagged).length;

  return (
    <div className="testing-shell flex flex-col bg-surface">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-ink">
            Section {Math.floor(module.ordinal / 2) + 1}, Module {module.module}: {subjectLabel}
          </p>
          <p className="truncate text-[12px] text-muted">{attempt.title}</p>
        </div>

        {module.endsAtMs ? (
          <Timer endsAtMs={module.endsAtMs} onExpire={onExpire} />
        ) : null}

        <div className="flex flex-1 items-center justify-end gap-1">
          {isMath ? (
            <>
              <ToolButton
                label="Calculator"
                active={showCalculator}
                onClick={() => setShowCalculator((v) => !v)}
              >
                <CalcIcon />
              </ToolButton>
              <ToolButton
                label="Reference"
                active={showReference}
                onClick={() => setShowReference((v) => !v)}
              >
                <BookIcon />
              </ToolButton>
            </>
          ) : null}
          <FullscreenButton />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {showReview ? (
          <ReviewScreen
            questions={questions}
            answers={answers}
            subjectLabel={subjectLabel}
            moduleNumber={module.module}
            onGoTo={goTo}
            onSubmit={() => setConfirming(true)}
          />
        ) : current ? (
          <QuestionPane
            question={current.question}
            number={index + 1}
            total={questions.length}
            given={answers[current.question.id]?.given ?? null}
            flagged={answers[current.question.id]?.flagged ?? false}
            eliminated={eliminated[current.question.id] ?? []}
            eliminatorOn={eliminatorOn}
            onAnswer={setAnswer}
            onToggleFlag={toggleFlag}
            onToggleEliminated={toggleEliminated}
            onToggleEliminator={() => setEliminatorOn((v) => !v)}
          />
        ) : null}
      </div>

      <footer className="relative flex h-16 shrink-0 items-center justify-between gap-3 border-t border-line px-3 sm:px-5">
        <p className="hidden text-[13px] text-muted sm:block">
          {answeredCount} of {questions.length} answered
        </p>

        <button
          type="button"
          onClick={() => setShowNavigator((v) => !v)}
          aria-expanded={showNavigator}
          className="btn-ghost btn-sm mx-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        >
          {showReview ? "Review page" : `Question ${index + 1} of ${questions.length}`}
          <ChevronIcon open={showNavigator} />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (showReview ? setShowReview(false) : goTo(index - 1))}
            disabled={index === 0 && !showReview}
            className="btn-ghost btn-sm"
          >
            Back
          </button>
          {showReview ? (
            <button type="button" onClick={() => setConfirming(true)} className="btn-primary btn-sm">
              Submit module
            </button>
          ) : index === questions.length - 1 ? (
            <button
              type="button"
              onClick={() => { flushTime(current.question.id); setShowReview(true); }}
              className="btn-primary btn-sm"
            >
              Review
            </button>
          ) : (
            <button type="button" onClick={() => goTo(index + 1)} className="btn-primary btn-sm">
              Next
            </button>
          )}
        </div>

        {showNavigator ? (
          <NavigatorPanel
            questions={questions}
            answers={answers}
            currentIndex={index}
            onGoTo={goTo}
            onClose={() => setShowNavigator(false)}
            onReview={() => { setShowNavigator(false); setShowReview(true); }}
          />
        ) : null}
      </footer>

      {showCalculator ? <Calculator onClose={() => setShowCalculator(false)} /> : null}
      {showReference ? <ReferenceSheet onClose={() => setShowReference(false)} /> : null}

      {confirming ? (
        <ConfirmDialog
          title={`Submit Module ${module.module}?`}
          body={
            unanswered > 0
              ? `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}${
                  flaggedCount > 0 ? ` and ${flaggedCount} marked for review` : ""
                }. There is no penalty for a wrong answer, so a guess is worth more than a blank. You cannot return to this module after submitting.`
              : "You have answered every question. You cannot return to this module after submitting."
          }
          confirmLabel={submitting ? "Submitting…" : "Submit module"}
          destructive={unanswered > 0}
          busy={submitting}
          onConfirm={submitModule}
          onCancel={() => setConfirming(false)}
        />
      ) : null}

      {expired && !submitting ? (
        <ConfirmDialog
          title="Time is up"
          body="This module's time has expired. Your answers have been saved and the module is being submitted."
          confirmLabel="Continue"
          busy={submitting}
          onConfirm={submitModule}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- sub-views */

function NavigatorPanel({
  questions, answers, currentIndex, onGoTo, onClose, onReview,
}: {
  questions: RunnerState["questions"];
  answers: Record<string, LocalAnswer>;
  currentIndex: number;
  onGoTo: (index: number) => void;
  onClose: () => void;
  onReview: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 animate-scale-in rounded-2xl border border-line bg-raised p-4 shadow-pop">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-ink">Go to question</p>
          <button type="button" onClick={onClose} className="btn-quiet btn-sm">
            Close
          </button>
        </div>
        <Legend />
        <div className="mt-3 grid grid-cols-7 gap-1.5 sm:grid-cols-10">
          {questions.map((item, i) => {
            const answer = answers[item.question.id];
            return (
              <button
                key={item.question.id}
                type="button"
                onClick={() => onGoTo(i)}
                className={clsx(
                  "relative flex h-9 items-center justify-center rounded-md border text-[13px] font-semibold tabular-nums transition",
                  i === currentIndex && "ring-2 ring-accent ring-offset-1 ring-offset-raised",
                  answer?.given
                    ? "border-accent bg-accent text-white"
                    : "border-dashed border-faint text-muted hover:border-ink hover:text-ink",
                )}
              >
                {i + 1}
                {answer?.flagged ? (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-caution ring-2 ring-raised" />
                ) : null}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onReview} className="btn-ghost btn-sm mt-4 w-full">
          Go to review page
        </button>
      </div>
    </>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm bg-accent" /> Answered
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border border-dashed border-faint" /> Unanswered
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-caution" /> Marked for review
      </span>
    </div>
  );
}

function ReviewScreen({
  questions, answers, subjectLabel, moduleNumber, onGoTo, onSubmit,
}: {
  questions: RunnerState["questions"];
  answers: Record<string, LocalAnswer>;
  subjectLabel: string;
  moduleNumber: number;
  onGoTo: (index: number) => void;
  onSubmit: () => void;
}) {
  const unanswered = questions.filter((q) => !answers[q.question.id]?.given);
  const flagged = questions.filter((q) => answers[q.question.id]?.flagged);

  return (
    <div className="h-full overflow-y-auto px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink">Check your work</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          {subjectLabel}, Module {moduleNumber}. On test day you cannot return to this module after
          submitting.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-[13.5px]">
          <span className="chip">{questions.length - unanswered.length} answered</span>
          <span className={clsx("chip", unanswered.length > 0 && "text-caution")}>
            {unanswered.length} unanswered
          </span>
          <span className="chip">{flagged.length} marked for review</span>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-paper p-4">
          <Legend />
          <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-9">
            {questions.map((item, i) => {
              const answer = answers[item.question.id];
              return (
                <button
                  key={item.question.id}
                  type="button"
                  onClick={() => onGoTo(i)}
                  className={clsx(
                    "relative flex h-10 items-center justify-center rounded-md border text-[13px] font-semibold tabular-nums transition",
                    answer?.given
                      ? "border-accent bg-accent text-white"
                      : "border-dashed border-faint bg-surface text-muted hover:border-ink hover:text-ink",
                  )}
                >
                  {i + 1}
                  {answer?.flagged ? (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-caution ring-2 ring-paper" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" onClick={onSubmit} className="btn-primary mt-6 w-full sm:w-auto">
          Submit module
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  label, active, onClick, children,
}: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={clsx(
        "flex h-9 w-9 items-center justify-center rounded-lg border transition",
        active ? "border-accent bg-accent-soft text-accent" : "border-transparent text-muted hover:bg-paper hover:text-ink",
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function CalcIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="4" y="2.5" width="12" height="15" rx="2" />
      <path d="M6.5 6.5h7M6.8 10h.01M10 10h.01M13.2 10h.01M6.8 13.4h.01M10 13.4h.01M13.2 13.4h.01" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3.5 4.5c2.5-1 4.5-1 6.5 0v11c-2-1-4-1-6.5 0v-11ZM16.5 4.5c-2.5-1-4.5-1-6.5 0v11c2-1 4-1 6.5 0v-11Z" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
      fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
