import "server-only";
// Fraction concept generator — convert division expression to fraction.
// Text-only for MVP; visual bar/circle representation deferred to Phase 15.
// D1: whole-number division "a : b" → proper fraction a/b (a < b).
// D2: "a : b" → improper fraction a/b (a > b).
// D3: word-problem template "Một [object] chia đều cho [b] người, mỗi người được mấy phần?"
//     → 1/b. Single template per KISS decision (2026-04-25).
// expectedAnswer: Fraction (accept any equivalent form via parseFraction + equivalent).
import { makeRng } from "../seeded-rng";
import { equivalent, parseFraction } from "../normalize/fraction";
import type { Fraction, Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 45 };

// Word-problem object nouns for D3 variation (Vietnamese)
const OBJECTS = ["cái bánh", "cái kẹo", "quả cam", "tờ giấy", "cái bánh mì"] as const;

export const fractionConcept: Generator<Fraction> = {
  generate(p: GeneratorParams): Question<Fraction> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let problemText: string;
    let expectedAnswer: Fraction;

    if (d === 1) {
      // Proper fraction: numerator < denominator
      const den = rng.int(3, 9);
      const num = rng.int(1, den - 1);
      problemText = `${num} : ${den} = ?`;
      expectedAnswer = { num, den };
    } else if (d === 2) {
      // Improper fraction: numerator > denominator
      const den = rng.int(2, 7);
      const num = rng.int(den + 1, den + den);
      problemText = `${num} : ${den} = ?`;
      expectedAnswer = { num, den };
    } else {
      // D3: word problem — 1/b
      const den = rng.int(3, 10);
      const obj = rng.pick(OBJECTS);
      problemText = `Một ${obj} chia đều cho ${den} người, mỗi người được mấy phần?`;
      expectedAnswer = { num: 1, den };
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "fraction",
      expectedAnswer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<Fraction>): boolean {
    const parsed = parseFraction(userAnswer);
    if (parsed === null) return false;
    return equivalent(parsed, q.expectedAnswer);
  },
};
