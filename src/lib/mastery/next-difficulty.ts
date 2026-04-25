// Pure difficulty selector — NO Prisma imports, NO Next.js imports.
// Maps mastery level to the numeric difficulty passed to the generator.
// MASTERED still receives HARD (difficulty=3) for retention practice.
import type { MasteryLevel, NumericDifficulty } from "./types";

/**
 * Determine the appropriate generator difficulty for a given mastery level.
 *
 * NOT_STARTED → 1 (EASY)   — low barrier, build confidence
 * FAMILIAR    → 2 (MEDIUM) — consolidate understanding
 * PROFICIENT  → 3 (HARD)   — push toward mastery threshold (streak≥8 on hard)
 * MASTERED    → 3 (HARD)   — retention; MASTERED still needs hard for spaced review
 */
export function nextDifficulty(level: MasteryLevel): NumericDifficulty {
  switch (level) {
    case "NOT_STARTED": return 1;
    case "FAMILIAR":    return 2;
    case "PROFICIENT":  return 3;
    case "MASTERED":    return 3;
  }
}
