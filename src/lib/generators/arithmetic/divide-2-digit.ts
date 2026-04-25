import "server-only";
// Division generator — always exact (no remainder) for MVP.
// D1: 2-digit ÷ 1-digit; D2: 3-digit ÷ 1-digit; D3: 3-digit ÷ 2-digit.
// Strategy: generate quotient + divisor first, compute dividend to guarantee exact division.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 60 };

export const divide2Digit: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let dividend: number, divisor: number, quotient: number;

    if (d === 1) {
      // 2-digit ÷ 1-digit: quotient ∈ [2,9], divisor ∈ [2,9]
      divisor = rng.int(2, 9);
      quotient = rng.int(2, 9);
      dividend = divisor * quotient; // guaranteed 2-digit if divisor≥2,quotient≥2 → min=4
    } else if (d === 2) {
      // 3-digit ÷ 1-digit: dividend in [100,999]
      divisor = rng.int(2, 9);
      quotient = rng.int(Math.ceil(100 / divisor), Math.floor(999 / divisor));
      dividend = divisor * quotient;
    } else {
      // 3-digit ÷ 2-digit: divisor ∈ [10,49], quotient ∈ [2,19]
      divisor = rng.int(10, 49);
      quotient = rng.int(2, 19);
      dividend = divisor * quotient;
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${dividend} ÷ ${divisor} = ?`,
      answerFormat: "numeric",
      expectedAnswer: quotient,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
