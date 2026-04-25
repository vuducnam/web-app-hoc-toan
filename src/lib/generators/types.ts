// Canonical generator types — shared by all generator files and consumers.
// SERVER-ONLY: generators import this; do not import in client components.

export type Difficulty = 1 | 2 | 3;

/**
 * A geometric dimension. `number` for concrete generated values, `string` for
 * symbolic labels (e.g. "a", "h", "?") used by knowledge-note theory figures
 * and "unknown side" word problems.
 */
export type Dim = number | string;

/**
 * Discriminated union describing every static SVG figure the system can render.
 * Generators emit a `figure` (matches the problem statement) and optionally a
 * `solutionFigure` (often `shaded` to highlight the area being computed).
 *
 * 2D kinds (Phase 02): triangle, trapezoid, rectangle (kiêm vuông), circle.
 * 3D kinds (Phase 03): cylinder3d, cylinderNet, rectPrism3d (kiêm cube), rectPrismNet.
 */
export type FigureSpec =
  | { kind: "triangle"; base: Dim; height: Dim; unit?: string; shaded?: boolean }
  | { kind: "trapezoid"; a: Dim; b: Dim; h: Dim; unit?: string; shaded?: boolean }
  | {
      kind: "rectangle";
      width: Dim;
      height: Dim;
      unit?: string;
      /** Force aria-label to say "hình vuông" even when width ≠ height (rare; usually let auto-detect handle it). */
      isSquare?: boolean;
      shaded?: boolean;
      /** Optional perimeter label rendered above the figure (e.g. "Chu vi = 42 m") — for problems that give the perimeter as input. */
      perimeter?: Dim;
    }
  | {
      kind: "circle";
      radius: Dim;
      /** What to draw + label on the diameter line. Defaults to "radius". */
      show?: "radius" | "diameter";
      unit?: string;
      shaded?: boolean;
    }
  | { kind: "cylinder3d"; radius: Dim; height: Dim; unit?: string; shaded?: boolean }
  | { kind: "cylinderNet"; radius: Dim; height: Dim; unit?: string }
  | {
      kind: "rectPrism3d";
      a: Dim;
      b: Dim;
      c: Dim;
      unit?: string;
      shaded?: boolean;
    }
  | { kind: "rectPrismNet"; a: Dim; b: Dim; c: Dim; unit?: string };

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
  /**
   * Optional static figure that accompanies the problem text (rendered above it
   * in the QuestionCard). Safe to send to client.
   */
  figure?: FigureSpec;
  /**
   * Optional figure that accompanies the explanation in the FeedbackPanel —
   * usually a shaded variant of `figure`, or a different kind (e.g. cylinder net
   * to visualise surface area). SERVER ONLY — strip-answer drops this before
   * sending Question to client; it re-emerges in SubmitAnswerResult.
   */
  solutionFigure?: FigureSpec;
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
