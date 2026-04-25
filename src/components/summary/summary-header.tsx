// summary-header.tsx — server component.
// Displays large "X / 10 đúng" score and skill name at the top of the summary page.
import { cn } from "@/lib/ui/cn";

interface SummaryHeaderProps {
  correct: number;
  total: number;
  skillName: string;
}

/** Big score display: "X / 10 đúng" + skill name label */
export function SummaryHeader({ correct, total, skillName }: SummaryHeaderProps) {
  const allCorrect = correct === total;
  const scoreColor = allCorrect ? "text-brand-500" : "text-ink-900";

  return (
    <div className="text-center space-y-2">
      <h1 className="font-display font-bold text-4xl md:text-5xl">
        <span className={cn("tabular-nums", scoreColor)}>{correct}</span>
        <span className="text-ink-400 mx-2">/</span>
        <span className="text-ink-600">{total}</span>
      </h1>
      <p className="font-display font-semibold text-lg text-ink-600">
        câu đúng
      </p>
      <p className="text-sm font-semibold text-brand-700 bg-brand-50 inline-block px-3 py-1 rounded-full">
        {skillName}
      </p>
    </div>
  );
}
