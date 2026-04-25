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
import type { MasteryLevel } from "@/components/ui/mastery-pill";
import type { EncouragementKind } from "@/lib/ui/encouragement-pool";

export interface FeedbackState {
  correct: boolean;
  leveledUp: boolean;
  newMasteryLevel: MasteryLevel;
  /** Encouragement key from server — maps to correct/wrong phrase pool */
  encouragementKey: string;
}

interface FeedbackOverlayProps {
  feedback: FeedbackState | null;
  /** Previous mastery level — used to show before→after in level-up banner */
  prevMasteryLevel?: MasteryLevel;
  /** Called after the auto-dismiss delay to advance to the next question */
  onAdvance: () => void;
}

// Durations in ms
const CORRECT_DISMISS_MS = 1200;
const WRONG_DISMISS_MS = 1400;
const LEVEL_UP_EXTRA_MS = 800; // extra wait while level-up banner shows

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

    const dismissMs = feedback.correct
      ? CORRECT_DISMISS_MS + (feedback.leveledUp ? LEVEL_UP_EXTRA_MS : 0)
      : WRONG_DISMISS_MS;

    const mimiResetMs = feedback.correct ? 800 : 1000;

    const mimiTimer = setTimeout(() => setMimi("idle"), mimiResetMs);
    const advanceTimer = setTimeout(onAdvance, dismissMs);

    return () => {
      clearTimeout(mimiTimer);
      clearTimeout(advanceTimer);
    };
  }, [feedback, setMimi, onAdvance]);

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

      {/* Encouraging toast with Mimi avatar */}
      <EncouragingToast
        open={true}
        onOpenChange={() => {/* controlled by timer */}}
        phrase={phrase}
        kind={kind}
        duration={feedback.correct ? CORRECT_DISMISS_MS : WRONG_DISMISS_MS}
      />
    </>
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
