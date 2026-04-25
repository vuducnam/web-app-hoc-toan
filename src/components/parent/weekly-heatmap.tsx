// Server component: 7-square SVG heatmap, Mon..Sun, green-scale by minutes practiced.
// Pure SVG, no Recharts.

import type { HeatmapDay } from "@/lib/parent/compute-weekly-heatmap";

interface WeeklyHeatmapProps {
  days: HeatmapDay[];
}

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Maps minutes → green intensity hex. 0 = gray, >30 = darkest green. */
function minutesToColor(minutes: number): string {
  if (minutes <= 0) return "#e5e7eb"; // mastery-0 gray
  if (minutes < 5)  return "#bbf7d0"; // green-200
  if (minutes < 15) return "#4ade80"; // green-400
  if (minutes < 30) return "#16a34a"; // green-600
  return "#14532d";                   // green-900
}

export function WeeklyHeatmap({ days }: WeeklyHeatmapProps) {
  // Pad or trim to 7 entries
  const padded = Array.from({ length: 7 }, (_, i) => days[i] ?? { date: "", minutes: 0 });

  const squareSize = 32;
  const gap = 8;
  const totalWidth = 7 * squareSize + 6 * gap;
  const svgHeight = squareSize + 20; // square + label row

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${totalWidth} ${svgHeight}`}
        width={totalWidth}
        height={svgHeight}
        role="img"
        aria-label="Hoạt động 7 ngày gần nhất"
      >
        {padded.map((day, i) => {
          const x = i * (squareSize + gap);
          const color = minutesToColor(day.minutes);
          const label = DAY_LABELS[i] ?? "";
          const title = day.date
            ? `${day.date}: ${day.minutes} phút`
            : "Chưa có dữ liệu";

          return (
            <g key={i}>
              <title>{title}</title>
              <rect
                x={x}
                y={0}
                width={squareSize}
                height={squareSize}
                rx={6}
                fill={color}
              />
              <text
                x={x + squareSize / 2}
                y={svgHeight - 3}
                textAnchor="middle"
                fontSize={10}
                fill="#94a3b8"
                fontFamily="var(--font-body, Nunito, sans-serif)"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-ink-400 mt-1">
        <span>Ít</span>
        {["#e5e7eb", "#bbf7d0", "#4ade80", "#16a34a", "#14532d"].map((c) => (
          <span
            key={c}
            style={{ backgroundColor: c }}
            className="inline-block w-3 h-3 rounded-sm"
            aria-hidden="true"
          />
        ))}
        <span>Nhiều</span>
      </div>
    </div>
  );
}
