"use client";
// Confetti burst component — wraps canvas-confetti imperatively.
// Fires a burst whenever the `trigger` prop changes to a truthy value.
// Respects prefers-reduced-motion: skips particle animation, flashes body bg instead.
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export interface ConfettiBurstProps {
  /** Toggle this to a new truthy value to fire the burst */
  trigger: boolean | number;
  size: "small" | "large";
}

const PARTICLE_COUNTS = { small: 40, large: 80 } as const;

/** Returns true if the user prefers reduced motion */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Renders nothing — fires a confetti burst imperatively via canvas-confetti.
 * On prefers-reduced-motion, shows a brief background color flash instead.
 */
export function ConfettiBurst({ trigger, size }: ConfettiBurstProps) {
  const prevTrigger = useRef<boolean | number>(false);

  useEffect(() => {
    if (!trigger || trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;

    if (prefersReducedMotion()) {
      // Reduced-motion fallback: flash document background briefly
      const body = document.body;
      body.style.transition = "background-color 150ms ease";
      body.style.backgroundColor = "#e6faf7"; // brand-50
      const reset = setTimeout(() => {
        body.style.backgroundColor = "";
        body.style.transition = "";
      }, 300);
      return () => clearTimeout(reset);
    }

    const count = PARTICLE_COUNTS[size];
    // Two bursts from left and right edges for a natural spread
    confetti({
      particleCount: Math.floor(count * 0.6),
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ["#0cbbab", "#f0b429", "#ff3366", "#fcd34d", "#34d399"],
      gravity: 1.2,
      scalar: 1.1,
    });
    confetti({
      particleCount: Math.floor(count * 0.4),
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ["#0cbbab", "#f0b429", "#ff3366", "#fcd34d", "#34d399"],
      gravity: 1.2,
      scalar: 1.1,
    });
  }, [trigger, size]);

  return null;
}
