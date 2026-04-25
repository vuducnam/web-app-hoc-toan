"use client";
// Knowledge-note Markdown renderer — wraps the shared MathText pipeline with
// note-specific prose styling (typography, lists, inline code) PLUS the
// `:::figure{kind=K …}:::` directive that embeds geometry figures inside notes.
// All input comes from version-controlled seed files (no untrusted user input in MVP),
// so no rehype-sanitize. Future teacher UI must add sanitization.
import remarkDirective from "remark-directive";
import type { Components } from "react-markdown";
import { MathText } from "@/components/ui/math-text";
import { FigureRenderer } from "@/components/geometry-figures/figure-renderer";
import { remarkFigureDirective } from "@/lib/knowledge-notes/remark-figure-directive";
import type { FigureSpec } from "@/lib/generators/types";
import { cn } from "@/lib/ui/cn";

interface NoteMarkdownProps {
  source: string;
  className?: string;
}

const NOTE_REMARK_PLUGINS = [remarkDirective, remarkFigureDirective];

const NOTE_COMPONENTS: Components = {
  // remark-figure-directive emits <div data-figure="<json>"> — intercept and render via FigureRenderer.
  div: (props) => {
    const figureJson = (props as { "data-figure"?: string })["data-figure"];
    if (!figureJson) return <div {...props} />;
    try {
      const spec = JSON.parse(figureJson) as FigureSpec;
      return <FigureRenderer spec={spec} />;
    } catch {
      return null;
    }
  },
};

export function NoteMarkdown({ source, className }: NoteMarkdownProps) {
  return (
    <MathText
      source={source}
      extraRemarkPlugins={NOTE_REMARK_PLUGINS}
      components={NOTE_COMPONENTS}
      className={cn(
        // Compact prose styling tuned for kids: larger base font, tight headings.
        "leading-relaxed text-ink-900 text-base md:text-lg",
        "[&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mb-1 [&_strong]:font-bold [&_strong]:text-ink-900",
        "[&_code]:font-mono [&_code]:px-1 [&_code]:rounded [&_code]:bg-ink-50",
        className,
      )}
    />
  );
}
