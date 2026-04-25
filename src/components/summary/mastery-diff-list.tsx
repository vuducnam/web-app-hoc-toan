// mastery-diff-list.tsx — server component.
// Shows current mastery level for the practiced skill with Vietnamese label.
// MVP: displays current level only (no per-session before/after — KISS per spec).
import { MasteryPill, type MasteryLevel } from "@/components/ui/mastery-pill";

interface MasteryDiffListProps {
  skillName: string;
  masteryLevel: MasteryLevel;
}

/** Displays current mastery level for the practiced skill */
export function MasteryDiffList({ skillName, masteryLevel }: MasteryDiffListProps) {
  return (
    <div className="bg-paper rounded-2xl border border-brand-100 shadow-flat px-5 py-4">
      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3">
        Mức độ kỹ năng
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="font-display font-semibold text-sm text-ink-900 truncate">
          {skillName}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-ink-400">Đang ở:</span>
          <MasteryPill level={masteryLevel} />
        </div>
      </div>
    </div>
  );
}
