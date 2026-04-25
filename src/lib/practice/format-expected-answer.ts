// Server-side helper to render expectedAnswer in a display-friendly string,
// matching the answerFormat declared on the question. Used when including the
// correct answer in SubmitAnswerResult so the UI can show it after submission.

import type { AnswerFormat, Fraction } from "@/lib/generators/types";

/**
 * Format an expectedAnswer per its answerFormat for student-facing display.
 * Vietnamese decimal comma is used for DECIMAL.
 */
export function formatExpectedAnswer(
  expectedAnswer: unknown,
  answerFormat: AnswerFormat,
): string {
  switch (answerFormat) {
    case "numeric": {
      // Number — possibly with " dư N" for divide-with-remainder; pass-through if string already.
      if (typeof expectedAnswer === "number") return String(expectedAnswer);
      return String(expectedAnswer ?? "");
    }
    case "decimal": {
      if (typeof expectedAnswer === "number") {
        // Vietnamese comma decimal separator
        return String(expectedAnswer).replace(".", ",");
      }
      return String(expectedAnswer ?? "");
    }
    case "fraction": {
      const f = expectedAnswer as Fraction | null | undefined;
      if (f && typeof f.num === "number" && typeof f.den === "number") {
        return `${f.num}/${f.den}`;
      }
      return String(expectedAnswer ?? "");
    }
    case "multiple-choice":
    case "text":
    default:
      return String(expectedAnswer ?? "");
  }
}
