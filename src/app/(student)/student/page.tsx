// Student dashboard — RSC.
// Loads all data in a single Promise.all to avoid waterfall.
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { pickContinueSkill } from "@/lib/dashboard/pick-continue-skill";
import { GreetingBlock } from "@/components/student/greeting-block";
import { DailyGoalProgress } from "@/components/student/daily-goal-progress";
import { ContinueCta } from "@/components/student/continue-cta";
import { TopicGrid, type TopicWithSkills } from "@/components/student/topic-grid";
import type { ProgressMap } from "@/lib/dashboard/aggregate-topic-mastery";

export const metadata = { title: "Bảng điều khiển — Toán SGK" };

export default async function StudentDashboardPage() {
  const user = await verifyStudent();

  // Parallel data fetch — no sequential waterfall
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayGoal, topics, allProgress, continueSkill] = await Promise.all([
    // Today's daily goal (may not exist yet for new accounts)
    prisma.dailyGoal.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    }),
    // Curriculum tree filtered to user's grade only — students see only their grade.
    prisma.topic.findMany({
      where: user.gradeId ? { volume: { gradeId: user.gradeId } } : undefined,
      include: {
        volume: { include: { grade: true } },
        lessons: { include: { skills: true } },
      },
      orderBy: [
        { volume: { grade: { key: "asc" } } },
        { volume: { order: "asc" } },
        { order: "asc" },
      ],
    }),
    // All skill progress rows for this user — aggregated in memory, no N+1
    prisma.skillProgress.findMany({
      where: { userId: user.id },
      select: { skillKey: true, masteryLevel: true },
    }),
    // Best skill to continue (scoped to user's grade)
    pickContinueSkill(user.id, user.gradeId),
  ]);

  // Build progress map for O(1) lookups in topic grid
  const progressMap: ProgressMap = new Map(
    allProgress.map((p) => [p.skillKey, p.masteryLevel as string])
  );

  const completedMin = todayGoal?.completedMin ?? 0;
  const targetMin = todayGoal?.targetMin ?? 15;

  return (
    <div className="space-y-6">
      {/* Greeting + daily goal row */}
      <section className="bg-gradient-to-br from-brand-50 to-white rounded-3xl shadow-[0_5px_0_0_rgb(0_0_0/.08)] p-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <GreetingBlock name={user.name ?? "bạn"} />
          <DailyGoalProgress
            completedMin={completedMin}
            targetMin={targetMin}
          />
        </div>
      </section>

      {/* Continue CTA */}
      {continueSkill ? (
        <div className="flex justify-center sm:justify-start">
          <ContinueCta
            skillKey={continueSkill.key}
            skillName={continueSkill.nameVi}
          />
        </div>
      ) : null}

      {/* Topic grid */}
      <TopicGrid
        topics={topics as TopicWithSkills[]}
        progressMap={progressMap}
      />
    </div>
  );
}
