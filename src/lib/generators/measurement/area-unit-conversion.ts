import "server-only";
// Area unit conversion generator for Vietnamese G5 curriculum.
// Units: km² → ha → dam² (a) → m² (base = m²).
// D1: ha↔m² adjacent, value 1-10. D2: km²↔ha. D3: km²↔m² (factor 1,000,000).
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import { generateConversion } from "./unit-conversion-helper";
import type { Generator, GeneratorParams, Question } from "../types";

// Note: dam² (đề-ca-mét vuông) = 100 m²; ha = 10000 m²; km² = 1,000,000 m²
const AREA_TABLE = {
  units: [
    { name: "km²", ratio: 1_000_000 },
    { name: "ha", ratio: 10_000 },
    { name: "dam²", ratio: 100 },
    { name: "m²", ratio: 1 },
  ],
} as const;

const TIME_SEC: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

export const areaUnitConversion: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    const { problemText, expectedAnswer } = generateConversion(
      rng,
      AREA_TABLE,
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
