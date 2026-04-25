import "server-only";
// Volume unit conversion generator for Vietnamese G5 curriculum.
// Units: m³ → dm³ → cm³ (base = cm³). 1 m³ = 1000 dm³, 1 dm³ = 1000 cm³.
// D1: dm³↔cm³ adjacent, value 1-10. D2: m³↔dm³. D3: m³↔cm³ (factor 1,000,000).
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import { generateConversion } from "./unit-conversion-helper";
import type { Generator, GeneratorParams, Question } from "../types";

const VOLUME_TABLE = {
  units: [
    { name: "m³", ratio: 1_000_000 },
    { name: "dm³", ratio: 1_000 },
    { name: "cm³", ratio: 1 },
  ],
} as const;

const TIME_SEC: Record<number, number> = { 1: 45, 2: 45, 3: 60 };

export const volumeUnits: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    const { problemText, expectedAnswer, fromUnit, toUnit, value } = generateConversion(
      rng,
      VOLUME_TABLE,
      d,
      "Đổi",
    );

    const fromRatio = VOLUME_TABLE.units.find((u) => u.name === fromUnit)?.ratio ?? 1;
    const toRatio = VOLUME_TABLE.units.find((u) => u.name === toUnit)?.ratio ?? 1;
    const factor = fromRatio / toRatio;

    // Note for students: 1 dm³ = 1 lít (link capacity to volume)
    const linkNote =
      fromUnit === "dm³" || toUnit === "dm³"
        ? " Lưu ý: $1\\,\\text{dm}^3 = 1\\,\\text{lít}$."
        : "";

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      explanation:
        `$${value}\\,\\text{${fromUnit}} = ${expectedAnswer}\\,\\text{${toUnit}}$.\n\n` +
        `Đổi: $1\\,\\text{${fromUnit}} = ${factor}\\,\\text{${toUnit}}$, ` +
        `nên $${value} \\times ${factor} = ${expectedAnswer}$.${linkNote}`,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
