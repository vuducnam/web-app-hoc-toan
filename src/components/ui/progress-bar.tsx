import * as React from "react";
import { cn } from "@/lib/ui/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  variant?: "student" | "parent";
}

/** Generic ratio-based progress bar for student and parent themes */
export function ProgressBar({
  value,
  max,
  variant = "student",
  className,
  ...props
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${value} / ${max}`}
      className={cn(
        "w-full overflow-hidden",
        variant === "student" ? "h-4 rounded-xl bg-brand-100" : "h-2 rounded-md bg-ink-400/20",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-base ease-snap",
          variant === "student" ? "bg-brand-500 rounded-xl" : "bg-brand-700 rounded-md"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
