import "server-only";
// Multiplication generator.
// D1: 2-digit × 1-digit; D2: 2-digit × 2-digit; D3: 3-digit × 2-digit.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 60 };

export const multiply2Digit: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let a: number, b: number;
    if (d === 1) {
      a = rng.int(10, 99);
      b = rng.int(2, 9);
    } else if (d === 2) {
      a = rng.int(10, 99);
      b = rng.int(10, 99);
    } else {
      a = rng.int(100, 999);
      b = rng.int(10, 99);
    }

    const answer = a * b;

    // Explanation varies by difficulty
    let explanation: string;
    if (d === 1) {
      // 2-digit × 1-digit: single partial product
      explanation =
        `Đặt tính: $${a} \\times ${b} = ${answer}$.\n\n` +
        `Nhân lần lượt từng chữ số của $${a}$ với $${b}$, ` +
        `cộng kết quả từng hàng lại.`;
    } else {
      // 2-digit × 2-digit or 3-digit × 2-digit: two partial products
      const bOnes = b % 10;
      const bTens = Math.floor(b / 10);
      const partial1 = a * bOnes;
      const partial2 = a * bTens;
      explanation =
        `Đặt tính: $${a} \\times ${b} = ${answer}$.\n\n` +
        `Tích riêng 1: $${a} \\times ${bOnes} = ${partial1}$. ` +
        `Tích riêng 2: $${a} \\times ${bTens} = ${partial2}$ (dịch sang trái 1 hàng). ` +
        `Cộng lại: $${partial1} + ${partial2 * 10} = ${answer}$.`;
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `${a} × ${b} = ?`,
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
