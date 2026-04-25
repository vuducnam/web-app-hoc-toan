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

    let operand: number, answer: number;
    let operandStr: string, problemText: string, explanation: string;
    let answerPlaces: number;

    if (d === 1) {
      // × 10 or × 100 with 1-2 dp source
      const pow = rng.pick([10, 100] as const);
      const places = pow === 10 ? 1 : 2;
      operand = round(rng.int(1, 99) / Math.pow(10, places), places);
      answer = round(operand * pow, Math.max(0, places - (pow === 10 ? 1 : 2)));
      answerPlaces = Math.max(0, places - (pow === 10 ? 1 : 2));
      operandStr = toVnFixed(operand, places);
      const ansStr = toVnFixed(answer, answerPlaces);
      const shift = pow === 10 ? 1 : 2;
      problemText = `${operandStr} × ${pow} = ?`;
      explanation =
        `$${operandStr} \\times ${pow} = ${ansStr}$.\n\n` +
        `Nhân với ${pow} bằng cách dịch dấu phẩy sang phải ${shift} chữ số.`;
    } else if (d === 2) {
      // ÷ 10 or ÷ 100 with 1-2 dp source
      const pow = rng.pick([10, 100] as const);
      operand = round(rng.int(10, 999) / 10, 1);
      const resultPlaces = pow === 10 ? 2 : 3;
      answer = round(operand / pow, resultPlaces);
      answerPlaces = resultPlaces;
      operandStr = toVnFixed(operand, 1);
      const ansStr = toVnFixed(answer, answerPlaces);
      const shift = pow === 10 ? 1 : 2;
      problemText = `${operandStr} ÷ ${pow} = ?`;
      explanation =
        `$${operandStr} \\div ${pow} = ${ansStr}$.\n\n` +
        `Chia cho ${pow} bằng cách dịch dấu phẩy sang trái ${shift} chữ số.`;
    } else {
      // D3: pick from × 0,1 / × 0,01 / ÷ 1000
      const op = rng.pick(["x0.1", "x0.01", "div1000"] as const);
      operand = round(rng.int(1, 999) / 10, 1);
      operandStr = toVnFixed(operand, 1);

      if (op === "x0.1") {
        answer = round(operand * 0.1, 2);
        answerPlaces = 2;
        const ansStr = toVnFixed(answer, answerPlaces);
        problemText = `${operandStr} × 0,1 = ?`;
        explanation =
          `$${operandStr} \\times 0{,}1 = ${ansStr}$.\n\n` +
          `Nhân với 0,1 tương đương chia cho 10: dịch dấu phẩy sang trái 1 chữ số.`;
      } else if (op === "x0.01") {
        answer = round(operand * 0.01, 3);
        answerPlaces = 3;
        const ansStr = toVnFixed(answer, answerPlaces);
        problemText = `${operandStr} × 0,01 = ?`;
        explanation =
          `$${operandStr} \\times 0{,}01 = ${ansStr}$.\n\n` +
          `Nhân với 0,01 tương đương chia cho 100: dịch dấu phẩy sang trái 2 chữ số.`;
      } else {
        answer = round(operand / 1000, 4);
        answerPlaces = 4;
        const ansStr = toVnFixed(answer, answerPlaces);
        problemText = `${operandStr} ÷ 1000 = ?`;
        explanation =
          `$${operandStr} \\div 1000 = ${ansStr}$.\n\n` +
          `Chia cho 1000 bằng cách dịch dấu phẩy sang trái 3 chữ số.`;
      }
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "decimal",
      expectedAnswer: answer,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer, 0.0001);
  },
};
