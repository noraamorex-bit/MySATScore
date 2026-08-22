"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CalcError, evaluateExpression, formatCalcResult, type CalcAngleMode } from "@/lib/calc";

const KEYS: { label: string; insert?: string; action?: string; span?: number; tone?: "op" | "fn" | "eq" }[][] = [
  [
    { label: "sin", insert: "sin(", tone: "fn" },
    { label: "cos", insert: "cos(", tone: "fn" },
    { label: "tan", insert: "tan(", tone: "fn" },
    { label: "√", insert: "sqrt(", tone: "fn" },
    { label: "^", insert: "^", tone: "op" },
  ],
  [
    { label: "ln", insert: "ln(", tone: "fn" },
    { label: "log", insert: "log(", tone: "fn" },
    { label: "π", insert: "pi", tone: "fn" },
    { label: "(", insert: "(", tone: "op" },
    { label: ")", insert: ")", tone: "op" },
  ],
  [
    { label: "7", insert: "7" },
    { label: "8", insert: "8" },
    { label: "9", insert: "9" },
    { label: "÷", insert: "/", tone: "op" },
    { label: "AC", action: "clear", tone: "op" },
  ],
  [
    { label: "4", insert: "4" },
    { label: "5", insert: "5" },
    { label: "6", insert: "6" },
    { label: "×", insert: "*", tone: "op" },
    { label: "⌫", action: "back", tone: "op" },
  ],
  [
    { label: "1", insert: "1" },
    { label: "2", insert: "2" },
    { label: "3", insert: "3" },
    { label: "−", insert: "-", tone: "op" },
    { label: "Ans", action: "ans", tone: "op" },
  ],
  [
    { label: "0", insert: "0" },
    { label: ".", insert: "." },
    { label: "%", insert: "%", tone: "op" },
    { label: "+", insert: "+", tone: "op" },
    { label: "=", action: "equals", tone: "eq" },
  ],
];

/**
 * On-screen scientific calculator.
 *
 * Expressions are evaluated by the parser in `lib/calc`, never by `eval`. The
 * panel is draggable on pointer devices and docks to the bottom of the screen
 * on phones, where dragging a floating panel over the question is worse than
 * a fixed sheet.
 */
export function Calculator({ onClose }: { onClose: () => void }) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ans, setAns] = useState(0);
  const [mode, setMode] = useState<CalcAngleMode>("deg");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function press(key: { insert?: string; action?: string }) {
    setError(null);
    if (key.insert !== undefined) {
      setExpression((value) => value + key.insert);
      return;
    }
    switch (key.action) {
      case "clear":
        setExpression("");
        setResult(null);
        break;
      case "back":
        setExpression((value) => value.slice(0, -1));
        break;
      case "ans":
        setExpression((value) => value + formatCalcResult(ans));
        break;
      case "equals":
        evaluate();
        break;
      default:
        break;
    }
  }

  function evaluate() {
    if (!expression.trim()) return;
    try {
      const value = evaluateExpression(expression, mode);
      setAns(value);
      setResult(formatCalcResult(value));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof CalcError ? err.message : "Cannot evaluate");
    }
  }

  function onPointerDown(event: React.PointerEvent) {
    if (window.innerWidth < 640) return;
    dragState.current = {
      startX: event.clientX, startY: event.clientY,
      originX: position.x, originY: position.y,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: React.PointerEvent) {
    const state = dragState.current;
    if (!state) return;
    setPosition({
      x: state.originX + (event.clientX - state.startX),
      y: state.originY + (event.clientY - state.startY),
    });
  }
  function onPointerUp() {
    dragState.current = null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-auto sm:left-auto sm:right-6 sm:top-20"
      style={
        typeof window !== "undefined" && window.innerWidth >= 640
          ? { transform: `translate(${position.x}px, ${position.y}px)` }
          : undefined
      }
      role="dialog"
      aria-label="Calculator"
    >
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-t-2xl border border-line bg-raised shadow-pop sm:rounded-2xl">
        <div
          className="flex cursor-grab items-center justify-between border-b border-line px-3 py-2 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <span className="text-[13px] font-semibold text-ink">Calculator</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode((m) => (m === "deg" ? "rad" : "deg"))}
              className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted hover:bg-paper"
            >
              {mode}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink"
              aria-label="Close calculator"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="bg-paper px-3 py-3">
          <input
            ref={inputRef}
            value={expression}
            onChange={(event) => { setExpression(event.target.value); setError(null); }}
            onKeyDown={(event) => {
              if (event.key === "Enter") { event.preventDefault(); evaluate(); }
            }}
            inputMode="text"
            spellCheck={false}
            autoComplete="off"
            aria-label="Calculator expression"
            className="w-full bg-transparent text-right font-mono text-[19px] text-ink outline-none"
            placeholder="0"
          />
          <p
            className={clsx(
              "mt-1 h-6 text-right font-mono text-[15px]",
              error ? "text-negative" : "text-muted",
            )}
          >
            {error ?? (result !== null ? `= ${result}` : "")}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-px bg-line p-px">
          {KEYS.flat().map((key, i) => (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              className={clsx(
                "h-11 bg-raised text-[15px] font-medium text-ink transition active:brightness-95",
                key.tone === "op" && "text-muted",
                key.tone === "fn" && "text-[13px] text-accent",
                key.tone === "eq" && "bg-accent text-white hover:brightness-110",
                !key.tone && "hover:bg-paper",
              )}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}
