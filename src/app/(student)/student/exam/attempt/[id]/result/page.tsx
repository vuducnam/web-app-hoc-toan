// Result page - score, M1-M4 breakdown, per-question review, weak topic CTA.
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { ExamSummary } from "@/lib/exam/types";
import { ExamResultSummary } from "@/components/exam/exam-result-summary";
import { ExamResultReview } from "@/components/exam/exam-result-review";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExamResultPage({ params }: Props) {
  const { id } = await params;
  const user = await verifyStudent();

  const attempt = await prisma.examAttempt.findFirst({
    where: { id, studentId: user.id },
    include: { examPaper: true, answers: { orderBy: { slotNo: "asc" } } },
  });
  if (!attempt) notFound();
  if (attempt.status === "IN_PROGRESS") {
    redirect(`/student/exam/attempt/${id}`);
  }

  const summary = (attempt.summaryJson ?? {
    byDifficulty: { M1: { correct: 0, total: 0 }, M2: { correct: 0, total: 0 }, M3: { correct: 0, total: 0 }, M4: { correct: 0, total: 0 } },
    weakTopics: [],
  }) as unknown as ExamSummary;

  return (
    <div className="space-y-6">
      <Link href="/student/exam" className="text-brand-700 hover:underline font-display font-semibold">
        ← Đề thi
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
        <section className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5">
          <h2 className="font-display font-bold text-xl text-amber-900 mb-3">
            Cần luyện thêm
          </h2>
          <ul className="space-y-2">
            {summary.weakTopics.map((t) => (
              <li key={t.topicId} className="text-amber-900">
                <strong>{t.topicName ?? t.topicId}</strong> · {Math.round(t.accuracy * 100)}% đúng ({t.totalCount} câu)
                {t.skillKeys.length > 0 && (
                  <span className="ml-2">
                    <Link
                      href={`/student/practice/${t.skillKeys[0]}`}
                      className="text-brand-700 underline"
                    >
                      Luyện ngay →
                    </Link>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ExamResultReview answers={attempt.answers.map((a) => ({
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
      }))} />
    </div>
  );
}
