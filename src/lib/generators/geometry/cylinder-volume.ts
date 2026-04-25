import "server-only";
// Cylinder volume generator for Vietnamese G5 curriculum.
// Formula: V = π × r² × h, using π = 3.14. Answer rounded to 2 decimal places.
// D1: r ∈ [2,5], h ∈ [4,10]. D2: r ∈ [3,8], h ∈ [5,15]. D3: r ∈ [4,12], h ∈ [6,20].
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const PI = 3.14;

const R_RANGES: Record<number, [number, number]> = {
  1: [2, 5],
  2: [3, 8],
  3: [4, 12],
};

const H_RANGES: Record<number, [number, number]> = {
  1: [4, 10],
  2: [5, 15],
  3: [6, 20],
};

const TIME_SEC: Record<number, number> = { 1: 75, 2: 75, 3: 75 };

export const cylinderVolume: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    const r = rng.int(R_RANGES[d][0], R_RANGES[d][1]);
    const h = rng.int(H_RANGES[d][0], H_RANGES[d][1]);
    const expectedAnswer = Math.round(PI * r * r * h * 100) / 100;

    const problemText =
      `Hình trụ có bán kính đáy ${r} cm, chiều cao ${h} cm. Thể tích (cm³)? (lấy π = 3,14)`;

    // Format expectedAnswer with Vietnamese decimal comma
    const answerStr = expectedAnswer.toFixed(2).replace(".", ",");

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "decimal",
      expectedAnswer,
      explanation:
        `$V = \\pi \\times r^2 \\times h = 3{,}14 \\times ${r}^2 \\times ${h}$\n\n` +
        `$= 3{,}14 \\times ${r * r} \\times ${h} = ${answerStr}\\,\\text{cm}^3$.`,
      figure: { kind: "cylinder3d", radius: r, height: h, unit: "cm" },
      solutionFigure: { kind: "cylinder3d", radius: r, height: h, unit: "cm", shaded: true },
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    return n !== null && equalsWithTolerance(n, q.expectedAnswer, 0.005);
  },
};
