import "server-only";
// Capacity unit conversion generator for Vietnamese G4 curriculum.
// Only 2 units in G4: l (lít) and ml (mililít). 1 l = 1000 ml.
// D1: value 1-10, l→ml. D2: value must be multiple of 1000, ml→l. D3: mixed direction + larger values.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 45, 2: 60, 3: 60 };
const FACTOR = 1000; // 1 l = 1000 ml

export const capacityConversion: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    let problemText: string;
    let expectedAnswer: number;

    let explanation: string;

    if (d === 1) {
      // l → ml, value 1-10
      const value = rng.int(1, 10);
      expectedAnswer = value * FACTOR;
      problemText = `Đổi: ${value} l = ? ml`;
      explanation =
        `$${value}\\,\\text{l} = ${expectedAnswer}\\,\\text{ml}$.\n\n` +
        `Đổi: $1\\,\\text{l} = ${FACTOR}\\,\\text{ml}$, nên $${value} \\times ${FACTOR} = ${expectedAnswer}$.`;
    } else if (d === 2) {
      // ml → l, value must be multiple of 1000, range 1000-9000
      const multiplier = rng.int(1, 9);
      const value = multiplier * FACTOR;
      expectedAnswer = multiplier;
      problemText = `Đổi: ${value} ml = ? l`;
      explanation =
        `$${value}\\,\\text{ml} = ${expectedAnswer}\\,\\text{l}$.\n\n` +
        `Đổi: $1\\,\\text{l} = ${FACTOR}\\,\\text{ml}$, nên $${value} \\div ${FACTOR} = ${expectedAnswer}$.`;
    } else {
      // D3: mixed direction, larger values
      const goLargeToSmall = rng.bool();
      if (goLargeToSmall) {
        // l → ml, value 10-99
        const value = rng.int(10, 99);
        expectedAnswer = value * FACTOR;
        problemText = `Đổi: ${value} l = ? ml`;
        explanation =
          `$${value}\\,\\text{l} = ${expectedAnswer}\\,\\text{ml}$.\n\n` +
          `Đổi: $1\\,\\text{l} = ${FACTOR}\\,\\text{ml}$, nên $${value} \\times ${FACTOR} = ${expectedAnswer}$.`;
      } else {
        // ml → l, value multiple of 1000, range 10000-99000
        const multiplier = rng.int(10, 99);
        const value = multiplier * FACTOR;
        expectedAnswer = multiplier;
        problemText = `Đổi: ${value} ml = ? l`;
        explanation =
          `$${value}\\,\\text{ml} = ${expectedAnswer}\\,\\text{l}$.\n\n` +
          `Đổi: $1\\,\\text{l} = ${FACTOR}\\,\\text{ml}$, nên $${value} \\div ${FACTOR} = ${expectedAnswer}$.`;
      }
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
