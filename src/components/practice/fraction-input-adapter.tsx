"use client";
// Wraps <FractionInput> from ui/ and emits "num/den" string to onAnswer.
import { useEffect, useRef, useState } from "react";
import { FractionInput } from "@/components/ui/fraction-input";
import type { FractionValue } from "@/components/ui/fraction-input";
import type { AnswerInputProps } from "@/lib/practice/map-answer-format-to-input";

/** Fraction input adapter — emits "${num}/${den}" string on commit. */
export function FractionInputAdapter({ onAnswer, disabled, autoFocus = true }: AnswerInputProps) {
  const [value, setValue] = useState<FractionValue>({ num: "", den: "" });
  // Focus the wrapper on mount so keyboard users can tab into numerator
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) {
      // Focus first focusable child (numerator input)
      const firstInput = wrapperRef.current?.querySelector("input");
      firstInput?.focus();
    }
  }, [autoFocus]);

  function handleCommit() {
    const num = value.num.trim();
    const den = value.den.trim();
    if (num && den && den !== "0") {
      onAnswer(`${num}/${den}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Allow Enter on denominator field to submit
    if (e.key === "Enter") handleCommit();
  }

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col items-center gap-3"
      onKeyDown={handleKeyDown}
    >
      <label className="text-sm text-ink-600 font-semibold">Điền phân số:</label>
      <FractionInput
        value={value}
        onChange={setValue}
        disabled={disabled}
        ariaLabel="Nhập phân số đáp án"
      />
    </div>
  );
}
