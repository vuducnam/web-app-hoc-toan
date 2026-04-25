import "server-only";
// Decimal × or ÷ powers of 10 generator.
// Boundary vs Phase 01 multiply-divide-powers-10: that generator handles integers only.
// This generator handles decimal operands exclusively.
// D1: × 10 or × 100 (1-2 dp source → shift decimal right).
// D2: ÷ 10 or ÷ 100 (shift decimal left).
// D3: includes × 0,1 / × 0,01 (equivalent to ÷ 10/100 alternative notation) + ÷ 1000.
// expectedAnswer: JS number; validate via equalsWithTolerance.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 20, 2: 25, 3: 30 };

function round(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

export const decimalPowers10: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let operand: number, multiplier: number, answer: number;
    let operandStr: string, multiplierStr: string;

    if (d === 1) {
      // × 10 or × 100 with 1-2 dp source
      const pow = rng.pick([10, 100] as const);
      const places = pow === 10 ? 1 : 2;
      operand = round(rng.int(1, 99) / Math.pow(10, places), places);
      multiplier = pow;
      answer = round(operand * multiplier, Math.max(0, places - (pow === 10 ? 1 : 2)));
      operandStr = toVnFixed(operand, places);
      multiplierStr = String(multiplier);
    } else if (d === 2) {
      // ÷ 10 or ÷ 100 with 1-2 dp source
      const pow = rng.pick([10, 100] as const);
      operand = round(rng.int(10, 999) / 10, 1);
      multiplier = pow;
      const resultPlaces = pow === 10 ? 2 : 3;
      answer = round(operand / multiplier, resultPlaces);
      operandStr = toVnFixed(operand, 1);
      multiplierStr = String(multiplier);
      // Use ÷ notation
      return {
        id: `${skillKey}-${seed}`,
        skillKey,
        problemText: `${operandStr} ÷ ${multiplierStr} = ?`,
        answerFormat: "decimal",
        expectedAnswer: answer,
        metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
      };
    } else {
      // D3: pick from × 0,1 / × 0,01 / ÷ 1000
      const op = rng.pick(["x0.1", "x0.01", "div1000"] as const);
      operand = round(rng.int(1, 999) / 10, 1);
      operandStr = toVnFixed(operand, 1);

      if (op === "x0.1") {
        answer = round(operand * 0.1, 2);
        return {
          id: `${skillKey}-${seed}`,
          skillKey,
          problemText: `${operandStr} × 0,1 = ?`,
          answerFormat: "decimal",
          expectedAnswer: answer,
          metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
        };
      } else if (op === "x0.01") {
        answer = round(operand * 0.01, 3);
        return {
          id: `${skillKey}-${seed}`,
          skillKey,
          problemText: `${operandStr} × 0,01 = ?`,
          answerFormat: "decimal",
          expectedAnswer: answer,
          metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
        };
      } else {
        answer = round(operand / 1000, 4);
        return {
          id: `${skillKey}-${seed}`,
          skillKey,
          problemText: `${operandStr} ÷ 1000 = ?`,
          answerFormat: "decimal",
          expectedAnswer: answer,
          metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
        };
      }
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${operandStr} × ${multiplierStr} = ?`,
      answerFormat: "decimal",
      expectedAnswer: answer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer, 0.0001);
  },
};
