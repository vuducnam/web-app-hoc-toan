// Pure badge evaluation — no Prisma / Next.js imports.
// Receives pre-loaded aggregates + full badge catalog; returns keys to award.

import type { BadgeCriteria } from "./badge-criteria-types";

/** Aggregate stats needed to evaluate all badge criteria */
export interface UserAggregates {
  /** Total correct answers across all skills */
  totalCorrect: number;
  /** Current streak in days (from Streak.currentDays) */
  consecutiveDays: number;
  /** Set of badge keys already owned — prevents double-award */
  ownedBadgeKeys: Set<string>;
  /** Number of distinct skillKeys attempted */
  distinctSkills: number;
  /** Count of correct attempts completed under fast threshold (20 s) */
  fastCorrectCount: number;
  /** Overall accuracy ratio (0..1); 0 when totalAttempts === 0 */
  accuracyRatio: number;
  /** Total attempts (correct + incorrect) */
  totalAttempts: number;
  /**
   * Rolling accuracy over the last `windowSize` attempts.
   * Key = windowSize, value = accuracy ratio for that window.
   * Caller fills only the windows needed by seeded badges (windowSize=10).
   */
  rollingAccuracy: Map<number, number>;
  /**
   * How many times the last `windowSize` attempts were ALL correct.
   * Caller fills only the windows needed (windowSize=10).
   */
  perfectWindowCount: Map<number, number>;
  /** How many consecutive daily goals the user has completed */
  dailyGoalStreak: number;
  /** Number of topics where all skills are MASTERED */
  masteredTopicCount: number;
}

/** Minimal badge shape the evaluator needs from the DB row */
export interface BadgeRecord {
  key: string;
  criteria: unknown; // stored as Json in Prisma — cast inside matches()
}

/**
 * Returns badge keys that should be awarded to the user.
 * Filters out already-owned badges before evaluating criteria.
 * Unknown criteria types are skipped (returns false) — forward-compatible.
 *
 * O(badges) — purely synchronous, no DB access.
 */
export function evaluateBadges(
  aggregates: UserAggregates,
  badges: BadgeRecord[],
): string[] {
  return badges
    .filter(
      (b) =>
        !aggregates.ownedBadgeKeys.has(b.key) &&
        matchesCriteria(b.criteria as BadgeCriteria, aggregates),
    )
    .map((b) => b.key);
}

/** Switch over the discriminated union — returns false for unknown types */
function matchesCriteria(criteria: BadgeCriteria, agg: UserAggregates): boolean {
  switch (criteria.type) {
    case "correct_count":
      return agg.totalCorrect >= criteria.value;

    case "streak_days":
      return agg.consecutiveDays >= criteria.value;

    case "fast_correct_count":
      // thresholdMs in criteria is informational; actual counting done at load time
      return agg.fastCorrectCount >= criteria.value;

    case "distinct_skills_attempted":
      return agg.distinctSkills >= criteria.value;

    case "accuracy_streak": {
      const rolling = agg.rollingAccuracy.get(criteria.windowSize) ?? 0;
      // Only meaningful once enough attempts exist
      return agg.totalAttempts >= criteria.windowSize && rolling >= criteria.minAccuracy;
    }

    case "perfect_window_count": {
      const count = agg.perfectWindowCount.get(criteria.windowSize) ?? 0;
      return count >= criteria.requiredCount;
    }

    case "daily_goal_streak":
      return agg.dailyGoalStreak >= criteria.value;

    case "topic_mastered":
      return agg.masteredTopicCount >= criteria.value;

    default:
      // Unknown criteria type — skip without throwing
      return false;
  }
}
