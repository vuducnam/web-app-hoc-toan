import "server-only";
// Generator: read/write 6-digit numbers (Vietnamese words → digits).
// Always "Viết số: <words>" prompt so student types digits (NUMERIC format).
// D1: 100000–199999 (lead digit 1). D2: 100000–999999 (full 6-digit range).
// D3: include zeros in middle positions (e.g. 405020) — picked from constrained set.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import { numberToVietnameseWords } from "./vn-number-words";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

/** Generate a 6-digit number with at least one zero in a middle position (hundreds/thousands/ten-thousands). */
function generateWithMiddleZero(rng: ReturnType<typeof makeRng>): number {
  // Force at least one of positions 1,2,3 (hundreds, thousands, ten-thousands) to be zero
  const lead = rng.int(1, 9);          // hundred-thousands
  const positions = [0, 0, 0, 0, 0];  // ten-thousands, thousands, hundreds, tens, ones
  // Pick one random middle position (indices 0–2 = ten-thousands, thousands, hundreds) to be zero
  const zeroPos = rng.int(0, 2);
  for (let i = 0; i < 5; i++) {
    if (i === zeroPos) {
      positions[i] = 0;
    } else {
      positions[i] = rng.int(0, 9);
    }
  }
  return (
    lead * 100_000 +
    positions[0] * 10_000 +
    positions[1] * 1_000 +
    positions[2] * 100 +
    positions[3] * 10 +
    positions[4]
  );
}

function generateNumber(rng: ReturnType<typeof makeRng>, difficulty: 1 | 2 | 3): number {
  switch (difficulty) {
    case 1: return rng.int(100_000, 199_999);
    case 2: return rng.int(100_000, 999_999);
    case 3: return generateWithMiddleZero(rng);
  }
}

export const sixDigitNumbers: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const n = generateNumber(rng, d);
    const words = numberToVietnameseWords(n);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Viết số: ${words} = ?`,
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
