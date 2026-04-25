// Parent: detailed view of one child exam attempt.
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { ExamSummary } from "@/lib/exam/types";
import { ExamResultSummary } from "@/components/exam/exam-result-summary";
import { ExamResultReview } from "@/components/exam/exam-result-review";

interface Props {
  params: Promise<{ id: string; attemptId: string }>;
}

export default async function ParentExamDetailPage({ params }: Props) {
  const { id: childId, attemptId } = await params;
  const parent = await verifyParent();

  // Cross-parent guard
  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: parent.id },
    select: { id: true, name: true },
  });
  if (!child) notFound();

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: childId },
    include: { examPaper: true, answers: { orderBy: { slotNo: "asc" } } },
  });
  if (!attempt) notFound();

  const summary = (attempt.summaryJson ?? {
    byDifficulty: {
      M1: { correct: 0, total: 0 }, M2: { correct: 0, total: 0 },
      M3: { correct: 0, total: 0 }, M4: { correct: 0, total: 0 },
    },
    weakTopics: [],
  }) as unknown as ExamSummary;

  return (
    <div className="space-y-6">
      <Link
        href={`/parent/child/${childId}/exam`}
        className="text-brand-700 hover:underline font-display font-semibold"
      >
        ← Đề thi của {child.name}
      </Link>

      <ExamResultSummary
        examName={attempt.examPaper.nameVi}
        score={Number(attempt.totalScore.toString())}
        totalPoints={Number(attempt.examPaper.totalPoints.toString())}
        correctCount={attempt.correctCount}
        totalCount={attempt.totalCount}
        timeSpentSec={attempt.timeSpentSec}
        expired={attempt.status === "EXPIRED"}
        byDifficulty={summary.byDifficulty}
      />

      {summary.weakTopics.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h2 className="font-display font-bold text-lg text-amber-900 mb-2">
            Cần luyện thêm
          </h2>
          <ul className="space-y-1 text-amber-900">
            {summary.weakTopics.map((t) => (
              <li key={t.topicId}>
                <strong>{t.topicName ?? t.topicId}</strong> · {Math.round(t.accuracy * 100)}% đúng ({t.totalCount} câu)
              </li>
            ))}
          </ul>
        </section>
      )}

      <ExamResultReview
        answers={attempt.answers.map((a) => ({
          slotNo: a.slotNo,
          difficulty: a.difficulty,
          questionType: a.questionType,
          questionText: a.questionText,
          expectedAnswer: a.expectedAnswer,
          studentAnswer: a.studentAnswer,
          isCorrect: a.isCorrect,
          pointEarned: Number(a.pointEarned.toString()),
          pointWeight: Number(a.pointWeight.toString()),
          choices: a.choices as never,
        }))}
      />
    </div>
  );
}
