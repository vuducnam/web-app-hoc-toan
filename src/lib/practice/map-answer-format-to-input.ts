"use client";
// Maps answerFormat from SafeQuestion to the appropriate input React element.
// Used inside QuestionCard (client component) to keep the switch logic DRY.
import type { AnswerFormat } from "@/lib/generators/types";

export interface InputAdapterProps {
  /** Called when the user commits an answer (string form). */
  onAnswer: (value: string) => void;
  disabled: boolean;
  /** Changing this key causes React to remount the input, triggering auto-focus. */
  questionSeed: string;
}

/**
 * Returns the import path token for the right input adapter component.
 * The CALLER imports the actual component; this helper just selects the format.
 *
 * We cannot return JSX here (this module is imported in both server and client
 * contexts for type checking). Instead, caller uses a switch on answerFormat.
 */
export function getInputVariant(answerFormat: AnswerFormat): AnswerFormat {
  return answerFormat;
}

/** Props signature that every input adapter must satisfy. */
export interface AnswerInputProps {
  onAnswer: (value: string) => void;
  disabled: boolean;
  autoFocus?: boolean;
  choices?: string[];
}

// Re-export AnswerFormat so callers have a single import point.
export type { AnswerFormat };
