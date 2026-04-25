// Server component — single topic card with name and 4-bucket mastery bar.
import Link from "next/link";
import { MasteryBar4 } from "@/components/ui/mastery-bar-4";
import type { MasteryBar4Counts } from "@/components/ui/mastery-bar-4";

interface TopicCardProps {
  topicId: string;
  nameVi: string;
  skillCount: number;
  masteredCount: number;
  counts: MasteryBar4Counts;
}

export function TopicCard({
  topicId,
  nameVi,
  skillCount,
  masteredCount,
  counts,
}: TopicCardProps) {
  const totalStarted = counts.familiar + counts.proficient + counts.mastered;
  const isNotStarted = totalStarted === 0;

  return (
    <Link
      href={`/student/topic/${topicId}`}
      className="group block bg-white rounded-2xl p-5 shadow-[0_5px_0_0_rgb(0_0_0/.10)] border border-brand-100 hover:border-brand-500 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-display font-bold text-xl text-ink-900 leading-tight group-hover:text-brand-700 transition-colors">
          {nameVi}
        </h3>
        <span className="shrink-0 text-xs font-bold text-ink-400">
          {skillCount} kỹ năng
        </span>
      </div>

      {/* 4-bucket mastery bar */}
      {skillCount > 0 ? (
        <MasteryBar4 counts={counts} className="mb-2" />
      ) : (
        <div className="h-3 w-full rounded-sm bg-mastery-0 mb-2" />
      )}

      <div className="flex justify-between items-center text-xs text-ink-400">
        <span>
          {isNotStarted
            ? "Chưa luyện"
            : `${masteredCount}/${skillCount} thuần thục`}
        </span>
        <span className="font-bold text-brand-700 group-hover:translate-x-1 transition-transform">
          {isNotStarted ? "Khám phá →" : "Tiếp tục →"}
        </span>
      </div>
    </Link>
  );
}
