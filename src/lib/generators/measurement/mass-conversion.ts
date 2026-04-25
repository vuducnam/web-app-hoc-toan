import "server-only";
// Mass unit conversion generator for Vietnamese G4 curriculum.
// Units: tấn → tạ → yến → kg → hg → dag → g (base = g).
// D1: adjacent units, value 1-10. D2: skip-1, value 1-99. D3: any pair, value 1-999.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import { generateConversion } from "./unit-conversion-helper";
import type { Generator, GeneratorParams, Question } from "../types";

const MASS_TABLE = {
  units: [
    { name: "tấn", ratio: 1_000_000 },
    { name: "tạ", ratio: 100_000 },
    { name: "yến", ratio: 10_000 },
    { name: "kg", ratio: 1_000 },
    { name: "hg", ratio: 100 },
    { name: "dag", ratio: 10 },
    { name: "g", ratio: 1 },
  ],
} as const;

const TIME_SEC: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

export const massConversion: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    const { problemText, expectedAnswer } = generateConversion(
      rng,
      MASS_TABLE,
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
