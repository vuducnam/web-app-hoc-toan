// Server-only helper: loads all data needed to render one child's dashboard section.
// Exported for reuse by both /parent (single-child inline view) and /parent/child/[id].
import "server-only";
import { prisma } from "@/lib/prisma";
import {
  computeCompositeRating,
  masteryLevelToInt,
  stdDev,
} from "./compute-composite-rating";
import { computeWeakSkills } from "./compute-weak-skills";
import { computeWeeklyHeatmap } from "./compute-weekly-heatmap";
import { composeRecommendations } from "./compose-recommendations";
import type { TrendPoint } from "@/components/parent/monthly-trend-chart";
import type { TopicMastery } from "@/components/parent/per-topic-mastery-list";

export interface ChildDashboardData {
  childId: string;
  childName: string;
  compositeRating: number;
  // factor sub-scores (0..40 or 0..20)
  accuracyScore: number;
  daysActiveScore: number;
  consistencyScore: number;
  masteryScore: number;
  // raw counts for display
  totalAttempts: number;
  correctAttempts: number;
  uniqueActiveDays: number;
  weakSkills: Awaited<ReturnType<typeof computeWeakSkills>>;
  heatmap: Awaited<ReturnType<typeof computeWeeklyHeatmap>>;
  recentAttempts: {
    id: string;
    skillKey: string;
    skillNameVi: string;
    correct: boolean;
    elapsedMs: number;
    createdAt: Date;
  }[];
  topicMastery: TopicMastery[];
  trendData: TrendPoint[];
  recommendations: string[];
}

