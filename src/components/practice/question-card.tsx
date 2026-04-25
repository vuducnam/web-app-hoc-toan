"use client";
// Renders the current question: problem text / LaTeX + the correct input adapter.
// Input adapter is chosen by answerFormat; keyed by seed so React remounts on new question.
import { MathDisplay } from "@/components/ui/math-display";
import { MathText } from "@/components/ui/math-text";
import { FigureRenderer } from "@/components/geometry-figures/figure-renderer";
import { NumericInput } from "./numeric-input";
import { DecimalInput } from "./decimal-input";
import { FractionInputAdapter } from "./fraction-input-adapter";
import { MultipleChoiceList } from "./multiple-choice-list";
import { TextInput } from "./text-input";
import type { SafeQuestion } from "@/lib/mastery/strip-answer";
import type { Difficulty } from "@/lib/generators/types";

interface QuestionCardProps {
  question: SafeQuestion & { seed: string; difficulty: Difficulty };
  onAnswer: (value: string) => void;
  /** Live value while user types — wired to "Kiểm tra" button submit path. */
  onChange?: (value: string) => void;
  disabled: boolean;
}

/**
 * Renders problem statement + the right input adapter for the answer format.
 * The adapter receives key={question.seed} so it remounts (and auto-focuses)
 * on every new question.
 */
export function QuestionCard({ question, onAnswer, onChange, disabled }: QuestionCardProps) {
  const { problemText, problemLatex, answerFormat, choices, seed, figure } = question;

  const adapterProps = {
    onAnswer,
    onChange,
    disabled,
    autoFocus: true,
    choices: choices ?? [],
  };

  return (
    <div className="space-y-6">
      {/* Geometry figure (if any) — renders above problem text on every viewport. */}
      {figure && (
        <div className="flex justify-center">
          <FigureRenderer spec={figure} />
        </div>
      )}

      {/* Problem statement */}
      <div className="text-center">
        {problemLatex ? (
          <MathDisplay
            formula={problemLatex}
            display
            ariaLabel={problemText}
            className="text-ink-900"
          />
        ) : (
          // MathText renders Markdown + KaTeX so `$\dfrac{...}$` etc. inside problemText
          // are formatted instead of appearing as literal LaTeX.
          // [&_p]:m-0 strips the auto <p> margin so the heading stays tight.
          <MathText
            source={problemText}
            className="font-display text-2xl md:text-3xl font-bold text-ink-900 leading-snug [&_p]:m-0"
          />
        )}
      </div>

      {/* Answer input — keyed by seed so React remounts the adapter */}
      <div className="flex justify-center">
        {answerFormat === "numeric" && (
          <NumericInput key={seed} {...adapterProps} />
        )}
        {answerFormat === "decimal" && (
          <DecimalInput key={seed} {...adapterProps} />
        )}
        {answerFormat === "fraction" && (
          <FractionInputAdapter key={seed} {...adapterProps} />
        )}
        {answerFormat === "multiple-choice" && (
          <MultipleChoiceList key={seed} {...adapterProps} />
        )}
        {answerFormat === "text" && (
          <TextInput key={seed} {...adapterProps} />
        )}
      </div>
    </div>
  );
}
