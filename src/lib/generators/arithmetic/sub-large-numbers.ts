import "server-only";
// Generator: subtraction of large numbers, always a >= b (no negatives at G4).
// D1: 5-digit − 5-digit. D2: 6-digit − 6-digit.
// D3: 7-digit − 6-digit, forces at least one borrow column.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

/** Returns true if subtracting a-b (a>=b) requires at least one borrow. */
function hasBorrow(a: number, b: number): boolean {
  let ca = a, cb = b;
  while (cb > 0) {
    if ((ca % 10) < (cb % 10)) return true;
    ca = Math.floor(ca / 10);
    cb = Math.floor(cb / 10);
  }
  return false;
}

const RANGES: Record<number, [number, number]> = {
  1: [10_000,    99_999],
  2: [100_000,   999_999],
  3: [1_000_000, 9_999_999],
};

const B_RANGES: Record<number, [number, number]> = {
  1: [10_000,    99_999],
  2: [100_000,   999_999],
  3: [100_000,   999_999],
};

export const subLargeNumbers: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const [aMin, aMax] = RANGES[d];
    const [bMin, bMax] = B_RANGES[d];
    const needsBorrow = d === 3;

    let a: number, b: number;
    for (let attempt = 0; attempt < 10; attempt++) {
      const x = rng.int(aMin, aMax);
      const y = rng.int(bMin, bMax);
      a = Math.max(x, y);
      b = Math.min(x, y);
      if (!needsBorrow || hasBorrow(a, b)) break;
    }
    // Ensure a >= b (already guaranteed by max/min above)
    const answer = a! - b!;

    const explanation =
      `Đặt tính rồi tính: $${a!} - ${b!} = ${answer}$.\n\n` +
      `Thẳng hàng các chữ số cùng hàng, trừ từ phải sang trái, ` +
      `mượn từ hàng kế tiếp nếu chữ số trên nhỏ hơn chữ số dưới.`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${a!} - ${b!} = ?`,
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
