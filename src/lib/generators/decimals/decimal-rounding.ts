import "server-only";
// Decimal rounding generator — round to specified place.
// D1: round to nearest integer (source has 1 dp).
// D2: round to 1 dp / tenths (source has 2 dp).
// D3: round to 2 dp / hundredths (source has 3 dp).
// expectedAnswer: rounded JS number; validate via equalsWithTolerance.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 45 };

/** Round n to `places` decimal places using standard rounding. */
function roundTo(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

const PLACE_NAMES: Record<number, string> = {
  1: "hàng đơn vị",
  2: "hàng phần mười",
  3: "hàng phần trăm",
};

export const decimalRounding: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    // sourcePlaces = number of dp in the source number
    // targetPlaces = number of dp to round to
    const sourcePlaces = d;      // D1→1dp source, D2→2dp, D3→3dp
    const targetPlaces = d - 1;  // D1→whole, D2→1dp, D3→2dp

    const factor = Math.pow(10, sourcePlaces);
    const rawN = rng.int(10, 999);
    const source = roundTo(rawN / factor, sourcePlaces);
    const answer = roundTo(source, targetPlaces);

    const sourceStr = toVnFixed(source, sourcePlaces);
    const placeName = PLACE_NAMES[d];
    const ansStr = toVnFixed(answer, targetPlaces);

    // Extract the deciding digit (first digit dropped when rounding)
    const decidingDigitRaw = Math.round(Math.abs(source) * Math.pow(10, sourcePlaces)) % 10;
    const roundUp = decidingDigitRaw >= 5;

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: `Làm tròn ${sourceStr} đến ${placeName}: ?`,
      answerFormat: "decimal",
      expectedAnswer: answer,
      explanation:
        `Làm tròn $${sourceStr}$ đến ${placeName} được $${ansStr}$.\n\n` +
        `Chữ số quyết định là ${decidingDigitRaw} (${roundUp ? "≥ 5 nên làm tròn lên" : "< 5 nên bỏ đi"}).`,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer, 0.001);
  },
};
