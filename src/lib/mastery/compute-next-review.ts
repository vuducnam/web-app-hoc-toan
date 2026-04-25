// Pure SM-2 lite interval calculator — NO Prisma imports, NO Next.js imports.
// Implements spaced-repetition intervals from research §5.
// Interval selection uses correctAttempts as a proxy for "how many times
// the student has successfully revisited this skill" (0=first time, 1=second, 2+=third+).
import type { MasteryLevel } from "./types";

// ---------------------------------------------------------------------------
// Interval tables from research §5
// ---------------------------------------------------------------------------

/**
 * Leitner-lite interval tables (days) per mastery level.
 * Index 0 = first review, 1 = second review, 2+ = third+ review.
 * NOT_STARTED has no review schedule — treated as FAMILIAR on first attempt.
 */
const INTERVALS: Record<MasteryLevel, [number, number, number]> = {
  NOT_STARTED: [1, 3, 7],   // same as FAMILIAR; used as fallback
  FAMILIAR:    [1, 3, 7],
  PROFICIENT:  [3, 7, 14],
  MASTERED:    [14, 30, 60],
};

// ---------------------------------------------------------------------------
// Pure function
// ---------------------------------------------------------------------------

export interface NextReviewResult {
  nextReviewAt: Date;
  daysIntervalUntilReview: number;
}

/**
 * Compute the next review date using SM-2 lite intervals.
 *
 * @param masteryLevel  New mastery level after the attempt.
 * @param correctAttempts  Cumulative correct attempts (used as interval-step proxy).
 * @param now  Reference timestamp (defaults to current time; injectable for tests).
 */
export function computeNextReview(
  masteryLevel: MasteryLevel,
  correctAttempts: number,
  now: Date = new Date(),
): NextReviewResult {
  const table = INTERVALS[masteryLevel];
  // Clamp index to [0, 2] — third+ review uses the longest interval for the level
  const index = Math.min(Math.max(correctAttempts, 0), 2) as 0 | 1 | 2;
  const daysIntervalUntilReview = table[index];

  const nextReviewAt = new Date(now.getTime());
  nextReviewAt.setDate(nextReviewAt.getDate() + daysIntervalUntilReview);

  return { nextReviewAt, daysIntervalUntilReview };
}
