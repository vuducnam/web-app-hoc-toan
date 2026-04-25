import "server-only";
// Decimal division generator — quotient-first construction avoids floating-point drift.
// D1: decimal ÷ small integer [2,9], exact result (1 dp source).
// D2: decimal ÷ decimal, result has 1 dp.
// D3: decimal ÷ decimal, result has 2 dp.
// Strategy: pick quotient + divisor first, compute dividend = quotient × divisor.
// expectedAnswer is a JS number.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 60, 2: 90, 3: 90 };

function round(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

export const decimalDivide: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let dividend: number, divisor: number, quotient: number;
    let dividendStr: string, divisorStr: string;

    if (d === 1) {
      // quotient: 1 dp decimal, divisor: integer [2,9]
      // dividend = quotient × divisor → exact
      quotient = round(rng.int(1, 99) / 10, 1);
      divisor = rng.int(2, 9);
      dividend = round(quotient * divisor, 1);
      dividendStr = toVnFixed(dividend, 1);
      divisorStr = String(divisor);
    } else if (d === 2) {
      // quotient: 1 dp, divisor: 1 dp decimal ≥ 0.1
      quotient = round(rng.int(1, 99) / 10, 1);
      divisor = round(rng.int(1, 9) / 10, 1);
      dividend = round(quotient * divisor, 2);
      dividendStr = toVnFixed(dividend, 2);
      divisorStr = toVnFixed(divisor, 1);
    } else {
      // quotient: 2 dp, divisor: 1 dp decimal
      quotient = round(rng.int(1, 99) / 100, 2);
      divisor = round(rng.int(1, 9) / 10, 1);
      dividend = round(quotient * divisor, 3);
      dividendStr = toVnFixed(dividend, 3);
      divisorStr = toVnFixed(divisor, 1);
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${dividendStr} ÷ ${divisorStr} = ?`,
      answerFormat: "decimal",
      expectedAnswer: quotient,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer, 0.01);
  },
};
