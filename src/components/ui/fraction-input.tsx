"use client";

import * as React from "react";
import { useRef } from "react";
import { cn } from "@/lib/ui/cn";

export interface FractionValue {
  num: string;
  den: string;
}

export interface FractionInputProps {
  value?: FractionValue;
  onChange?: (value: FractionValue) => void;
  disabled?: boolean;
  className?: string;
  /** aria-label for the whole fraction input group */
  ariaLabel?: string;
}

const inputClass =
  "w-16 h-10 text-center font-mono text-3xl font-semibold text-ink-900 bg-transparent" +
  " border-2 border-brand-100 rounded-md focus:outline-none focus:border-brand-500" +
  " focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed" +
  " placeholder:text-ink-400";

/**
 * Fraction input — two stacked inputs (numerator over denominator).
 * Enter key in numerator moves focus to denominator.
 * Emits {num, den} via onChange.
 */
export function FractionInput({
  value = { num: "", den: "" },
  onChange,
  disabled = false,
  className,
  ariaLabel = "Nhập phân số",
}: FractionInputProps) {
  const denRef = useRef<HTMLInputElement>(null);

  function handleNumKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      denRef.current?.focus();
    }
  }

  function handleChange(field: "num" | "den", raw: string) {
    // Allow digits and empty only
    const cleaned = raw.replace(/[^0-9]/g, "");
    onChange?.({ ...value, [field]: cleaned });
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("inline-flex flex-col items-center gap-0.5", className)}
    >
      {/* Numerator */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Tử số"
        value={value.num}
        disabled={disabled}
        onChange={(e) => handleChange("num", e.target.value)}
        onKeyDown={handleNumKeyDown}
        className={inputClass}
        placeholder="0"
      />

      {/* Fraction line */}
      <div className="w-16 h-0.5 bg-ink-900 rounded-full" aria-hidden="true" />

      {/* Denominator */}
      <input
        ref={denRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Mẫu số"
        value={value.den}
        disabled={disabled}
        onChange={(e) => handleChange("den", e.target.value)}
        className={inputClass}
        placeholder="1"
      />
    </div>
  );
}
