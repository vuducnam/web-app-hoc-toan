// Parent view: list of child's exam attempts + active assignments.
import Link from "next/link";
import { ExamStatusBadge } from "./exam-status-badge";

interface Attempt {
  id: string;
  examPaperKey: string;
  examPaperName: string;
  status: string;
  totalScore: number;
  totalPoints: number;
  correctCount: number;
  totalCount: number;
  startedAt: string;
  submittedAt: string | null;
}

interface Assignment {
  id: string;
  examPaperName: string;
  status: string;
  assignedAt: string;
  dueAt: string | null;
}

interface Props {
  childId: string;
  attempts: Attempt[];
  assignments: Assignment[];
}

export function ChildExamList({ childId, attempts, assignments }: Props) {
  return (
    <div className="space-y-6">
      {assignments.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-lg text-ink-900 mb-3">
            Đề đã giao - chưa hoàn thành
          </h2>
          <ul className="space-y-2">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="rounded-xl bg-white border border-ink-200 px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-display font-semibold text-ink-900">
                    {a.examPaperName}
                  </h3>
                  <p className="text-sm text-ink-600">
                    Giao: {new Date(a.assignedAt).toLocaleDateString("vi-VN")}
                    {a.dueAt && ` · Hạn: ${new Date(a.dueAt).toLocaleDateString("vi-VN")}`}
                  </p>
                </div>
                <ExamStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display font-bold text-lg text-ink-900 mb-3">
          Lịch sử thi
        </h2>
        {attempts.length === 0 ? (
          <p className="text-ink-700">Chưa có lần thi nào.</p>
        ) : (
          <ul className="space-y-2">
            {attempts.map((a) => (
              <li
                key={a.id}
                className="rounded-xl bg-white border border-ink-200 px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-ink-900 truncate">
                    {a.examPaperName}
                  </h3>
                  <p className="text-sm text-ink-600">
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleString("vi-VN")
                      : `Bắt đầu ${new Date(a.startedAt).toLocaleString("vi-VN")}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ExamStatusBadge status={a.status} />
                  {a.status !== "IN_PROGRESS" && (
                    <span className="font-display font-bold text-ink-900 tabular-nums">
                      {a.totalScore.toFixed(a.totalScore % 1 === 0 ? 0 : 1)}/{a.totalPoints}
                    </span>
                  )}
                  <Link
                    href={`/parent/child/${childId}/exam/${a.id}`}
                    className="text-brand-700 hover:underline font-display font-semibold text-sm"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
