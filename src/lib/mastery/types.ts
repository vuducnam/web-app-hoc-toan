// Local TS types for the mastery engine — mirrors Prisma model shapes exactly.
// NOT auto-generated from Prisma; intentionally kept pure so these types can be
// imported in unit tests and pure functions without pulling in the Prisma client.

/** Matches Prisma enum MasteryLevel */
export type MasteryLevel = "NOT_STARTED" | "FAMILIAR" | "PROFICIENT" | "MASTERED";

/** Matches Prisma enum Difficulty — used in Attempt.difficulty + SkillProgress.lastDifficulty */
export type PrismaDifficulty = "EASY" | "MEDIUM" | "HARD";

/** Numeric difficulty alias used by the generator interface (1=EASY, 2=MEDIUM, 3=HARD) */
export type NumericDifficulty = 1 | 2 | 3;

/** Maps numeric difficulty → Prisma enum string */
export function numericToPrismaDifficulty(n: NumericDifficulty): PrismaDifficulty {
  const map: Record<NumericDifficulty, PrismaDifficulty> = {
    1: "EASY",
    2: "MEDIUM",
    3: "HARD",
  };
  return map[n];
}

/** Maps Prisma enum string → numeric difficulty */
export function prismaDifficultyToNumeric(d: PrismaDifficulty): NumericDifficulty {
  const map: Record<PrismaDifficulty, NumericDifficulty> = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
  };
  return map[d];
}

/**
 * Mirrors Prisma SkillProgress model fields used by the mastery engine.
 * All nullable Prisma fields are reflected as `| null` here.
 */
export interface SkillProgressShape {
  userId: string;
  skillKey: string;
  masteryLevel: MasteryLevel;
  totalAttempts: number;
  correctAttempts: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticedAt: Date | null;
  lastDifficulty: PrismaDifficulty | null;
  nextReviewAt: Date | null;
  daysIntervalUntilReview: number;
}

/**
 * Input to evaluateMastery — represents a single practice attempt.
 * Difficulty here is the Prisma enum (what was stored / what is returned from generator mapping).
 */
export interface AttemptInput {
  correct: boolean;
  difficulty: PrismaDifficulty;
  timestamp: Date;
}

/**
 * Return type of evaluateMastery — plain object, no Prisma imports.
 * `leveledUp` drives the UI celebration.
 */
export interface MasteryEvalResult {
  masteryLevel: MasteryLevel;
  totalAttempts: number;
  correctAttempts: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticedAt: Date;
  lastDifficulty: PrismaDifficulty;
  leveledUp: boolean;
}
