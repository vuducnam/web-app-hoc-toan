"use client";
// Static SVG isosceles trapezoid (đáy lớn dưới, đáy bé trên) with dashed altitude.
import type { Dim } from "@/lib/generators/types";
import {
  FIG_HIDDEN_DASH,
  FIG_LABEL_COLOUR,
  FIG_LABEL_FONT,
  FIG_SHADE_FILL,
  FIG_SHADE_OPACITY,
  FIG_STROKE,
  FIG_STROKE_WIDTH,
  fmtDim,
} from "./figure-style";

interface TrapezoidFigureProps {
  /** Đáy lớn (bottom). */
  a: Dim;
  /** Đáy bé (top). */
  b: Dim;
  /** Chiều cao. */
  h: Dim;
  unit?: string;
  shaded?: boolean;
  className?: string;
}

export function TrapezoidFigure({ a, b, h, unit, shaded, className }: TrapezoidFigureProps) {
  // Geometry — fixed isosceles shape; numeric values only label, not scale.
  const topY = 40;
  const bottomY = 150;
  const topLeftX = 70;
  const topRightX = 150;
  const bottomLeftX = 30;
  const bottomRightX = 190;
  const altX = 110; // altitude foot inside the bottom base

  const ariaLabel = `Hình thang có đáy lớn ${fmtDim(a, unit)}, đáy bé ${fmtDim(b, unit)} và chiều cao ${fmtDim(h, unit)}.`;

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-52 w-auto"}>
      <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" className="block max-h-52 w-auto h-auto mx-auto">
        {shaded && (
          <polygon
            points={`${topLeftX},${topY} ${topRightX},${topY} ${bottomRightX},${bottomY} ${bottomLeftX},${bottomY}`}
            fill={FIG_SHADE_FILL}
            fillOpacity={FIG_SHADE_OPACITY}
          />
        )}
        <polygon
          points={`${topLeftX},${topY} ${topRightX},${topY} ${bottomRightX},${bottomY} ${bottomLeftX},${bottomY}`}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
          strokeLinejoin="round"
        />
        {/* Altitude — dashed vertical between the two bases */}
        <line
          x1={altX}
          y1={topY}
          x2={altX}
          y2={bottomY}
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
          strokeDasharray={FIG_HIDDEN_DASH}
        />
        {/* Right-angle marker at the bottom of the altitude */}
        <polyline
          points={`${altX - 8},${bottomY} ${altX - 8},${bottomY - 8} ${altX},${bottomY - 8}`}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth="1.5"
        />
        {/* Bottom label (đáy lớn) */}
        <text
          x={(bottomLeftX + bottomRightX) / 2}
          y={bottomY + 22}
          textAnchor="middle"
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          {fmtDim(a, unit)}
        </text>
        {/* Top label (đáy bé) */}
        <text
          x={(topLeftX + topRightX) / 2}
          y={topY - 8}
          textAnchor="middle"
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          {fmtDim(b, unit)}
        </text>
        {/* Height label */}
        <text
          x={altX + 8}
          y={(topY + bottomY) / 2 + 5}
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          {fmtDim(h, unit)}
        </text>
      </svg>
    </div>
  );
}
