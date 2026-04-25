"use client";
// Difficulty selector — 4 chips: Auto / D1 Dễ / D2 Vừa / D3 Khó.
// Manual override applies to the NEXT question; current question keeps its difficulty.
// "Auto" returns to mastery-derived difficulty (server picks via nextDifficulty()).
import { cn } from "@/lib/ui/cn";
import type { Difficulty } from "@/lib/generators/types";

export type DifficultyChoice = Difficulty | null; // null = "Auto" (mastery-default)

interface DifficultySelectorProps {
  value: DifficultyChoice;
  onChange: (next: DifficultyChoice) => void;
  disabled?: boolean;
}

interface ChipDef {
  key: string;
  value: DifficultyChoice;
  label: string;
  hint: string;
}

const CHIPS: ReadonlyArray<ChipDef> = [
  { key: "auto", value: null, label: "Tự động", hint: "Dựa theo mức tiến bộ" },
  { key: "d1",   value: 1,    label: "Dễ",     hint: "Mức 1 — khởi động" },
  { key: "d2",   value: 2,    label: "Vừa",    hint: "Mức 2 — luyện tập" },
  { key: "d3",   value: 3,    label: "Khó",    hint: "Mức 3 — thử thách" },
];

export function DifficultySelector({ value, onChange, disabled = false }: DifficultySelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Chọn độ khó"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-sm font-bold text-ink-600 mr-1">Độ khó:</span>
      {CHIPS.map((chip) => {
        const active = chip.value === value;
        return (
          <button
            key={chip.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${chip.label} — ${chip.hint}`}
            disabled={disabled}
            onClick={() => onChange(chip.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-bold transition-all",
              "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              active
                ? "bg-brand-500 text-white shadow-chunky-brand"
                : "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
