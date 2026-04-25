// Shared types for the practice server actions.
// Kept in a separate file so practice.ts, practice-submit-core.ts and tests
// can all import without circular deps.
import type { Difficulty as GenDifficulty } from "@/lib/generators/types";
import type { MasteryLevel } from "@/lib/mastery/types";

export type EncouragementKey =
  | "correct"
  | "correct-fast"
  | "correct-streak"
  | "correct-levelup"
  | "wrong"
  | "wrong-close";

export interface SubmitAnswerInput {
  skillKey: string;
  seed: string;
  difficulty: GenDifficulty; // 1 | 2 | 3
  userAnswer: string;
  elapsedMs: number;
}

export interface SubmitAnswerResult {
  correct: boolean;
  leveledUp: boolean;
  newMasteryLevel: MasteryLevel;
  encouragementKey: EncouragementKey;
  /** Correct answer, formatted for display (e.g. "42", "3/4", "3,14", "nhọn"). */
  correctAnswer: string;
  /** Optional Markdown + KaTeX explanation. Empty string when generator does not provide one. */
  explanation: string;
  // Phase 11 — gamification fields
  xpEarned: number;
  newBadges: string[];
  dailyGoalCompleted: boolean;
}

export interface QuestionError {
  error: "not-found" | "stub" | "replay" | "unknown";
  message?: string;
}
