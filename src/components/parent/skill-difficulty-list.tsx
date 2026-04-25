"use client";
// Parent UI for setting preferredDifficulty per skill on a specific child.
// Server component renders the list; this client component handles chip clicks
// via the setPreferredDifficulty server action. Optimistic UI: chips update
// locally on click, revert on server error.
import * as React from "react";
import { useTransition, useState } from "react";
import { setPreferredDifficulty } from "@/app/actions/parent-difficulty-preference";
import type { SkillDifficultyRow } from "@/lib/parent/load-child-skill-difficulties";
import type { Difficulty as PrismaDifficulty } from "@/generated/prisma/client";
import { cn } from "@/lib/ui/cn";

interface SkillDifficultyListProps {
  childId: string;
  rows: ReadonlyArray<SkillDifficultyRow>;
}

interface ChipDef {
  value: PrismaDifficulty | null;
  label: string;
}

const CHIPS: ReadonlyArray<ChipDef> = [
  { value: null,     label: "Tự động" },
  { value: "EASY",   label: "Dễ" },
  { value: "MEDIUM", label: "Vừa" },
  { value: "HARD",   label: "Khó" },
];

interface RowState {
  current: PrismaDifficulty | null;
  saving: boolean;
  error: string | null;
}

export function SkillDifficultyList({ childId, rows }: SkillDifficultyListProps) {
  // Group by topic for visual structure.
  const grouped = React.useMemo(() => {
    const map = new Map<string, SkillDifficultyRow[]>();
    for (const r of rows) {
      const list = map.get(r.topicNameVi) ?? [];
      list.push(r);
      map.set(r.topicNameVi, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  // Per-skill local state (initialised from rows on mount only).
  const [state, setState] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {};
    for (const r of rows) {
      init[r.skillKey] = { current: r.preferredDifficulty, saving: false, error: null };
    }
    return init;
  });

  const [, startTransition] = useTransition();

  function handlePick(skillKey: string, next: PrismaDifficulty | null) {
    const prev = state[skillKey]?.current ?? null;
    if (prev === next) return; // no-op

    setState((s) => ({ ...s, [skillKey]: { current: next, saving: true, error: null } }));

    startTransition(async () => {
      const res = await setPreferredDifficulty({ childId, skillKey, difficulty: next });
      if (res.ok) {
        setState((s) => ({ ...s, [skillKey]: { current: next, saving: false, error: null } }));
      } else {
        // Revert on error
        setState((s) => ({
          ...s,
          [skillKey]: { current: prev, saving: false, error: "Không lưu được — thử lại" },
        }));
      }
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-600">
        Chọn độ khó cố định cho từng kỹ năng. <strong>Tự động</strong> để hệ thống quyết định
        theo mức tiến bộ.
      </p>

      {grouped.map(([topic, skills]) => (
        <section key={topic} className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-ink-600 tracking-wider">{topic}</h3>
          <ul className="divide-y divide-ink-400/10 border border-ink-400/10 rounded-md">
            {skills.map((row) => {
              const rs = state[row.skillKey] ?? { current: null, saving: false, error: null };
              return (
                <li key={row.skillKey} className="p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900 truncate">{row.skillNameVi}</p>
                    {!row.hasGenerator && (
                      <p className="text-xs text-ink-400">Bài đang được chuẩn bị</p>
                    )}
                    {rs.error && (
                      <p className="text-xs text-coral-500" role="alert">{rs.error}</p>
                    )}
                  </div>
                  <div role="radiogroup" aria-label={`Độ khó cho ${row.skillNameVi}`} className="flex gap-1.5 flex-wrap">
                    {CHIPS.map((chip) => {
                      const active = rs.current === chip.value;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={rs.saving || !row.hasGenerator}
                          onClick={() => handlePick(row.skillKey, chip.value)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            active
                              ? "bg-brand-500 text-white"
                              : "bg-ink-50 text-ink-700 hover:bg-ink-100",
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
