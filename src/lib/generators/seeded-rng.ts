// Deterministic seeded RNG wrapper around the `seedrandom` library.
// Same seed always produces identical sequence — critical for server-side answer verification.
// No Math.random() usage anywhere in generators; always use makeRng().
import seedrandom from "seedrandom";

export interface SeededRng {
  /** Inclusive integer in [min, max]. */
  int(min: number, max: number): number;
  /** Pick one element uniformly from a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** Bernoulli(0.5) boolean. */
  bool(): boolean;
  /** Uniform float in [0, 1). */
  float(): number;
}

/**
 * Create a deterministic RNG from a string seed.
 * Every call to a method advances the internal state — keep one rng instance per generate() call.
 */
export function makeRng(seed: string): SeededRng {
  const s = seedrandom(seed);

  return {
    float(): number {
      return s();
    },

    int(min: number, max: number): number {
      // s() ∈ [0,1) → scale to [min, max] inclusive
      return Math.floor(s() * (max - min + 1)) + min;
    },

    pick<T>(arr: readonly T[]): T {
      if (arr.length === 0) throw new RangeError("pick() called on empty array");
      return arr[Math.floor(s() * arr.length)];
    },

    bool(): boolean {
      return s() < 0.5;
    },
  };
}
