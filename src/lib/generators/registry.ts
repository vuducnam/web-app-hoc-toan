import "server-only";
// Generator registry — maps every generatorKey from the curriculum to a Generator instance.
// Live generators: 10 implemented generators covering core grade 4-5 skills.
// Stub generators: remaining curriculum keys throw NotImplementedError at generate() time,
//   so the UI can surface "coming soon" cleanly without a missing-key crash at lookup.
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
import { makeStub } from "./stub";
import type { Generator } from "./types";

// ---------------------------------------------------------------------------
// Stub keys — curriculum skills not yet implemented as live generators.
// Source: researcher-curriculum-knt-k45.md + expected generatorKeys from
//   prisma/seed-data/grade-4.ts and grade-5.ts (Phase 03).
// ---------------------------------------------------------------------------
const STUB_KEYS: readonly string[] = [
  "round-to-nearest-10k",
  "compare-multi-digit",
  "convert-units-length",
  "convert-units-mass",
  "convert-units-time",
  "area-rectangle",
  "perimeter-rectangle",
  "decimal-subtract",
  "decimal-divide",
  "decimal-compare",
  "fraction-multiply",
  "fraction-divide",
  "fraction-compare",
  "mixed-number-conversion",
  "percent-find-percent",
  "percent-find-base",
  "add-sub-decimals-vertical",
  "multiply-by-10-100-1000",
  "divide-by-10-100-1000",
];

// ---------------------------------------------------------------------------
// Build registry
// ---------------------------------------------------------------------------
const liveGenerators: Record<string, Generator> = {
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

/** All registered generator keys — used by Phase 12 tests to assert DB coverage. */
export const ALL_GENERATOR_KEYS = Object.keys(GENERATORS) as readonly string[];
