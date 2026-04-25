import "server-only";
// Box (rectangular prism) total surface area generator for Vietnamese G5 curriculum.
// Formula: S_tp = 2(ab + bc + ca). Integer sides → integer answer always.
// D1: sides a,b,c ∈ [3,8]. D2: [5,15]. D3: [8,20].
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const RANGES: Record<number, [number, number]> = {
  1: [3, 8],
  2: [5, 15],
  3: [8, 20],
};

const TIME_SEC: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

export const boxSurfaceArea: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);
    const [min, max] = RANGES[d];

    const a = rng.int(min, max);
    const b = rng.int(min, max);
    const c = rng.int(min, max);
    const expectedAnswer = 2 * (a * b + b * c + c * a);

    const problemText =
      `Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Diện tích toàn phần (cm²)?`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
