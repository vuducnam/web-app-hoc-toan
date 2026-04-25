"use client";
// Decimal answer input — accepts both comma (Vietnamese) and dot separators.
// Normalises to dot before calling onAnswer so server comparison is consistent.
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import type { AnswerInputProps } from "@/lib/practice/map-answer-format-to-input";

const inputClass =
  "w-40 text-center font-mono text-3xl font-bold py-3 rounded-2xl" +
  " border-2 border-brand-100 bg-white text-ink-900" +
  " focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" +
  " disabled:opacity-50 disabled:cursor-not-allowed" +
  " placeholder:text-ink-300";

/** Decimal answer input; normalises Vietnamese comma separator to dot on submit. */
export function DecimalInput({ onAnswer, onChange, disabled, autoFocus = true }: AnswerInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function normalise(raw: string): string {
    // Replace comma with dot for server-side comparison
    return raw.replace(",", ".");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onAnswer(normalise(value.trim()));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow digits, dot, and comma only
    const cleaned = e.target.value.replace(/[^0-9.,]/g, "");
    setValue(cleaned);
    onChange?.(cleaned.trim() ? normalise(cleaned.trim()) : "");
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm text-ink-600 font-semibold">Nhập đáp số:</label>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        aria-label="Nhập số thập phân"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(inputClass)}
        placeholder="0,0"
      />
    </div>
  );
}
