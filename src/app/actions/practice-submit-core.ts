"use server";
// Core submit logic — separated for testability.
// submitAnswerCore is exported so Phase 12 tests can call it with an explicit userId
// without needing a real Auth.js session.
import { getGenerator } from "@/lib/generators/registry";
import type { Difficulty as GenDifficulty } from "@/lib/generators/types";
import { formatExpectedAnswer } from "@/lib/practice/format-expected-answer";
import { evaluateMastery } from "@/lib/mastery/evaluate-mastery";
import { computeNextReview } from "@/lib/mastery/compute-next-review";
import { numericToPrismaDifficulty, type MasteryLevel } from "@/lib/mastery/types";
import { prisma } from "@/lib/prisma";
import { computeXpForAttempt } from "@/lib/gamification/compute-xp";
import { updateStreakOnAttempt } from "@/lib/gamification/update-streak";
import { vietnamToday } from "@/lib/gamification/vietnam-today";
import { upsertDailyGoal } from "@/lib/gamification/daily-goal";
import { loadUserAggregates } from "@/lib/gamification/load-user-aggregates";
import { evaluateBadges } from "@/lib/gamification/evaluate-badges";
import type { QuestionError, SubmitAnswerInput, SubmitAnswerResult } from "./practice-types";
import { loadProgress, buildEncouragementKey, MAX_ELAPSED_MS } from "./practice-helpers";

/** Daily goal bonus XP awarded the first time the user completes today's goal */
const DAILY_GOAL_BONUS_XP = 50;

/** Elapsed minutes derived from clamped elapsedMs for daily goal tracking */
function elapsedMinutes(elapsedMs: number): number {
  return Math.max(1, Math.round(elapsedMs / 60_000));
}

/**
 * Core submit logic — no session verification, takes explicit userId.
 * Public server action `submitAnswer` in practice.ts wraps this after verifyStudent().
 */
