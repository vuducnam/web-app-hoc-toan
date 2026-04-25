"use client";
// Numeric answer input — auto-focuses on mount (React remount via key={seed}).
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import type { AnswerInputProps } from "@/lib/practice/map-answer-format-to-input";

const inputClass =
  "w-40 text-center font-mono text-3xl font-bold py-3 rounded-2xl" +
  " border-2 border-brand-100 bg-white text-ink-900" +
  " focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" +
  " disabled:opacity-50 disabled:cursor-not-allowed" +
  " placeholder:text-ink-300";

/** Numeric input for integer / whole-number answers. */
export function NumericInput({ onAnswer, onChange, disabled, autoFocus = true }: AnswerInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  // Auto-focus when mounted (component is remounted on each new question via key={seed}).
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onAnswer(value.trim());
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    onChange?.(next.trim());
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm text-ink-600 font-semibold">Nhập đáp số:</label>
      <input
        ref={ref}
        type="number"
        inputMode="numeric"
        aria-label="Nhập đáp số"
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={cn(inputClass)}
        placeholder="0"
      />
    </div>
  );
}
