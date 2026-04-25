import "server-only";
// Generator registry — maps every generatorKey from the curriculum to a Generator instance.
// Phase 13 + 14a (2026-04-25): expanded liveGenerators from 10 → 56 (44 + 12 Phase 14a)
//   (number-sense, arithmetic, fractions, decimals, measurement, geometry, composites).
// Stub generators: remaining curriculum keys throw NotImplementedError at generate() time,
//   so the UI can surface "coming soon" cleanly without a missing-key crash at lookup.

// --- Live generators: existing (10) ---
import { addSub100kCarry } from "./arithmetic/add-sub-100k-carry";
import { multiply2Digit } from "./arithmetic/multiply-2-digit";
import { divide2Digit } from "./arithmetic/divide-2-digit";
import { simplifyFraction } from "./fractions/simplify-fraction";
import { fractionCommonDenominator } from "./fractions/fraction-common-denominator";
import { fractionAdd } from "./fractions/fraction-add";
import { fractionSubtract } from "./fractions/fraction-subtract";
import { decimalAdd } from "./decimals/decimal-add";
import { decimalMultiply } from "./decimals/decimal-multiply";
import { percentOfWhole } from "./percent/percent-of-whole";

// --- Phase 13 Tier 1: G4 number sense + big arithmetic (10) ---
import { numbersTo100k } from "./number-sense/numbers-to-100k";
import { evenOdd } from "./number-sense/even-odd";
import { sixDigitNumbers } from "./number-sense/6-digit-numbers";
import { placeValue6digit } from "./number-sense/place-value-6digit";
import { rounding } from "./number-sense/rounding";
import { addLargeNumbers } from "./arithmetic/add-large-numbers";
import { subLargeNumbers } from "./arithmetic/sub-large-numbers";
import { multiply1Digit } from "./arithmetic/multiply-1-digit";
import { divide1Digit } from "./arithmetic/divide-1-digit";
import { multiplyDividePowers10 } from "./arithmetic/multiply-divide-powers-10";

// --- Phase 13 Tier 2: G5 fractions + decimals (11) ---
import { fractionMultiply } from "./fractions/fraction-multiply";
import { fractionDivide } from "./fractions/fraction-divide";
import { fractionCompare } from "./fractions/fraction-compare";
import { fractionConcept } from "./fractions/fraction-concept";
import { fractionsReview } from "./fractions/fractions-review";
import { decimalSubtract } from "./decimals/decimal-subtract";
import { decimalDivide } from "./decimals/decimal-divide";
import { decimalCompare } from "./decimals/decimal-compare";
import { decimalConcept } from "./decimals/decimal-concept";
import { decimalRounding } from "./decimals/decimal-rounding";
import { decimalPowers10 } from "./decimals/decimal-powers-10";
import { naturalNumbersReview } from "./number-sense/natural-numbers-review";

// --- Phase 13 Tier 3: measurement + geometry (7) ---
import { lengthConversion } from "./measurement/length-conversion";
import { massConversion } from "./measurement/mass-conversion";
import { capacityConversion } from "./measurement/capacity-conversion";
import { areaUnitConversion } from "./measurement/area-unit-conversion";
import { volumeUnits } from "./measurement/volume-units";
import { rectangularPrismVolume } from "./measurement/rectangular-prism-volume";
import { timeMeasurement } from "./measurement/time-measurement";

// --- Phase 13 Tier 4: composite reviews (5) ---
import { semester1ReviewArithmetic } from "./reviews/semester1-review-arithmetic";
import { semester1ReviewDecimals } from "./reviews/semester1-review-decimals";
import { yearReviewArithmetic } from "./reviews/year-review-arithmetic";
import { yearReviewFractions } from "./reviews/year-review-fractions";
import { yearReviewComprehensive } from "./reviews/year-review-comprehensive";

// --- Phase 14a: G5 geometry/measurement formula generators (5) ---
import { triangleArea } from "./geometry/triangle-area";
import { trapezoidArea } from "./geometry/trapezoid-area";
import { boxSurfaceArea } from "./geometry/box-surface-area";
import { cylinderVolume } from "./geometry/cylinder-volume";
import { circleCircumferenceArea } from "./geometry/circle-circumference-area";

// --- Phase 14a: G4 concept MC generators (4) ---
import { angleClassify } from "./concept/angle-classify";
import { parallelPerpendicular } from "./concept/parallel-perpendicular";
import { parallelogramRhombus } from "./concept/parallelogram-rhombus";
import { probabilityIntro } from "./concept/probability-intro";

// --- Phase 14a: G5 word-problem generators (3) ---
import { speedDistanceTime } from "./word-problems/speed-distance-time";
import { ratioConcept } from "./word-problems/ratio-concept";
import { ratioWordProblems } from "./word-problems/ratio-word-problems";

// --- Phase 14a: G5 geometry composite review (1) ---
import { geometryReview } from "./reviews/geometry-review";

import { makeStub } from "./stub";
import type { Generator } from "./types";

