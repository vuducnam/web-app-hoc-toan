"use client";
// Client component: Recharts LineChart for 30-day correct-ratio trend.
// Imported via dynamic({ssr:false}) from server parent — never SSR'd directly.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface TrendPoint {
  /** Short date label e.g. "25/04" */
  label: string;
  /** 0-100 percentage */
  correctPct: number;
}

interface MonthlyTrendChartProps {
  data: TrendPoint[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic py-8 text-center">
        Chưa có dữ liệu trong 30 ngày qua.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Nunito, sans-serif" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Nunito, sans-serif" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`${value}%`, "Tỉ lệ đúng"]}
          contentStyle={{
            fontSize: 12,
            fontFamily: "Nunito, sans-serif",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        />
        <Line
          type="monotone"
          dataKey="correctPct"
          stroke="#0cbbab"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#0cbbab" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
