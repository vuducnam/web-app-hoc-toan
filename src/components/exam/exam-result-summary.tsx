// Big score display + M1-M4 horizontal bars.
import type { ExamSummary } from "@/lib/exam/types";

interface Props {
  examName: string;
  score: number;
  totalPoints: number;
  correctCount: number;
  totalCount: number;
  timeSpentSec: number;
  expired: boolean;
  byDifficulty: ExamSummary["byDifficulty"];
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}p ${s}s`;
}

const M_LABEL: Record<string, string> = {
  M1: "M1 (Nhận biết)",
  M2: "M2 (Thông hiểu)",
  M3: "M3 (Vận dụng)",
  M4: "M4 (Sáng tạo)",
};

export function ExamResultSummary({
  examName, score, totalPoints, correctCount, totalCount, timeSpentSec, expired, byDifficulty,
}: Props) {
  const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  let scoreColor = "text-emerald-700";
  if (pct < 50) scoreColor = "text-red-700";
  else if (pct < 70) scoreColor = "text-amber-700";

  return (
    <section className="rounded-3xl bg-white border-2 border-ink-100 shadow-[0_5px_0_0_rgb(0_0_0/.08)] p-6 space-y-5">
      <header>
        <h1 className="font-display font-bold text-2xl text-ink-900">{examName}</h1>
        {expired && (
          <span className="inline-block mt-2 px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm font-bold">
            Hết giờ
          </span>
        )}
      </header>

      <div className="text-center py-4">
        <div className={`font-display font-extrabold text-6xl ${scoreColor}`}>
          {score.toFixed(score % 1 === 0 ? 0 : 1)}
          <span className="text-3xl text-ink-500"> / {totalPoints}</span>
        </div>
        <p className="text-ink-700 mt-2">
          Đúng {correctCount}/{totalCount} câu · Thời gian {fmtTime(timeSpentSec)}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-display font-bold text-lg text-ink-900">Theo mức độ</h2>
        {(["M1", "M2", "M3", "M4"] as const).map((m) => {
          const data = byDifficulty[m];
          const ratio = data.total > 0 ? (data.correct / data.total) * 100 : 0;
          return (
            <div key={m} className="flex items-center gap-3">
              <span className="w-32 text-sm text-ink-700">{M_LABEL[m]}</span>
              <div className="flex-1 h-5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${ratio}%` }}
                  aria-label={`${m}: ${ratio.toFixed(0)}%`}
                />
              </div>
              <span className="w-16 text-right text-sm text-ink-700 tabular-nums">
                {data.correct}/{data.total}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
