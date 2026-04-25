import "server-only";
// Composite natural-numbers review generator — randomly delegates to one of 9 G4 number-sense + arithmetic sub-generators.
// Sub-generators imported directly (NOT via registry) to avoid circular import.
// Sub-pick is deterministic: same seed always picks same sub-generator + same sub-question.
// metadata.composedFrom records which sub-skill was picked; sub-metadata is spread through to preserve format-specific fields (e.g., divide-1-digit needs `remainder`).
// validate() delegates to picked sub-generator so format-specific parsers (e.g., "X dư Y") work.
import { makeRng } from "../seeded-rng";
import { numbersTo100k } from "./numbers-to-100k";
import { sixDigitNumbers } from "./6-digit-numbers";
import { placeValue6digit } from "./place-value-6digit";
import { rounding } from "./rounding";
import { addLargeNumbers } from "../arithmetic/add-large-numbers";
import { subLargeNumbers } from "../arithmetic/sub-large-numbers";
import { multiply1Digit } from "../arithmetic/multiply-1-digit";
import { divide1Digit } from "../arithmetic/divide-1-digit";
import { multiplyDividePowers10 } from "../arithmetic/multiply-divide-powers-10";
import type { Generator, GeneratorParams, Question } from "../types";

const SUB_GENERATORS = [
  { key: "numbers-to-100k", gen: numbersTo100k },
  { key: "6-digit-numbers", gen: sixDigitNumbers },
  { key: "place-value-6digit", gen: placeValue6digit },
  { key: "rounding", gen: rounding },
  { key: "add-large-numbers", gen: addLargeNumbers },
  { key: "sub-large-numbers", gen: subLargeNumbers },
  { key: "multiply-1-digit", gen: multiply1Digit },
  { key: "divide-1-digit", gen: divide1Digit },
  { key: "multiply-divide-powers-10", gen: multiplyDividePowers10 },
] as const;

const TIME: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

function findSub(key: string) {
  return SUB_GENERATORS.find((s) => s.key === key);
}

export const naturalNumbersReview: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
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
    }) as Question<number>;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: subQuestion.problemText,
      problemLatex: subQuestion.problemLatex,
      answerFormat: "numeric",
      expectedAnswer: subQuestion.expectedAnswer,
      explanation: subQuestion.explanation,
      // Spread sub-metadata first so format-specific fields (divisor, remainder) propagate;
      // then override identity fields with composite values.
      metadata: {
        ...subQuestion.metadata,
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME[d],
        composedFrom: chosen.key,
      } as Question<number>["metadata"],
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const meta = q.metadata as Question<number>["metadata"] & {
      composedFrom?: string;
    };
    const composedFrom = meta.composedFrom;
    if (!composedFrom) return false;

    const sub = findSub(composedFrom);
    if (!sub) return false;

    // Reconstruct sub-question with sub's skillKey so sub.validate sees the
    // expected metadata shape (sub-metadata fields are already in q.metadata via spread above).
    const subQuestion: Question<number> = {
      ...q,
      skillKey: composedFrom,
      metadata: { ...q.metadata, skillKey: composedFrom },
    };

    return sub.gen.validate(userAnswer, subQuestion);
  },
};
