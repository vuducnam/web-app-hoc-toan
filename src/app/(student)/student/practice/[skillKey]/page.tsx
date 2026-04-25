// RSC entry for the practice page.
// Verifies student, resolves skill, prefetches first question.
// Stub generators get a "coming soon" card rather than a 500.
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getNextQuestion } from "@/app/actions/practice";
import { PracticeSession } from "@/components/practice/practice-session";
import { resolveKnowledgeNote } from "@/lib/knowledge-notes/resolve-note";

interface Props {
  params: Promise<{ skillKey: string }>;
}

export default async function PracticePage({ params }: Props) {
  const { skillKey } = await params;

  // Auth guard — redirects to "/" if unauthenticated or wrong role.
  await verifyStudent();

  // Skill must exist in curriculum. Include lesson so we can resolve knowledge notes.
  const skill = await prisma.skill.findUnique({
    where: { key: skillKey },
    include: { lesson: true },
  });
  if (!skill) notFound();

  // Resolve pre-exercise knowledge note from lesson (MVP: lesson-only).
  const knowledgeNote = resolveKnowledgeNote(skill.lesson);

  // Prefetch first question server-side for fast TTI.
  const firstQ = await getNextQuestion(skillKey);

  // Stub generator — render a friendly placeholder instead of erroring.
  if ("error" in firstQ) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="text-6xl" aria-hidden="true">🚧</div>
        <h1 className="font-display font-bold text-2xl text-ink-900">
          {skill.nameVi}
        </h1>
        <p className="text-ink-600 max-w-sm">
          Bài đang được chuẩn bị. Hãy quay lại sau!
        </p>
        <Link
          href="/student"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-500 text-white font-display font-semibold shadow-chunky-brand hover:bg-brand-700 transition-colors active:translate-y-[3px] active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <PracticeSession
      firstQuestion={firstQ}
      skillKey={skillKey}
      skillName={skill.nameVi}
      knowledgeNote={knowledgeNote}
    />
  );
}
