"use client";
// Generic text answer input for answerFormat: "text".
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import type { AnswerInputProps } from "@/lib/practice/map-answer-format-to-input";

const inputClass =
  "w-64 text-center font-mono text-2xl font-bold py-3 rounded-2xl" +
  " border-2 border-brand-100 bg-white text-ink-900" +
  " focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" +
  " disabled:opacity-50 disabled:cursor-not-allowed" +
  " placeholder:text-ink-300";

/** Generic text input for open-ended or word answers. */
export function TextInput({ onAnswer, disabled, autoFocus = true }: AnswerInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onAnswer(value.trim());
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm text-ink-600 font-semibold">Nhập câu trả lời:</label>
      <input
        ref={ref}
        type="text"
        aria-label="Nhập câu trả lời"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(inputClass)}
        placeholder="..."
      />
    </div>
  );
}
