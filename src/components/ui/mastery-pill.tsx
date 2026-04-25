import * as React from "react";
import { cn } from "@/lib/ui/cn";

/** Mastery bucket levels matching the 4-bucket system */
export type MasteryLevel = "NOT_STARTED" | "FAMILIAR" | "PROFICIENT" | "MASTERED";

interface MasteryPillConfig {
  label: string;
  className: string;
}

const MASTERY_CONFIG: Record<MasteryLevel, MasteryPillConfig> = {
  NOT_STARTED: {
    label: "Chưa học",
    className: "bg-mastery-0 text-ink-600",
  },
  FAMILIAR: {
    label: "Quen thuộc",
    className: "bg-mastery-1 text-ink-900",
  },
  PROFICIENT: {
    label: "Thành thạo",
    className: "bg-mastery-2 text-ink-900",
  },
  MASTERED: {
    label: "Thuần thục",
    className: "bg-mastery-3 text-white",
  },
};

export interface MasteryPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: MasteryLevel;
}

/** Pill badge showing Vietnamese mastery level with color coding */
export function MasteryPill({ level, className, ...props }: MasteryPillProps) {
  const config = MASTERY_CONFIG[level];
  return (
    <span
      role="status"
      aria-label={`Mức độ: ${config.label}`}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold",
        config.className,
        className
      )}
      {...props}
    >
      {config.label}
    </span>
  );
}
