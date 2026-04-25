"use client";
// Dot indicator: filled = answered, ring = current, empty = unanswered.
interface Props {
  total: number;
  current: number; // 0-indexed
  answered: Set<number>; // set of slotNo values that have an answer
  slotNumbers: number[];
  onJump: (index: number) => void;
}

export function ExamProgressBar({ total, current, answered, slotNumbers, onJump }: Props) {
  return (
    <ol className="flex items-center justify-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => {
        const slotNo = slotNumbers[i];
        const isAnswered = answered.has(slotNo);
        const isCurrent = i === current;
        const cls = [
          "w-9 h-9 rounded-full text-sm font-display font-bold flex items-center justify-center transition",
          isCurrent ? "ring-3 ring-brand-500 ring-offset-2" : "",
          isAnswered ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-700",
        ].join(" ");
        return (
          <li key={slotNo}>
            <button
              type="button"
              onClick={() => onJump(i)}
              className={cls}
              aria-label={`Câu ${slotNo}${isAnswered ? " - đã làm" : ""}${isCurrent ? " - hiện tại" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {slotNo}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
