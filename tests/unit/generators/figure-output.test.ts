import { describe, it, expect } from "vitest";
import { triangleArea } from "@/lib/generators/geometry/triangle-area";
import { trapezoidArea } from "@/lib/generators/geometry/trapezoid-area";
import { circleCircumferenceArea } from "@/lib/generators/geometry/circle-circumference-area";
import { cylinderVolume } from "@/lib/generators/geometry/cylinder-volume";
import { boxSurfaceArea } from "@/lib/generators/geometry/box-surface-area";
import { rectangularPrismVolume } from "@/lib/generators/measurement/rectangular-prism-volume";
import { wordCircleTriangleArea } from "@/lib/generators/word-problems/word-circle-triangle-area";
import { wordRectangleArea } from "@/lib/generators/word-problems/word-rectangle-area";
import { word3dVolume } from "@/lib/generators/word-problems/word-3d-volume";

describe("Geometry generators emit figure + solutionFigure", () => {
  it("triangle-area → triangle figure (shaded solution)", () => {
    const q = triangleArea.generate({ seed: "abc", difficulty: 1, skillKey: "g5-triangle-area" });
    expect(q.figure).toMatchObject({ kind: "triangle", unit: "cm" });
    expect(q.solutionFigure).toMatchObject({ kind: "triangle", shaded: true });
  });

  it("trapezoid-area → trapezoid figure (shaded solution)", () => {
    const q = trapezoidArea.generate({ seed: "abc", difficulty: 2, skillKey: "g5-trapezoid-area" });
    expect(q.figure).toMatchObject({ kind: "trapezoid", unit: "cm" });
    expect(q.solutionFigure).toMatchObject({ kind: "trapezoid", shaded: true });
  });

  it("circle-circumference-area → circle figure", () => {
    const q = circleCircumferenceArea.generate({ seed: "abc", difficulty: 2, skillKey: "g5-circle" });
    expect(q.figure).toMatchObject({ kind: "circle", unit: "cm" });
    expect(q.solutionFigure?.kind).toBe("circle");
  });

  it("cylinder-volume → cylinder3d figure (shaded solution)", () => {
    const q = cylinderVolume.generate({ seed: "abc", difficulty: 1, skillKey: "g5-cylinder-volume" });
    expect(q.figure).toMatchObject({ kind: "cylinder3d", unit: "cm" });
    expect(q.solutionFigure).toMatchObject({ kind: "cylinder3d", shaded: true });
  });

  it("rectangular-prism-volume → rectPrism3d figure (shaded solution)", () => {
    const q = rectangularPrismVolume.generate({ seed: "abc", difficulty: 1, skillKey: "g5-prism" });
    expect(q.figure).toMatchObject({ kind: "rectPrism3d", unit: "cm" });
    expect(q.solutionFigure).toMatchObject({ kind: "rectPrism3d", shaded: true });
  });

  it("box-surface-area → rectPrism3d problem + rectPrismNet solution", () => {
    const q = boxSurfaceArea.generate({ seed: "abc", difficulty: 1, skillKey: "g5-box-sa" });
    expect(q.figure).toMatchObject({ kind: "rectPrism3d", unit: "cm" });
    expect(q.solutionFigure).toMatchObject({ kind: "rectPrismNet", unit: "cm" });
  });
});

describe("Word-problem geometry generators emit figure + solutionFigure", () => {
  it("word-circle-triangle-area D1 (triangle) → triangle figure", () => {
    const q = wordCircleTriangleArea.generate({ seed: "abc", difficulty: 1, skillKey: "g5-word-cta" });
    expect(q.figure?.kind).toBe("triangle");
    expect(q.solutionFigure?.kind).toBe("triangle");
  });

  it("word-rectangle-area emits a rectangle figure for every template", () => {
    // Loop several seeds to hit multiple templates.
    for (let i = 0; i < 20; i++) {
      const q = wordRectangleArea.generate({ seed: `seed-${i}`, difficulty: 2, skillKey: "g4-word-rect" });
      expect(q.figure?.kind).toBe("rectangle");
      expect(q.solutionFigure?.kind).toBe("rectangle");
    }
  });

  it("word-3d-volume D1 (cube) → rectPrism3d with a=b=c", () => {
    const q = word3dVolume.generate({ seed: "abc", difficulty: 1, skillKey: "g5-word-3d" });
    expect(q.figure?.kind).toBe("rectPrism3d");
    if (q.figure?.kind === "rectPrism3d") {
      expect(q.figure.a).toBe(q.figure.b);
      expect(q.figure.b).toBe(q.figure.c);
    }
  });
});
