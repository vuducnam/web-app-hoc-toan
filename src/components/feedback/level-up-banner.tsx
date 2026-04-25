"use client";
// Level-up banner — shown for ~800ms when a student advances a mastery tier.
// Absolute-positioned over the practice card, fades in/out via framer-motion.
import { motion, AnimatePresence } from "framer-motion";
import type { MasteryLevel } from "@/components/ui/mastery-pill";

const MASTERY_LABELS: Record<MasteryLevel, string> = {
  NOT_STARTED: "Chưa học",
  FAMILIAR: "Quen thuộc",
  PROFICIENT: "Thành thạo",
  MASTERED: "Thuần thục",
};

export interface LevelUpBannerProps {
  from: MasteryLevel;
  to: MasteryLevel;
  /** Controls visibility — unmount when false to trigger exit animation */
  visible: boolean;
}

/**
 * Vietnamese level-up celebration banner.
 * Renders as an absolute overlay; parent must have position: relative.
 */
export function LevelUpBanner({ from, to, visible }: LevelUpBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label={`Lên hạng! ${MASTERY_LABELS[from]} lên ${MASTERY_LABELS[to]}`}
          initial={{ opacity: 0, scale: 0.85, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-40 flex justify-center pointer-events-none"
        >
          <div className="bg-paper rounded-2xl shadow-celebration border-2 border-coral-500 px-6 py-4 text-center max-w-xs">
            <p className="font-display font-bold text-xl text-coral-500 mb-1">
              Lên hạng!
            </p>
            <p className="font-display font-semibold text-base text-ink-900">
              {MASTERY_LABELS[from]}
              <span className="mx-2 text-brand-500">→</span>
              {MASTERY_LABELS[to]}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
