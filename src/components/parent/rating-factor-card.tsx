// Server component: one of the 4 factor breakdown cards for composite rating.
// MetricCard style: radius-md, white, ink-400 border, label + big number + trend arrow.

interface RatingFactorCardProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  trend?: "up" | "down" | "flat";
}

const TREND_ICONS: Record<string, { symbol: string; color: string }> = {
  up:   { symbol: "↑", color: "text-green-600" },
  down: { symbol: "↓", color: "text-warn" },
  flat: { symbol: "→", color: "text-ink-400" },
};

export function RatingFactorCard({ label, value, max, unit, trend }: RatingFactorCardProps) {
  const trendInfo = trend ? TREND_ICONS[trend] : null;

  return (
    <div className="rounded-lg border border-ink-400/30 bg-white shadow-flat p-4 flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-ink-400 uppercase tracking-wider leading-none">
        {label}
      </span>

      <div className="flex items-end gap-1 mt-1">
        <span className="text-2xl font-bold text-ink-900 leading-none">
          {value}
        </span>
        <span className="text-sm text-ink-600 leading-tight pb-0.5">
          /{max}{unit ? ` ${unit}` : ""}
        </span>
        {trendInfo && (
          <span
            className={`text-base font-semibold pb-0.5 ml-1 ${trendInfo.color}`}
            aria-label={`Xu hướng: ${trend}`}
          >
            {trendInfo.symbol}
          </span>
        )}
      </div>
    </div>
  );
}
