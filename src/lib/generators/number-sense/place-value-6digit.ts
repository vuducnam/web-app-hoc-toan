import "server-only";
// Generator: identify place value of a digit in a number.
// D1: 5-digit numbers, asks about trăm/nghìn/chục nghìn positions.
// D2: 6-digit numbers, includes trăm nghìn position.
// D3: 6-digit numbers, asks "giá trị của chữ số X trong số Y" (digit × place value).
// expectedAnswer: the place-value contribution (digit × 10^position).
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

// position index 0 = ones, 1 = tens, 2 = hundreds, 3 = thousands, 4 = ten-thousands, 5 = hundred-thousands
const PLACE_NAMES: Record<number, string> = {
  0: "hàng đơn vị",
  1: "hàng chục",
  2: "hàng trăm",
  3: "hàng nghìn",
  4: "hàng chục nghìn",
  5: "hàng trăm nghìn",
};

/** Extract digit at a given position (0 = ones). */
function digitAt(n: number, pos: number): number {
  return Math.floor(n / Math.pow(10, pos)) % 10;
}

/** Generate a number and position where the target digit is non-zero (to avoid trivial questions). */
function generate(
  rng: ReturnType<typeof makeRng>,
  difficulty: 1 | 2 | 3,
): { n: number; pos: number } {
  const maxPos = difficulty === 1 ? 4 : 5;
  const minDigits = difficulty === 1 ? 5 : 6;
  const minN = Math.pow(10, minDigits - 1);
  const maxN = Math.pow(10, minDigits) - 1;

  for (let attempt = 0; attempt < 30; attempt++) {
    const n = rng.int(minN, maxN);
    const pos = rng.int(2, maxPos); // skip ones/tens for clarity; ask hundreds and above
    if (digitAt(n, pos) !== 0) return { n, pos };
  }
  // Fallback: construct a number with a known non-zero digit at a fixed position
  const pos = difficulty === 1 ? 3 : 4;
  const base = difficulty === 1 ? 12_345 : 123_456;
  return { n: base, pos };
}

export const placeValue6digit: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const { n, pos } = generate(rng, d);
    const digit = digitAt(n, pos);
    const placeValue = digit * Math.pow(10, pos);
    const placeName = PLACE_NAMES[pos];

    const problemText =
      d === 3
        ? `Trong số ${n}, giá trị của chữ số ${digit} ở ${placeName} là ?`
        : `Trong số ${n}, chữ số ở ${placeName} có giá trị là ?`;

    // Explanation: show digit × place-value unit
    const placeUnit = Math.pow(10, pos);
    const explanation =
      `Đáp án: $${placeValue}$.\n\n` +
      `Chữ số $${digit}$ ở ${placeName} có giá trị là ` +
      `$${digit} \\times ${placeUnit} = ${placeValue}$.`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer: placeValue,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
