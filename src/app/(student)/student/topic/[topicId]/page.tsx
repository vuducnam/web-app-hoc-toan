// Thin RSC — lists skills in a topic with mastery pill + practice link.
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { MasteryPill } from "@/components/ui/mastery-pill";
import type { MasteryLevel } from "@/components/ui/mastery-pill";

interface Props {
  params: Promise<{ topicId: string }>;
}

export default async function TopicDetailPage({ params }: Props) {
  const { topicId } = await params;
  const user = await verifyStudent();

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      volume: { include: { grade: true } },
      lessons: {
        orderBy: { order: "asc" },
        include: { skills: { orderBy: { id: "asc" } } },
      },
    },
  });

  if (!topic) notFound();

  const skills = topic.lessons.flatMap((l) => l.skills);
  const skillKeys = skills.map((s) => s.key);

  const progressRows = await prisma.skillProgress.findMany({
    where: { userId: user.id, skillKey: { in: skillKeys } },
    select: { skillKey: true, masteryLevel: true },
  });

  const progressMap = new Map(progressRows.map((p) => [p.skillKey, p.masteryLevel]));

  const volumeLabel = `${topic.volume.grade.name} — ${topic.volume.name}`;

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/student"
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-500 transition-colors"
      >
        ← Quay lại
      </Link>

      <div>
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide">{volumeLabel}</p>
        <h1 className="font-display font-bold text-3xl text-ink-900 mt-1">{topic.nameVi}</h1>
      </div>

      <ul className="space-y-3">
        {skills.map((skill) => {
          const level = (progressMap.get(skill.key) ?? "NOT_STARTED") as MasteryLevel;
          const hasGenerator = Boolean(skill.generatorKey);

          return (
            <li
              key={skill.key}
              className="flex items-center justify-between gap-3 bg-white rounded-2xl px-5 py-4 shadow-[0_3px_0_0_rgb(0_0_0/.08)] border border-brand-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <MasteryPill level={level} />
                <span className="font-semibold text-ink-900 truncate">{skill.nameVi}</span>
              </div>

              {hasGenerator ? (
                <Link
                  href={`/student/practice/${skill.key}`}
                  className="shrink-0 min-h-[44px] inline-flex items-center px-4 py-2 rounded-xl bg-brand-500 text-white font-display font-semibold text-sm shadow-chunky-brand active:translate-y-[3px] active:shadow-none hover:bg-brand-700 transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500"
                >
                  Luyện tập
                </Link>
              ) : (
                <span className="shrink-0 text-xs text-ink-400 font-semibold">Sắp có</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
