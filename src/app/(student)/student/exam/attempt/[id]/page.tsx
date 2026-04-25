// Active exam attempt page - loads sanitized questions, hands off to client runner.
import { notFound, redirect } from "next/navigation";
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ExamAttemptRunner } from "@/components/exam/exam-attempt-runner";
import { answersToQuestionDTOs } from "@/app/actions/exam-helpers";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExamAttemptPage({ params }: Props) {
  const { id } = await params;
  const user = await verifyStudent();

  const attempt = await prisma.examAttempt.findFirst({
    where: { id, studentId: user.id },
    include: { examPaper: true, answers: true },
  });
  if (!attempt) notFound();

  if (attempt.status !== "IN_PROGRESS") {
    redirect(`/student/exam/attempt/${id}/result`);
  }

  const questions = answersToQuestionDTOs(attempt.answers);

  return (
    <ExamAttemptRunner
      attemptId={attempt.id}
      examName={attempt.examPaper.nameVi}
      durationMinutes={attempt.examPaper.durationMinutes}
      startedAtIso={attempt.startedAt.toISOString()}
      serverNowIso={new Date().toISOString()}
      questions={questions}
    />
  );
}
