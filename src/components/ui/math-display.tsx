"use client";

import * as React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { cn } from "@/lib/ui/cn";

export interface MathDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  formula: string;
  /** Render as block (centered, large) vs inline */
  display?: boolean;
  /** Screen reader label for the formula */
  ariaLabel?: string;
}

/**
 * KaTeX math renderer — wraps react-katex InlineMath/BlockMath.
 * KaTeX CSS must be imported globally (done in layout.tsx).
 */
export function MathDisplay({
  formula,
  display = false,
  ariaLabel,
  className,
  ...props
}: MathDisplayProps) {
  if (display) {
    return (
      <div
        role="img"
        aria-label={ariaLabel ?? formula}
        className={cn(
          "font-mono text-4xl text-ink-900 text-center py-6 leading-none",
          className
        )}
        {...props}
      >
        <BlockMath math={formula} />
      </div>
    );
  }

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? formula}
      className={cn("font-mono text-ink-900 leading-none", className)}
      {...props}
    >
      <InlineMath math={formula} />
    </span>
  );
}
