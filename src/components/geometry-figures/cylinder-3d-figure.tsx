"use client";
// Static SVG cylinder in oblique projection — 2 ellipses with the bottom-back arc
// dashed to convey depth. Style: SGK Kết nối tri thức Toán 5.
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

interface Cylinder3dFigureProps {
  radius: Dim;
  height: Dim;
  unit?: string;
  shaded?: boolean;
  className?: string;
}

export function Cylinder3dFigure({ radius, height, unit, shaded, className }: Cylinder3dFigureProps) {
  // Schematic geometry — fixed pixel layout; numeric props label, not scale.
  const cx = 110;
  const rx = 60;
  const ry = 18;
  const topCy = 50;
  const botCy = 170;

  const ariaLabel = `Hình trụ có bán kính đáy ${fmtDim(radius, unit)} và chiều cao ${fmtDim(height, unit)}.`;

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-52 w-auto"}>
      <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" className="block max-h-52 w-auto h-auto mx-auto">
        {shaded && (
          // Body fill — rectangle between the two ellipses + cap the rounded bottom front.
          <>
            <rect x={cx - rx} y={topCy} width={rx * 2} height={botCy - topCy} fill={FIG_SHADE_FILL} fillOpacity={FIG_SHADE_OPACITY} />
            <ellipse cx={cx} cy={topCy} rx={rx} ry={ry} fill={FIG_SHADE_FILL} fillOpacity={FIG_SHADE_OPACITY} />
          </>
        )}
        {/* Top rim — full ellipse, both halves visible from above */}
        <ellipse cx={cx} cy={topCy} rx={rx} ry={ry} fill="none" stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        {/* Bottom front half — visible solid arc going DOWN from left to right */}
        <path
          d={`M ${cx - rx} ${botCy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${botCy}`}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
        />
        {/* Bottom back half — hidden, dashed arc going UP from left to right */}
        <path
          d={`M ${cx - rx} ${botCy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${botCy}`}
          fill="none"
          stroke={FIG_STROKE}
          strokeWidth={FIG_STROKE_WIDTH}
          strokeDasharray={FIG_HIDDEN_DASH}
        />
        {/* Two vertical generators (left + right edges) */}
        <line x1={cx - rx} y1={topCy} x2={cx - rx} y2={botCy} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        <line x1={cx + rx} y1={topCy} x2={cx + rx} y2={botCy} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        {/* Radius reference inside top ellipse — center to right rim */}
        <line x1={cx} y1={topCy} x2={cx + rx} y2={topCy} stroke={FIG_STROKE} strokeWidth="1.5" />
        <circle cx={cx} cy={topCy} r="2.5" fill={FIG_STROKE} />
        <text x={cx + rx / 2} y={topCy - 6} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          r = {fmtDim(radius, unit)}
        </text>
        {/* Height label beside the right generator */}
        <text x={cx + rx + 8} y={(topCy + botCy) / 2 + 5} fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          h = {fmtDim(height, unit)}
        </text>
      </svg>
    </div>
  );
}
