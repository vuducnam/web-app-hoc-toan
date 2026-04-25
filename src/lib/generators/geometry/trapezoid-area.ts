import "server-only";
// Trapezoid area generator for Vietnamese G5 curriculum.
// Formula: S = ((a + b) × h) / 2. Integer answers enforced: (a+b)×h must be even.
// D1: a, b, h ∈ [4,12], force (a+b) even
// D2: a, b, h ∈ [5,20], force (a+b)×h even
// D3: a, b, h ∈ [6,30], force (a+b)×h even
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const RANGES: Record<number, [number, number]> = {
  1: [4, 12],
  2: [5, 20],
  3: [6, 30],
};

const TIME_SEC: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

export const trapezoidArea: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);
    const [min, max] = RANGES[d];

    const a = rng.int(min, max);
    // Ensure (a+b) is even: b must have same parity as a
    const bCandidates: number[] = [];
    for (let v = min; v <= max; v++) {
      if ((a + v) % 2 === 0) bCandidates.push(v);
    }
    const b = bCandidates[rng.int(0, bCandidates.length - 1)];

    // (a+b) is now even, so (a+b)/2 is integer. h can be anything.
    const h = rng.int(min, max);

    const expectedAnswer = ((a + b) * h) / 2;

    const problemText =
      `Hình thang có đáy lớn ${a} cm, đáy bé ${b} cm, chiều cao ${h} cm. Diện tích (cm²)?`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      explanation:
        `$S = \\dfrac{(a + b) \\times h}{2} = \\dfrac{(${a} + ${b}) \\times ${h}}{2} = \\dfrac{${a + b} \\times ${h}}{2} = ${expectedAnswer}\\,\\text{cm}^2$.`,
      figure: { kind: "trapezoid", a, b, h, unit: "cm" },
      solutionFigure: { kind: "trapezoid", a, b, h, unit: "cm", shaded: true },
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
