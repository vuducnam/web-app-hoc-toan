import "server-only";
// Generator: round an integer to a given place value.
// Boundary vs decimal-rounding (Phase 02): this skill rounds integers ONLY.
// D1: round to nearest 10, numbers in [10, 999].
// D2: round to nearest 100, numbers in [100, 9999].
// D3: round to nearest 1000, numbers in [1000, 99999].
// Tie-breaking: Math.round() uses round-half-up (e.g. 15 → 20, 150 → 200).
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

const DIFFICULTY_CONFIG: Record<number, { min: number; max: number; unit: number; unitName: string }> = {
  1: { min: 10,    max: 999,    unit: 10,    unitName: "chục" },
  2: { min: 100,   max: 9_999,  unit: 100,   unitName: "trăm" },
  3: { min: 1_000, max: 99_999, unit: 1_000, unitName: "nghìn" },
};

export const rounding: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const { min, max, unit, unitName } = DIFFICULTY_CONFIG[d];
    const n = rng.int(min, max);
    const rounded = Math.round(n / unit) * unit;

    // Explanation: show the deciding digit and rounding rule
    const decidingDigit = Math.floor(n / (unit / 10)) % 10; // digit just below rounding position
    const ruleText = decidingDigit >= 5
      ? `Chữ số liền bên phải hàng ${unitName} là $${decidingDigit} \\geq 5$, nên làm tròn lên.`
      : `Chữ số liền bên phải hàng ${unitName} là $${decidingDigit} < 5$, nên làm tròn xuống.`;
    const explanation =
      `Đáp án: $${rounded}$.\n\n${ruleText} ` +
      `Vậy $${n}$ làm tròn đến hàng ${unitName} được $${rounded}$.`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Làm tròn số ${n} đến hàng ${unitName}: ?`,
      answerFormat: "numeric",
      expectedAnswer: rounded,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
