// Server component: renders the full child dashboard given pre-loaded data.
// Used by both /parent (single-child inline) and /parent/child/[id] (detail page).
// MonthlyTrendChartLoader is a "use client" wrapper that holds the dynamic({ssr:false}) call,
// which is required by Next.js 16 / Turbopack (ssr:false only allowed in client components).

import type { ChildDashboardData } from "@/lib/parent/load-child-dashboard-data";
import { CompositeRatingGauge } from "./composite-rating-gauge";
import { RatingFactorCard } from "./rating-factor-card";
import { WeeklyHeatmap } from "./weekly-heatmap";
import { WeakSkillsList } from "./weak-skills-list";
import { RecentSessionsList } from "./recent-sessions-list";
import { PerTopicMasteryList } from "./per-topic-mastery-list";
import { RecommendationsList } from "./recommendations-list";
import { MonthlyTrendChartLoader } from "./monthly-trend-chart-loader";

interface ChildDashboardViewProps {
  data: ChildDashboardData;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-ink-600 uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-ink-400/20 bg-white shadow-flat p-5 ${className}`}>
      {children}
    </div>
  );
}

export function ChildDashboardView({ data }: ChildDashboardViewProps) {
  const {
    childName,
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
  } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">{childName}</h1>
        <p className="text-sm text-ink-600 mt-0.5">
          Tổng hợp kết quả học tập — 30 ngày gần nhất
        </p>
      </div>

      {/* Row 1: Gauge + Factor cards */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start">
        <Card className="flex flex-col items-center gap-2 w-full md:w-52">
          <SectionTitle>Đánh giá tổng hợp</SectionTitle>
          <CompositeRatingGauge value={compositeRating} />
          <p className="text-xs text-ink-600 text-center">
            Dựa trên {totalAttempts} bài làm, {correctAttempts} đúng
          </p>
        </Card>

        <div className="flex flex-col gap-3">
          <SectionTitle>Phân tích theo yếu tố</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <RatingFactorCard label="Độ chính xác" value={accuracyScore} max={40} />
            <RatingFactorCard
              label="Ngày hoạt động"
              value={daysActiveScore}
              max={20}
              unit={`(${uniqueActiveDays}/7)`}
            />
            <RatingFactorCard label="Đều đặn" value={consistencyScore} max={20} />
            <RatingFactorCard label="Thành thạo" value={masteryScore} max={20} />
          </div>
        </div>
      </div>

      {/* Row 2: Heatmap + Recent sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>Hoạt động 7 ngày</SectionTitle>
          <WeeklyHeatmap days={heatmap} />
        </Card>
        <Card>
          <SectionTitle>Bài làm gần nhất</SectionTitle>
          <RecentSessionsList attempts={recentAttempts} />
        </Card>
      </div>

      {/* Row 3: Weak skills */}
      <Card>
        <SectionTitle>Điểm yếu cần cải thiện</SectionTitle>
        <WeakSkillsList skills={weakSkills} />
      </Card>

      {/* Row 4: Per-topic mastery */}
      <Card>
        <SectionTitle>Tiến độ theo chủ đề</SectionTitle>
        <PerTopicMasteryList topics={topicMastery} />
      </Card>

      {/* Row 5: Monthly trend chart — client-only via MonthlyTrendChartLoader */}
      <Card>
        <SectionTitle>Xu hướng 30 ngày (tỉ lệ đúng)</SectionTitle>
        <MonthlyTrendChartLoader data={trendData} />
      </Card>

      {/* Row 6: Recommendations */}
      <Card>
        <SectionTitle>Gợi ý cho Anh/Chị</SectionTitle>
        <RecommendationsList items={recommendations} />
      </Card>
    </div>
  );
}
