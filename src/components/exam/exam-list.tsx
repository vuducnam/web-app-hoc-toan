// Card grid for student's exam papers with assigned + last-attempt indicators.
import Link from "next/link";

const EXAM_TYPE_LABEL: Record<string, string> = {
  MID_SEM_1: "Giữa kỳ 1",
  END_SEM_1: "Cuối kỳ 1",
  MID_SEM_2: "Giữa kỳ 2",
  END_OF_YEAR: "Cuối năm",
};

interface ExamListItem {
  id: string;
  key: string;
  nameVi: string;
  examType: string;
  durationMinutes: number;
  totalQuestions: number;
  isAssigned: boolean;
  lastAttempt: { id: string; totalScore: string; submittedAt: Date | null } | null;
}

export function ExamList({ items }: { items: ExamListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-ink-700">
        Chưa có đề thi nào cho lớp của em.
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl bg-white border-2 border-ink-100 shadow-[0_4px_0_0_rgb(0_0_0/.06)] p-5 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-xl text-ink-900">
                {item.nameVi}
              </h2>
              <p className="text-ink-600 text-sm">
                {EXAM_TYPE_LABEL[item.examType] ?? item.examType} · {item.totalQuestions} câu · {item.durationMinutes} phút
              </p>
            </div>
            {item.isAssigned && (
              <span className="px-2 py-1 rounded-md bg-brand-100 text-brand-700 text-xs font-bold">
                Mới giao
              </span>
            )}
          </div>
          {item.lastAttempt && (
            <div className="text-sm text-ink-700">
              Lần gần nhất: <strong>{item.lastAttempt.totalScore}/10</strong>
              {item.lastAttempt.submittedAt ? (
                <span> · {new Date(item.lastAttempt.submittedAt).toLocaleDateString("vi-VN")}</span>
              ) : null}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-auto">
            {item.lastAttempt && (
              <Link
                href={`/student/exam/attempt/${item.lastAttempt.id}/result`}
                className="px-3 py-2 rounded-lg text-brand-700 font-display font-semibold hover:bg-brand-50"
              >
                Xem kết quả
              </Link>
            )}
            <Link
              href={`/student/exam/${item.key}/intro`}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white font-display font-semibold shadow-chunky-brand hover:bg-brand-700 transition active:translate-y-[2px] active:shadow-none"
            >
              {item.lastAttempt ? "Thi lại" : "Bắt đầu"}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
