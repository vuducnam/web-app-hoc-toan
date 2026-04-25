// Fraction normalization utilities — GCD, simplification, and equivalence checks.
// Used by fraction generators and validate() methods.
import type { Fraction } from "../types";

/** Euclidean GCD — always returns a positive value. */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Reduce a fraction to lowest terms.
 * Sign is normalised to the numerator (denominator always positive).
 * Throws if denominator is 0.
 */
export function simplify(f: Fraction): Fraction {
  if (f.den === 0) throw new RangeError("Fraction denominator cannot be zero");
  const d = gcd(Math.abs(f.num), Math.abs(f.den));
  const sign = f.den < 0 ? -1 : 1;
  return { num: (sign * f.num) / d, den: (sign * f.den) / d };
}

/**
 * Cross-multiply equivalence: a/b == c/d iff a*d == b*c.
 * Both fractions are reduced first to handle different-but-equivalent forms.
 */
export function equivalent(a: Fraction, b: Fraction): boolean {
  const sa = simplify(a);
  const sb = simplify(b);
  return sa.num === sb.num && sa.den === sb.den;
}

/**
 * Parse a user-supplied fraction string like "3/4" or " 1 / 2 ".
 * Returns null if the string is not a valid fraction.
 */
export function parseFraction(input: string): Fraction | null {
  const parts = input.trim().split("/");
  if (parts.length !== 2) return null;
  const num = parseInt(parts[0].trim(), 10);
  const den = parseInt(parts[1].trim(), 10);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return { num, den };
}
