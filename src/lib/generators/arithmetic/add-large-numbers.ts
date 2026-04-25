import "server-only";
// Generator: addition of large numbers extending past 100k.
// D1: 5-digit + 5-digit. D2: 6-digit + 6-digit. D3: 7-digit + 5-digit (mismatched widths).
// No carry enforcement — random carries naturally; skill is positional addition.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

const RANGES: Record<number, [number, number, number, number]> = {
  // [aMin, aMax, bMin, bMax]
  1: [10_000,    99_999,    10_000,    99_999],
  2: [100_000,   999_999,   100_000,   999_999],
  3: [1_000_000, 9_999_999, 10_000,    99_999],
};

export const addLargeNumbers: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const [aMin, aMax, bMin, bMax] = RANGES[d];
    const a = rng.int(aMin, aMax);
    const b = rng.int(bMin, bMax);
    const answer = a + b;

    const explanation =
      `Đặt tính rồi tính: $${a} + ${b} = ${answer}$.\n\n` +
      `Thẳng hàng các chữ số cùng hàng, cộng từ phải sang trái, ` +
      `nhớ sang hàng kế tiếp nếu tổng cột $\\geq 10$.`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${a} + ${b} = ?`,
      answerFormat: "numeric",
      expectedAnswer: answer,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
