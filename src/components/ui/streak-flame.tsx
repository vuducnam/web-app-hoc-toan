import * as React from "react";
import { cn } from "@/lib/ui/cn";

export interface StreakFlameProps extends React.HTMLAttributes<HTMLDivElement> {
  days: number;
}

/** Coral flame SVG + streak day count with gentle pulse animation */
export function StreakFlame({ days, className, ...props }: StreakFlameProps) {
  return (
    <div
      aria-label={`Chuỗi ${days} ngày liên tiếp`}
      className={cn("inline-flex items-center gap-1.5 font-bold text-coral-500", className)}
      {...props}
    >
      {/* Flame — inline SVG */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="animate-[pulse_2s_ease-in-out_infinite]"
      >
        <path d="M12 2C12 2 7 7.5 7 13a5 5 0 0 0 10 0c0-2.5-1.5-4.5-2.5-5.5 0 0 .5 3-1.5 3.5C11.5 9.5 12 5.5 12 2z" />
        <path
          d="M12 22C9.5 22 8 20.5 8 18.5c0-1.5 1-2.5 2-3 0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5c1 .5 2 1.5 2 3 0 2-1.5 3.5-3 3.5z"
          opacity="0.6"
        />
      </svg>
      <span className="text-lg leading-none">{days}</span>
      <span className="text-sm font-semibold text-coral-300">ngày</span>
    </div>
  );
}
