// Canonical generator types — shared by all generator files and consumers.
// SERVER-ONLY: generators import this; do not import in client components.

export type Difficulty = 1 | 2 | 3;

export type AnswerFormat =
  | "numeric"
  | "fraction"
  | "decimal"
  | "text"
  | "multiple-choice";

/** Rational fraction in lowest terms (or as generated). */
export interface Fraction {
  num: number;
  den: number;
}

export interface GeneratorParams {
  seed: string;
  difficulty: Difficulty;
  skillKey: string;
}

/**
 * A generated math problem.
 * Phase 05 strips `expectedAnswer` before sending to client.
 */
export interface Question<T = number | Fraction | string> {
  /** Stable ID for this (seed, skillKey) pair. */
  id: string;
  skillKey: string;
  /** Vietnamese problem text; may include KaTeX \frac{}{} notation. */
  problemText: string;
  /** Optional full LaTeX form of the problem. */
  problemLatex?: string;
  answerFormat: AnswerFormat;
  /** Only populated for multiple-choice questions. */
  choices?: string[];
  /** SERVER ONLY — Phase 05 strips before sending to client. */
  expectedAnswer: T;
  /**
   * Optional Markdown + KaTeX explanation of how to solve the problem.
   * SERVER ONLY — strip-answer must drop this before sending Question to client.
   * Re-emerges in SubmitAnswerResult after the user submits, so they can learn from mistakes.
   * Generators may produce this; if absent, UI falls back to "Đáp án đúng: X" only.
   */
  explanation?: string;
  metadata: {
    difficulty: Difficulty;
    seed: string;
    skillKey: string;
    timeEstimateSec: number;
  };
}

export interface Generator<T = unknown> {
  generate(p: GeneratorParams): Question<T>;
  validate(userAnswer: string, q: Question<T>): boolean;
}
