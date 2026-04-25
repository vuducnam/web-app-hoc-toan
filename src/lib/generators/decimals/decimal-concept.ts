import "server-only";
// Decimal concept generator — convert fraction/mixed form to decimal.
// Text-only for MVP; place-value table deferred to Phase 15.
// D1: fraction with denominator 10 → decimal (e.g. "5/10 = ?" → 0,5).
// D2: fraction with denominator 100 → decimal (e.g. "3/100 = ?" → 0,03).
// D3: mixed form "a và b/10" → decimal (e.g. "2 và 3/10 = ?" → 2,3).
// expectedAnswer: JS number; validate via parseVnDecimal + equalsWithTolerance.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 45 };

export const decimalConcept: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let problemText: string;
    let expectedAnswer: number;

    if (d === 1) {
      // n/10 → decimal
      const num = rng.int(1, 9);
      problemText = `${num}/10 = ?`;
      expectedAnswer = num / 10;
    } else if (d === 2) {
      // n/100 → decimal (includes cases like 30/100 = 0,30)
      const num = rng.int(1, 99);
      problemText = `${num}/100 = ?`;
      expectedAnswer = Math.round(num) / 100;
    } else {
      // D3: mixed "a và b/10" → a + b/10
      const whole = rng.int(1, 9);
      const frac = rng.int(1, 9);
      problemText = `${whole} và ${frac}/10 = ?`;
      expectedAnswer = whole + frac / 10;
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "decimal",
      expectedAnswer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer, 0.001);
  },
};
