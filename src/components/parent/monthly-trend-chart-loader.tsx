"use client";
// Client-only wrapper that lazy-loads MonthlyTrendChart via dynamic({ssr:false}).
// Must be a Client Component because next/dynamic with ssr:false is only allowed in client components.

import dynamic from "next/dynamic";
import type { TrendPoint } from "./monthly-trend-chart";

const MonthlyTrendChart = dynamic(
  () => import("./monthly-trend-chart").then((m) => m.MonthlyTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] flex items-center justify-center text-sm text-ink-400 animate-pulse">
        Đang tải biểu đồ...
      </div>
    ),
  },
);

interface MonthlyTrendChartLoaderProps {
  data: TrendPoint[];
}

export function MonthlyTrendChartLoader({ data }: MonthlyTrendChartLoaderProps) {
  return <MonthlyTrendChart data={data} />;
}
