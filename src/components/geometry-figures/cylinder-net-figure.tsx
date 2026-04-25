"use client";
// Cylinder net (khai triển): two circular bases + side rectangle whose width equals
// the base circumference (2πr). Useful for surface-area lessons.
import type { Dim } from "@/lib/generators/types";
import {
  FIG_LABEL_COLOUR,
  FIG_LABEL_FONT,
  FIG_STROKE,
  FIG_STROKE_WIDTH,
  fmtDim,
} from "./figure-style";

interface CylinderNetFigureProps {
  radius: Dim;
  height: Dim;
  unit?: string;
  className?: string;
}

export function CylinderNetFigure({ radius, height, unit, className }: CylinderNetFigureProps) {
  // Schematic — fixed pixel layout. Numeric props label, not scale.
  const circleR = 28;
  const topY = 25;
  const leftCx = 35;
  const rightCx = leftCx + circleR * 2 + 30; // gap of 30 px between bases
  const rectX = rightCx + circleR + 30;
  const rectY = topY - 5;
  const rectW = 200;
  const rectH = circleR * 2 + 10;

  const ariaLabel = `Khai triển hình trụ: hai hình tròn bán kính ${fmtDim(radius, unit)} và một hình chữ nhật chiều cao ${fmtDim(height, unit)}.`;

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-52 w-auto"}>
      <svg viewBox="0 0 380 130" xmlns="http://www.w3.org/2000/svg" className="block max-h-52 w-auto h-auto mx-auto">
        {/* Two circular bases */}
        <circle cx={leftCx} cy={topY + circleR} r={circleR} fill="none" stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        <circle cx={rightCx} cy={topY + circleR} r={circleR} fill="none" stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        {/* Side rectangle (xung quanh) */}
        <rect x={rectX} y={rectY} width={rectW} height={rectH} fill="none" stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        {/* Labels */}
        <text x={leftCx} y={topY + circleR * 2 + 18} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          r = {fmtDim(radius, unit)}
        </text>
        <text x={rightCx} y={topY + circleR * 2 + 18} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          r = {fmtDim(radius, unit)}
        </text>
        {/* Height label on the side rect (chiều cao) */}
        <text x={rectX - 6} y={rectY + rectH / 2 + 5} textAnchor="end" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          h = {fmtDim(height, unit)}
        </text>
        {/* Width = circumference label below the rect */}
        <text x={rectX + rectW / 2} y={rectY + rectH + 18} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          2πr (chu vi đáy)
        </text>
      </svg>
    </div>
  );
}
