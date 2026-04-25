import "server-only";
// Length unit conversion generator for Vietnamese G4 curriculum.
// Units: km → m → dm → cm → mm (base = mm, ratio relative to mm).
// D1: adjacent units, value 1-10. D2: skip-1, value 1-99. D3: any pair, value 1-999.
// All answers are integers (large→small enforced; small→large only when divisible).
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import { generateConversion } from "./unit-conversion-helper";
import type { Generator, GeneratorParams, Question } from "../types";

const LENGTH_TABLE = {
  units: [
    { name: "km", ratio: 1_000_000 },
    { name: "m", ratio: 1_000 },
    { name: "dm", ratio: 100 },
    { name: "cm", ratio: 10 },
    { name: "mm", ratio: 1 },
  ],
} as const;

const TIME_SEC: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

export const lengthConversion: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    const { problemText, expectedAnswer } = generateConversion(
      rng,
      LENGTH_TABLE,
      d,
      "Đổi",
    );

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
