// Per-question review with student vs. correct answer.
import { MathText } from "@/components/ui/math-text";
import type { MCChoice } from "@/lib/exam/distractors/types";

interface ReviewItem {
  slotNo: number;
  difficulty: string;
  questionType: string;
  questionText: string;
  expectedAnswer: string;
  studentAnswer: string | null;
  isCorrect: boolean;
  pointEarned: number;
  pointWeight: number;
  choices?: MCChoice[] | null;
}

function resolveStudentDisplay(item: ReviewItem): string {
  if (item.studentAnswer == null || item.studentAnswer === "") return "(không trả lời)";
  if (item.questionType === "MC" && item.choices) {
    const c = item.choices.find((x) => x.label === item.studentAnswer);
    return c ? `${c.label}. ${c.value}` : item.studentAnswer;
  }
  return item.studentAnswer;
}

function resolveCorrectDisplay(item: ReviewItem): string {
  if (item.questionType === "MC" && item.choices) {
    const c = item.choices.find((x) => x.value === item.expectedAnswer);
    return c ? `${c.label}. ${c.value}` : item.expectedAnswer;
  }
  return item.expectedAnswer;
}

export function ExamResultReview({ answers }: { answers: ReviewItem[] }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display font-bold text-xl text-ink-900">Xem lại từng câu</h2>
      <ol className="space-y-3">
        {answers.map((a) => (
          <li
            key={a.slotNo}
            className={[
              "rounded-2xl border-2 p-4 bg-white",
              a.isCorrect ? "border-emerald-200" : "border-red-200",
            ].join(" ")}
          >
            <header className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-ink-900">
                Câu {a.slotNo}{" "}
                <span className="text-ink-500 text-sm font-normal">
                  ({a.difficulty} · {a.pointWeight}đ)
                </span>
              </h3>
              <span
                className={[
                  "px-2 py-1 rounded-md text-xs font-bold",
                  a.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700",
                ].join(" ")}
              >
                {a.isCorrect ? `+${a.pointEarned}đ` : "Sai"}
              </span>
            </header>

            <MathText
              source={a.questionText}
              className="text-ink-800 mb-3 [&_p]:m-0"
            />

            <dl className="text-sm space-y-1">
              <div className="flex gap-2">
                <dt className="font-semibold text-ink-700 w-32 shrink-0">Em đã chọn:</dt>
                <dd className={a.isCorrect ? "text-emerald-700" : "text-red-700"}>
                  {resolveStudentDisplay(a)}
                </dd>
              </div>
              {!a.isCorrect && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink-700 w-32 shrink-0">Đáp án đúng:</dt>
                  <dd className="text-emerald-700">{resolveCorrectDisplay(a)}</dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
