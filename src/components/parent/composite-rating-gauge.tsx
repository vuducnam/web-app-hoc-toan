// Server component: half-circle SVG gauge displaying composite rating 0-100.
// brand-500 arc, big numeric center, tier label below.
// No client JS, no Recharts — pure SVG (KISS).

interface CompositeRatingGaugeProps {
  value: number; // 0-100 integer
}

/** Maps 0-100 to a tier label in Vietnamese */
function tierLabel(v: number): string {
  if (v >= 85) return "Xuất sắc";
  if (v >= 70) return "Tốt";
  if (v >= 50) return "Khá";
  if (v >= 30) return "Trung bình";
  return "Cần cải thiện";
}

/**
 * Renders a half-circle (180°) gauge.
 * SVG viewBox 200×110; arc radius 80, center at (100, 100).
 */
export function CompositeRatingGauge({ value }: CompositeRatingGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 80;
  const cx = 100;
  const cy = 100;

  // Half-circle arc from 180° (left) to 0° (right), sweep = 180°
  // Arc circumference for half-circle
  const circumference = Math.PI * radius; // ~251.3

  // Stroke offset: full arc = circumference, empty = 0 filled
  const fillLength = (clamped / 100) * circumference;
  const gapLength = circumference - fillLength;

  // Track arc path: from (-r, 0) to (+r, 0) going upward (counter-clockwise in SVG = large-arc=1, sweep=0)
  const trackD = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  // Brand teal color
  const brandColor = "#0cbbab";
  const trackColor = "#e5e7eb"; // mastery-0 gray

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`Đánh giá tổng hợp: ${clamped}/100`}>
      <svg
        viewBox="0 0 200 110"
        width={200}
        height={110}
        role="img"
        aria-hidden="true"
      >
        {/* Background track */}
        <path
          d={trackD}
          fill="none"
          stroke={trackColor}
          strokeWidth={16}
          strokeLinecap="round"
        />

        {/* Filled arc using stroke-dasharray trick */}
        <path
          d={trackD}
          fill="none"
          stroke={brandColor}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${fillLength} ${gapLength}`}
          strokeDashoffset={0}
        />

        {/* Numeric value */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize={38}
          fontWeight={700}
          fill="#0f172a"
          fontFamily="var(--font-body, Nunito, sans-serif)"
        >
          {clamped}
        </text>

        {/* /100 label */}
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize={13}
          fill="#94a3b8"
          fontFamily="var(--font-body, Nunito, sans-serif)"
        >
          / 100
        </text>
      </svg>

      {/* Tier label */}
      <span className="text-sm font-semibold text-brand-700 -mt-2">
        {tierLabel(clamped)}
      </span>
    </div>
  );
}
