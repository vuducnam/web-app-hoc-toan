// Parent dashboard RSC.
// 1 child → show dashboard inline.
// 2+ children → show ChildSelectorGrid with per-child composite rating.
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  loadChildDashboardData,
} from "@/lib/parent/load-child-dashboard-data";
import {
  computeCompositeRating,
  masteryLevelToInt,
  stdDev,
} from "@/lib/parent/compute-composite-rating";
import { ChildSelectorGrid } from "@/components/parent/child-selector-grid";
import { ChildDashboardView } from "@/components/parent/child-dashboard-view";

export const metadata = { title: "Bảng theo dõi — Phụ huynh | Toán SGK" };

export default async function ParentDashboardPage() {
  const user = await verifyParent();

  const childUsers = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // No children linked
  if (childUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-lg text-ink-600 text-center">
          Chưa có học sinh nào được liên kết với tài khoản này.
        </p>
        <p className="text-sm text-ink-400 text-center">
          Vui lòng liên hệ quản trị viên để liên kết tài khoản học sinh.
        </p>
      </div>
    );
  }

  // Single child → inline dashboard
  if (childUsers.length === 1) {
    const data = await loadChildDashboardData(childUsers[0].id);
    return <ChildDashboardView data={data} />;
  }

  // Multiple children → build composite rating for each, then show selector
  const childSummaries = await Promise.all(
    childUsers.map(async (child) => {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [progress, recentAttempts] = await Promise.all([
        prisma.skillProgress.findMany({
          where: { userId: child.id },
          select: { masteryLevel: true, totalAttempts: true, correctAttempts: true },
        }),
        prisma.attempt.findMany({
          where: { userId: child.id, createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true, elapsedMs: true },
        }),
      ]);

      const totalAttempts = progress.reduce((s, p) => s + p.totalAttempts, 0);
      const correctAttempts = progress.reduce((s, p) => s + p.correctAttempts, 0);
      const accuracyRatio = correctAttempts / Math.max(1, totalAttempts);

      const activeDays = new Set(
        recentAttempts.map((a) => a.createdAt.toISOString().slice(0, 10)),
      ).size;

      const dailyMs = new Map<string, number>();
      for (const a of recentAttempts) {
        const key = a.createdAt.toISOString().slice(0, 10);
        dailyMs.set(key, (dailyMs.get(key) ?? 0) + a.elapsedMs);
      }
      const dailyMinutes = Array.from(dailyMs.values()).map((ms) => ms / 60_000);
      const stddevMinutes = stdDev(dailyMinutes);

      const sumMastery = progress.reduce((s, p) => s + masteryLevelToInt(p.masteryLevel), 0);
      const skillCount = progress.length;

      const compositeRating = computeCompositeRating({
        accuracyRatio,
        uniqueActiveDays: activeDays,
        stddevMinutes,
        sumMasteryLevel: sumMastery,
        skillCount,
      });

      return { id: child.id, name: child.name, compositeRating };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Theo dõi học sinh</h1>
        <p className="text-sm text-ink-600 mt-1">
          Chọn học sinh để xem chi tiết kết quả học tập.
        </p>
      </div>
      <ChildSelectorGrid items={childSummaries} />
    </div>
  );
}
