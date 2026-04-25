"use client";
// Soft companion nudge shown when a kid sits idle on a question.
// Two phases come from useIdleHint(): "soft" = gentle "still there?", "deep" = stronger "skip if it's hard".
// Designed to be supportive, never punitive — no countdown, no red color, no time numbers shown.
// Mimi switches to "thinking" so the cue feels like the mascot is also pondering.
import { motion, AnimatePresence } from "framer-motion";
import { MimiSVG } from "@/components/mimi/mimi-svg";
import type { IdleHintPhase } from "@/lib/practice/use-idle-hint";

interface IdleHintBubbleProps {
  phase: IdleHintPhase;
}

const PHRASES: Record<Exclude<IdleHintPhase, "calm">, string> = {
  soft: "Cứ từ từ nhé, mình suy nghĩ cùng bạn…",
  deep: "Câu này hơi khó nhỉ? Bỏ qua hoặc xin trợ giúp cũng được nha.",
};

export function IdleHintBubble({ phase }: IdleHintBubbleProps) {
  const visible = phase !== "calm";
  const phrase = visible ? PHRASES[phase] : "";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 shadow-soft"
        >
          <MimiSVG state="thinking" size={48} className="shrink-0" />
          <p className="font-display text-base font-semibold text-brand-700 leading-snug">
            {phrase}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
