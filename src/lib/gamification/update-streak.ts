// Pure streak calculation — no Prisma / Next.js imports.
// Streak = number of consecutive days the user was active.
// Anti-Duolingo: we reset silently, no guilt notification.

import { vietnamYesterday } from "./vietnam-today";

export interface StreakInput {
  currentDays: number;
  longestDays: number;
  /** YYYY-MM-DD string in Vietnam TZ */
  lastActiveDate: string;
}

export interface StreakOutput {
  currentDays: number;
  longestDays: number;
  /** YYYY-MM-DD string in Vietnam TZ */
  lastActiveDate: string;
}

/**
 * Compute new streak state given an activity on `todayDate`.
 *
 * Cases:
 *   - streak is null (first ever activity) → {1, 1, today}
 *   - lastActiveDate === today             → no-op (already counted today)
 *   - lastActiveDate === yesterday         → increment currentDays
 *   - otherwise                            → reset currentDays to 1
 *
 * @param streak  Current streak from DB, or null if user has no record yet.
 * @param todayDate  YYYY-MM-DD string in Vietnam TZ — use vietnamToday().
 */
export function updateStreakOnAttempt(
  streak: StreakInput | null,
  todayDate: string,
): StreakOutput {
  // First activity ever
  if (streak === null) {
    return { currentDays: 1, longestDays: 1, lastActiveDate: todayDate };
  }

  const { lastActiveDate, currentDays, longestDays } = streak;

  // Already active today — nothing changes
  if (lastActiveDate === todayDate) {
    return { currentDays, longestDays, lastActiveDate };
  }

  // Active yesterday → extend streak
  if (lastActiveDate === vietnamYesterday(todayDate)) {
    const next = currentDays + 1;
    return {
      currentDays: next,
      longestDays: Math.max(longestDays, next),
      lastActiveDate: todayDate,
    };
  }

  // Missed at least one day → reset
  return {
    currentDays: 1,
    longestDays: Math.max(longestDays, 1),
    lastActiveDate: todayDate,
  };
}