// ---------------------------------------------------------------------------
// Stub keys — empty after Phase 13 Tier 4 + Phase 05 cleanup.
// 13 legacy alias keys removed (verified zero seed/code references).
// poolKey skills (16 angle/triangle/word-problem skills) handled separately
// via practice.ts guard, not via this registry.
// ---------------------------------------------------------------------------
const STUB_KEYS: readonly string[] = [];

// ---------------------------------------------------------------------------
// Build registry — 57 live + 0 stubs = 57 known keys (Phase 14a converts 12 poolKey→generatorKey;
// geometry-review composite = +1 = 58 after composite added)
// ---------------------------------------------------------------------------
const liveGenerators: Record<string, Generator> = {
  // --- Pre-Phase 13 (10) ---
  "add-sub-100k-carry": addSub100kCarry,
  "multiply-2-digit": multiply2Digit,
  "divide-2-digit": divide2Digit,
  "simplify-fraction": simplifyFraction,
  "fraction-common-denominator": fractionCommonDenominator,
  "fraction-add": fractionAdd,
  "fraction-subtract": fractionSubtract,
  "decimal-add": decimalAdd,
  "decimal-multiply": decimalMultiply,
  "percent-of-whole": percentOfWhole,

  // --- Phase 13 Tier 1: G4 number sense + arithmetic (10) ---
  "numbers-to-100k": numbersTo100k,
  "even-odd": evenOdd,
  "6-digit-numbers": sixDigitNumbers,
  "place-value-6digit": placeValue6digit,
  "rounding": rounding,
  "add-large-numbers": addLargeNumbers,
  "sub-large-numbers": subLargeNumbers,
  "multiply-1-digit": multiply1Digit,
  "divide-1-digit": divide1Digit,
  "multiply-divide-powers-10": multiplyDividePowers10,

  // --- Phase 13 Tier 2: G5 fractions + decimals (12) ---
  "fraction-multiply": fractionMultiply,
  "fraction-divide": fractionDivide,
  "fraction-compare": fractionCompare,
  "fraction-concept": fractionConcept,
  "fractions-review": fractionsReview,
  "decimal-subtract": decimalSubtract,
  "decimal-divide": decimalDivide,
  "decimal-compare": decimalCompare,
  "decimal-concept": decimalConcept,
  "decimal-rounding": decimalRounding,
  "decimal-powers-10": decimalPowers10,
  "natural-numbers-review": naturalNumbersReview,

  // --- Phase 13 Tier 3: measurement + geometry (7) ---
  "length-conversion": lengthConversion,
  "mass-conversion": massConversion,
  "capacity-conversion": capacityConversion,
  "area-unit-conversion": areaUnitConversion,
  "volume-units": volumeUnits,
  "rectangular-prism-volume": rectangularPrismVolume,
  "time-measurement": timeMeasurement,

  // --- Phase 13 Tier 4: composite reviews (5) ---
  "semester1-review-arithmetic": semester1ReviewArithmetic,
  "semester1-review-decimals": semester1ReviewDecimals,
  "year-review-arithmetic": yearReviewArithmetic,
  "year-review-fractions": yearReviewFractions,
  "year-review-comprehensive": yearReviewComprehensive,

  // --- Phase 14a: G5 geometry/measurement formula (5) ---
  "triangle-area": triangleArea,
  "trapezoid-area": trapezoidArea,
  "box-surface-area": boxSurfaceArea,
  "cylinder-volume": cylinderVolume,
  "circle-circumference-area": circleCircumferenceArea,

  // --- Phase 14a: G4 concept MC (4) ---
  "angle-classify": angleClassify,
  "parallel-perpendicular": parallelPerpendicular,
  "parallelogram-rhombus": parallelogramRhombus,
  "probability-intro": probabilityIntro,

  // --- Phase 14a: G5 word problems (3) ---
  "speed-distance-time": speedDistanceTime,
  "ratio-concept": ratioConcept,
  "ratio-word-problems": ratioWordProblems,

  // --- Phase 14a: G5 geometry composite (1) ---
  "geometry-review": geometryReview,
};

const stubGenerators: Record<string, Generator> = Object.fromEntries(
  STUB_KEYS.map((key) => [key, makeStub(key)]),
);

/** Complete registry of all known generator keys. */
export const GENERATORS: Record<string, Generator> = {
  ...liveGenerators,
  ...stubGenerators,
};

/**
 * Look up a generator by its key.
 * Throws if the key is entirely unknown (not in live set or stub set).
 * A stub key does NOT throw here — it throws only on generate().
 */
export function getGenerator(key: string): Generator {
  const g = GENERATORS[key];
  if (!g) throw new Error(`Unknown generator: "${key}"`);
  return g;
}

/** All registered generator keys — used by tests to assert DB coverage. */
export const ALL_GENERATOR_KEYS = Object.keys(GENERATORS) as readonly string[];

/** Set of keys that have a live (non-stub) implementation. */
export const LIVE_GENERATOR_KEYS = new Set(Object.keys(liveGenerators));
