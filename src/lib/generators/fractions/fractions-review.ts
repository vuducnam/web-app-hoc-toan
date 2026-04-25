import "server-only";
// Composite fraction review generator — randomly delegates to one of 5 fraction sub-generators.
// Sub-generators imported directly (NOT via registry) to avoid circular import.
// Sub-pick is deterministic: same seed always picks same sub-generator + same sub-question.
// metadata.composedFrom records which sub-skill was picked for debugging.
import { makeRng } from "../seeded-rng";
import { parseFraction, equivalent } from "../normalize/fraction";
import { simplifyFraction } from "./simplify-fraction";
import { fractionAdd } from "./fraction-add";
import { fractionSubtract } from "./fraction-subtract";
import { fractionMultiply } from "./fraction-multiply";
import { fractionDivide } from "./fraction-divide";
import type { Fraction, Generator, GeneratorParams, Question } from "../types";

const SUB_GENERATORS = [
  { key: "simplify-fraction", gen: simplifyFraction },
  { key: "fraction-add", gen: fractionAdd },
  { key: "fraction-subtract", gen: fractionSubtract },
  { key: "fraction-multiply", gen: fractionMultiply },
  { key: "fraction-divide", gen: fractionDivide },
] as const;

const TIME: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

export const fractionsReview: Generator<Fraction> = {
  generate(p: GeneratorParams): Question<Fraction> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    // Pick sub-generator deterministically from seed
    const chosen = rng.pick(SUB_GENERATORS);
    // Derive sub-seed from parent seed to keep sub-question deterministic
    const subSeed = `${seed}-${chosen.key}`;

    const subQuestion = chosen.gen.generate({
      seed: subSeed,
      difficulty: d,
      skillKey: chosen.key,
    }) as Question<Fraction>;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: subQuestion.problemText,
      problemLatex: subQuestion.problemLatex,
      answerFormat: "fraction",
      expectedAnswer: subQuestion.expectedAnswer,
      explanation: subQuestion.explanation,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME[d],
        // composedFrom: which sub-generator was picked — useful for debugging determinism
        composedFrom: chosen.key,
      } as Question<Fraction>["metadata"],
    };
  },

  validate(userAnswer: string, q: Question<Fraction>): boolean {
    const parsed = parseFraction(userAnswer);
    if (parsed === null) return false;
    return equivalent(parsed, q.expectedAnswer);
  },
};
