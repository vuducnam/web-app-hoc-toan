"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/ui/cn";

export interface XPCounterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  /** Duration of count-up animation in seconds */
  duration?: number;
}

/** Animated XP counter — sun-500 color with count-up via framer-motion */
export function XPCounter({ value, duration = 0.8, className, ...props }: XPCounterProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const prevRef = useRef(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    prevRef.current = value;
    return controls.stop;
  }, [value, duration, motionValue]);

  return (
    <div
      aria-label={`${value} XP`}
      className={cn("inline-flex items-center gap-1.5 font-bold text-sun-500", className)}
      {...props}
    >
      {/* Sun icon — inline SVG, no external dependency */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="2"  x2="12" y2="5"  />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2"  y1="12" x2="5"  y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.9"  y1="4.9"  x2="7"    y2="7"    />
          <line x1="17"   y1="17"   x2="19.1" y2="19.1" />
          <line x1="4.9"  y1="19.1" x2="7"    y2="17"   />
          <line x1="17"   y1="7"    x2="19.1" y2="4.9"  />
        </g>
      </svg>
      <motion.span>{rounded}</motion.span>
      <span className="text-sm font-semibold text-sun-700">XP</span>
    </div>
  );
}
