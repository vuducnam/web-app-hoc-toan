"use client";
// 10-slot progress bar. Each slot is a pill coloured by answer state.
// The current slot pulses to indicate the active question.
// Colors: correct=brand-500, wrong=coral-500, current=sun-400, empty=slate-200
import { cn } from "@/lib/ui/cn";

export type DotState = "empty" | "correct" | "wrong";

interface ProgressDotsProps {
  dots: DotState[];
  current: number; // index of the active question (0-based)
}

const dotColour: Record<DotState, string> = {
  empty: "bg-slate-200",
  correct: "bg-brand-500",
  wrong: "bg-coral-500",
};

/** Ten progress pills — gray/green/red with a pulse on the active slot. */
export function ProgressDots({ dots, current }: ProgressDotsProps) {
  return (
    <div className="flex-1 flex gap-1.5 items-center" aria-label="Tiến trình" role="progressbar">
      {dots.map((state, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 h-2 rounded-full transition-colors duration-300",
            dotColour[state],
            // Pulse ring on the active (empty) slot
            i === current && state === "empty" && "ring-2 ring-sun-500/40 bg-sun-400",
          )}
          aria-label={
            state === "empty"
              ? i === current
                ? "Câu hiện tại"
                : "Chưa làm"
              : state === "correct"
                ? "Đúng"
                : "Sai"
          }
        />
      ))}
    </div>
  );
}
