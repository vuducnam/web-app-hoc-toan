// Loads all aggregate stats needed for badge evaluation in a single pass.
// Runs 5 parallel DB queries; returns a plain UserAggregates object.

import type { PrismaClient } from "@/generated/prisma/client";
import type { UserAggregates } from "./evaluate-badges";
import { vietnamToday } from "./vietnam-today";

/** Fast-answer threshold must match seed data for speed badges (thresholdMs: 20000) */
const FAST_THRESHOLD_MS = 20_000;

/** Window size used by seeded accuracy / perfect-window badges */
const ACCURACY_WINDOW = 10;

/**
 * Fetches all data required by evaluateBadges for `userId`.
 * Safe to call after the main $transaction commits.
 */
export async function loadUserAggregates(
  prisma: PrismaClient,
  userId: string,
): Promise<UserAggregates> {
  const [streak, ownedBadges, attemptRows, skillProgressRows, dailyGoalRows] =
    await Promise.all([
      prisma.streak.findUnique({
        where: { userId },
        select: { currentDays: true },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        select: { badgeKey: true },
      }),
      // Fetch all attempts for accuracy + fast-correct + distinct-skills
      prisma.attempt.findMany({
        where: { userId },
        select: { correct: true, elapsedMs: true, skillKey: true },
        orderBy: { createdAt: "desc" },
      }),
      // Fetch skill progress to count mastered topics (proxy: MASTERED skills)
      prisma.skillProgress.findMany({
        where: { userId },
        select: { masteryLevel: true, skillKey: true },
      }),
      // Fetch daily goals to compute daily-goal streak
      prisma.dailyGoal.findMany({
        where: { userId },
        select: { date: true, completedMin: true, targetMin: true },
        orderBy: { date: "desc" },
      }),
    ]);

  // --- Correct count & accuracy ---
  const totalAttempts = attemptRows.length;
  const totalCorrect = attemptRows.filter((a) => a.correct).length;
  const accuracyRatio = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

  // --- Distinct skills attempted ---
  const distinctSkills = new Set(attemptRows.map((a) => a.skillKey)).size;

  // --- Fast correct count (correct AND elapsed < 20 s) ---
  const fastCorrectCount = attemptRows.filter(
    (a) => a.correct && a.elapsedMs < FAST_THRESHOLD_MS,
  ).length;

  // --- Rolling accuracy over last ACCURACY_WINDOW attempts ---
  const rollingAccuracy = new Map<number, number>();
  const perfectWindowCount = new Map<number, number>();

  if (totalAttempts >= ACCURACY_WINDOW) {
    const window = attemptRows.slice(0, ACCURACY_WINDOW);
    const windowCorrect = window.filter((a) => a.correct).length;
    rollingAccuracy.set(ACCURACY_WINDOW, windowCorrect / ACCURACY_WINDOW);

    // Count how many non-overlapping perfect windows exist
    let perfCount = 0;
    for (let i = 0; i + ACCURACY_WINDOW <= totalAttempts; i += ACCURACY_WINDOW) {
      const slice = attemptRows.slice(i, i + ACCURACY_WINDOW);
      if (slice.every((a) => a.correct)) perfCount++;
    }
    perfectWindowCount.set(ACCURACY_WINDOW, perfCount);
  }

  // --- Mastered topic count (proxy: distinct MASTERED skillKeys) ---
  // Phase 11 treats each MASTERED skill as a "topic" for the topic_mastered badge
  const masteredTopicCount = skillProgressRows.filter(
    (sp) => sp.masteryLevel === "MASTERED",
  ).length;

  // --- Daily goal streak ---
  const dailyGoalStreak = computeDailyGoalStreak(dailyGoalRows);

  // --- Owned badge keys ---
  const ownedBadgeKeys = new Set(ownedBadges.map((b) => b.badgeKey));

  return {
    totalCorrect,
    consecutiveDays: streak?.currentDays ?? 0,
    ownedBadgeKeys,
    distinctSkills,
    fastCorrectCount,
    accuracyRatio,
    totalAttempts,
    rollingAccuracy,
    perfectWindowCount,
    dailyGoalStreak,
    masteredTopicCount,
  };
}

/**
 * Counts consecutive days (ending today or yesterday) where the daily goal was completed.
 * Goals are already sorted desc by date from the query.
 */
function computeDailyGoalStreak(
  goals: { date: Date; completedMin: number; targetMin: number }[],
): number {
  if (goals.length === 0) return 0;

  const completed = goals.filter((g) => g.completedMin >= g.targetMin);
  if (completed.length === 0) return 0;

  // Walk backwards from the most recent completed goal, counting consecutive days
  const todayStr = vietnamToday();
  let streak = 0;
  let expectedDate = todayStr;

  for (const goal of completed) {
    const dateStr = goal.date.toISOString().slice(0, 10);
    if (dateStr === expectedDate) {
      streak++;
      // Move expected date back one day
      const d = new Date(`${expectedDate}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 1);
      expectedDate = d.toISOString().slice(0, 10);
    } else if (streak === 0 && dateStr < expectedDate) {
      // Most recent completed goal was yesterday — still counts
      expectedDate = dateStr;
      streak++;
      const d = new Date(`${dateStr}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 1);
      expectedDate = d.toISOString().slice(0, 10);
    } else {
      break;
    }
  }

  return streak;
}
