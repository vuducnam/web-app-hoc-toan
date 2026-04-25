"use client";
// Entry point for rendering any FigureSpec → typed component lookup.
// Used by QuestionCard (problem figure), FeedbackPanel (solution figure),
// and the remark-figure-directive in knowledge notes.
import type { FigureSpec } from "@/lib/generators/types";
import { TriangleFigure } from "./triangle-figure";
import { TrapezoidFigure } from "./trapezoid-figure";
import { RectangleFigure } from "./rectangle-figure";
import { CircleFigure } from "./circle-figure";
import { Cylinder3dFigure } from "./cylinder-3d-figure";
import { CylinderNetFigure } from "./cylinder-net-figure";
import { RectPrism3dFigure } from "./rect-prism-3d-figure";
import { RectPrismNetFigure } from "./rect-prism-net-figure";

interface FigureRendererProps {
  spec: FigureSpec | undefined | null;
  className?: string;
}

export function FigureRenderer({ spec, className }: FigureRendererProps) {
  if (!spec) return null;
  switch (spec.kind) {
    case "triangle":
      return <TriangleFigure {...spec} className={className} />;
    case "trapezoid":
      return <TrapezoidFigure {...spec} className={className} />;
    case "rectangle":
      return <RectangleFigure {...spec} className={className} />;
    case "circle":
      return <CircleFigure {...spec} className={className} />;
    case "cylinder3d":
      return <Cylinder3dFigure {...spec} className={className} />;
    case "cylinderNet":
      return <CylinderNetFigure {...spec} className={className} />;
    case "rectPrism3d":
      return <RectPrism3dFigure {...spec} className={className} />;
    case "rectPrismNet":
      return <RectPrismNetFigure {...spec} className={className} />;
    default: {
      // exhaustiveness guard
      const _exhaustive: never = spec;
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn("FigureRenderer: unknown spec kind", _exhaustive);
      }
      return null;
    }
  }
}
