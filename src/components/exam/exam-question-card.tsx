"use client";
// Render one exam question - MC (4 buttons) or NUMERIC (text input).
import { MathText } from "@/components/ui/math-text";
import type { ExamQuestionDTO } from "@/lib/exam/types";

interface Props {
  question: ExamQuestionDTO;
  value: string;
  onChange: (value: string) => void;
}

export function ExamQuestionCard({ question, value, onChange }: Props) {
  return (
    <article className="rounded-3xl bg-white border-2 border-ink-100 shadow-[0_5px_0_0_rgb(0_0_0/.08)] p-6 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-ink-900">
          Câu {question.slotNo}
        </h2>
        <span className="text-sm text-ink-500">
          {question.difficulty} · {question.pointWeight} điểm
        </span>
      </header>

      <MathText
        source={question.questionText}
        className="font-display text-xl md:text-2xl text-ink-900 leading-snug [&_p]:m-0"
      />

      {question.questionType === "MC" && question.choices ? (
        <ul className="space-y-3" role="radiogroup" aria-label="Đáp án">
          {question.choices.map((c) => {
            const checked = value === c.label;
            return (
              <li key={c.label}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => onChange(c.label)}
                  className={[
                    "w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-start gap-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500 min-h-[56px]",
                    checked
                      ? "border-brand-500 bg-brand-50 shadow-[0_3px_0_0_rgb(0_0_0/.06)]"
                      : "border-ink-200 hover:border-brand-300",
                  ].join(" ")}
                >
                  <span className="font-display font-bold text-brand-700 w-7 shrink-0">
                    {c.label}.
                  </span>
                  <span className="font-display text-ink-900 text-lg">
                    <MathText source={c.value} inline className="[&_p]:m-0 inline" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div>
          <label htmlFor={`ans-${question.slotNo}`} className="block text-sm text-ink-700 mb-2">
            Nhập đáp án (vd: 12,5 hoặc 12.5)
          </label>
          <input
            id={`ans-${question.slotNo}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-brand-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500 font-display text-xl"
          />
        </div>
      )}
    </article>
  );
}
