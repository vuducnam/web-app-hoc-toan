import "server-only";
// Shared factory for composite review generators (Phase 04).
// Builds a Generator that deterministically picks a sub-generator from `subs`
// based on the parent seed, derives a sub-seed, generates the sub-question,
// and re-wraps the result under the composite's identity (skillKey, time).
//
// Sub-metadata (e.g. divide-1-digit's `remainder`) is propagated via spread so
// validate() can delegate cleanly to the picked sub-generator without losing
// format-specific fields.
//
// Pre-existing composites (fractions-review, natural-numbers-review) inline
// the same pattern; they are left as-is to avoid out-of-scope refactor.
import { makeRng } from "../seeded-rng";
import type { AnswerFormat, Generator, GeneratorParams, Question } from "../types";

export interface SubGenEntry {
  key: string;
  gen: Generator<unknown>;
}

export interface CompositeOpts {
  /** Sub-generator pool — sub picked uniformly at random per seed. */
  subs: readonly SubGenEntry[];
  /** Composite's outward answerFormat (matches the parent skill's seed value). */
  answerFormat: AnswerFormat;
  /** Time estimate per difficulty (seconds). */
  time: Record<number, number>;
}

export function makeCompositeReview<T>(opts: CompositeOpts): Generator<T> {
  const { subs, answerFormat, time } = opts;
  const findSub = (key: string) => subs.find((s) => s.key === key);

  return {
    generate(p: GeneratorParams): Question<T> {
      const { seed, difficulty, skillKey } = p;
      const rng = makeRng(seed);
      const d = difficulty as 1 | 2 | 3;

      const chosen = rng.pick(subs);
      const subSeed = `${seed}-${chosen.key}`;
      const subQuestion = chosen.gen.generate({
        seed: subSeed,
        difficulty: d,
        skillKey: chosen.key,
      }) as Question<T>;

      return {
        id: `${skillKey}-${seed}`,
        skillKey,
        problemText: subQuestion.problemText,
        problemLatex: subQuestion.problemLatex,
        answerFormat,
        choices: subQuestion.choices,
        expectedAnswer: subQuestion.expectedAnswer,
        metadata: {
          ...subQuestion.metadata,
          difficulty: d,
          seed,
          skillKey,
          timeEstimateSec: time[d],
          composedFrom: chosen.key,
        } as Question<T>["metadata"],
      };
    },

    validate(userAnswer: string, q: Question<T>): boolean {
      const composedFrom = (q.metadata as { composedFrom?: string }).composedFrom;
      if (!composedFrom) return false;
      const sub = findSub(composedFrom);
      if (!sub) return false;

      const subQuestion: Question<T> = {
        ...q,
        skillKey: composedFrom,
        metadata: { ...q.metadata, skillKey: composedFrom },
      };
      return sub.gen.validate(userAnswer, subQuestion);
    },
  };
}
