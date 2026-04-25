// Lenient answer comparison - handles MC label resolution + numeric tolerance.
import "server-only";
import type { QuestionType } from "./types";
import type { MCChoice } from "./distractors/types";
import { parseVnDecimal } from "@/lib/generators/normalize/decimal";

const NUMERIC_TOLERANCE = 0.01;

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Compare student answer to expected, returning correctness boolean.
 * MC: studentAnswer may be the label ("A") or the value text - we accept both.
 * NUMERIC: lenient parsing (comma/period decimal, ±tolerance).
 */
export function compareAnswer(
  studentAnswer: string | null | undefined,
  expectedAnswer: string,
  questionType: QuestionType,
  choices?: MCChoice[] | null,
): boolean {
  if (studentAnswer == null || studentAnswer.trim() === "") return false;

  if (questionType === "MC") {
    const sa = studentAnswer.trim();
    // Resolve label A/B/C/D to value if choices provided
    if (choices && /^[a-dA-D]$/.test(sa)) {
      const ch = choices.find((c) => c.label === sa.toUpperCase());
      if (ch) return normalize(ch.value) === normalize(expectedAnswer);
    }
    // Accept value text directly
    return normalize(sa) === normalize(expectedAnswer);
  }

  // NUMERIC - lenient compare
  const sNum = parseVnDecimal(studentAnswer);
  const eNum = parseVnDecimal(expectedAnswer);
  if (sNum !== null && eNum !== null) {
    return Math.abs(sNum - eNum) <= NUMERIC_TOLERANCE;
  }
  // Fallback string compare (e.g., "12 dư 3")
  return normalize(studentAnswer) === normalize(expectedAnswer);
}