export async function submitAnswerCore(
  userId: string,
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult | QuestionError> {
  const { skillKey, seed, difficulty, userAnswer, elapsedMs } = input;

  // Clamp elapsedMs — never trust raw client timing for business logic
  const safeElapsedMs = Math.min(elapsedMs, MAX_ELAPSED_MS);

  // 1. Replay check — (userId, skillKey, seed) must be unique per Attempt index
  const existing = await prisma.attempt.findFirst({
    where: { userId, skillKey, seed },
    select: { id: true },
  });
  if (existing) return { error: "replay" };

  // 2. Verify skill exists
  const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
  if (!skill) return { error: "not-found" };

  // poolKey skills have no procedural generator — surface placeholder.
  if (!skill.generatorKey) {
    return { error: "stub", message: "Bài đang được chuẩn bị" };
  }

  // 3. Re-generate server-side to recover expectedAnswer, then validate
  let correct: boolean;
  let correctAnswer = "";
  let explanation = "";
  try {
    const generator = getGenerator(skill.generatorKey);
    const q = generator.generate({ seed, difficulty, skillKey });
    correct = generator.validate(userAnswer, q);
    correctAnswer = formatExpectedAnswer(q.expectedAnswer, q.answerFormat);
    explanation = q.explanation ?? "";
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("NotImplemented")) {
      return { error: "stub", message: "Bài đang được chuẩn bị" };
    }
    return { error: "unknown", message: "Generator error" };
  }

  // 4. Pure mastery evaluation — no DB, no Next.js
  const progress = await loadProgress(userId, skillKey);
  const prismaDiff = numericToPrismaDifficulty(difficulty as GenDifficulty);
  const now = new Date();

  const evalResult = evaluateMastery(progress, {
    correct,
    difficulty: prismaDiff,
    timestamp: now,
  });

  const { nextReviewAt, daysIntervalUntilReview } = computeNextReview(
    evalResult.masteryLevel,
    evalResult.correctAttempts,
    now,
  );

  // 5. Gamification — pure computations before writing
  const consecutiveCorrect = evalResult.currentStreak;
  const xp = computeXpForAttempt({ correct, elapsedMs: safeElapsedMs, consecutiveCorrect });
  const today = vietnamToday(now);

  // Read streak outside transaction — we only need pre-state for the pure function
  const prevStreak = await prisma.streak.findUnique({ where: { userId } });
  const prevStreakInput = prevStreak
    ? {
        currentDays: prevStreak.currentDays,
        longestDays: prevStreak.longestDays,
        lastActiveDate: vietnamToday(prevStreak.lastActiveDate),
      }
    : null;
  const newStreak = updateStreakOnAttempt(prevStreakInput, today);

  // 6. Atomic transaction: Attempt + SkillProgress + Streak upsert
  await prisma.$transaction([
    prisma.attempt.create({
      data: {
        userId,
        skillKey,
        seed,
        submittedAnswer: userAnswer,
        correct,
        difficulty: prismaDiff,
        elapsedMs: safeElapsedMs,
      },
    }),
    prisma.skillProgress.upsert({
      where: { userId_skillKey: { userId, skillKey } },
      create: {
        userId,
        skillKey,
        masteryLevel: evalResult.masteryLevel,
        totalAttempts: evalResult.totalAttempts,
        correctAttempts: evalResult.correctAttempts,
        currentStreak: evalResult.currentStreak,
        longestStreak: evalResult.longestStreak,
        lastPracticedAt: evalResult.lastPracticedAt,
        lastDifficulty: evalResult.lastDifficulty,
        nextReviewAt,
        daysIntervalUntilReview,
      },
      update: {
        masteryLevel: evalResult.masteryLevel,
        totalAttempts: evalResult.totalAttempts,
        correctAttempts: evalResult.correctAttempts,
        currentStreak: evalResult.currentStreak,
        longestStreak: evalResult.longestStreak,
        lastPracticedAt: evalResult.lastPracticedAt,
        lastDifficulty: evalResult.lastDifficulty,
        nextReviewAt,
        daysIntervalUntilReview,
      },
    }),
    prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        currentDays: newStreak.currentDays,
        longestDays: newStreak.longestDays,
        lastActiveDate: new Date(newStreak.lastActiveDate),
      },
      update: {
        currentDays: newStreak.currentDays,
        longestDays: newStreak.longestDays,
        lastActiveDate: new Date(newStreak.lastActiveDate),
      },
    }),
  ]);

  // 7. Daily goal — separate write (badges are forgiving per research §3)
  const elapsedMin = elapsedMinutes(safeElapsedMs);
  const goal = await upsertDailyGoal(prisma, userId, today, xp, elapsedMin);
  const bonusXp = goal.completed && !goal.wasAlreadyCompleted ? DAILY_GOAL_BONUS_XP : 0;
  const totalXp = xp + bonusXp;

  // 8. Badge evaluation — post-commit, best-effort (no throw on failure)
  let newBadgeKeys: string[] = [];
  try {
    const [aggs, allBadges] = await Promise.all([
      loadUserAggregates(prisma, userId),
      prisma.badge.findMany({ select: { key: true, criteria: true } }),
    ]);
    newBadgeKeys = evaluateBadges(aggs, allBadges);

    if (newBadgeKeys.length > 0) {
      // createMany with skipDuplicates handles the unique(userId, badgeKey) constraint
      await prisma.userBadge.createMany({
        data: newBadgeKeys.map((badgeKey) => ({ userId, badgeKey })),
        skipDuplicates: true,
      });
    }
  } catch {
    // Badge award failure must not break the core submit response
    newBadgeKeys = [];
  }

  return {
    correct,
    leveledUp: evalResult.leveledUp,
    newMasteryLevel: evalResult.masteryLevel as MasteryLevel,
    encouragementKey: buildEncouragementKey(
      correct,
      evalResult.leveledUp,
      safeElapsedMs,
      evalResult.currentStreak,
    ),
    correctAnswer,
    explanation,
    xpEarned: totalXp,
    newBadges: newBadgeKeys,
    dailyGoalCompleted: goal.completed,
  };
}
