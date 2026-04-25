"use client";
// Styling-agnostic Markdown + KaTeX renderer.
// Pipeline-only — caller controls all visual styling via className.
// Used by NoteMarkdown (knowledge notes), QuestionCard (problem text), FeedbackPanel (explanations).
// Allows `$\dfrac{...}$` etc. to render correctly inside any context (fixes literal-LaTeX bug).
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { PluggableList } from "unified";
import type { Components } from "react-markdown";
import { cn } from "@/lib/ui/cn";

interface MathTextProps {
  source: string;
  className?: string;
  /** When true, unwraps the auto-generated <p> so output sits inline (no block margin). */
  inline?: boolean;
  /** Additional remark plugins to chain after remark-math (e.g. directive plugins). */
  extraRemarkPlugins?: PluggableList;
  /** Custom component overrides (e.g. handle <div data-figure> emitted by remark-figure-directive). */
  components?: Components;
}

const INLINE_COMPONENTS: Components = {
  // Strip the <p> wrapper that ReactMarkdown adds around root text — keeps inline contexts (e.g. headings) clean.
  p: ({ children }) => <>{children}</>,
};

export function MathText({
  source,
  className,
  inline,
  extraRemarkPlugins = [],
  components,
}: MathTextProps) {
  const mergedComponents = inline
    ? { ...INLINE_COMPONENTS, ...(components ?? {}) }
    : components;
  return (
    <div className={cn(className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, ...extraRemarkPlugins]}
        // output: 'html' suppresses the MathML twin that browsers natively render —
        // without it (and without katex.min.css's visually-hidden rule taking effect),
        // each `$x$` would show twice (e.g. "3 3"). HTML-only is fine for our audience.
        rehypePlugins={[[rehypeKatex, { output: "html" }]]}
        components={mergedComponents}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
