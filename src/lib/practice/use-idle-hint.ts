"use client";
// Tracks idle time on the current question and emits two soft phases:
//   "calm" → "soft" (after softMs of inactivity)
//          → "deep" (after deepMs of inactivity)
// Resets on every keydown / pointerdown / touchstart, AND when `seedKey` changes
// (= a new question loaded). Pauses entirely when `locked` is true (e.g. during
// feedback overlay) — we do not want to nudge a kid mid-celebration.
import { useEffect, useState } from "react";

export type IdleHintPhase = "calm" | "soft" | "deep";

export interface UseIdleHintOptions {
  /** Threshold (ms) for the gentle "still there?" phase. Default 45s. */
  softMs?: number;
  /** Threshold (ms) for the stronger "want a hint?" phase. Default 90s. */
  deepMs?: number;
}

const DEFAULT_SOFT_MS = 45_000;
const DEFAULT_DEEP_MS = 90_000;

export function useIdleHint(
  seedKey: string,
  locked: boolean,
  opts: UseIdleHintOptions = {}
): IdleHintPhase {
  const softMs = opts.softMs ?? DEFAULT_SOFT_MS;
  const deepMs = opts.deepMs ?? DEFAULT_DEEP_MS;
  const [phase, setPhase] = useState<IdleHintPhase>("calm");

  useEffect(() => {
    // While the question is locked (post-submit feedback), skip the nudge entirely.
    if (locked) {
      setPhase("calm");
      return;
    }

    let softTimer: ReturnType<typeof setTimeout>;
    let deepTimer: ReturnType<typeof setTimeout>;

    const reset = () => {
      setPhase("calm");
      clearTimeout(softTimer);
      clearTimeout(deepTimer);
      softTimer = setTimeout(() => setPhase("soft"), softMs);
      deepTimer = setTimeout(() => setPhase("deep"), deepMs);
    };

    reset();
    // Listen on window so any input modality (keyboard / mouse / touch) defers the nudge.
    window.addEventListener("keydown", reset);
    window.addEventListener("pointerdown", reset);
    return () => {
      clearTimeout(softTimer);
      clearTimeout(deepTimer);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("pointerdown", reset);
    };
  }, [seedKey, locked, softMs, deepMs]);

  return phase;
}
