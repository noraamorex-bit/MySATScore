import katex from "katex";
import { Fragment, type ReactNode } from "react";
import { parseRich, splitEmphasis } from "@/lib/rich-text";

function renderMath(value: string, display: boolean): string {
  try {
    return katex.renderToString(value, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: "html",
    });
  } catch {
    // Never let a malformed expression blank out a question.
    return `<code>${value.replace(/[<>&]/g, "")}</code>`;
  }
}

function InlineRuns({ text }: { text: string }): ReactNode {
  return parseRich(text).map((run, i) => {
    if (run.kind === "math") {
      return (
        <span
          key={i}
          className={run.display ? "my-2 block overflow-x-auto" : "inline-block"}
          // KaTeX output is generated here from bank content, not user input.
          dangerouslySetInnerHTML={{ __html: renderMath(run.value, run.display) }}
        />
      );
    }
    return (
      <Fragment key={i}>
        {splitEmphasis(run.value).map((part, j) =>
          part.emphasis ? <em key={j}>{part.text}</em> : <Fragment key={j}>{part.text}</Fragment>,
        )}
      </Fragment>
    );
  });
}

/**
 * Renders authored content: prose with inline `$math$`, display `$$math$$`,
 * `*emphasis*`, and blank-line paragraph breaks.
 */
export function RichText({
  text,
  className,
  as = "div",
}: {
  text: string;
  className?: string;
  as?: "div" | "span" | "p";
}) {
  const paragraphs = text.split(/\n{2,}/);
  if (as === "span") {
    return (
      <span className={className}>
        <InlineRuns text={text} />
      </span>
    );
  }
  const Tag = as;
  return (
    <Tag className={className}>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={i > 0 ? "mt-3" : undefined}>
          <InlineRuns text={paragraph} />
        </p>
      ))}
    </Tag>
  );
}

/** Single-line variant for answer choices and table cells. */
export function RichLine({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      <InlineRuns text={text} />
    </span>
  );
}
