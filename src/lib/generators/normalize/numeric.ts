// Numeric answer normalization — parses user-supplied integer strings.
// Handles leading/trailing whitespace and optional + prefix.

/**
 * Parse a user-submitted numeric string into a JS number, or null if unparseable.
 * Accepts: "42", " -7 ", "+100", "0"
 * Rejects: "", "abc", "1.5" (use parseVnDecimal for decimals)
 */
export function parseNumeric(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  // Allow optional leading sign, then digits only
  if (!/^[+-]?\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}
