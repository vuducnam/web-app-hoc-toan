import "server-only";
// Decimal addition generator — Vietnamese comma notation in problemText.
// D1: 1 decimal place; D2: 2 decimal places; D3: 3 decimal places.
// expectedAnswer is a JS number (uses "." internally).
// problemText uses "," per Vietnamese convention.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 40, 3: 50 };

/** Round to given decimal places to eliminate floating-point noise. */
function round(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

export const decimalAdd: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const places = d; // D1=1, D2=2, D3=3
    const factor = Math.pow(10, places);

    // Generate as integers, then divide — avoids floating-point RNG issues
    const rawA = rng.int(1, 99);
    const rawB = rng.int(1, 99);
    const a = round(rawA / factor, places);
    const b = round(rawB / factor, places);
    const answer = round(a + b, places);

    const aStr = toVnFixed(a, places);
    const bStr = toVnFixed(b, places);
    const ansStr = toVnFixed(answer, places);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${aStr} + ${bStr} = ?`,
      answerFormat: "decimal",
      expectedAnswer: answer,
      explanation:
        `$${aStr} + ${bStr} = ${ansStr}$.\n\n` +
        `Thẳng hàng dấu phẩy rồi cộng từng chữ số như số tự nhiên, nhớ đặt dấu phẩy ở kết quả.`,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer);
  },
};
