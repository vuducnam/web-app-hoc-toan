"use client";
// Pre-session knowledge note card. Three sections: Ghi nhớ / Chú ý / Mở rộng.
// Renders only sections that have content. Empty card = caller should not render at all.
// CTA "Bắt đầu luyện tập" advances to first question (controlled by parent).
import * as React from "react";
import { NoteMarkdown } from "./note-markdown";
import type { KnowledgeNote } from "@/lib/knowledge-notes/resolve-note";
import { cn } from "@/lib/ui/cn";

interface NoteCardProps {
  note: KnowledgeNote;
  skillName: string;
  onContinue: () => void;
}

interface SectionDef {
  key: keyof KnowledgeNote;
  title: string;
  /** Tailwind classes for the section accent (left border + heading color). */
  accent: string;
  icon: string;
}

const SECTIONS: ReadonlyArray<SectionDef> = [
  {
    key: "remember",
    title: "Ghi nhớ",
    accent: "border-l-brand-500 [&_h2]:text-brand-700",
    icon: "💡",
  },
  {
    key: "caution",
    title: "Chú ý",
    accent: "border-l-sun-500 [&_h2]:text-sun-700",
    icon: "⚠️",
  },
  {
    key: "extension",
    title: "Mở rộng",
    accent: "border-l-bubble-mint-500 [&_h2]:text-bubble-mint-500",
    icon: "🌱",
  },
];

export function NoteCard({ note, skillName, onContinue }: NoteCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-chunky border border-brand-100 p-6 md:p-10 space-y-6">
      <header className="text-center space-y-2">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">Kiến thức cần nhớ</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-900">{skillName}</h1>
      </header>

      <div className="space-y-4">
        {SECTIONS.map((s) => {
          const content = note[s.key];
          if (!content) return null;
          return (
            <section
              key={s.key}
              className={cn(
                "border-l-4 bg-ink-50/50 rounded-r-2xl p-4 md:p-5 space-y-2",
                s.accent,
              )}
            >
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <span aria-hidden="true">{s.icon}</span>
                {s.title}
              </h2>
              <NoteMarkdown source={content} />
            </section>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onContinue}
          className={cn(
            "inline-flex items-center px-8 py-3 rounded-2xl text-lg font-display font-bold",
            "bg-brand-500 text-white shadow-chunky-brand transition-all",
            "hover:bg-brand-700 active:translate-y-[3px] active:shadow-none",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
          )}
        >
          Bắt đầu luyện tập →
        </button>
      </div>
    </div>
  );
}
