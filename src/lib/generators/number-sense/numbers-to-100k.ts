import "server-only";
// Generator: read Vietnamese number-words → write digits.
// Direction: word → digit ONLY (confirmed locked decision 2026-04-25).
// D1: 3–4 digit numbers (100–9999), D2: 5 digit (10000–99999), D3: boundary + edge cases.
// Edge cases avoided in D1/D2: numbers where tens digit is 0 with non-zero ones ("linh"),
// ones digit is 1 after non-zero tens ("mốt"), or ones digit is 5 after tens ("lăm").
// D3 uses full range including these forms.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import { numberToVietnameseWords } from "./vn-number-words";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

/** Returns true if the number has a "tricky" Vietnamese word form (linh/mốt/lăm). */
function hasTrickyForm(n: number): boolean {
  // Check each thousands/hundreds component for zero-tens-nonzero-ones (linh)
  // or ones digit 1 or 5 after a non-zero tens digit (mốt, lăm)
  let remainder = n;
  while (remainder > 0) {
    const chunk = remainder % 1000;
    remainder = Math.floor(remainder / 1000);
    const tens = Math.floor((chunk % 100) / 10);
    const ones = chunk % 10;
    if (tens === 0 && ones !== 0) return true;
    if (tens >= 2 && (ones === 1 || ones === 5)) return true;
  }
  return false;
}

function generateNumber(rng: ReturnType<typeof makeRng>, difficulty: 1 | 2 | 3): number {
  if (difficulty === 3) {
    // D3: include boundary + full range including tricky forms
    const options = [10_000, 50_000, 100_000];
    if (rng.bool()) return rng.pick(options);
    return rng.int(10_000, 100_000);
  }

  const [min, max] = difficulty === 1 ? [100, 9_999] : [10_000, 99_999];
  // Attempt up to 20 times to pick a non-tricky number
  for (let i = 0; i < 20; i++) {
    const n = rng.int(min, max);
    if (!hasTrickyForm(n)) return n;
  }
  // Fallback: construct a safe number (all tens digits 2-9, ones digits 2-4 or 6-9)
  const safeTens = [2, 3, 4, 6, 7, 8];
  const safeOnes = [2, 3, 4, 6, 7, 8];
  if (difficulty === 1) {
    const hundreds = rng.int(1, 9);
    const tens = rng.pick(safeTens);
    const ones = rng.pick(safeOnes);
    return hundreds * 100 + tens * 10 + ones;
  }
  const ten_thousands = rng.int(1, 9);
  const thousands = rng.int(0, 9);
  const hundreds = rng.int(0, 9);
  const tens = rng.pick(safeTens);
  const ones = rng.pick(safeOnes);
  return ten_thousands * 10_000 + thousands * 1_000 + hundreds * 100 + tens * 10 + ones;
}

export const numbersTo100k: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const n = generateNumber(rng, d);
    const words = numberToVietnameseWords(n);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Số "${words}" viết là ?`,
      answerFormat: "numeric",
      expectedAnswer: n,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
