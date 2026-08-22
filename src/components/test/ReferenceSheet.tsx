"use client";

import { RichLine } from "@/components/RichText";

/**
 * The formula reference available during the Math section, matching what the
 * real test provides. Rendered from the same math pipeline as the questions so
 * the notation is identical.
 */
const FORMULAS: { label: string; tex: string; figure?: string }[] = [
  { label: "Area of a circle", tex: "A = \\pi r^{2}" },
  { label: "Circumference of a circle", tex: "C = 2\\pi r" },
  { label: "Area of a rectangle", tex: "A = \\ell w" },
  { label: "Area of a triangle", tex: "A = \\tfrac{1}{2}bh" },
  { label: "Pythagorean theorem", tex: "c^{2} = a^{2} + b^{2}" },
  { label: "Special right triangle", tex: "x,\; x\\sqrt{3},\; 2x \\quad (30\\degree\\text{-}60\\degree\\text{-}90\\degree)" },
  { label: "Special right triangle", tex: "s,\; s,\; s\\sqrt{2} \\quad (45\\degree\\text{-}45\\degree\\text{-}90\\degree)" },
  { label: "Volume of a rectangular prism", tex: "V = \\ell w h" },
  { label: "Volume of a cylinder", tex: "V = \\pi r^{2} h" },
  { label: "Volume of a sphere", tex: "V = \\tfrac{4}{3}\\pi r^{3}" },
  { label: "Volume of a cone", tex: "V = \\tfrac{1}{3}\\pi r^{2} h" },
  { label: "Volume of a pyramid", tex: "V = \\tfrac{1}{3}\\ell w h" },
  { label: "Quadratic formula", tex: "x = \\dfrac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}" },
  { label: "Slope of a line", tex: "m = \\dfrac{y_2 - y_1}{x_2 - x_1}" },
  { label: "Distance between two points", tex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}" },
  { label: "Equation of a circle", tex: "(x - h)^2 + (y - k)^2 = r^2" },
];

const FACTS = [
  "The number of degrees of arc in a circle is $360$.",
  "The number of radians of arc in a circle is $2\\pi$.",
  "The sum of the measures in degrees of the angles of a triangle is $180$.",
];

export function ReferenceSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Reference sheet"
      onClick={onClose}
    >
      <div
        className="max-h-[86dvh] w-full max-w-2xl animate-scale-in overflow-y-auto rounded-t-2xl border border-line bg-raised shadow-pop sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-raised px-5 py-3">
          <h2 className="text-[15px] font-semibold text-ink">Reference</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-quiet btn-sm"
          >
            Close
          </button>
        </div>
        <div className="grid gap-x-8 gap-y-3 px-5 py-5 sm:grid-cols-2">
          {FORMULAS.map((formula) => (
            <div key={formula.label + formula.tex} className="border-b border-line/70 pb-2.5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">
                {formula.label}
              </p>
              <div className="mt-1 overflow-x-auto text-[15px] text-ink">
                <RichLine text={`$${formula.tex}$`} />
              </div>
            </div>
          ))}
        </div>
        <ul className="space-y-1.5 px-5 pb-6 text-[14px] text-muted">
          {FACTS.map((fact) => (
            <li key={fact}>
              <RichLine text={fact} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
