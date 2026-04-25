"use client";
// Parent child detail: section that shows current grade + lets parent change it.
// Uses a native <select> wrapped in a confirm-on-submit form. Server action
// preserves SkillProgress (history kept; only the dashboard view is filtered).
import { useActionState, useState } from "react";
import {
  updateChildGrade,
  type UpdateGradeState,
} from "@/app/actions/parent-children";

interface GradeOption {
  id: string;
  key: string;
  name: string;
}

interface GradeSectionProps {
  childId: string;
  childName: string;
  currentGradeId: string | null;
  currentGradeName: string | null;
  grades: GradeOption[];
}

export function GradeSection({
  childId,
  childName,
  currentGradeId,
  currentGradeName,
  grades,
}: GradeSectionProps) {
  const [state, formAction, isPending] = useActionState<UpdateGradeState, FormData>(
    updateChildGrade,
    undefined,
  );
  const [editing, setEditing] = useState(false);

  return (
    <section className="rounded-lg border border-ink-400/20 bg-white shadow-flat p-5">
      <h2 className="text-sm font-semibold text-ink-600 uppercase tracking-wider mb-3">
        Lớp đang học
      </h2>

      {!editing ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-ink-900">
              {currentGradeName ?? "Chưa chọn lớp"}
            </p>
            <p className="text-xs text-ink-400 mt-0.5">
              {childName} chỉ thấy bài tập đúng lớp này.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-md border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            Đổi lớp
          </button>
        </div>
      ) : (
        <form
          action={(formData) => {
            const newGradeId = formData.get("gradeId");
            if (newGradeId === currentGradeId) {
              // No change — just close.
              setEditing(false);
              return;
            }
            const ok = window.confirm(
              `Đổi lớp cho ${childName}? Tiến độ luyện tập cũ vẫn được giữ.`,
            );
            if (!ok) return;
            formData.set("childId", childId);
            formAction(formData);
            setEditing(false);
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="childId" value={childId} />
          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor={`grade-${childId}`}
              className="text-sm font-medium text-ink-900"
            >
              Lớp mới
            </label>
            <select
              id={`grade-${childId}`}
              name="gradeId"
              required
              defaultValue={currentGradeId ?? ""}
              className="border border-ink-400/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="" disabled>
                Chọn lớp...
              </option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={isPending}
              className="rounded-md border border-ink-400/30 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-brand-700 text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      )}

      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-coral-500">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="mt-3 text-sm text-brand-700">
          {state.success}
        </p>
      )}
    </section>
  );
}
