// Server component — arc/ring showing today's daily goal progress.
// Renders an SVG arc ring with completedMin / targetMin ratio.

interface DailyGoalProgressProps {
  completedMin: number;
  targetMin: number;
}

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DailyGoalProgress({ completedMin, targetMin }: DailyGoalProgressProps) {
  const ratio = targetMin > 0 ? Math.min(completedMin / targetMin, 1) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - ratio);
  const pct = Math.round(ratio * 100);

  const statusLabel =
    completedMin === 0
      ? "Chưa luyện"
      : `Đã luyện ${completedMin} phút`;

  return (
    <div className="flex flex-col items-center gap-2" aria-label={`Mục tiêu hôm nay: ${statusLabel}`}>
      <p className="font-display font-bold text-sm text-ink-600 tracking-wide uppercase">
        Mục tiêu hôm nay
      </p>

      {/* Arc ring — SVG */}
      <div className="relative w-24 h-24">
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke="#f0b429"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500"
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-xl text-sun-700 leading-none">
            {pct}%
          </span>
          <span className="text-xs text-ink-400 leading-none mt-0.5">
            {completedMin}/{targetMin}p
          </span>
        </div>
      </div>

      <p className="text-xs text-ink-600 font-semibold">{statusLabel}</p>
    </div>
  );
}
