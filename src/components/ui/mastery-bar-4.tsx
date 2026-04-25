import * as React from "react";
import { cn } from "@/lib/ui/cn";

export interface MasteryBar4Counts {
  notStarted: number;
  familiar: number;
  proficient: number;
  mastered: number;
}

export interface MasteryBar4Props extends React.HTMLAttributes<HTMLDivElement> {
  counts: MasteryBar4Counts;
}

/** 4-segment horizontal mastery bar — filled per bucket level */
export function MasteryBar4({ counts, className, ...props }: MasteryBar4Props) {
  const total = counts.notStarted + counts.familiar + counts.proficient + counts.mastered;
  if (total === 0) return null;

  const segments = [
    { key: "notStarted", value: counts.notStarted, bg: "bg-mastery-0", label: "Chưa học" },
    { key: "familiar",   value: counts.familiar,   bg: "bg-mastery-1", label: "Quen thuộc" },
    { key: "proficient", value: counts.proficient, bg: "bg-mastery-2", label: "Thành thạo" },
    { key: "mastered",   value: counts.mastered,   bg: "bg-mastery-3", label: "Thuần thục" },
  ] as const;

  return (
    <div
      role="img"
      aria-label={`Tiến độ: ${counts.mastered}/${total} thuần thục`}
      className={cn("flex h-3 w-full overflow-hidden rounded-sm", className)}
      {...props}
    >
      {segments.map(({ key, value, bg, label }) => {
        const pct = (value / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={key}
            title={`${label}: ${value}`}
            className={cn("h-full transition-all", bg)}
            style={{ width: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}
