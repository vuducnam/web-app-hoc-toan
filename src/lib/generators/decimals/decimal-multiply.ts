import "server-only";
// Decimal multiplication generator — Vietnamese comma notation in problemText.
// D1: 1-place × integer; D2: 1-place × 1-place; D3: 2-place × 1-place.
// expectedAnswer is a JS number.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 35, 2: 45, 3: 55 };

function round(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

export const decimalMultiply: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let a: number, b: number, answer: number, aStr: string, bStr: string;

    if (d === 1) {
      // 1-place decimal × integer
      const rawA = rng.int(1, 99);
      a = round(rawA / 10, 1);
      b = rng.int(2, 9);
      answer = round(a * b, 1);
      aStr = toVnFixed(a, 1);
      bStr = String(b);
    } else if (d === 2) {
      // 1-place × 1-place
      const rawA = rng.int(1, 99);
      const rawB = rng.int(1, 99);
      a = round(rawA / 10, 1);
      b = round(rawB / 10, 1);
      answer = round(a * b, 2);
      aStr = toVnFixed(a, 1);
      bStr = toVnFixed(b, 1);
    } else {
      // 2-place × 1-place
      const rawA = rng.int(1, 99);
      const rawB = rng.int(1, 99);
      a = round(rawA / 100, 2);
      b = round(rawB / 10, 1);
      answer = round(a * b, 3);
      aStr = toVnFixed(a, 2);
      bStr = toVnFixed(b, 1);
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${aStr} × ${bStr} = ?`,
      answerFormat: "decimal",
      expectedAnswer: answer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer);
  },
};
