import "server-only";
// Generator: multi-digit × 1-digit multiplication.
// D1: 2-digit × 1-digit. D2: 3-digit × 1-digit. D3: 4-digit × 1-digit.
// 1-digit factor constrained to [2,9] — avoids trivial 0×n and 1×n cases.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

const MULTI_RANGES: Record<number, [number, number]> = {
  1: [10,    99],
  2: [100,   999],
  3: [1_000, 9_999],
};

export const multiply1Digit: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const [min, max] = MULTI_RANGES[d];
    const a = rng.int(min, max);
    const b = rng.int(2, 9);
    const answer = a * b;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${a} × ${b} = ?`,
      answerFormat: "numeric",
      expectedAnswer: answer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
