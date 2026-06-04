import { Fragment, ReactNode } from "react";

/**
 * Splits a label into a base and subscript part for display.
 * Splits on the first underscore (e.g. "M_Toast" → base "M", sub "Toast"),
 * falling back to trailing digits (e.g. "M1" → base "M", sub "1").
 * Returns null if the label has no natural subscript.
 */
function splitLabel(label: string): { base: string; sub: string } | null {
  const underscoreIdx = label.indexOf("_");
  if (underscoreIdx !== -1 && underscoreIdx < label.length - 1) {
    return {
      base: label.slice(0, underscoreIdx),
      sub: label.slice(underscoreIdx + 1),
    };
  }
  const trailingMatch = label.match(/^(\D+?)(\d+)$/);
  if (trailingMatch) {
    return { base: trailingMatch[1], sub: trailingMatch[2] };
  }
  return null;
}

/** Renders a label as React, using <sub> for any inferred subscript. */
export function FormattedLabel({ label }: { label: string }): ReactNode {
  const split = splitLabel(label);
  if (!split) return <Fragment>{label}</Fragment>;
  return (
    <Fragment>
      {split.base}
      <sub>{split.sub}</sub>
    </Fragment>
  );
}

/**
 * Formats a label for embedding inside a MathJax expression.
 * E.g. "M_Toast" → "M_{Toast}", "M1" → "M_{1}", "A" → "A".
 */
export function formatLabelMathJax(label: string): string {
  const split = splitLabel(label);
  if (!split) return label;
  return `${split.base}_{${split.sub}}`;
}
