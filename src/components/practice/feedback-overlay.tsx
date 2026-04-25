"use client";
// Full feedback overlay — Phase 09 replacement for the Phase 08 stub.
// Drives: confetti burst (correct), shake (wrong), Mimi emotions, level-up banner.
// Asymmetric: correct = big celebration; wrong = gentle shake, no red banner.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMascot } from "@/stores/mascot-store";
import { EncouragingToast } from "@/components/ui/encouraging-toast";
import { ConfettiBurst } from "@/components/feedback/confetti-burst";
import { LevelUpBanner } from "@/components/feedback/level-up-banner";
import { SHAKE_ANIMATE, SHAKE_TRANSITION } from "@/components/feedback/shake-attr";
import { pickEncouragement } from "@/lib/ui/encouragement-pool";
import { NoteMarkdown } from "@/components/knowledge-notes/note-markdown";
import { FigureRenderer } from "@/components/geometry-figures/figure-renderer";
import { cn } from "@/lib/ui/cn";
import type { MasteryLevel } from "@/components/ui/mastery-pill";
import type { EncouragementKind } from "@/lib/ui/encouragement-pool";
import type { FigureSpec } from "@/lib/generators/types";

export interface FeedbackState {
  correct: boolean;
  leveledUp: boolean;
  newMasteryLevel: MasteryLevel;
  /** Encouragement key from server — maps to correct/wrong phrase pool */
  encouragementKey: string;
  /** Server-formatted correct answer (always shown after submit). */
  correctAnswer: string;
  /** Optional Markdown + KaTeX explanation. Empty when unavailable. */
  explanation: string;
  /** Optional figure visualising the solution (often shaded). */
  solutionFigure?: FigureSpec;
}

interface FeedbackOverlayProps {
  feedback: FeedbackState | null;
  /** Previous mastery level — used to show before→after in level-up banner */
  prevMasteryLevel?: MasteryLevel;
  /** Called after the auto-dismiss delay to advance to the next question */
  onAdvance: () => void;
}

// Durations in ms
// Correct answers auto-advance, but with generous delay (8s) for the student to
// read the inline answer + explanation panel. They can click "Tiếp theo"
// to skip the wait early. Wrong answers DO NOT auto-advance — manual click required.
const CORRECT_DISMISS_MS = 8000;
const LEVEL_UP_EXTRA_MS = 800;

/**
 * Full feedback overlay replacing Phase 08 stub.
 * Wraps question card children in a motion.div that shakes on wrong answers.
 * Confetti and level-up banner render as portals above the card.
 */
export function FeedbackOverlay({
  feedback,
  prevMasteryLevel = "NOT_STARTED",
  onAdvance,
}: FeedbackOverlayProps) {
  const setMimi = useMascot((s) => s.set);
  // Track confetti trigger via state so re-renders see the new value (refs read during render are not allowed)
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const triggerSeqRef = useRef<number>(0);
  // Panel can be hidden without advancing — student may want to look at the original
  // question while keeping the option to re-show the answer + explanation.
  const [dismissed, setDismissed] = useState<boolean>(false);

  // Reset dismissed state whenever a new feedback object arrives (next submit).
  useEffect(() => {
    setDismissed(false);
  }, [feedback]);

  useEffect(() => {
    if (!feedback) return;

    if (feedback.correct) {
      // Bump confetti trigger to re-fire burst
      triggerSeqRef.current += 1;
      setConfettiTrigger(triggerSeqRef.current);
      setMimi(feedback.leveledUp ? "cheering" : "happy");
    } else {
      setMimi("sad");
    }

    const mimiResetMs = feedback.correct ? 800 : 1000;
    const mimiTimer = setTimeout(() => setMimi("idle"), mimiResetMs);

    // Hybrid advance: correct → auto-dismiss; wrong → wait for student click on "Tiếp theo".
    // If student manually dismissed the panel, cancel auto-advance so they have time to think.
    if (feedback.correct && !dismissed) {
      const dismissMs = CORRECT_DISMISS_MS + (feedback.leveledUp ? LEVEL_UP_EXTRA_MS : 0);
      const advanceTimer = setTimeout(onAdvance, dismissMs);
      return () => {
        clearTimeout(mimiTimer);
        clearTimeout(advanceTimer);
      };
    }

    return () => clearTimeout(mimiTimer);
  }, [feedback, setMimi, onAdvance, dismissed]);

  if (!feedback) return null;

  const kind: EncouragementKind = feedback.correct ? "correct" : "wrong";
  const phrase = pickEncouragement(kind);

  return (
    <>
      {/* Confetti — only on correct answers */}
      {feedback.correct && (
        <ConfettiBurst
          trigger={confettiTrigger}
          size={feedback.leveledUp ? "large" : "small"}
        />
      )}

      {/* Level-up banner — absolute overlay, visible for ~800ms extra */}
      {feedback.leveledUp && (
        <LevelUpBanner
          from={prevMasteryLevel}
          to={feedback.newMasteryLevel}
          visible={true}
        />
      )}

      {/* Inline panel — ALWAYS shown after submit. Correct = green/brand, wrong = coral.
          Both render correctAnswer + explanation. Can be temporarily hidden via close
          button → "Xem lại đáp án" pill restores it. */}
      <FeedbackPanel
        correct={feedback.correct}
        phrase={phrase}
        correctAnswer={feedback.correctAnswer}
        explanation={feedback.explanation}
        solutionFigure={feedback.solutionFigure}
        dismissed={dismissed}
        onDismiss={() => setDismissed(true)}
        onRestore={() => setDismissed(false)}
        onAdvance={onAdvance}
      />
    </>
  );
}

