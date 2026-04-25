"use client";
// Multiple-choice answer options — renders q.choices as 4 tappable buttons.
import { Button } from "@/components/ui/button";
import type { AnswerInputProps } from "@/lib/practice/map-answer-format-to-input";

/** Multiple-choice answer grid; immediately calls onAnswer on selection. */
export function MultipleChoiceList({
  onAnswer,
  disabled,
  choices = [],
}: AnswerInputProps) {
  if (choices.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-sm text-ink-600 font-semibold">Chọn đáp án đúng:</p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {choices.map((choice) => (
          <Button
            key={choice}
            variant="secondary"
            aria-label={`Chọn đáp án ${choice}`}
            disabled={disabled}
            onClick={() => onAnswer(choice)}
            className="font-mono text-xl py-4 h-auto"
          >
            {choice}
          </Button>
        ))}
      </div>
    </div>
  );
}
