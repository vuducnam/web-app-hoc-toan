// Pure mastery state-machine — NO Prisma imports, NO Next.js imports.
// Implements every row of the transition table from research §2.
// Safe to unit-test in isolation (Phase 12).
import type {
  MasteryLevel,
  SkillProgressShape,
  AttemptInput,
  MasteryEvalResult,
} from "./types";

// ---------------------------------------------------------------------------
// Promotion thresholds (research §6)
// ---------------------------------------------------------------------------

/** NOT_STARTED → FAMILIAR: first correct, OR 3rd+ failure */
const FAMILIAR_WRONG_THRESHOLD = 3;

/** FAMILIAR → PROFICIENT: 5 consecutive correct OR (≥5 attempts AND ratio≥0.65) */
const PROFICIENT_STREAK_THRESHOLD = 5;
const PROFICIENT_RATIO_THRESHOLD = 0.65;
const PROFICIENT_ATTEMPTS_THRESHOLD = 5;

/** PROFICIENT → MASTERED: 8 consecutive on hard OR (≥15 attempts AND ratio≥0.9) */
const MASTERED_STREAK_THRESHOLD = 8;
const MASTERED_RATIO_THRESHOLD = 0.9;
const MASTERED_ATTEMPTS_THRESHOLD = 15;

/** PROFICIENT demotion back to FAMILIAR: ratio<0.6 AND inactivity>7d (research §2 row 6) */
const PROFICIENT_DEMOTE_RATIO = 0.6;
const PROFICIENT_DEMOTE_INACTIVITY_DAYS = 7;

/** MASTERED decay to PROFICIENT: inactivity>30d (research §2 row 7 — checked here at practice time) */
const MASTERED_DECAY_INACTIVITY_DAYS = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysSince(date: Date | null, now: Date): number {
  if (!date) return Infinity;
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
}

function correctRatio(correct: number, total: number): number {
  if (total === 0) return 0;
  return correct / total;
}

// ---------------------------------------------------------------------------
// Core pure function
// ---------------------------------------------------------------------------

/**
 * Evaluate mastery transition after a single attempt.
 * Implements ALL rows from research §2 transition table.
 *
 * Row reference:
 *   R1: NOT_STARTED + Correct → FAMILIAR
 *   R2: NOT_STARTED + Wrong (3rd+ failure) → FAMILIAR
 *   R3: FAMILIAR + streak=5 → PROFICIENT
 *   R4: FAMILIAR + ratio≥0.65 & attempts≥5 → PROFICIENT
 *   R5: PROFICIENT + streak≥8 on hard → MASTERED
 *   R6: PROFICIENT + ratio<0.6 & inactivity>7d → FAMILIAR (demote)
 *   R7: MASTERED + inactivity>30d → PROFICIENT (decay, checked at practice time)
 *   R8: Any + hard difficulty → boost progression (weight streak higher — handled via R3/R5 thresholds)
 *
 * Level is sticky on wrong answers (no demotion from wrong answers alone,
 * except R6 PROFICIENT demote which requires inactivity + ratio combined).
 */
export function evaluateMastery(
  progress: SkillProgressShape,
  attempt: AttemptInput,
): MasteryEvalResult {
  const now = attempt.timestamp;

  // --- 1. Update counters ---
  const totalAttempts = progress.totalAttempts + 1;
  const correctAttempts = attempt.correct
    ? progress.correctAttempts + 1
    : progress.correctAttempts;

  // streak resets to 0 on wrong, increments on correct
  const currentStreak = attempt.correct ? progress.currentStreak + 1 : 0;
  const longestStreak = Math.max(progress.longestStreak, currentStreak);

  const ratio = correctRatio(correctAttempts, totalAttempts);
  const inactivityDays = daysSince(progress.lastPracticedAt, now);
  const isHard = attempt.difficulty === "HARD";
  // STRICT progression gate (2026-04-25): each promotion requires the triggering
  // attempt to be at the matching minimum difficulty. Closes the "D1 spam → MASTERED"
  // loophole. NOT_STARTED → FAMILIAR has no gate (any first attempt advances).
  const isMediumOrHigher = attempt.difficulty === "MEDIUM" || attempt.difficulty === "HARD";

  // --- 2. Determine new mastery level ---
  let masteryLevel: MasteryLevel = progress.masteryLevel;

  switch (progress.masteryLevel) {
    case "NOT_STARTED": {
      // R1: first correct → FAMILIAR
      if (attempt.correct) {
        masteryLevel = "FAMILIAR";
        break;
      }
      // R2: 3rd+ failure → FAMILIAR (flag for review)
      if (!attempt.correct && totalAttempts >= FAMILIAR_WRONG_THRESHOLD) {
        masteryLevel = "FAMILIAR";
      }
      break;
    }

    case "FAMILIAR": {
      // STRICT GATE: PROFICIENT requires the triggering attempt to be at MEDIUM or HARD.
      // Prevents reaching PROFICIENT by spamming EASY-only.
      if (!isMediumOrHigher) break;
      // R3: streak=5 consecutive correct → PROFICIENT
      if (currentStreak >= PROFICIENT_STREAK_THRESHOLD) {
        masteryLevel = "PROFICIENT";
        break;
      }
      // R4: ratio≥0.65 AND attempts≥5 → PROFICIENT
      if (
        totalAttempts >= PROFICIENT_ATTEMPTS_THRESHOLD &&
        ratio >= PROFICIENT_RATIO_THRESHOLD
      ) {
        masteryLevel = "PROFICIENT";
      }
      break;
    }

    case "PROFICIENT": {
      // R6: ratio<0.6 AND inactivity>7d → FAMILIAR (demote, checked at practice time)
      // Check this BEFORE promotion: if they've been away and are doing poorly, demote first.
      if (
        inactivityDays > PROFICIENT_DEMOTE_INACTIVITY_DAYS &&
        ratio < PROFICIENT_DEMOTE_RATIO
      ) {
        masteryLevel = "FAMILIAR";
        break;
      }
      // STRICT GATE: MASTERED always requires the triggering attempt to be HARD.
      // Closes the EASY/MEDIUM-only loophole on the ratio path (R5b).
      if (!isHard) break;
      // R5a: streak≥8 on hard → MASTERED
      if (currentStreak >= MASTERED_STREAK_THRESHOLD) {
        masteryLevel = "MASTERED";
        break;
      }
      // R5b (ratio path): ≥15 attempts AND ratio≥0.9 → MASTERED — now also requires isHard above.
      if (
        totalAttempts >= MASTERED_ATTEMPTS_THRESHOLD &&
        ratio >= MASTERED_RATIO_THRESHOLD
      ) {
        masteryLevel = "MASTERED";
      }
      break;
    }

    case "MASTERED": {
      // R7: inactivity>30d → PROFICIENT (decay)
      // Decay is checked at practice time rather than a background cron in MVP.
      if (inactivityDays > MASTERED_DECAY_INACTIVITY_DAYS) {
        masteryLevel = "PROFICIENT";
      }
      // MASTERED never demotes further from a single attempt.
      break;
    }
  }

  const leveledUp = masteryLevel !== progress.masteryLevel;

  return {
    masteryLevel,
    totalAttempts,
    correctAttempts,
    currentStreak,
    longestStreak,
    lastPracticedAt: now,
    lastDifficulty: attempt.difficulty,
    leveledUp,
  };
}
