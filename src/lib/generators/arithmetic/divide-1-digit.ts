import "server-only";
// Generator: multi-digit ÷ 1-digit division.
// Strategy: pick quotient + divisor, compute dividend (guarantees clean division for D1/D2).
// D1: 2-digit ÷ 1-digit, exact (no remainder). Quotient in [10,99], divisor in [2,9].
// D2: 3-digit ÷ 1-digit, exact. Quotient in [100,999], divisor in [2,9].
// D3: 4-digit ÷ 1-digit WITH remainder. Dividend in [1000,9999], divisor in [2,9].
//   expectedAnswer = quotient (integer division).
//   validate() accepts "123" OR "123 dư 4" — regex /^(\d+)(?:\s*dư\s*(\d+))?$/.
//   If remainder form provided, BOTH quotient and remainder must match.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 60, 2: 60, 3: 60 };

const QUOTIENT_RANGES: Record<number, [number, number]> = {
  1: [10,  99],
  2: [100, 999],
};

const DU_REGEX = /^(\d+)(?:\s*dư\s*(\d+))?$/;

/** Parse "quotient" or "quotient dư remainder" answer string. Returns null if unparseable. */
function parseDivisionAnswer(input: string): { quotient: number; remainder: number | null } | null {
  const trimmed = input.trim();
  const m = DU_REGEX.exec(trimmed);
  if (!m) return null;
  const quotient = parseInt(m[1], 10);
  const remainder = m[2] !== undefined ? parseInt(m[2], 10) : null;
  if (!Number.isFinite(quotient)) return null;
  if (remainder !== null && !Number.isFinite(remainder)) return null;
  return { quotient, remainder };
}

export const divide1Digit: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let dividend: number, divisor: number, quotient: number, remainder: number;

    if (d === 3) {
      // D3: pick dividend directly; answer is quotient; remainder may be non-zero
      divisor = rng.int(2, 9);
      dividend = rng.int(1_000, 9_999);
      quotient = Math.floor(dividend / divisor);
      remainder = dividend % divisor;
    } else {
      // D1/D2: exact division — pick quotient × divisor
      const [qMin, qMax] = QUOTIENT_RANGES[d];
      quotient = rng.int(qMin, qMax);
      divisor = rng.int(2, 9);
      dividend = quotient * divisor;
      remainder = 0;
    }

    // Store remainder in metadata for validate() use
    const problemText = `${dividend} ÷ ${divisor} = ?`;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer: quotient,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME[d],
        // Extra: store divisor and remainder for D3 validation
        divisor,
        remainder,
      } as Question<number>["metadata"] & { divisor: number; remainder: number },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    if (!userAnswer) return false;
    const parsed = parseDivisionAnswer(userAnswer);
    if (!parsed) return false;

    const { quotient, remainder } = parsed;
    if (quotient !== q.expectedAnswer) return false;

    // If user supplied "dư" form, validate remainder too
    const meta = q.metadata as typeof q.metadata & { remainder?: number };
    if (remainder !== null) {
      const expectedRemainder = meta.remainder ?? 0;
      return remainder === expectedRemainder;
    }

    return true;
  },
};
