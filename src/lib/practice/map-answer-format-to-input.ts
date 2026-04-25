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
  /** Fired when user commits an answer (Enter key, MC click, Submit button). */
  onAnswer: (value: string) => void;
  /**
   * Fired continuously as the user types/selects. Parent uses this to track the
   * current value so the bottom "Kiểm tra" button can submit it. Empty string when input cleared.
   */
  onChange?: (value: string) => void;
  disabled: boolean;
  autoFocus?: boolean;
  choices?: string[];
}

// Re-export AnswerFormat so callers have a single import point.
export type { AnswerFormat };
