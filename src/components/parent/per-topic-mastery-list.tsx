// Server component: list of topics with MasteryBar4 per topic.
// Shows skill count distribution across mastery levels.

import { MasteryBar4 } from "@/components/ui/mastery-bar-4";

export interface TopicMastery {
  topicId: string;
  topicNameVi: string;
  notStarted: number;
  familiar: number;
  proficient: number;
  mastered: number;
}

interface PerTopicMasteryListProps {
  topics: TopicMastery[];
}

export function PerTopicMasteryList({ topics }: PerTopicMasteryListProps) {
  if (topics.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic">Chưa có dữ liệu theo chủ đề.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {topics.map((t) => {
        const total = t.notStarted + t.familiar + t.proficient + t.mastered;
        const masteredPct = total > 0 ? Math.round((t.mastered / total) * 100) : 0;

        return (
          <li key={t.topicId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-900 truncate pr-2">
                {t.topicNameVi}
              </span>
              <span className="text-xs text-ink-600 shrink-0">
                {t.mastered}/{total} thuần thục ({masteredPct}%)
              </span>
            </div>
            <MasteryBar4
              counts={{
                notStarted: t.notStarted,
                familiar: t.familiar,
                proficient: t.proficient,
                mastered: t.mastered,
              }}
              className="h-2.5"
            />
          </li>
        );
      })}
    </ul>
  );
}
