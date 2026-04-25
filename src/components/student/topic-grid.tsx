// Server component — 2-col mobile / 4-col md topic grid grouped by volume.
import { TopicCard } from "@/components/student/topic-card";
import { aggregateTopicMastery, type ProgressMap } from "@/lib/dashboard/aggregate-topic-mastery";

/** Shape returned by the dashboard's topic query */
export interface TopicWithSkills {
  id: string;
  nameVi: string;
  order: number;
  volume: {
    id: string;
    name: string;
    order: number;
    grade: { name: string };
  };
  lessons: Array<{
    skills: Array<{ key: string }>;
  }>;
}

interface TopicGridProps {
  topics: TopicWithSkills[];
  progressMap: ProgressMap;
}

export function TopicGrid({ topics, progressMap }: TopicGridProps) {
  // Group topics by volumeId — maintain insertion order (already ordered by volume.order)
  const volumeMap = new Map<
    string,
    { label: string; topics: TopicWithSkills[] }
  >();

  for (const topic of topics) {
    const vid = topic.volume.id;
    if (!volumeMap.has(vid)) {
      volumeMap.set(vid, {
        label: `${topic.volume.grade.name} - ${topic.volume.name}`,
        topics: [],
      });
    }
    volumeMap.get(vid)!.topics.push(topic);
  }

  return (
    <section aria-label="Danh sách chủ đề">
      <h2 className="font-display font-bold text-2xl text-ink-900 mb-4">Chủ đề</h2>

      <div className="space-y-8">
        {Array.from(volumeMap.values()).map(({ label, topics: vTopics }) => {
          return (
            <div key={label}>
              <h3 className="font-display font-semibold text-lg text-brand-700 mb-3">
                {label}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {vTopics.map((topic) => {
                  const skills = topic.lessons.flatMap((l) => l.skills);
                  const counts = aggregateTopicMastery(skills, progressMap);
                  return (
                    <TopicCard
                      key={topic.id}
                      topicId={topic.id}
                      nameVi={topic.nameVi}
                      skillCount={skills.length}
                      masteredCount={counts.mastered}
                      counts={counts}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
