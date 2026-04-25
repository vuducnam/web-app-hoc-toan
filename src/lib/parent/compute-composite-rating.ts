// Pure function: computes composite 0-100 rating from 4 factors.
// accuracy: 40pts, daysActive: 20pts, consistency: 20pts, mastery: 20pts

export interface CompositeRatingInput {
  /** correctAttempts / max(1, totalAttempts) — already a ratio 0..1 */
  accuracyRatio: number;
  /** unique active days in last 7 (0..7) */
  uniqueActiveDays: number;
  /** stddev of daily practice minutes over 7 days (>=0) */
  stddevMinutes: number;
  /** sum of masteryLevel integers across all skills */
  sumMasteryLevel: number;
  /** total number of skill progress records */
  skillCount: number;
}

/**
 * Returns integer 0-100.
 * Formula:
 *   accuracy     = 40 * accuracyRatio
 *   daysActive   = 20 * clamp(uniqueActiveDays / 7, 0, 1)
 *   consistency  = 20 * (1 / (1 + stddevMinutes))  -- inverse-normalized, never NaN
 *   mastery      = 20 * clamp(sumMasteryLevel / (skillCount * 3), 0, 1)
 */
export function computeCompositeRating(input: CompositeRatingInput): number {
  const { accuracyRatio, uniqueActiveDays, stddevMinutes, sumMasteryLevel, skillCount } = input;

  const accuracy = 40 * clamp(accuracyRatio, 0, 1);
  const daysActive = 20 * clamp(uniqueActiveDays / 7, 0, 1);
  // consistency: high stddev → low score; stddev=0 → 1.0 (perfect consistency)
  const consistency = 20 * (1 / (1 + Math.max(0, stddevMinutes)));
  const masteryDenom = Math.max(1, skillCount) * 3;
  const mastery = 20 * clamp(sumMasteryLevel / masteryDenom, 0, 1);

  return Math.round(accuracy + daysActive + consistency + mastery);
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/** Maps MasteryLevel enum string → integer 0..3 */
export function masteryLevelToInt(level: string): number {
  switch (level) {
    case "NOT_STARTED": return 0;
    case "FAMILIAR":    return 1;
    case "PROFICIENT":  return 2;
    case "MASTERED":    return 3;
    default:            return 0;
  }
}

/** Computes population stddev of an array of numbers. Returns 0 for empty/single-element arrays. */
export function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
