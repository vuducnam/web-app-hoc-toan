import "server-only";
// Rectangular prism volume generator for Vietnamese G5 curriculum.
// Formula: V = a × b × c (cm³). Integer sides only.
// D1: sides ∈ [2, 9]. D2: sides ∈ [5, 15]. D3: sides ∈ [10, 25].
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const RANGES: Record<number, [number, number]> = {
  1: [2, 9],
  2: [5, 15],
  3: [10, 25],
};

const TIME_SEC: Record<number, number> = { 1: 60, 2: 75, 3: 75 };

export const rectangularPrismVolume: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);
    const [min, max] = RANGES[d];

    const a = rng.int(min, max);
    const b = rng.int(min, max);
    const c = rng.int(min, max);
    const expectedAnswer = a * b * c;

    const problemText =
      `Tính thể tích hình hộp chữ nhật có chiều dài ${a} cm, ` +
      `chiều rộng ${b} cm, chiều cao ${c} cm. V = ? cm³`;

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
