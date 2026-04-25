"use client";
// Static SVG circle with centre dot + radius (default) or diameter line.
import type { Dim } from "@/lib/generators/types";
import {
  FIG_LABEL_COLOUR,
  FIG_LABEL_FONT,
  FIG_SHADE_FILL,
  FIG_SHADE_OPACITY,
  FIG_STROKE,
  FIG_STROKE_WIDTH,
  fmtDim,
} from "./figure-style";

interface CircleFigureProps {
  radius: Dim;
  /** Whether to draw + label the radius (default) or full diameter line. */
  show?: "radius" | "diameter";
  unit?: string;
  shaded?: boolean;
  className?: string;
}

export function CircleFigure({ radius, show = "radius", unit, shaded, className }: CircleFigureProps) {
  const cx = 100;
  const cy = 100;
  const r = 70;
  const isDiameter = show === "diameter";

  const labelText = isDiameter
    ? `d = ${fmtDim(typeof radius === "number" ? radius * 2 : radius, unit)}`
    : `r = ${fmtDim(radius, unit)}`;

  const ariaLabel = isDiameter
    ? `Hình tròn có đường kính ${fmtDim(typeof radius === "number" ? radius * 2 : radius, unit)}.`
    : `Hình tròn có bán kính ${fmtDim(radius, unit)}.`;

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-52 w-auto"}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="block max-h-52 w-auto h-auto mx-auto">
        {shaded && (
          <circle cx={cx} cy={cy} r={r} fill={FIG_SHADE_FILL} fillOpacity={FIG_SHADE_OPACITY} />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
        />
        {/* Diameter or radius reference line */}
        {isDiameter ? (
          <line
            x1={cx - r}
            y1={cy}
            x2={cx + r}
            y2={cy}
            stroke={FIG_STROKE}
            strokeWidth={FIG_STROKE_WIDTH}
          />
        ) : (
          <line
            x1={cx}
            y1={cy}
            x2={cx + r}
            y2={cy}
            stroke={FIG_STROKE}
            strokeWidth={FIG_STROKE_WIDTH}
          />
        )}
        {/* Centre dot + label "O" */}
        <circle cx={cx} cy={cy} r="3" fill={FIG_STROKE} />
        <text
          x={cx - 8}
          y={cy - 6}
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          O
        </text>
        {/* Radius / diameter label sits above the line */}
        <text
          x={cx + r / 2}
          y={cy - 8}
          textAnchor="middle"
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          {labelText}
        </text>
      </svg>
    </div>
  );
}
