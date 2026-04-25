"use client";
// Lightweight Markdown + KaTeX renderer for knowledge notes.
// All input comes from version-controlled seed files (no untrusted user input in MVP),
// so no rehype-sanitize. Future teacher UI must add sanitization.
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/ui/cn";

interface NoteMarkdownProps {
  source: string;
  className?: string;
}

export function NoteMarkdown({ source, className }: NoteMarkdownProps) {
  return (
    <div
      className={cn(
        // Compact prose styling tuned for kids: larger base font, tight headings.
        "leading-relaxed text-ink-900 text-base md:text-lg",
        "[&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mb-1 [&_strong]:font-bold [&_strong]:text-ink-900",
        "[&_code]:font-mono [&_code]:px-1 [&_code]:rounded [&_code]:bg-ink-50",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
