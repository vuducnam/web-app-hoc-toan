"use client";
// Static SVG rectangular prism in oblique 30° projection — kiêm cube khi a=b=c.
// Visible: front + top + right faces. Hidden: 3 back edges (dashed).
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

interface RectPrism3dFigureProps {
  a: Dim;
  b: Dim;
  c: Dim;
  unit?: string;
  shaded?: boolean;
  className?: string;
}

const COS30 = 0.866;
const SIN30 = 0.5;

function isCubeLike(a: Dim, b: Dim, c: Dim): boolean {
  return a === b && b === c;
}

export function RectPrism3dFigure({ a, b, c, unit, shaded, className }: RectPrism3dFigureProps) {
  const cube = isCubeLike(a, b, c);
  // Schematic pixel layout — cube = equal dims, otherwise rectangular look.
  const aPx = cube ? 100 : 130;
  const cPx = cube ? 100 : 90;
  const depthPx = cube ? 60 : 55;
  const dx = depthPx * COS30;
  const dy = -depthPx * SIN30;

  // Front bottom-left anchor
  const x0 = 35;
  const y0 = 175;
  // Front rectangle vertices
  const F1 = [x0, y0];
  const F2 = [x0 + aPx, y0];
  const F3 = [x0 + aPx, y0 - cPx];
  const F4 = [x0, y0 - cPx];
  // Back vertices
  const B1 = [F1[0] + dx, F1[1] + dy];
  const B2 = [F2[0] + dx, F2[1] + dy];
  const B3 = [F3[0] + dx, F3[1] + dy];
  const B4 = [F4[0] + dx, F4[1] + dy];

  const ariaLabel = cube
    ? `Hình lập phương cạnh ${fmtDim(a, unit)}.`
    : `Hình hộp chữ nhật có chiều dài ${fmtDim(a, unit)}, chiều rộng ${fmtDim(b, unit)}, chiều cao ${fmtDim(c, unit)}.`;

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-56 w-auto"}>
      <svg viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" className="block max-h-56 w-auto h-auto mx-auto">
        {shaded && (
          <>
            {/* Front face */}
            <polygon points={`${F1.join(",")} ${F2.join(",")} ${F3.join(",")} ${F4.join(",")}`} fill={FIG_SHADE_FILL} fillOpacity={FIG_SHADE_OPACITY} />
            {/* Top face */}
            <polygon points={`${F4.join(",")} ${F3.join(",")} ${B3.join(",")} ${B4.join(",")}`} fill={FIG_SHADE_FILL} fillOpacity={FIG_SHADE_OPACITY * 0.7} />
            {/* Right face */}
            <polygon points={`${F2.join(",")} ${F3.join(",")} ${B3.join(",")} ${B2.join(",")}`} fill={FIG_SHADE_FILL} fillOpacity={FIG_SHADE_OPACITY * 0.5} />
          </>
        )}
        {/* Visible solid edges */}
        <polygon points={`${F1.join(",")} ${F2.join(",")} ${F3.join(",")} ${F4.join(",")}`} fill="none" stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} strokeLinejoin="round" />
        <line x1={F2[0]} y1={F2[1]} x2={B2[0]} y2={B2[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        <line x1={F3[0]} y1={F3[1]} x2={B3[0]} y2={B3[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        <line x1={F4[0]} y1={F4[1]} x2={B4[0]} y2={B4[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        <line x1={B2[0]} y1={B2[1]} x2={B3[0]} y2={B3[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        <line x1={B3[0]} y1={B3[1]} x2={B4[0]} y2={B4[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} />
        {/* Hidden dashed edges */}
        <line x1={F1[0]} y1={F1[1]} x2={B1[0]} y2={B1[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} strokeDasharray={FIG_HIDDEN_DASH} />
        <line x1={B1[0]} y1={B1[1]} x2={B2[0]} y2={B2[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} strokeDasharray={FIG_HIDDEN_DASH} />
        <line x1={B1[0]} y1={B1[1]} x2={B4[0]} y2={B4[1]} stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} strokeDasharray={FIG_HIDDEN_DASH} />

        {/* Labels — concise; for cube we only show "cạnh" once below */}
        {cube ? (
          <text x={F1[0] + aPx / 2} y={F1[1] + 22} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
            cạnh {fmtDim(a, unit)}
          </text>
        ) : (
          <>
            <text x={F1[0] + aPx / 2} y={F1[1] + 22} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
              {fmtDim(a, unit)}
            </text>
            <text x={F1[0] - 8} y={(F1[1] + F4[1]) / 2 + 5} textAnchor="end" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
              {fmtDim(c, unit)}
            </text>
            <text x={(F4[0] + B4[0]) / 2 + 4} y={(F4[1] + B4[1]) / 2 - 4} fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
              {fmtDim(b, unit)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