interface FeedbackPanelProps {
  correct: boolean;
  phrase: string;
  correctAnswer: string;
  explanation: string;
  solutionFigure?: FigureSpec;
  dismissed: boolean;
  onDismiss: () => void;
  onRestore: () => void;
  onAdvance: () => void;
}

/** Inline panel below the question card. Always shows correct answer + explanation.
 *  When `dismissed`, renders a compact bar with "Xem lại đáp án" + "Tiếp theo →". */
function FeedbackPanel({
  correct,
  phrase,
  correctAnswer,
  explanation,
  solutionFigure,
  dismissed,
  onDismiss,
  onRestore,
  onAdvance,
}: FeedbackPanelProps) {
  const tone = correct
    ? { wrap: "border-bubble-mint-300 bg-bubble-mint-300/10", label: "text-bubble-mint-500", header: "Đáp án" }
    : { wrap: "border-coral-300 bg-coral-50/30", label: "text-coral-500", header: "Đáp án đúng" };

  if (dismissed) {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRestore}
          aria-label="Xem lại đáp án và giải thích"
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-bold text-sm md:text-base",
            "bg-white border-2 border-brand-300 text-brand-700 shadow-chunky transition-all",
            "hover:bg-brand-50 active:translate-y-[3px] active:shadow-none",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
          )}
        >
          <span aria-hidden="true">↩</span>
          Xem lại đáp án
        </button>
        <button
          type="button"
          onClick={onAdvance}
          className={cn(
            "inline-flex items-center px-6 py-2.5 rounded-2xl font-display font-bold",
            "bg-brand-500 text-white shadow-chunky-brand transition-all",
            "hover:bg-brand-700 active:translate-y-[3px] active:shadow-none",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
          )}
        >
          Tiếp theo →
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={correct ? "Đáp án và giải thích" : "Đáp án đúng và giải thích"}
      className={cn("mt-4 rounded-3xl border-2 p-5 md:p-6 space-y-3 relative", tone.wrap)}
    >
      {/* Close button — hides panel without advancing, lets student look at the question. */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Ẩn đáp án (vẫn có thể xem lại)"
        className={cn(
          "absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full",
          "text-ink-600 hover:text-ink-900 hover:bg-white/70 transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <p className={cn("text-sm font-bold pr-10", tone.label)} aria-live="polite">
        {correct ? "✓ " : ""}{phrase}
      </p>

      <div className="space-y-1">
        <p className="text-xs font-bold uppercase text-ink-600 tracking-wide">{tone.header}</p>
        <p className="font-mono text-2xl font-bold text-ink-900">{correctAnswer}</p>
      </div>

      {solutionFigure && (
        <div className="flex justify-center">
          <FigureRenderer spec={solutionFigure} />
        </div>
      )}

      {explanation && (
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase text-ink-600 tracking-wide">Giải thích</p>
          <NoteMarkdown source={explanation} className="text-sm md:text-base" />
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onAdvance}
          className={cn(
            "inline-flex items-center px-6 py-2.5 rounded-2xl font-display font-bold",
            "bg-brand-500 text-white shadow-chunky-brand transition-all",
            "hover:bg-brand-700 active:translate-y-[3px] active:shadow-none",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
          )}
        >
          Tiếp theo →
        </button>
      </div>
    </div>
  );
}

/**
 * Wrapper for the question card that applies a shake animation on wrong answers
 * AND a brief border/ring flash at the moment of submission.
 *   flash="correct" → green ring pulse (~500ms)
 *   flash="wrong"   → red ring pulse + shake (~600ms)
 *   flash=null      → idle, no animation
 * The flash key forces the keyframe animation to restart on every submit so a
 * second wrong answer in a row still pulses visibly.
 */
export function ShakeWrapper({
  shake,
  flash,
  flashKey,
  children,
}: {
  shake: boolean;
  flash?: "correct" | "wrong" | null;
  /** Bump this value (e.g. question seed) to force-restart the flash keyframe. */
  flashKey?: string | number;
  children: React.ReactNode;
}) {
  const flashClass =
    flash === "correct"
      ? "animate-[ring-flash-correct_500ms_ease-out] rounded-3xl"
      : flash === "wrong"
        ? "animate-[ring-flash-wrong_600ms_ease-out] rounded-3xl"
        : "";

  return (
    <motion.div
      // key forces remount of the animation when a new flash starts
      key={flash ? `${flash}-${flashKey ?? ""}` : "idle"}
      animate={shake ? SHAKE_ANIMATE : { x: 0 }}
      transition={shake ? SHAKE_TRANSITION : { duration: 0 }}
      className={flashClass}
    >
      {children}
    </motion.div>
  );
}