export async function loadChildDashboardData(childId: string): Promise<ChildDashboardData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Single Promise.all for all queries
  const [child, progress, attempts30d] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: childId },
      select: { id: true, name: true },
    }),
    prisma.skillProgress.findMany({
      where: { userId: childId },
      select: {
        skillKey: true,
        masteryLevel: true,
        totalAttempts: true,
        correctAttempts: true,
        skill: { select: { nameVi: true, lessonId: true, lesson: { select: { topicId: true, topic: { select: { nameVi: true } } } } } },
      },
    }),
    prisma.attempt.findMany({
      where: { userId: childId, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        skillKey: true,
        correct: true,
        elapsedMs: true,
        createdAt: true,
      },
    }),
  ]);

  // Build skill key → nameVi map from progress
  const skillNameMap = new Map<string, string>(
    progress.map((p) => [p.skillKey, p.skill.nameVi]),
  );

  // --- Composite rating factors ---
  const totalAttempts = progress.reduce((s, p) => s + p.totalAttempts, 0);
  const correctAttempts = progress.reduce((s, p) => s + p.correctAttempts, 0);
  const accuracyRatio = correctAttempts / Math.max(1, totalAttempts);

  // Unique active days in last 7 days
  const sevenDayAttempts = attempts30d.filter((a) => a.createdAt >= sevenDaysAgo);
  const activeDaysSet = new Set(
    sevenDayAttempts.map((a) => a.createdAt.toISOString().slice(0, 10)),
  );
  const uniqueActiveDays = activeDaysSet.size;

  // Daily minutes for stddev (last 7 days)
  const dailyMs = new Map<string, number>();
  for (const a of sevenDayAttempts) {
    const key = a.createdAt.toISOString().slice(0, 10);
    dailyMs.set(key, (dailyMs.get(key) ?? 0) + a.elapsedMs);
  }
  // Fill all 7 days with 0 if missing (ensures consistent stddev)
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (!dailyMs.has(key)) dailyMs.set(key, 0);
  }
  const dailyMinutes = Array.from(dailyMs.values()).map((ms) => ms / 60_000);
  const stddevMinutes = stdDev(dailyMinutes);

  const sumMasteryLevel = progress.reduce(
    (s, p) => s + masteryLevelToInt(p.masteryLevel),
    0,
  );
  const skillCount = progress.length;

  const compositeRating = computeCompositeRating({
    accuracyRatio,
    uniqueActiveDays,
    stddevMinutes,
    sumMasteryLevel,
    skillCount,
  });

  // Sub-scores for factor cards (rounded)
  const accuracyScore = Math.round(40 * Math.min(1, accuracyRatio));
  const daysActiveScore = Math.round(20 * Math.min(1, uniqueActiveDays / 7));
  const consistencyScore = Math.round(20 * (1 / (1 + Math.max(0, stddevMinutes))));
  const masteryScore = Math.round(20 * Math.min(1, sumMasteryLevel / Math.max(1, skillCount * 3)));

  // --- Weak skills ---
  const weakSkillsInput = progress.map((p) => ({
    skillKey: p.skillKey,
    nameVi: p.skill.nameVi,
    totalAttempts: p.totalAttempts,
    correctAttempts: p.correctAttempts,
    masteryLevel: p.masteryLevel,
  }));
  const weakSkills = computeWeakSkills(weakSkillsInput);

  // --- Weekly heatmap ---
  const heatmap = computeWeeklyHeatmap(
    attempts30d.map((a) => ({ createdAt: a.createdAt, elapsedMs: a.elapsedMs })),
    now,
  );

  // --- Recent 5 attempts ---
  const recentAttempts = attempts30d.slice(0, 5).map((a) => ({
    id: a.id,
    skillKey: a.skillKey,
    skillNameVi: skillNameMap.get(a.skillKey) ?? a.skillKey,
    correct: a.correct,
    elapsedMs: a.elapsedMs,
    createdAt: a.createdAt,
  }));

  // --- Per-topic mastery ---
  // Build skillKey → topicId + topicNameVi map from progress
  const skillTopicMap = new Map<string, { topicId: string; topicNameVi: string }>();
  for (const p of progress) {
    skillTopicMap.set(p.skillKey, {
      topicId: p.skill.lesson.topicId,
      topicNameVi: p.skill.lesson.topic.nameVi,
    });
  }

  // Aggregate mastery counts per topic from progress
  const topicAgg = new Map<string, TopicMastery>();
  for (const p of progress) {
    const topicInfo = skillTopicMap.get(p.skillKey);
    if (!topicInfo) continue;
    const existing = topicAgg.get(topicInfo.topicId) ?? {
      topicId: topicInfo.topicId,
      topicNameVi: topicInfo.topicNameVi,
      notStarted: 0,
      familiar: 0,
      proficient: 0,
      mastered: 0,
    };
    switch (p.masteryLevel) {
      case "NOT_STARTED": existing.notStarted++; break;
      case "FAMILIAR":    existing.familiar++;   break;
      case "PROFICIENT":  existing.proficient++; break;
      case "MASTERED":    existing.mastered++;   break;
    }
    topicAgg.set(topicInfo.topicId, existing);
  }
  const topicMastery = Array.from(topicAgg.values());

  // --- 30-day trend: daily correctRatio → TrendPoint[] ---
  const trendMap = new Map<string, { correct: number; total: number }>();
  for (const a of attempts30d) {
    const key = a.createdAt.toISOString().slice(0, 10);
    const entry = trendMap.get(key) ?? { correct: 0, total: 0 };
    entry.total++;
    if (a.correct) entry.correct++;
    trendMap.set(key, entry);
  }
  // Sort days ascending
  const trendData: TrendPoint[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { correct, total }]) => ({
      label: date.slice(5).replace("-", "/"), // "MM/DD"
      correctPct: Math.round((correct / Math.max(1, total)) * 100),
    }));

  // --- Recommendations ---
  const masteryRatio = sumMasteryLevel / Math.max(1, skillCount * 3);
  const recommendations = composeRecommendations({
    weakSkills,
    uniqueActiveDays,
    masteryRatio,
    skillCount,
  });

  return {
    childId: child.id,
    childName: child.name,
    compositeRating,
    accuracyScore,
    daysActiveScore,
    consistencyScore,
    masteryScore,
    totalAttempts,
    correctAttempts,
    uniqueActiveDays,
    weakSkills,
    heatmap,
    recentAttempts,
    topicMastery,
    trendData,
    recommendations,
  };
}
