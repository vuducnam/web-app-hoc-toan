// Pure XP calculation for a single answer attempt.
// No Prisma / Next.js imports — safe to use in unit tests.

/** Minimum consecutive correct answers to earn the streak bonus */
const CONSECUTIVE_BONUS_THRESHOLD = 3;

/** Base XP for any correct answer */
const BASE_XP = 10;

/** Speed bonus: answer under 30 seconds */
const SPEED_BONUS_XP = 5;
const SPEED_THRESHOLD_MS = 30_000;

/** Streak bonus: 3+ consecutive correct answers */
const CONSECUTIVE_BONUS_XP = 15;

export interface XpAttemptInput {
  correct: boolean;
  elapsedMs: number;
  consecutiveCorrect: number;
}

/**
 * Compute XP earned for a single answer attempt.
 *
 * Rules:
 *   - Wrong answer → 0 XP
 *   - +10 base for correct
 *   - +5 if answered in under 30 s
 *   - +15 if consecutiveCorrect >= 3
 *
 * Example: correct=true, elapsedMs=10000, consecutiveCorrect=5 → 30 (10+5+15)
 */
export function computeXpForAttempt(a: XpAttemptInput): number {
  if (!a.correct) return 0;

  let xp = BASE_XP;
  if (a.elapsedMs < SPEED_THRESHOLD_MS) xp += SPEED_BONUS_XP;
  if (a.consecutiveCorrect >= CONSECUTIVE_BONUS_THRESHOLD) xp += CONSECUTIVE_BONUS_XP;

  return xp;
}
