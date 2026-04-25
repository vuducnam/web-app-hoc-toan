"use client";
// Rectangular prism net (khai triển) — 6 faces in a cross layout. Helps students
// visualise total surface area S = 2(ab + bc + ca).
import type { Dim } from "@/lib/generators/types";
import {
  FIG_LABEL_COLOUR,
  FIG_LABEL_FONT,
  FIG_STROKE,
  FIG_STROKE_WIDTH,
  fmtDim,
} from "./figure-style";

interface RectPrismNetFigureProps {
  a: Dim;
  b: Dim;
  c: Dim;
  unit?: string;
  className?: string;
}

export function RectPrismNetFigure({ a, b, c, unit, className }: RectPrismNetFigureProps) {
  // Schematic — fixed pixel sizes; numeric props label, not scale.
  const aPx = 90;
  const bPx = 50;
  const cPx = 70;
  // Anchor: front face top-left
  const frontX = 80;
  const frontY = 60;

  const ariaLabel = `Khai triển hình hộp chữ nhật: 6 mặt với chiều dài ${fmtDim(a, unit)}, chiều rộng ${fmtDim(b, unit)}, chiều cao ${fmtDim(c, unit)}.`;

  // Faces
  const front = { x: frontX, y: frontY, w: aPx, h: cPx };
  const left = { x: frontX - bPx, y: frontY, w: bPx, h: cPx };
  const right = { x: frontX + aPx, y: frontY, w: bPx, h: cPx };
  const back = { x: frontX + aPx + bPx, y: frontY, w: aPx, h: cPx };
  const top = { x: frontX, y: frontY - bPx, w: aPx, h: bPx };
  const bottom = { x: frontX, y: frontY + cPx, w: aPx, h: bPx };

  return (
    <div role="img" aria-label={ariaLabel} className={className ?? "mx-auto max-h-60 w-auto"}>
      <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="block max-h-60 w-auto h-auto mx-auto">
        {/* 6 faces */}
        {[front, left, right, back, top, bottom].map((f, i) => (
          <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} fill="none" stroke={FIG_STROKE} strokeWidth={FIG_STROKE_WIDTH} strokeLinejoin="round" />
        ))}

        {/* Labels — only on the front + adjacent faces to avoid clutter */}
        {/* Front face: a (horizontal), c (vertical) */}
        <text x={front.x + front.w / 2} y={front.y + front.h / 2 + 5} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR} fontWeight="bold">
          mặt trước
        </text>
        <text x={front.x + front.w / 2} y={front.y + front.h + 18} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          a = {fmtDim(a, unit)}
        </text>
        <text x={front.x - 8} y={front.y + front.h / 2 + 5} textAnchor="end" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          c = {fmtDim(c, unit)}
        </text>
        {/* Top face label "b" along the top edge */}
        <text x={top.x + top.w / 2} y={top.y - 6} textAnchor="middle" fontSize={FIG_LABEL_FONT} fontFamily="sans-serif" fill={FIG_LABEL_COLOUR}>
          b = {fmtDim(b, unit)}
        </text>
      </svg>
    </div>
  );
}
