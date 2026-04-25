"use client";
// Bottom action bar: Skip / Help / Check buttons.
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onSkip: () => void;
  onHelp: () => void;
  onSubmit: () => void;
  /** True while a server action is in-flight; disables all buttons. */
  disabled: boolean;
  /** True when no answer has been entered yet; disables the submit button only. */
  answerEmpty: boolean;
}

/** Three-button action row anchored at the bottom of the question card. */
export function ActionBar({ onSkip, onHelp, onSubmit, disabled, answerEmpty }: ActionBarProps) {
  return (
    <div className="mt-8 flex flex-wrap gap-3 justify-between items-center">
      <div className="flex gap-2">
        <Button
          variant="ghost"
          aria-label="Trợ giúp"
          disabled={disabled}
          onClick={onHelp}
          size="sm"
        >
          💡 Trợ giúp
        </Button>
        <Button
          variant="ghost"
          aria-label="Bỏ qua câu hỏi này"
          disabled={disabled}
          onClick={onSkip}
          size="sm"
        >
          Bỏ qua
        </Button>
      </div>

      <Button
        variant="primary"
        aria-label="Kiểm tra đáp án"
        disabled={disabled || answerEmpty}
        onClick={onSubmit}
      >
        Kiểm tra ✓
      </Button>
    </div>
  );
}
