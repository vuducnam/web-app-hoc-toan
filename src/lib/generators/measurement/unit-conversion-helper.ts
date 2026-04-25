import "server-only";
// Shared helper for all unit-conversion generators.
// Converts between two units in a table ordered largest → smallest.
// All generators use this to produce deterministic, integer-answer problems.
import type { SeededRng } from "../seeded-rng";

export interface UnitEntry {
  name: string;
  /** Ratio relative to smallest (base) unit. */
  ratio: number;
}

export interface UnitTable {
  units: readonly UnitEntry[];
}

export interface ConversionResult {
  problemText: string;
  expectedAnswer: number;
  fromUnit: string;
  toUnit: string;
  value: number;
}

/**
 * Pick a from/to pair and a value that produces an integer answer.
 *
 * Difficulty bands:
 *   D1 — adjacent units only, value ∈ [1, 10]
 *   D2 — skip 1 level apart, value ∈ [1, 99]
 *   D3 — any pair, value ∈ [1, 999]
 *
 * Direction: D1/D2 convert large → small (always integer).
 * D3: 50% chance small → large, but only when value is a multiple of (toRatio / fromRatio).
 */
export function generateConversion(
  rng: SeededRng,
  table: UnitTable,
  difficulty: 1 | 2 | 3,
  promptVerb: string,
): ConversionResult {
  const units = table.units;
  const n = units.length;

  // Determine allowed gap between indices (adjacent = 1, skip-1 = 2, any >= 1)
  const maxGap = difficulty === 1 ? 1 : difficulty === 2 ? 2 : n - 1;
  const minGap = 1;
  const valueMax = difficulty === 1 ? 10 : difficulty === 2 ? 99 : 999;

  // Attempt up to 20 tries to find valid pair + value
  for (let attempt = 0; attempt < 20; attempt++) {
    const gap = rng.int(minGap, Math.min(maxGap, n - 1));
    const fromIdx = rng.int(0, n - 1 - gap); // large→small default
    const toIdx = fromIdx + gap;

    const fromUnit = units[fromIdx];
    const toUnit = units[toIdx];

    // conversionFactor: how many toUnits fit in one fromUnit
    const factor = fromUnit.ratio / toUnit.ratio;

    // For D3 allow reverse direction (small→large) only when divisible
    if (difficulty === 3 && rng.bool()) {
      // Try reverse: units[toIdx] → units[fromIdx]
      const reverseValue = rng.int(1, valueMax);
      const inverseFactor = toUnit.ratio / fromUnit.ratio; // < 1 for large target
      const answer = reverseValue * inverseFactor;
      if (Number.isInteger(answer) && answer > 0) {
        return buildResult(promptVerb, toUnit.name, fromUnit.name, reverseValue, answer);
      }
      // Fallback to forward conversion below (don't return)
    }

    const value = rng.int(1, valueMax);
    const answer = value * factor;
    if (Number.isInteger(answer) && answer > 0) {
      return buildResult(promptVerb, fromUnit.name, toUnit.name, value, answer);
    }
  }

  // Last-resort: use first adjacent pair, small value guaranteed integer
  const fromUnit = units[0];
  const toUnit = units[1];
  const factor = fromUnit.ratio / toUnit.ratio;
  const value = rng.int(1, 9);
  return buildResult(promptVerb, fromUnit.name, toUnit.name, value, value * factor);
}

function buildResult(
  promptVerb: string,
  fromName: string,
  toName: string,
  value: number,
  answer: number,
): ConversionResult {
  return {
    problemText: `${promptVerb}: ${value} ${fromName} = ? ${toName}`,
    expectedAnswer: answer,
    fromUnit: fromName,
    toUnit: toName,
    value,
  };
}
