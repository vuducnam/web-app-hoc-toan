import "server-only";
// Decimal comparison generator — pick <, =, or > between two decimals.
// D1: same decimal-place count. D2: different dp count (tests 0,5 = 0,50 recognition).
// D3: includes = boundary + up to 3 dp.
// answerFormat: multiple-choice; choices: ["<", "=", ">"]
// expectedAnswer: the correct symbol string.
import { makeRng } from "../seeded-rng";
import { toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const CHOICES = ["<", "=", ">"] as const;
const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 45 };

function compareSymbol(a: number, b: number): string {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
}

function round(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

export const decimalCompare: Generator<string> = {
  generate(p: GeneratorParams): Question<string> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let a: number, b: number;
    let aStr: string, bStr: string;

    if (d === 1) {
      // Same dp count (1 dp each)
      a = round(rng.int(1, 99) / 10, 1);
      b = round(rng.int(1, 99) / 10, 1);
      aStr = toVnFixed(a, 1);
      bStr = toVnFixed(b, 1);
    } else if (d === 2) {
      // Different dp: one 1dp, one 2dp — may be equal (e.g. 0,5 vs 0,50)
      const makeEqual = rng.bool();
      if (makeEqual) {
        a = round(rng.int(1, 9) / 10, 1);
        b = a; // same value, different display
        aStr = toVnFixed(a, 1);
        bStr = toVnFixed(b, 2); // e.g. "0,50"
      } else {
        a = round(rng.int(1, 99) / 10, 1);
        b = round(rng.int(1, 99) / 100, 2);
        // Avoid accidental equality
        if (a === b) b = round(b + 0.01, 2);
        aStr = toVnFixed(a, 1);
        bStr = toVnFixed(b, 2);
      }
    } else {
      // D3: ~1/3 chance equal; up to 3 dp
      const makeEqual = rng.int(0, 2) === 0;
      if (makeEqual) {
        a = round(rng.int(1, 99) / 100, 2);
        b = a;
        aStr = toVnFixed(a, 2);
        bStr = toVnFixed(b, 3); // e.g. "0,120"
      } else {
        a = round(rng.int(1, 999) / 1000, 3);
        b = round(rng.int(1, 999) / 1000, 3);
        if (a === b) b = round(b + 0.001, 3);
        aStr = toVnFixed(a, 3);
        bStr = toVnFixed(b, 3);
      }
    }

    const answer = compareSymbol(a, b);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `So sánh: ${aStr} và ${bStr}`,
      answerFormat: "multiple-choice",
      choices: [...CHOICES],
      expectedAnswer: answer,
      explanation:
        `$${aStr} ${answer} ${bStr}$.\n\n` +
        `So sánh phần nguyên trước, nếu bằng nhau thì so sánh từng chữ số phần thập phân từ trái sang phải.`,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<string>): boolean {
    if (!userAnswer || !q.choices) return false;
    const trimmed = userAnswer.trim();
    if (!q.choices.includes(trimmed)) return false;
    return trimmed === q.expectedAnswer;
  },
};
