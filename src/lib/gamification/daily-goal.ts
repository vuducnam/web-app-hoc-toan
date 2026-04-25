// Daily goal upsert helper.
// Returns a callable Prisma operation for inclusion in a $transaction array,
// plus a post-commit completion detector.

import type { PrismaClient } from "@/generated/prisma/client";

/** Daily goal target in minutes — matches DailyGoal.targetMin schema default */
const TARGET_MIN = 15;

export interface DailyGoalResult {
  completed: boolean;
  wasAlreadyCompleted: boolean;
}

/**
 * Upsert the user's DailyGoal row for `todayDate`, adding `xpDelta` XP and
 * `minutesDelta` minutes. Runs inside the caller's Prisma transaction.
 *
 * Returns completion state derived from the pre-upsert snapshot:
 *   - `completed`          → completedMin after update >= targetMin
 *   - `wasAlreadyCompleted`→ completedMin BEFORE update was already >= targetMin
 *
 * The caller should add +50 bonus XP when `completed && !wasAlreadyCompleted`.
 */
export async function upsertDailyGoal(
  prisma: PrismaClient,
  userId: string,
  todayDate: string,
  xpDelta: number,
  minutesDelta: number,
): Promise<DailyGoalResult> {
  // Read current state before mutating so we can detect first-completion
  const existing = await prisma.dailyGoal.findUnique({
    where: { userId_date: { userId, date: new Date(todayDate) } },
    select: { completedMin: true, targetMin: true },
  });

  const prevMin = existing?.completedMin ?? 0;
  const target = existing?.targetMin ?? TARGET_MIN;
  const wasAlreadyCompleted = prevMin >= target;

  await prisma.dailyGoal.upsert({
    where: { userId_date: { userId, date: new Date(todayDate) } },
    create: {
      userId,
      date: new Date(todayDate),
      targetMin: TARGET_MIN,
      completedMin: minutesDelta,
      xpEarned: xpDelta,
    },
    update: {
      completedMin: { increment: minutesDelta },
      xpEarned: { increment: xpDelta },
    },
  });

  const newMin = prevMin + minutesDelta;
  const completed = newMin >= target;

  return { completed, wasAlreadyCompleted };
}
