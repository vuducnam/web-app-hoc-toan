"use client";
// Form for parent to assign an exam paper to a child.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignExam } from "@/app/actions/exam-assign";

const EXAM_TYPE_LABEL: Record<string, string> = {
  MID_SEM_1: "Giữa kỳ 1",
  END_SEM_1: "Cuối kỳ 1",
  MID_SEM_2: "Giữa kỳ 2",
  END_OF_YEAR: "Cuối năm",
};

interface Paper {
  id: string;
  nameVi: string;
  examType: string;
  totalQuestions: number;
  durationMinutes: number;
  alreadyAssigned: boolean;
}

export function ExamAssignForm({ childId, papers }: { childId: string; papers: Paper[] }) {
  const router = useRouter();
  const [examPaperId, setExamPaperId] = useState<string>(papers.find((p) => !p.alreadyAssigned)?.id ?? "");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const dueIso = dueAt ? new Date(dueAt).toISOString() : null;
        await assignExam({ studentId: childId, examPaperId, dueAt: dueIso });
        router.push(`/parent/child/${childId}/exam`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-display font-semibold text-ink-900 mb-2">Chọn đề</label>
        <select
          value={examPaperId}
          onChange={(e) => setExamPaperId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-brand-500 font-display"
        >
          {papers.map((p) => (
            <option key={p.id} value={p.id} disabled={p.alreadyAssigned}>
              {p.nameVi} · {p.totalQuestions} câu · {p.durationMinutes} phút
              {p.alreadyAssigned ? " (đã giao)" : ""}
            </option>
          ))}
        </select>
        {papers.length === 0 && (
          <p className="mt-2 text-sm text-ink-700">
            Không có đề nào khả dụng. Hãy chắc chắn lớp của con đã được cài đặt.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="dueAt" className="block font-display font-semibold text-ink-900 mb-2">
          Hạn nộp (tuỳ chọn)
        </label>
        <input
          id="dueAt"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-brand-500 font-display"
        />
      </div>

      {error && <p role="alert" className="text-red-600 text-sm font-semibold">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || !examPaperId}
          className="px-5 py-3 rounded-xl bg-brand-700 text-white font-display font-semibold hover:bg-brand-800 transition disabled:opacity-50"
        >
          {pending ? "Đang giao..." : "Giao đề"}
        </button>
      </div>
    </form>
  );
}
