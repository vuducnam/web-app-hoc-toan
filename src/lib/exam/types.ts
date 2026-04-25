// Exam engine types - shared between server actions, engine, and UI DTOs.
import "server-only";
import type { MCChoice } from "./distractors/types";

export type DifficultyLevel = "M1" | "M2" | "M3" | "M4";
export type QuestionType = "MC" | "NUMERIC";

/** Single slot definition in ExamPaper.structure JSON. */
export interface ExamSlot {
  slotNo: number;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  /** Decimal-compatible number e.g. 1, 1.5, 2 */
  pointWeight: number;
  /** Candidate skillKeys (must be live generators). Engine picks one per attempt seed. */
  skillPool: string[];
}

/** A single generated question, server-side (includes expectedAnswer). */
export interface GeneratedQuestion {
  slotNo: number;
  skillKey: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  questionText: string;
  expectedAnswer: string;
  /** MC only - 4 choices labeled A/B/C/D. */
  choices: MCChoice[] | null;
  correctIndex: number | null;
  pointWeight: number;
}

/** Sanitized question payload sent to client (no expectedAnswer/correctIndex). */
export interface ExamQuestionDTO {
  slotNo: number;
  skillKey: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  questionText: string;
  choices: MCChoice[] | null;
  pointWeight: number;
  /** Pre-saved student answer (resume support). */
  studentAnswer?: string | null;
}

export interface ExamAnswerInput {
  slotNo: number;
  skillKey?: string;
  difficulty?: DifficultyLevel;
  questionType: QuestionType;
  questionText?: string;
  expectedAnswer: string;
  studentAnswer: string | null;
  pointWeight: number;
  choices?: unknown;
}

export interface ScoredAnswer extends ExamAnswerInput {
  isCorrect: boolean;
  pointEarned: number;
}

export interface ScoreResult {
  totalScore: number;
  correctCount: number;
  totalCount: number;
  answers: ScoredAnswer[];
}

export interface WeakTopic {
  topicId: string;
  topicName?: string;
  skillKeys: string[];
  accuracy: number;
  totalCount: number;
}

export interface ExamSummary {
  byDifficulty: Record<DifficultyLevel, { correct: number; total: number }>;
  weakTopics: WeakTopic[];
}
