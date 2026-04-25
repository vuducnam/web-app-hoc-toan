// Shared helpers for practice server actions.
// loadProgress — DB fetch + zero-state init.
// buildEncouragementKey — pure feedback string selector.
import { prisma } from "@/lib/prisma";
import type { MasteryLevel, SkillProgressShape } from "@/lib/mastery/types";
import type { EncouragementKey } from "./practice-types";

/** Max elapsedMs accepted from client — cap at 10 minutes to prevent abuse */
export const MAX_ELAPSED_MS = 600_000;

/** elapsedMs threshold for "correct-fast" encouragement (30 seconds) */
const FAST_THRESHOLD_MS = 30_000;

/** Streak threshold for "correct-streak" encouragement */
const STREAK_ENCOURAGEMENT_THRESHOLD = 3;

/**
 * Load SkillProgress from DB, or return a zero-state shape if not yet started.
 * Returns a plain TS object — no Prisma model type escapes this boundary.
 */
export async function loadProgress(
  userId: string,
  skillKey: string,
): Promise<SkillProgressShape> {
  const row = await prisma.skillProgress.findUnique({
    where: { userId_skillKey: { userId, skillKey } },
  });

  if (row) {
    return {
      userId: row.userId,
      skillKey: row.skillKey,
      masteryLevel: row.masteryLevel as MasteryLevel,
      totalAttempts: row.totalAttempts,
      correctAttempts: row.correctAttempts,
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      lastPracticedAt: row.lastPracticedAt,
      lastDifficulty: row.lastDifficulty as SkillProgressShape["lastDifficulty"],
      preferredDifficulty: row.preferredDifficulty as SkillProgressShape["preferredDifficulty"],
      nextReviewAt: row.nextReviewAt,
      daysIntervalUntilReview: row.daysIntervalUntilReview,
    };
  }

  // First time practising this skill
  return {
    userId,
    skillKey,
    masteryLevel: "NOT_STARTED",
    totalAttempts: 0,
    correctAttempts: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticedAt: null,
    lastDifficulty: null,
    preferredDifficulty: null,
    nextReviewAt: null,
    daysIntervalUntilReview: 0,
  };
}

/**
 * Select the appropriate encouragement key for the feedback UI (Phase 09).
 * Priority: levelup > fast > streak > plain correct > wrong.
 */
export function buildEncouragementKey(
  correct: boolean,
  leveledUp: boolean,
  elapsedMs: number,
  currentStreak: number,
): EncouragementKey {
  if (!correct) return "wrong";
  if (leveledUp) return "correct-levelup";
  if (elapsedMs < FAST_THRESHOLD_MS) return "correct-fast";
  if (currentStreak >= STREAK_ENCOURAGEMENT_THRESHOLD) return "correct-streak";
  return "correct";
}
