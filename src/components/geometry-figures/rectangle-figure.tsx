"use client";
// Static SVG rectangle — auto-detects square (width === height) for the aria-label.
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

interface RectangleFigureProps {
  width: Dim;
  height: Dim;
  unit?: string;
  /** Force "hình vuông" labelling even when widths differ (rare). */
  isSquare?: boolean;
  shaded?: boolean;
  /** When set, renders "Chu vi = X" above the figure. */
  perimeter?: Dim;
  className?: string;
}

export function RectangleFigure({ width, height, unit, isSquare, shaded, perimeter, className }: RectangleFigureProps) {
  const square = isSquare === true || (typeof width === typeof height && width === height);

  // Geometry — fixed pixel positions; numeric props only label, not scale.
  // Reserve top space for the optional perimeter caption when present.
  const topPad = perimeter !== undefined ? 28 : 8;
  const x = 40;
  const y = topPad + 22;
  const w = square ? 120 : 140;
  const h = square ? 120 : 90;
  const viewBoxH = y + h + 30;

  const perimeterLabel =
    perimeter !== undefined ? `Chu vi = ${fmtDim(perimeter, unit)}` : null;

  const ariaLabel = square
    ? `Hình vuông cạnh ${fmtDim(width, unit)}${perimeterLabel ? ", chu vi " + fmtDim(perimeter!, unit) : ""}.`
    : `Hình chữ nhật chiều dài ${fmtDim(width, unit)}, chiều rộng ${fmtDim(height, unit)}${perimeterLabel ? ", chu vi " + fmtDim(perimeter!, unit) : ""}.`;

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-56 w-auto"}>
      <svg viewBox={`0 0 220 ${viewBoxH}`} xmlns="http://www.w3.org/2000/svg" className="block max-h-56 w-auto h-auto mx-auto">
        {/* Optional perimeter caption above the figure */}
        {perimeterLabel && (
          <text
            x={110}
            y={20}
            textAnchor="middle"
            fontSize={FIG_LABEL_FONT}
            fontFamily="sans-serif"
            fill={FIG_LABEL_COLOUR}
            fontWeight="bold"
          >
            {perimeterLabel}
          </text>
        )}
        {shaded && (
          <rect x={x} y={y} width={w} height={h} fill={FIG_SHADE_FILL} fillOpacity={FIG_SHADE_OPACITY} />
        )}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
          strokeLinejoin="round"
        />
        {/* Width label below the bottom edge */}
        <text
          x={x + w / 2}
          y={y + h + 22}
          textAnchor="middle"
          fontSize={FIG_LABEL_FONT}
          fontFamily="sans-serif"
          fill={FIG_LABEL_COLOUR}
        >
          {fmtDim(width, unit)}
        </text>
        {/* Height label to the left of the left edge (skip for squares — single "cạnh" already implied) */}
        {!square && (
          <text
            x={x - 12}
            y={y + h / 2 + 5}
            textAnchor="end"
            fontSize={FIG_LABEL_FONT}
            fontFamily="sans-serif"
            fill={FIG_LABEL_COLOUR}
          >
            {fmtDim(height, unit)}
          </text>
        )}
      </svg>
    </div>
  );
}
