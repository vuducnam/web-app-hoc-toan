// Server component: top-3 weak skills with one-line nhận định each.
// Shows placeholder "Chưa có dữ liệu" if empty.

import type { WeakSkill } from "@/lib/parent/compute-weak-skills";

interface WeakSkillsListProps {
  skills: WeakSkill[];
}

/** Generates a short Vietnamese diagnostic for a weak skill ratio */
function nhanDinh(ratio: number): string {
  if (ratio < 0.3) return "Cần luyện tập nhiều hơn.";
  if (ratio < 0.5) return "Đang tiến bộ, cần ôn thêm.";
  return "Gần đạt yêu cầu, tiếp tục cố gắng.";
}

export function WeakSkillsList({ skills }: WeakSkillsListProps) {
  if (skills.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic">
        Chưa có dữ liệu (cần ít nhất 3 lần làm bài cho mỗi kỹ năng).
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {skills.map((skill, idx) => {
        const pct = Math.round(skill.ratio * 100);
        return (
          <li key={skill.key} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center mt-0.5">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink-900 truncate">
                  {skill.nameVi}
                </span>
                <span className="text-sm font-semibold text-warn shrink-0">
                  {pct}%
                </span>
              </div>
              {/* Thin progress bar */}
              <div className="mt-1 h-1.5 w-full rounded-full bg-ink-400/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-warn"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-ink-600">{nhanDinh(skill.ratio)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
