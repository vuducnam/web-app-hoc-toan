import "server-only";
// Decimal subtraction generator — Vietnamese comma notation in problemText.
// D1: 1 decimal place; D2: 2 decimal places; D3: 3 decimal places.
// Always a ≥ b to guarantee non-negative result.
// expectedAnswer is a JS number.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 55 };

function round(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

export const decimalSubtract: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const places = d; // D1=1dp, D2=2dp, D3=3dp
    const factor = Math.pow(10, places);

    // Generate as integers then divide — avoids floating-point RNG issues
    const rawA = rng.int(10, 99);
    const rawB = rng.int(1, 99);
    // Ensure a ≥ b
    const larger = Math.max(rawA, rawB);
    const smaller = Math.min(rawA, rawB);

    const a = round(larger / factor, places);
    const b = round(smaller / factor, places);
    const answer = round(a - b, places);

    const aStr = toVnFixed(a, places);
    const bStr = toVnFixed(b, places);
    const ansStr = toVnFixed(answer, places);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${aStr} - ${bStr} = ?`,
      answerFormat: "decimal",
      expectedAnswer: answer,
      explanation:
        `$${aStr} - ${bStr} = ${ansStr}$.\n\n` +
        `Thẳng hàng dấu phẩy rồi trừ từng chữ số như số tự nhiên, nhớ đặt dấu phẩy ở kết quả.`,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer);
  },
};
