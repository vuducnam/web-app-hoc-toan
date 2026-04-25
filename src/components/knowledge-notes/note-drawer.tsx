"use client";
// Inline drawer toggle inside practice session. Same content as NoteCard,
// but rendered as a slide-down overlay panel triggered by a button.
// ESC closes; backdrop click closes.
import * as React from "react";
import { NoteMarkdown } from "./note-markdown";
import type { KnowledgeNote } from "@/lib/knowledge-notes/resolve-note";
import { cn } from "@/lib/ui/cn";

interface NoteDrawerProps {
  note: KnowledgeNote;
  skillName: string;
}

const SECTIONS = [
  { key: "remember"  as const, title: "Ghi nhớ",  icon: "💡", accent: "border-l-brand-500 [&_h3]:text-brand-700" },
  { key: "caution"   as const, title: "Chú ý",   icon: "⚠️", accent: "border-l-sun-500 [&_h3]:text-sun-700" },
  { key: "extension" as const, title: "Mở rộng", icon: "🌱", accent: "border-l-bubble-mint-500 [&_h3]:text-bubble-mint-500" },
];

export function NoteDrawer({ note, skillName }: NoteDrawerProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="knowledge-note-drawer"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold",
          "bg-bubble-mint-300/40 text-bubble-mint-500 hover:bg-bubble-mint-300/60 transition-colors",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
        )}
      >
        <span aria-hidden="true">📖</span>
        <span>Xem kiến thức</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-900/40 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            id="knowledge-note-drawer"
            role="dialog"
            aria-label={`Kiến thức cần nhớ: ${skillName}`}
            className={cn(
              "fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[480px]",
              "bg-white shadow-chunky border-t-4 md:border-l-4 md:border-t-0 border-brand-500",
              "rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none p-6 md:p-8 z-50 overflow-y-auto",
              "max-h-[85vh] md:max-h-screen",
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">Kiến thức cần nhớ</p>
                <h2 className="font-display text-xl font-bold text-ink-900">{skillName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="text-ink-400 hover:text-ink-900 shrink-0"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {SECTIONS.map((s) => {
                const content = note[s.key];
                if (!content) return null;
                return (
                  <section
                    key={s.key}
                    className={cn("border-l-4 bg-ink-50/50 rounded-r-2xl p-3 md:p-4 space-y-1.5", s.accent)}
                  >
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <span aria-hidden="true">{s.icon}</span>
                      {s.title}
                    </h3>
                    <NoteMarkdown source={content} className="text-sm md:text-base" />
                  </section>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
