import "server-only";
// Triangle area generator for Vietnamese G5 curriculum.
// Formula: S = (a × h) / 2. Integer answers enforced by ensuring a×h is always even.
// D1: a, h ∈ [4,12], both even → answer always integer ∈ [8,72]
// D2: a, h ∈ [5,25], at least one forced even → answer integer
// D3: a, h ∈ [6,40], at least one forced even → answer integer
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const RANGES: Record<number, [number, number]> = {
  1: [4, 12],
  2: [5, 25],
  3: [6, 40],
};

const TIME_SEC: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

/**
 * Pick two integers from [min,max] such that their product is even.
 * Strategy: pick a, then if a is odd pick even b; otherwise pick any b.
 */
function pickEvenProduct(rng: ReturnType<typeof import("../seeded-rng").makeRng>, min: number, max: number): [number, number] {
  const a = rng.int(min, max);
  if (a % 2 !== 0) {
    // Force b to be even: pick from evens in range
    const evenMin = min % 2 === 0 ? min : min + 1;
    const evenMax = max % 2 === 0 ? max : max - 1;
    const evenCount = Math.floor((evenMax - evenMin) / 2) + 1;
    const b = evenMin + rng.int(0, evenCount - 1) * 2;
    return [a, b];
  }
  const b = rng.int(min, max);
  return [a, b];
}

export const triangleArea: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);
    const [min, max] = RANGES[d];

    let a: number;
    let h: number;

    if (d === 1) {
      // Both even guaranteed
      const evenMin = min % 2 === 0 ? min : min + 1;
      const evenMax = max % 2 === 0 ? max : max - 1;
      const evenCount = Math.floor((evenMax - evenMin) / 2) + 1;
      a = evenMin + rng.int(0, evenCount - 1) * 2;
      h = evenMin + rng.int(0, evenCount - 1) * 2;
    } else {
      [a, h] = pickEvenProduct(rng, min, max);
    }

    const expectedAnswer = (a * h) / 2;

    const problemText =
      `Tam giác có đáy ${a} cm, chiều cao ${h} cm. Tính diện tích (cm²).`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      explanation:
        `$S = \\dfrac{a \\times h}{2} = \\dfrac{${a} \\times ${h}}{2} = ${expectedAnswer}\\,\\text{cm}^2$.`,
      figure: { kind: "triangle", base: a, height: h, unit: "cm" },
      solutionFigure: { kind: "triangle", base: a, height: h, unit: "cm", shaded: true },
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
