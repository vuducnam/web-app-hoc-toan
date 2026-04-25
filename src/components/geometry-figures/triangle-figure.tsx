"use client";
// Static SVG triangle (apex top, base bottom) with dashed altitude.
// Style: SGK Kết nối tri thức Toán 5 — labels outside the figure, sans-serif.
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

interface TriangleFigureProps {
  base: Dim;
  height: Dim;
  unit?: string;
  shaded?: boolean;
  className?: string;
}

export function TriangleFigure({ base, height, unit, shaded, className }: TriangleFigureProps) {
  // Geometry — apex at (100,30), base from (40,150) to (160,150). Altitude foot at (100,150).
  const apexX = 100;
  const apexY = 30;
  const baseLeftX = 40;
  const baseRightX = 160;
  const baseY = 150;

  const ariaLabel = `Hình tam giác có đáy ${fmtDim(base, unit)} và chiều cao ${fmtDim(height, unit)}.`;

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-52 w-auto"}>
      <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" className="block max-h-52 w-auto h-auto mx-auto">
        {shaded && (
          <polygon
            points={`${apexX},${apexY} ${baseLeftX},${baseY} ${baseRightX},${baseY}`}
            fill={FIG_SHADE_FILL}
            fillOpacity={FIG_SHADE_OPACITY}
          />
        )}
        <polygon
          points={`${apexX},${apexY} ${baseLeftX},${baseY} ${baseRightX},${baseY}`}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
          strokeLinejoin="round"
        />
        {/* Altitude — dashed line from apex straight down to the base */}
        <line
          x1={apexX}
          y1={apexY}
          x2={apexX}
          y2={baseY}
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
          strokeDasharray={FIG_HIDDEN_DASH}
        />
        {/* Right-angle marker at the foot of the altitude */}
        <polyline
          points={`${apexX - 8},${baseY} ${apexX - 8},${baseY - 8} ${apexX},${baseY - 8}`}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth="1.5"
        />
        {/* Base label below the base */}
        <text
          x={apexX}
          y={baseY + 22}
          textAnchor="middle"
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          {fmtDim(base, unit)}
        </text>
        {/* Height label to the right of the altitude */}
        <text
          x={apexX + 8}
          y={(apexY + baseY) / 2 + 5}
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          {fmtDim(height, unit)}
        </text>
      </svg>
    </div>
  );
}
