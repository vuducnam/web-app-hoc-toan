// Decimal answer normalization — handles Vietnamese comma notation (e.g. "3,5" → 3.5).
// All expectedAnswer values for decimals are stored as JS numbers (using ".").
// problemText uses "," per Vietnamese convention; answers may use either separator.

/**
 * Parse a Vietnamese decimal string (comma or period separator) into a JS number.
 * Returns null if the string cannot be parsed as a finite number.
 * Accepts: "3,5", "3.5", " 12,00 ", "-0,5"
 */
export function parseVnDecimal(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (normalized === "") return null;
  // Allow optional sign, digits, optional decimal point+digits
  if (!/^[+-]?\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Compare two decimal values within a tolerance.
 * Default tolerance is ±0.01 (suitable for grade 4-5 decimal arithmetic).
 */
export function equalsWithTolerance(
  a: number,
  b: number,
  tol: number = 0.01,
): boolean {
  return Math.abs(a - b) <= tol;
}

/**
 * Format a JS number as a Vietnamese decimal string (period → comma).
 * Used when building problemText for decimal generators.
 */
export function toVnDecimal(n: number): string {
  return String(n).replace(".", ",");
}

/**
 * Format a number to a fixed number of decimal places as a Vietnamese decimal string.
 * e.g. toVnFixed(3.5, 1) → "3,5"
 */
export function toVnFixed(n: number, places: number): string {
  return n.toFixed(places).replace(".", ",");
}
