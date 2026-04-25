import "server-only";
// G5 geometry review — composite of NUMERIC geometry/measurement generators.
// Excludes cylinder-volume and circle-circumference-area (DECIMAL — answerFormat mismatch).
// Skill seed: g5-geometry-review (NUMERIC).
import { triangleArea } from "../geometry/triangle-area";
import { trapezoidArea } from "../geometry/trapezoid-area";
import { boxSurfaceArea } from "../geometry/box-surface-area";
import { rectangularPrismVolume } from "../measurement/rectangular-prism-volume";
import { makeCompositeReview } from "./composite-helper";

export const geometryReview = makeCompositeReview<number>({
  subs: [
    { key: "triangle-area", gen: triangleArea },
    { key: "trapezoid-area", gen: trapezoidArea },
    { key: "box-surface-area", gen: boxSurfaceArea },
    { key: "rectangular-prism-volume", gen: rectangularPrismVolume },
  ],
  answerFormat: "numeric",
  time: { 1: 60, 2: 75, 3: 90 },
});
