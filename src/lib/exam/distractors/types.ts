// Distractor types - hand-crafted "plausible wrong answers" for MC exam questions.
// Each family file exports a DistractorFn that mimics common student errors.
import "server-only";
import type { SeededRng } from "@/lib/generators/seeded-rng";

export type DistractorFamily =
  | "decimals"
  | "fractions"
  | "percent"
  | "arithmetic"
  | "geometry"
  | "unit-conversion"
  | "word-problems"
  | "fallback";

/**
 * Generate 3 unique distractor strings for a correct answer.
 * Output must NOT include the correct answer itself; uniqueness handled by caller.
 */
export type DistractorFn = (correct: string, rng: SeededRng) => string[];

export interface MCChoice {
  label: "A" | "B" | "C" | "D";
  value: string;
}

export interface BuildChoicesResult {
  choices: MCChoice[];
  correctIndex: number;
}
